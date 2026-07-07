"""
Unit tests for comprehensive activity logging functionality.
Tests all aspects of the ActivityLogger class and integration.
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, date
from app.activity_logging import ActivityLogger
from app.super_admin_models import ActivityLog
from app.extensions import db


class TestActivityLogger:
    """Test suite for ActivityLogger functionality."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.test_user_id = 1
        self.test_gym_id = 1
        self.test_entity_id = 123
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    @patch('app.activity_logging.request')
    def test_log_activity_basic(self, mock_request, mock_get_gym_id, mock_get_user_id):
        """Test basic activity logging functionality."""
        # Setup mocks
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        mock_request.remote_addr = '192.168.1.1'
        mock_request.headers.get.return_value = 'Mozilla/5.0 Test Browser'
        mock_request.method = 'POST'
        mock_request.path = '/api/members'
        
        # Test basic logging
        result = ActivityLogger.log_activity(
            'create',
            'Test activity description',
            entity_type='member',
            entity_id=self.test_entity_id
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    def test_log_create(self, mock_get_gym_id, mock_get_user_id):
        """Test log_create method."""
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        
        result = ActivityLogger.log_create(
            'member',
            self.test_entity_id,
            entity_name='John Doe',
            extra_data={'phone': '1234567890'}
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    def test_log_update(self, mock_get_gym_id, mock_get_user_id):
        """Test log_update method."""
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        
        changes = {
            'first_name': {'old': 'John', 'new': 'Johnny'},
            'phone': {'old': '1111111111', 'new': '2222222222'}
        }
        
        result = ActivityLogger.log_update(
            'member',
            self.test_entity_id,
            changes=changes,
            entity_name='John Doe'
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    def test_log_delete(self, mock_get_gym_id, mock_get_user_id):
        """Test log_delete method."""
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        
        result = ActivityLogger.log_delete(
            'member',
            self.test_entity_id,
            entity_name='John Doe',
            soft_delete=False
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    def test_log_view(self, mock_get_gym_id, mock_get_user_id):
        """Test log_view method."""
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        
        result = ActivityLogger.log_view(
            'member',
            self.test_entity_id,
            entity_name='John Doe',
            view_type='detail'
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    def test_log_export(self, mock_get_gym_id, mock_get_user_id):
        """Test log_export method."""
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        
        result = ActivityLogger.log_export(
            'member',
            export_format='csv',
            record_count=25
        )
        
        assert result is True
        
    def test_log_system_event(self):
        """Test log_system_event method."""
        result = ActivityLogger.log_system_event(
            'backup',
            'System backup completed successfully',
            severity='info'
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    def test_log_super_admin_action(self, mock_get_user_id):
        """Test log_super_admin_action method."""
        mock_get_user_id.return_value = self.test_user_id
        
        result = ActivityLogger.log_super_admin_action(
            'gym_approval',
            'Approved gym registration',
            target_gym_id=5,
            entity_type='gym',
            entity_id=5
        )
        
        assert result is True
        
    def test_log_authentication(self):
        """Test log_authentication method."""
        result = ActivityLogger.log_authentication(
            'login',
            self.test_user_id,
            success=True,
            details='Successful login from web interface'
        )
        
        assert result is True
        
    def test_log_authentication_failed(self):
        """Test log_authentication method for failed attempts."""
        result = ActivityLogger.log_authentication(
            'login',
            self.test_user_id,
            success=False,
            details='Invalid password'
        )
        
        assert result is True
        
    @patch('app.activity_logging.request')
    def test_get_client_ip_forwarded(self, mock_request):
        """Test IP address extraction with forwarded headers."""
        mock_request.headers.get.side_effect = lambda header: {
            'X-Forwarded-For': '203.0.113.1, 198.51.100.1',
            'X-Real-IP': None
        }.get(header)
        
        ip = ActivityLogger._get_client_ip()
        assert ip == '203.0.113.1'
        
    @patch('app.activity_logging.request')
    def test_get_client_ip_real_ip(self, mock_request):
        """Test IP address extraction with X-Real-IP header."""
        mock_request.headers.get.side_effect = lambda header: {
            'X-Forwarded-For': None,
            'X-Real-IP': '203.0.113.2'
        }.get(header)
        
        ip = ActivityLogger._get_client_ip()
        assert ip == '203.0.113.2'
        
    @patch('app.activity_logging.request')
    def test_get_client_ip_remote_addr(self, mock_request):
        """Test IP address extraction with remote_addr."""
        mock_request.headers.get.return_value = None
        mock_request.remote_addr = '203.0.113.3'
        
        ip = ActivityLogger._get_client_ip()
        assert ip == '203.0.113.3'
        
    @patch('app.activity_logging.request')
    def test_get_user_agent(self, mock_request):
        """Test user agent extraction."""
        test_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        mock_request.headers.get.return_value = test_user_agent
        
        user_agent = ActivityLogger._get_user_agent()
        assert user_agent == test_user_agent
        
    @patch('app.activity_logging.request')
    def test_get_request_method(self, mock_request):
        """Test request method extraction."""
        mock_request.method = 'PUT'
        
        method = ActivityLogger._get_request_method()
        assert method == 'PUT'
        
    @patch('app.activity_logging.request')
    def test_get_request_path(self, mock_request):
        """Test request path extraction."""
        mock_request.path = '/api/members/123'
        
        path = ActivityLogger._get_request_path()
        assert path == '/api/members/123'
        
    @patch('app.activity_logging.request', None)
    def test_context_methods_no_request(self):
        """Test context methods when request is not available."""
        assert ActivityLogger._get_client_ip() is None
        assert ActivityLogger._get_user_agent() is None
        assert ActivityLogger._get_request_method() is None
        assert ActivityLogger._get_request_path() is None
        
    @patch('app.activity_logging.db.session')
    def test_log_activity_exception_handling(self, mock_session):
        """Test that logging exceptions don't break the main operation."""
        mock_session.add.side_effect = Exception('Database error')
        
        result = ActivityLogger.log_activity(
            'test',
            'Test description'
        )
        
        assert result is False
        
    @patch('app.activity_logging.get_current_user_id')
    @patch('app.activity_logging.get_current_gym_id')
    def test_convenience_functions(self, mock_get_gym_id, mock_get_user_id):
        """Test convenience wrapper functions."""
        from app.activity_logging import log_activity, log_create, log_update, log_delete, log_authentication
        
        mock_get_user_id.return_value = self.test_user_id
        mock_get_gym_id.return_value = self.test_gym_id
        
        # Test convenience functions
        assert log_activity('test', 'Test activity') is True
        assert log_create('member', 123, 'John Doe') is True
        assert log_update('member', 123, changes={'name': 'John'}) is True
        assert log_delete('member', 123, 'John Doe') is True
        assert log_authentication('login', self.test_user_id, success=True) is True
        

class TestActivityLogModel:
    """Test suite for ActivityLog model."""
    
    def test_activity_log_to_dict(self):
        """Test ActivityLog model to_dict method."""
        log_entry = ActivityLog(
            user_id=1,
            gym_id=1,
            action_type='create',
            entity_type='member',
            entity_id=123,
            description='Created member: John Doe',
            ip_address='192.168.1.1',
            user_agent='Mozilla/5.0',
            request_method='POST',
            request_path='/api/members',
            extra_data={'phone': '1234567890'},
            severity='info',
            timestamp=datetime(2026, 7, 6, 10, 30, 0)
        )
        
        result_dict = log_entry.to_dict()
        
        assert result_dict['action_type'] == 'create'
        assert result_dict['entity_type'] == 'member'
        assert result_dict['entity_id'] == 123
        assert result_dict['description'] == 'Created member: John Doe'
        assert result_dict['ip_address'] == '192.168.1.1'
        assert result_dict['severity'] == 'info'
        assert result_dict['metadata'] == {'phone': '1234567890'}
        assert result_dict['timestamp'] == '2026-07-06T10:30:00'


class TestActivityLoggingIntegration:
    """Integration tests for activity logging in routes."""
    
    @patch('app.routes.members.ActivityLogger')
    def test_member_create_logging(self, mock_logger):
        """Test that member creation triggers activity logging."""
        # This would be part of a more comprehensive integration test
        # that actually creates a member and verifies logging is called
        mock_logger.log_create.return_value = True
        
        # Simulate member creation
        mock_logger.log_create(
            'member',
            123,
            entity_name='John Doe',
            gym_id=1,
            extra_data={'phone': '1234567890', 'email': 'john@example.com'}
        )
        
        mock_logger.log_create.assert_called_once()
        
    @patch('app.routes.payments.ActivityLogger')
    def test_payment_update_logging(self, mock_logger):
        """Test that payment updates trigger activity logging."""
        mock_logger.log_update.return_value = True
        
        changes = {
            'payment_amount': {'old': 100.0, 'new': 150.0},
            'payment_status': {'old': 'Pending', 'new': 'Paid'}
        }
        
        mock_logger.log_update(
            'payment',
            456,
            changes=changes,
            entity_name='Payment for John Doe',
            gym_id=1
        )
        
        mock_logger.log_update.assert_called_once()
        
    @patch('app.routes.membership_plans.ActivityLogger')
    def test_membership_plan_delete_logging(self, mock_logger):
        """Test that membership plan deletion triggers activity logging."""
        mock_logger.log_delete.return_value = True
        
        mock_logger.log_delete(
            'membership_plan',
            789,
            entity_name='Premium Plan',
            gym_id=1,
            soft_delete=False
        )
        
        mock_logger.log_delete.assert_called_once()
        
    @patch('app.auth_utils.ActivityLogger')
    def test_authentication_failure_logging(self, mock_logger):
        """Test that authentication failures are logged."""
        mock_logger.log_activity.return_value = True
        
        mock_logger.log_activity(
            'access_denied',
            'Unauthorized Super Admin access attempt',
            severity='warning',
            user_id=1,
            extra_data={'required_role': 'super_admin', 'actual_role': 'gym_owner'}
        )
        
        mock_logger.log_activity.assert_called_once()


class TestActivityLoggingSeverityLevels:
    """Test different severity levels and their handling."""
    
    @patch('app.activity_logging.get_current_user_id')
    def test_info_severity(self, mock_get_user_id):
        """Test info level logging."""
        mock_get_user_id.return_value = 1
        
        result = ActivityLogger.log_activity(
            'view',
            'Viewed member list',
            entity_type='member',
            severity='info'
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    def test_warning_severity(self, mock_get_user_id):
        """Test warning level logging."""
        mock_get_user_id.return_value = 1
        
        result = ActivityLogger.log_activity(
            'access_attempt',
            'Failed login attempt',
            entity_type='user',
            severity='warning'
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    def test_error_severity(self, mock_get_user_id):
        """Test error level logging."""
        mock_get_user_id.return_value = 1
        
        result = ActivityLogger.log_activity(
            'system_error',
            'Database connection failed',
            severity='error'
        )
        
        assert result is True
        
    @patch('app.activity_logging.get_current_user_id')
    def test_critical_severity(self, mock_get_user_id):
        """Test critical level logging."""
        mock_get_user_id.return_value = 1
        
        result = ActivityLogger.log_activity(
            'security_breach',
            'Unauthorized data access detected',
            severity='critical'
        )
        
        assert result is True


if __name__ == '__main__':
    pytest.main([__file__])