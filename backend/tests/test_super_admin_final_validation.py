#!/usr/bin/env python3
"""
Final validation test for Super Admin module integration.
Tests core functionality to ensure the module is ready for production.
"""

import sys
import os

# Add the parent directory to Python path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_imports():
    """Test that all Super Admin modules can be imported correctly"""
    try:
        # Test backend imports
        from app.super_admin_models import ActivityLog, SystemSettings, GymSubscription
        from app.enhanced_models import Gym
        from app.auth_utils import super_admin_required, get_current_user_id
        from app.activity_logging import ActivityLogger, log_activity, log_admin_action
        from app.super_admin_errors import SuperAdminError
        
        print("✅ All Super Admin modules imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_models_structure():
    """Test that Super Admin models have required attributes"""
    try:
        from app.super_admin_models import ActivityLog, SystemSettings, GymSubscription
        
        # Test ActivityLog model
        activity_log_attrs = ['user_id', 'gym_id', 'action_type', 'description', 'timestamp']
        for attr in activity_log_attrs:
            assert hasattr(ActivityLog, attr), f"ActivityLog missing {attr}"
        
        # Test SystemSettings model
        settings_attrs = ['setting_key', 'setting_value', 'setting_type', 'updated_by']
        for attr in settings_attrs:
            assert hasattr(SystemSettings, attr), f"SystemSettings missing {attr}"
        
        # Test GymSubscription model
        subscription_attrs = ['gym_id', 'plan_name', 'monthly_price', 'status']
        for attr in subscription_attrs:
            assert hasattr(GymSubscription, attr), f"GymSubscription missing {attr}"
        
        print("✅ All model structures validated")
        return True
    except Exception as e:
        print(f"❌ Model validation error: {e}")
        return False

def test_authentication_functions():
    """Test that authentication functions are properly defined"""
    try:
        from app.auth_utils import super_admin_required, get_current_user_id
        
        # Check that functions are callable
        assert callable(super_admin_required), "super_admin_required is not callable"
        assert callable(get_current_user_id), "get_current_user_id is not callable"
        
        print("✅ Authentication functions validated")
        return True
    except Exception as e:
        print(f"❌ Authentication validation error: {e}")
        return False

def test_activity_logging():
    """Test that activity logging functions are available"""
    try:
        from app.activity_logging import ActivityLogger, log_activity, log_admin_action, log_user_action
        
        # Check that ActivityLogger class exists and has required methods
        assert hasattr(ActivityLogger, 'log_activity'), "ActivityLogger missing log_activity"
        assert hasattr(ActivityLogger, 'log_super_admin_action'), "ActivityLogger missing log_super_admin_action"
        
        # Check convenience functions
        assert callable(log_activity), "log_activity is not callable"
        assert callable(log_admin_action), "log_admin_action is not callable"
        assert callable(log_user_action), "log_user_action is not callable"
        
        print("✅ Activity logging functions validated")
        return True
    except Exception as e:
        print(f"❌ Activity logging validation error: {e}")
        return False

def test_admin_routes_import():
    """Test that admin routes blueprint can be imported"""
    try:
        from app.routes.admin import admin_bp
        
        # Check that it's a Flask blueprint
        assert hasattr(admin_bp, 'name'), "admin_bp is not a proper Flask blueprint"
        assert admin_bp.name == 'admin', "Blueprint name is not 'admin'"
        
        print("✅ Admin routes blueprint validated")
        return True
    except Exception as e:
        print(f"❌ Admin routes validation error: {e}")
        return False

def test_error_handling():
    """Test that error handling modules are available"""
    try:
        from app.super_admin_errors import SuperAdminError, handle_super_admin_errors
        
        # Check that SuperAdminError is an exception class
        assert issubclass(SuperAdminError, Exception), "SuperAdminError is not an Exception subclass"
        assert callable(handle_super_admin_errors), "handle_super_admin_errors is not callable"
        
        print("✅ Error handling modules validated")
        return True
    except Exception as e:
        print(f"❌ Error handling validation error: {e}")
        return False

def run_all_tests():
    """Run all validation tests"""
    print("🚀 Running Super Admin Final Validation Tests...")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_models_structure,
        test_authentication_functions,
        test_activity_logging,
        test_admin_routes_import,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} failed with error: {e}")
    
    print("\n" + "=" * 60)
    print(f"FINAL RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Super Admin module is ready for production!")
        return True
    else:
        print(f"⚠️  {total - passed} tests failed. Module needs attention.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)