"""
Unit tests for Super Admin error handling
"""

import pytest
from unittest.mock import patch, MagicMock
from app.super_admin_errors import SuperAdminError, handle_super_admin_errors, validate_super_admin_operation


class TestSuperAdminError:
    """Test Super Admin custom exception"""
    
    def test_super_admin_error_creation(self):
        """Test creating SuperAdminError with all parameters"""
        error = SuperAdminError(
            message="Test error",
            code="TEST_ERROR", 
            details="Test details",
            status_code=400
        )
        
        assert error.message == "Test error"
        assert error.code == "TEST_ERROR"
        assert error.details == "Test details"
        assert error.status_code == 400
    
    def test_super_admin_error_defaults(self):
        """Test SuperAdminError with default values"""
        error = SuperAdminError("Test error")
        
        assert error.message == "Test error"
        assert error.code == "SUPER_ADMIN_ERROR"
        assert error.details is None
        assert error.status_code == 500


class TestErrorHandlerDecorator:
    """Test error handler decorator"""
    
    @patch('app.super_admin_errors.ActivityLogger')
    def test_handles_super_admin_error(self, mock_logger):
        """Test decorator handles SuperAdminError correctly"""
        
        @handle_super_admin_errors
        def test_function():
            raise SuperAdminError("Test error", code="TEST_ERROR", status_code=400)
        
        response, status_code = test_function()
        
        assert status_code == 400
        assert response.json['error'] == "Test error"
        assert response.json['code'] == "TEST_ERROR"
        mock_logger.log_activity.assert_called_once()
    
    @patch('app.super_admin_errors.ActivityLogger')
    def test_handles_validation_error(self, mock_logger):
        """Test decorator handles ValueError correctly"""
        
        @handle_super_admin_errors
        def test_function():
            raise ValueError("Invalid input")
        
        response, status_code = test_function()
        
        assert status_code == 400
        assert response.json['code'] == "VALIDATION_ERROR"
    
    @patch('app.super_admin_errors.ActivityLogger')
    def test_handles_unexpected_error(self, mock_logger):
        """Test decorator handles unexpected errors"""
        
        @handle_super_admin_errors
        def test_function():
            raise Exception("Unexpected error")
        
        response, status_code = test_function()
        
        assert status_code == 500
        assert response.json['code'] == "INTERNAL_SERVER_ERROR"
        mock_logger.log_activity.assert_called_once()


class TestValidationFunctions:
    """Test Super Admin operation validation"""
    
    def test_validate_gym_deletion_with_members(self):
        """Test validation prevents gym deletion with active members"""
        entity_data = {'active_members': 5}
        
        with pytest.raises(SuperAdminError) as exc_info:
            validate_super_admin_operation('delete_gym', entity_data)
        
        assert exc_info.value.code == 'GYM_HAS_ACTIVE_MEMBERS'
        assert exc_info.value.status_code == 400
    
    def test_validate_gym_deletion_no_members(self):
        """Test validation allows gym deletion with no active members"""
        entity_data = {'active_members': 0}
        
        # Should not raise exception
        validate_super_admin_operation('delete_gym', entity_data)
    
    def test_validate_super_admin_modification(self):
        """Test validation prevents Super Admin modification"""
        
        with pytest.raises(SuperAdminError) as exc_info:
            validate_super_admin_operation('modify_super_admin')
        
        assert exc_info.value.code == 'CANNOT_MODIFY_SUPER_ADMIN'
        assert exc_info.value.status_code == 403
    
    def test_validate_critical_setting_without_confirmation(self):
        """Test validation requires confirmation for critical settings"""
        entity_data = {'confirmed': False}
        
        with pytest.raises(SuperAdminError) as exc_info:
            validate_super_admin_operation('critical_setting', entity_data)
        
        assert exc_info.value.code == 'CRITICAL_SETTING_CHANGE'
    
    def test_validate_critical_setting_with_confirmation(self):
        """Test validation allows critical setting with confirmation"""
        entity_data = {'confirmed': True}
        
        # Should not raise exception
        validate_super_admin_operation('critical_setting', entity_data)


if __name__ == '__main__':
    pytest.main([__file__])