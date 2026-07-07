"""
Super Admin Error Handling for Backend
Centralized error handling with proper logging for Super Admin operations
"""

from flask import jsonify
from functools import wraps
from app.activity_logging import ActivityLogger


class SuperAdminError(Exception):
    """Custom exception for Super Admin operations"""
    
    def __init__(self, message, code=None, details=None, status_code=500):
        self.message = message
        self.code = code or 'SUPER_ADMIN_ERROR'
        self.details = details
        self.status_code = status_code
        super().__init__(self.message)


def handle_super_admin_errors(f):
    """Decorator for comprehensive Super Admin error handling"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SuperAdminError as e:
            # Log Super Admin specific errors
            ActivityLogger.log_activity(
                'super_admin_error',
                f"Super Admin Error: {e.message}",
                severity='error',
                extra_data={
                    'error_code': e.code,
                    'details': e.details,
                    'endpoint': f.__name__
                }
            )
            
            return jsonify({
                'error': e.message,
                'code': e.code,
                'details': e.details
            }), e.status_code
            
        except ValueError as e:
            return jsonify({
                'error': 'Invalid input data',
                'code': 'VALIDATION_ERROR',
                'details': str(e)
            }), 400
            
        except Exception as e:
            # Log unexpected errors
            ActivityLogger.log_activity(
                'system_error',
                f"Unexpected error in Super Admin operation: {str(e)}",
                severity='critical',
                extra_data={'endpoint': f.__name__}
            )
            
            return jsonify({
                'error': 'An unexpected error occurred',
                'code': 'INTERNAL_SERVER_ERROR',
                'details': 'Please contact support if this persists'
            }), 500
    
    return decorated_function


def validate_super_admin_operation(operation_type, entity_data=None):
    """Validate Super Admin operations before execution"""
    
    if operation_type == 'delete_gym':
        # Check if gym has active members
        if entity_data and entity_data.get('active_members', 0) > 0:
            raise SuperAdminError(
                'Cannot delete gym with active members',
                code='GYM_HAS_ACTIVE_MEMBERS',
                details=f"Gym has {entity_data['active_members']} active members",
                status_code=400
            )
    
    elif operation_type == 'modify_super_admin':
        raise SuperAdminError(
            'Cannot modify Super Admin accounts',
            code='CANNOT_MODIFY_SUPER_ADMIN',
            status_code=403
        )
    
    elif operation_type == 'critical_setting':
        # Require additional confirmation for critical settings
        if not entity_data or not entity_data.get('confirmed'):
            raise SuperAdminError(
                'Critical system setting requires confirmation',
                code='CRITICAL_SETTING_CHANGE',
                details='This setting affects core system functionality',
                status_code=400
            )