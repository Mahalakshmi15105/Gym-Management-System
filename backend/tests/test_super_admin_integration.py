"""
Integration tests for complete Super Admin workflows
Tests end-to-end functionality for gym management, user management, subscriptions, and activity logging
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, date, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Gym, Member, Payment
from app.super_admin_models import SystemSettings, ActivityLog, GymSubscription


@pytest.fixture
def app():
    """Create test application"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def super_admin_token(client):
    """Create Super Admin token for authentication"""
    # Mock JWT token generation
    return "mock_super_admin_token"


@pytest.fixture
def test_gym(app):
    """Create test gym"""
    with app.app_context():
        gym = Gym(
            name="Test Gym",
            address="123 Test St",
            phone="555-0123",
            email="test@gym.com",
            status="Pending"
        )
        db.session.add(gym)
        db.session.commit()
        return gym


class TestGymManagementWorkflow:
    """Test complete gym management workflow: approve → suspend → delete"""
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_gym_approval_workflow(self, mock_super_admin, mock_jwt, client, test_gym, super_admin_token):
        """Test gym approval workflow"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        # 1. Approve gym
        response = client.put(f'/admin/gyms/{test_gym.id}/approve', 
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        
        # 2. Verify gym status changed
        response = client.get(f'/admin/gyms/{test_gym.id}',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['gym']['status'] == 'Active'
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_gym_suspension_workflow(self, mock_super_admin, mock_jwt, client, test_gym, super_admin_token):
        """Test gym suspension workflow"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        # 1. First approve gym
        client.put(f'/admin/gyms/{test_gym.id}/approve',
                  headers={'Authorization': f'Bearer {super_admin_token}'})
        
        # 2. Suspend gym
        response = client.put(f'/admin/gyms/{test_gym.id}/suspend',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        
        # 3. Verify gym status changed
        response = client.get(f'/admin/gyms/{test_gym.id}',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        data = response.get_json()
        assert data['gym']['status'] == 'Suspended'
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_gym_deletion_workflow(self, mock_super_admin, mock_jwt, client, test_gym, super_admin_token):
        """Test gym deletion workflow"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        # Delete gym (should work if no active members)
        response = client.delete(f'/admin/gyms/{test_gym.id}',
                               headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        
        # Verify gym is deleted
        response = client.get(f'/admin/gyms/{test_gym.id}',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 404


class TestUserManagementWorkflow:
    """Test complete user management workflow across multiple gyms"""
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_cross_gym_user_search(self, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test user search across multiple gyms"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            # Create users in different gyms
            gym1 = Gym(name="Gym 1", address="123 St", phone="555-0001", email="gym1@test.com")
            gym2 = Gym(name="Gym 2", address="456 St", phone="555-0002", email="gym2@test.com")
            db.session.add_all([gym1, gym2])
            db.session.flush()
            
            user1 = User(name="John Doe", email="john@test.com", gym_id=gym1.id, role="member")
            user2 = User(name="Jane Smith", email="jane@test.com", gym_id=gym2.id, role="member")
            db.session.add_all([user1, user2])
            db.session.commit()
        
        # Search users across all gyms
        response = client.get('/admin/users?search=test.com',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['users']) == 2
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_user_status_management(self, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test user status management (enable/disable)"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            gym = Gym(name="Test Gym", address="123 St", phone="555-0001", email="gym@test.com")
            db.session.add(gym)
            db.session.flush()
            
            user = User(name="Test User", email="user@test.com", gym_id=gym.id, role="member", status="Active")
            db.session.add(user)
            db.session.commit()
            user_id = user.id
        
        # Disable user
        response = client.put(f'/admin/users/{user_id}/disable',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        
        # Verify user status changed
        response = client.get(f'/admin/users/{user_id}',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        data = response.get_json()
        assert data['user']['status'] == 'Disabled'


class TestSubscriptionManagementWorkflow:
    """Test subscription management and billing cycle operations"""
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_subscription_creation_workflow(self, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test subscription creation and management"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            gym = Gym(name="Test Gym", address="123 St", phone="555-0001", email="gym@test.com")
            db.session.add(gym)
            db.session.commit()
            gym_id = gym.id
        
        # Create subscription
        subscription_data = {
            'gym_id': gym_id,
            'plan_name': 'Premium Plan',
            'monthly_price': 99.99,
            'max_members': 500,
            'billing_cycle_start': date.today().isoformat(),
            'billing_cycle_end': (date.today() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/admin/subscriptions',
                             json=subscription_data,
                             headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 201
        
        # Verify subscription created
        response = client.get(f'/admin/subscriptions?gym_id={gym_id}',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        data = response.get_json()
        assert len(data['subscriptions']) == 1
        assert data['subscriptions'][0]['plan_name'] == 'Premium Plan'
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_billing_cycle_management(self, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test billing cycle management operations"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            gym = Gym(name="Test Gym", address="123 St", phone="555-0001", email="gym@test.com")
            db.session.add(gym)
            db.session.flush()
            
            subscription = GymSubscription(
                gym_id=gym.id,
                plan_name='Basic Plan',
                monthly_price=49.99,
                max_members=100,
                billing_cycle_start=date.today(),
                billing_cycle_end=date.today() + timedelta(days=30),
                next_billing_date=date.today() + timedelta(days=30)
            )
            db.session.add(subscription)
            db.session.commit()
            subscription_id = subscription.id
        
        # Update billing cycle
        update_data = {
            'next_billing_date': (date.today() + timedelta(days=60)).isoformat()
        }
        
        response = client.put(f'/admin/subscriptions/{subscription_id}',
                            json=update_data,
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200


class TestActivityLoggingAccuracy:
    """Test activity logging accuracy across all Super Admin operations"""
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    @patch('app.activity_logging.ActivityLogger.log_super_admin_action')
    def test_gym_operations_logging(self, mock_log, mock_super_admin, mock_jwt, client, test_gym, super_admin_token):
        """Test that gym operations are properly logged"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        # Approve gym
        client.put(f'/admin/gyms/{test_gym.id}/approve',
                  headers={'Authorization': f'Bearer {super_admin_token}'})
        
        # Verify logging was called
        mock_log.assert_called()
        call_args = mock_log.call_args[1]
        assert call_args['action_type'] == 'gym_approval'
        assert call_args['target_gym_id'] == test_gym.id
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    @patch('app.activity_logging.ActivityLogger.log_activity')
    def test_user_management_logging(self, mock_log, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test that user management operations are logged"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            gym = Gym(name="Test Gym", address="123 St", phone="555-0001", email="gym@test.com")
            db.session.add(gym)
            db.session.flush()
            
            user = User(name="Test User", email="user@test.com", gym_id=gym.id, role="member")
            db.session.add(user)
            db.session.commit()
            user_id = user.id
        
        # Disable user
        client.put(f'/admin/users/{user_id}/disable',
                  headers={'Authorization': f'Bearer {super_admin_token}'})
        
        # Verify logging was called
        mock_log.assert_called()


class TestRoleBasedAccessControl:
    """Test role-based access control throughout the application"""
    
    def test_super_admin_access_granted(self, client):
        """Test Super Admin access is granted to admin routes"""
        # Mock Super Admin token
        with patch('app.auth_utils.get_jwt') as mock_jwt:
            mock_jwt.return_value = {'role': 'super_admin', 'sub': '1'}
            
            response = client.get('/admin/analytics/platform',
                                headers={'Authorization': 'Bearer mock_token'})
            # Should not return 403 (would return 200 or other non-403 status)
            assert response.status_code != 403
    
    def test_gym_owner_access_denied(self, client):
        """Test gym owner access is denied to Super Admin routes"""
        with patch('app.auth_utils.get_jwt') as mock_jwt:
            mock_jwt.return_value = {'role': 'gym_owner', 'sub': '1', 'gym_id': 1}
            
            response = client.get('/admin/analytics/platform',
                                headers={'Authorization': 'Bearer mock_token'})
            assert response.status_code == 403


class TestTenantIsolation:
    """Test that tenant isolation is maintained with Super Admin features"""
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_cross_tenant_data_access(self, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test Super Admin can access cross-tenant data safely"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            # Create multiple gyms with members
            gym1 = Gym(name="Gym 1", address="123 St", phone="555-0001", email="gym1@test.com")
            gym2 = Gym(name="Gym 2", address="456 St", phone="555-0002", email="gym2@test.com")
            db.session.add_all([gym1, gym2])
            db.session.flush()
            
            member1 = Member(gym_id=gym1.id, first_name="John", last_name="Doe", phone="555-1111")
            member2 = Member(gym_id=gym2.id, first_name="Jane", last_name="Smith", phone="555-2222")
            db.session.add_all([member1, member2])
            db.session.commit()
        
        # Super Admin should see aggregated data
        response = client.get('/admin/analytics/platform',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        
        data = response.get_json()
        assert data['total_gyms'] == 2
        assert data['total_members'] >= 2
    
    @patch('app.routes.admin.jwt_required')
    @patch('app.routes.admin.super_admin_required')
    def test_gym_specific_operations_maintain_isolation(self, mock_super_admin, mock_jwt, client, app, super_admin_token):
        """Test gym-specific operations maintain proper isolation"""
        mock_jwt.return_value = lambda f: f
        mock_super_admin.return_value = lambda f: f
        
        with app.app_context():
            gym1 = Gym(name="Gym 1", address="123 St", phone="555-0001", email="gym1@test.com")
            gym2 = Gym(name="Gym 2", address="456 St", phone="555-0002", email="gym2@test.com")
            db.session.add_all([gym1, gym2])
            db.session.commit()
            gym1_id, gym2_id = gym1.id, gym2.id
        
        # Operations on gym1 should not affect gym2
        response = client.put(f'/admin/gyms/{gym1_id}/suspend',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        assert response.status_code == 200
        
        # Verify gym2 is unaffected
        response = client.get(f'/admin/gyms/{gym2_id}',
                            headers={'Authorization': f'Bearer {super_admin_token}'})
        data = response.get_json()
        assert data['gym']['status'] != 'Suspended'


if __name__ == '__main__':
    pytest.main([__file__])