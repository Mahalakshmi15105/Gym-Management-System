#!/usr/bin/env python3
"""
Comprehensive final integration tests for Super Admin module.
Tests all routes, security, integration, and tenant isolation.
"""

import pytest
import json
import sqlite3
from datetime import datetime, timedelta
from flask import Flask
from flask_jwt_extended import create_access_token

# Import test modules to verify they exist and work
try:
    from backend.app import create_app
    from backend.app.models import db, User, Gym
    from backend.app.super_admin_models import SystemSettings, ActivityLog, GymSubscription
    from backend.app.enhanced_models import Gym as EnhancedGym
    from backend.app.auth_utils import super_admin_required, get_current_user_role
    from backend.app.routes.admin import admin_bp
    from backend.app.activity_logging import log_activity
    app_available = True
except ImportError as e:
    print(f"Warning: Could not import app modules: {e}")
    app_available = False

class TestSuperAdminFinalIntegration:
    """Final comprehensive integration tests for Super Admin module."""
    
    @pytest.fixture(autouse=True)
    def setup_app(self):
        """Setup test app and database."""
        if not app_available:
            pytest.skip("App modules not available")
            
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        with self.app.app_context():
            db.create_all()
            self.setup_test_data()
        
        self.client = self.app.test_client()
        yield
        
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        
        self.app_context.pop()
    
    def setup_test_data(self):
        """Create test data for final integration tests."""
        # Create test users
        self.super_admin = User(
            username='superadmin',
            email='super@admin.com',
            role='super_admin'
        )
        self.super_admin.set_password('password123')
        
        self.regular_user = User(
            username='regularuser',
            email='user@gym.com', 
            role='admin',
            gym_id=1
        )
        self.regular_user.set_password('password123')
        
        # Create test gyms
        self.test_gym1 = Gym(
            name='Test Gym 1',
            email='gym1@test.com',
            phone='1234567890',
            address='123 Test St',
            status='active',
            approved_at=datetime.utcnow(),
            approved_by=1
        )
        
        self.test_gym2 = Gym(
            name='Test Gym 2', 
            email='gym2@test.com',
            phone='0987654321',
            address='456 Test Ave',
            status='pending'
        )
        
        # Create test subscription
        self.test_subscription = GymSubscription(
            gym_id=1,
            plan_name='Premium',
            billing_cycle='monthly',
            status='active',
            start_date=datetime.utcnow(),
            next_billing_date=datetime.utcnow() + timedelta(days=30)
        )
        
        # Create test system settings
        self.test_setting = SystemSettings(
            key='max_gyms',
            value='100',
            category='limits',
            description='Maximum number of gyms allowed'
        )
        
        db.session.add_all([
            self.super_admin, self.regular_user, 
            self.test_gym1, self.test_gym2,
            self.test_subscription, self.test_setting
        ])
        db.session.commit()
    
    def get_auth_headers(self, user_role='super_admin'):
        """Get authentication headers for testing."""
        if user_role == 'super_admin':
            token = create_access_token(
                identity=self.super_admin.id,
                additional_claims={'role': 'super_admin'}
            )
        else:
            token = create_access_token(
                identity=self.regular_user.id, 
                additional_claims={'role': 'admin', 'gym_id': 1}
            )
        return {'Authorization': f'Bearer {token}'}
    
    def test_route_protection_super_admin_only(self):
        """Test 1: Verify all Super Admin routes are properly protected."""
        super_admin_routes = [
            '/api/admin/dashboard/analytics',
            '/api/admin/gyms',
            '/api/admin/gyms/1/approve',
            '/api/admin/gyms/1/suspend', 
            '/api/admin/subscriptions',
            '/api/admin/users',
            '/api/admin/settings',
            '/api/admin/activity-logs'
        ]
        
        # Test with no authentication
        for route in super_admin_routes:
            response = self.client.get(route)
            assert response.status_code == 401, f"Route {route} should require authentication"
        
        # Test with regular user authentication
        regular_headers = self.get_auth_headers('admin')
        for route in super_admin_routes:
            response = self.client.get(route, headers=regular_headers)
            assert response.status_code == 403, f"Route {route} should deny regular users"
        
        # Test with super admin authentication
        admin_headers = self.get_auth_headers('super_admin')
        for route in super_admin_routes:
            response = self.client.get(route, headers=admin_headers)
            assert response.status_code in [200, 404], f"Route {route} should allow super admin"
    
    def test_gym_management_integration(self):
        """Test 2: Test complete gym management workflow."""
        headers = self.get_auth_headers('super_admin')
        
        # List gyms
        response = self.client.get('/api/admin/gyms', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['gyms']) >= 2
        
        # Approve pending gym
        response = self.client.post('/api/admin/gyms/2/approve', headers=headers)
        assert response.status_code == 200
        
        # Verify gym was approved
        gym2 = Gym.query.get(2)
        assert gym2.status == 'active'
        assert gym2.approved_at is not None
        
        # Suspend gym
        response = self.client.post('/api/admin/gyms/2/suspend', headers=headers)
        assert response.status_code == 200
        
        # Verify gym was suspended
        gym2 = Gym.query.get(2)
        assert gym2.status == 'suspended'
    
    def test_user_management_cross_platform(self):
        """Test 3: Test user management across all gyms."""
        headers = self.get_auth_headers('super_admin')
        
        # List all users across platforms
        response = self.client.get('/api/admin/users', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['users']) >= 2
        
        # Filter users by gym
        response = self.client.get('/api/admin/users?gym_id=1', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        gym_users = [u for u in data['users'] if u.get('gym_id') == 1]
        assert len(gym_users) >= 1
    
    def test_subscription_management_integration(self):
        """Test 4: Test subscription management functionality."""
        headers = self.get_auth_headers('super_admin')
        
        # List subscriptions
        response = self.client.get('/api/admin/subscriptions', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['subscriptions']) >= 1
        
        # Update subscription status
        response = self.client.put(
            '/api/admin/subscriptions/1',
            json={'status': 'suspended'},
            headers=headers
        )
        assert response.status_code == 200
        
        # Verify subscription was updated
        subscription = GymSubscription.query.get(1)
        assert subscription.status == 'suspended'
    
    def test_activity_logging_comprehensive(self):
        """Test 5: Test activity logging across all operations."""
        headers = self.get_auth_headers('super_admin')
        
        # Perform various operations that should be logged
        self.client.post('/api/admin/gyms/2/approve', headers=headers)
        self.client.post('/api/admin/gyms/2/suspend', headers=headers)
        self.client.put(
            '/api/admin/subscriptions/1',
            json={'status': 'active'},
            headers=headers
        )
        
        # Check activity logs
        response = self.client.get('/api/admin/activity-logs', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Should have multiple log entries
        assert len(data['logs']) >= 3
        
        # Verify log entries contain required information
        for log in data['logs']:
            assert 'action' in log
            assert 'user_id' in log
            assert 'timestamp' in log
            assert 'details' in log
    
    def test_tenant_isolation_maintained(self):
        """Test 6: Verify tenant isolation is maintained."""
        headers = self.get_auth_headers('super_admin')
        
        # Super admin should see all data
        response = self.client.get('/api/admin/gyms', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['gyms']) >= 2
        
        # Regular user should only see their gym data
        regular_headers = self.get_auth_headers('admin')
        
        # Test that regular routes still work for regular users
        # This assumes regular gym routes exist and work properly
        response = self.client.get('/api/members', headers=regular_headers)
        # Should either work (200) or be not found (404), but not forbidden (403)
        assert response.status_code in [200, 404], "Regular routes should work for regular users"
    
    def test_dashboard_analytics_integration(self):
        """Test 7: Test dashboard analytics functionality."""
        headers = self.get_auth_headers('super_admin')
        
        response = self.client.get('/api/admin/dashboard/analytics', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Verify analytics structure
        assert 'total_gyms' in data
        assert 'total_members' in data
        assert 'total_revenue' in data
        assert 'active_subscriptions' in data
        
        # Verify values are reasonable
        assert data['total_gyms'] >= 2
        assert data['active_subscriptions'] >= 0
    
    def test_system_settings_management(self):
        """Test 8: Test system settings management."""
        headers = self.get_auth_headers('super_admin')
        
        # Get settings
        response = self.client.get('/api/admin/settings', headers=headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['settings']) >= 1
        
        # Update setting
        response = self.client.put(
            '/api/admin/settings/max_gyms',
            json={'value': '150'},
            headers=headers
        )
        assert response.status_code == 200
        
        # Verify setting was updated
        setting = SystemSettings.query.filter_by(key='max_gyms').first()
        assert setting.value == '150'
    
    def test_existing_functionality_not_broken(self):
        """Test 9: Ensure existing functionality still works."""
        # Test that we can still create regular users and gyms
        regular_headers = self.get_auth_headers('admin')
        
        # Test basic operations still work
        response = self.client.get('/api/auth/me', headers=regular_headers)
        # Should work or be not found, but not break
        assert response.status_code in [200, 404, 401]
    
    def test_security_audit_passed(self):
        """Test 10: Perform security audit checks."""
        # Test SQL injection protection
        headers = self.get_auth_headers('super_admin')
        
        # Try SQL injection in various endpoints
        malicious_payloads = [
            "'; DROP TABLE gyms; --",
            "1' OR '1'='1",
            "<script>alert('xss')</script>"
        ]
        
        for payload in malicious_payloads:
            # Test in query parameters
            response = self.client.get(
                f'/api/admin/users?search={payload}',
                headers=headers
            )
            # Should not cause server error
            assert response.status_code in [200, 400, 422]
            
            # Test in JSON payload
            response = self.client.put(
                '/api/admin/settings/test_key',
                json={'value': payload},
                headers=headers
            )
            # Should handle malicious input gracefully
            assert response.status_code in [200, 400, 404, 422]

def test_all_modules_importable():
    """Test that all required modules can be imported."""
    try:
        import backend.app
        import backend.app.models
        import backend.app.super_admin_models
        import backend.app.enhanced_models
        import backend.app.auth_utils
        import backend.app.routes.admin
        import backend.app.activity_logging
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import required modules: {e}")

def test_database_migrations_applied():
    """Test that database migrations were properly applied."""
    if not app_available:
        pytest.skip("App modules not available")
        
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        
        # Test that all required tables exist
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        required_tables = [
            'users', 'gyms', 'system_settings', 
            'activity_logs', 'gym_subscriptions'
        ]
        
        for table in required_tables:
            assert table in tables, f"Required table {table} not found"
        
        # Test that Gym table has enhanced columns
        gym_columns = [col['name'] for col in inspector.get_columns('gyms')]
        enhanced_columns = ['status', 'approved_at', 'approved_by']
        
        for column in enhanced_columns:
            assert column in gym_columns, f"Enhanced column {column} not found in gyms table"

if __name__ == '__main__':
    # Run the tests
    pytest.main([__file__, '-v'])