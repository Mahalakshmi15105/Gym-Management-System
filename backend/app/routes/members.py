from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import or_
from app.extensions import db
from app.models import Member
from app.activity_logging import ActivityLogger
from datetime import datetime

members_bp = Blueprint('members', __name__)

def get_current_gym_id():
    """Extract gym_id from JWT token for multi-tenant isolation"""
    claims = get_jwt()
    return claims.get('gym_id')

@members_bp.route('', methods=['GET'])
@jwt_required()
def list_members():
    """List all members for the current gym (multi-tenant filtered)"""
    gym_id = get_current_gym_id()
    if not gym_id:
        return jsonify({'error': 'Gym ID not found in token'}), 400
    
    # Get query parameters for filtering and search
    status_filter = request.args.get('status')
    search_query = request.args.get('q', '').strip()
    
    # Base query with multi-tenant isolation
    query = Member.query.filter_by(gym_id=gym_id)
    
    # Apply status filter
    if status_filter and status_filter != 'All':
        query = query.filter(Member.status == status_filter)
    
    # Apply search filter
    if search_query:
        search_pattern = f"%{search_query}%"
        query = query.filter(
            or_(
                Member.first_name.ilike(search_pattern),
                Member.last_name.ilike(search_pattern),
                Member.email.ilike(search_pattern),
                Member.phone.ilike(search_pattern),
                Member.member_id.ilike(search_pattern)
            )
        )
    
    # Order by created date (newest first) and limit for safety
    members = query.order_by(Member.created_at.desc()).limit(100).all()
    
    # Log the view operation
    ActivityLogger.log_view('member', view_type='list', gym_id=gym_id)
    
    return jsonify({
        'members': [member.to_dict() for member in members]
    }), 200

@members_bp.route('', methods=['POST'])
@jwt_required()
def create_member():
    """Create a new member for the current gym"""
    gym_id = get_current_gym_id()
    if not gym_id:
        return jsonify({'error': 'Gym ID not found in token'}), 400
    
    data = request.get_json() or {}
    
    # Required fields validation
    if not data.get('first_name') or not data.get('phone'):
        return jsonify({'error': 'First name and phone are required'}), 400
    
    # Check unique constraints within gym
    if data.get('email'):
        existing_email = Member.query.filter_by(gym_id=gym_id, email=data['email']).first()
        if existing_email:
            return jsonify({'error': 'Email already exists for a member in this gym'}), 400
        
    existing_phone = Member.query.filter_by(gym_id=gym_id, phone=data['phone']).first()
    if existing_phone:
        return jsonify({'error': 'Phone number already exists for a member in this gym'}), 400
    
    try:
        # Parse dates
        start_date = None
        end_date = None
        dob = None
        
        if data.get('membership_start_date'):
            start_date = datetime.strptime(data['membership_start_date'], '%Y-%m-%d').date()
        if data.get('membership_end_date'):
            end_date = datetime.strptime(data['membership_end_date'], '%Y-%m-%d').date()
        if data.get('date_of_birth'):
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        # Generate unique member_id
        import uuid
        member_id = f"MEM{str(uuid.uuid4())[:8].upper()}"
        
        # Ensure member_id is unique within gym
        while Member.query.filter_by(gym_id=gym_id, member_id=member_id).first():
            member_id = f"MEM{str(uuid.uuid4())[:8].upper()}"
        
        # Create new member
        new_member = Member(
            gym_id=gym_id,
            member_id=member_id,
            first_name=data['first_name'],
            last_name=data.get('last_name', ''),
            gender=data.get('gender', ''),
            date_of_birth=dob,
            phone=data['phone'],
            email=data.get('email', ''),
            address=data.get('address', ''),
            emergency_contact_name=data.get('emergency_contact_name', ''),
            emergency_contact_phone=data.get('emergency_contact_phone', ''),
            medical_notes=data.get('medical_notes', ''),
            membership_plan_name=data.get('membership_plan_name', ''),
            membership_start_date=start_date,
            membership_end_date=end_date,
            status=data.get('status', 'Active')
        )
        
        db.session.add(new_member)
        db.session.commit()
        
        # Log the create operation
        member_name = f"{new_member.first_name} {new_member.last_name}".strip()
        ActivityLogger.log_create(
            'member', 
            new_member.id, 
            entity_name=member_name,
            gym_id=gym_id,
            extra_data={'phone': new_member.phone, 'email': new_member.email}
        )
        
        return jsonify({
            'message': 'Member created successfully',
            'member': new_member.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create member: {str(e)}'}), 500
