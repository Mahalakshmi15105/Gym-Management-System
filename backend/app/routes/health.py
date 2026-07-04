from flask import Blueprint, jsonify
from app.extensions import db
from sqlalchemy import text

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health():
    db_status = "healthy"
    try:
        # Perform a simple execution to check database connectivity
        db.session.execute(text('SELECT 1'))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    return jsonify({
        'status': 'active',
        'database': db_status
    }), 200 if "unhealthy" not in db_status else 500
