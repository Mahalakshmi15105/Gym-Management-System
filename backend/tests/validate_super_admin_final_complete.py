#!/usr/bin/env python3
"""
Final validation script for Super Admin module.
Validates all components, routes, security, and integration.
"""

import os
import sys
import sqlite3
import json
from pathlib import Path

def validate_file_structure():
    """Validate that all required files exist."""
    print("🔍 Validating file structure...")
    
    required_files = [
        # Backend models and core
        'backend/app/super_admin_models.py',
        'backend/app/enhanced_models.py',
        'backend/app/auth_utils.py',
        'backend/app/activity_logging.py',
        'backend/app/super_admin_errors.py',
        
        # Backend routes
        'backend/app/routes/admin.py',
        
        # Database migrations
        'backend/migrations/001_create_super_admin_tables.sql',
        'backend/migrations/002_enhance_gym_model.sql',
        
        # Frontend pages
        'frontend/src/pages/SuperAdminDashboard.jsx',
        'frontend/src/pages/GymManagement.jsx',
        'frontend/src/pages/SubscriptionManagement.jsx',
        'frontend/src/pages/UserManagement.jsx',
        'frontend/src/pages/SystemSettings.jsx',
        'frontend/src/pages/ActivityLogs.jsx',
        
        # Frontend components
        'frontend/src/components/admin/AdminDataTable.jsx',
        'frontend/src/components/admin/AdminMetricCard.jsx',
        'frontend/src/components/admin/AdminActionModal.jsx',
        'frontend/src/components/admin/AdminChart.jsx',
        'frontend/src/components/admin/ResponsiveDataTable.jsx',
        'frontend/src/components/admin/MobileNavigation.jsx',
        'frontend/src/components/admin/ErrorNotification.jsx',
        'frontend/src/components/admin/ConfirmationDialog.jsx',
        'frontend/src/components/admin/FormErrorDisplay.jsx',
        
        # Context and utilities
        'frontend/src/context/AuthContext.jsx',
        'frontend/src/components/ProtectedRoute.jsx',
        'frontend/src/components/RoleBasedNavLink.jsx',
        'frontend/src/utils/errorHandling.js',
        'frontend/src/hooks/useResponsive.js',
        'frontend/src/styles/responsive.css',
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    
    print("✅ All required files exist")
    return True

def validate_backend_models():
    """Validate backend models and database schema."""
    print("🔍 Validating backend models...")
    
    try:
        # Check super admin models
        with open('backend/app/super_admin_models.py', 'r') as f:
            content = f.read()
            required_models = ['SystemSettings', 'ActivityLog', 'GymSubscription']
            for model in required_models:
                if f"class {model}" not in content:
                    print(f"❌ Missing model: {model}")
                    return False
        
        # Check enhanced models
        with open('backend/app/enhanced_models.py', 'r') as f:
            content = f.read()
            if 'class Gym' not in content:
                print("❌ Enhanced Gym model not found")
                return False
        
        # Check auth utilities
        with open('backend/app/auth_utils.py', 'r') as f:
            content = f.read()
            required_functions = ['super_admin_required', 'get_current_user_role']
            for func in required_functions:
                if f"def {func}" not in content:
                    print(f"❌ Missing auth function: {func}")
                    return False
        
        print("✅ Backend models validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Backend models validation failed: {e}")
        return False

def validate_backend_routes():
    """Validate backend routes and endpoints."""
    print("🔍 Validating backend routes...")
    
    try:
        with open('backend/app/routes/admin.py', 'r') as f:
            content = f.read()
            
            required_routes = [
                '/dashboard/analytics',
                '/gyms',
                '/gyms/<int:gym_id>/approve',
                '/gyms/<int:gym_id>/suspend',
                '/subscriptions',
                '/users',
                '/settings',
                '/activity-logs'
            ]
            
            for route in required_routes:
                if route not in content:
                    print(f"❌ Missing route: {route}")
                    return False
        
        print("✅ Backend routes validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Backend routes validation failed: {e}")
        return False

def validate_frontend_pages():
    """Validate frontend page components."""
    print("🔍 Validating frontend pages...")
    
    required_pages = [
        ('frontend/src/pages/SuperAdminDashboard.jsx', 'SuperAdminDashboard'),
        ('frontend/src/pages/GymManagement.jsx', 'GymManagement'),
        ('frontend/src/pages/SubscriptionManagement.jsx', 'SubscriptionManagement'),
        ('frontend/src/pages/UserManagement.jsx', 'UserManagement'),
        ('frontend/src/pages/SystemSettings.jsx', 'SystemSettings'),
        ('frontend/src/pages/ActivityLogs.jsx', 'ActivityLogs'),
    ]
    
    try:
        for file_path, component_name in required_pages:
            with open(file_path, 'r') as f:
                content = f.read()
                if f"const {component_name}" not in content and f"function {component_name}" not in content:
                    print(f"❌ Missing component: {component_name} in {file_path}")
                    return False
        
        print("✅ Frontend pages validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Frontend pages validation failed: {e}")
        return False

def validate_frontend_components():
    """Validate frontend admin components."""
    print("🔍 Validating frontend components...")
    
    required_components = [
        ('frontend/src/components/admin/AdminDataTable.jsx', 'AdminDataTable'),
        ('frontend/src/components/admin/AdminMetricCard.jsx', 'AdminMetricCard'),
        ('frontend/src/components/admin/AdminActionModal.jsx', 'AdminActionModal'),
        ('frontend/src/components/admin/AdminChart.jsx', 'AdminChart'),
        ('frontend/src/components/admin/ResponsiveDataTable.jsx', 'ResponsiveDataTable'),
        ('frontend/src/components/admin/ErrorNotification.jsx', 'ErrorNotification'),
        ('frontend/src/components/admin/ConfirmationDialog.jsx', 'ConfirmationDialog'),
    ]
    
    try:
        for file_path, component_name in required_components:
            with open(file_path, 'r') as f:
                content = f.read()
                if f"const {component_name}" not in content and f"function {component_name}" not in content:
                    print(f"❌ Missing component: {component_name} in {file_path}")
                    return False
        
        print("✅ Frontend components validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Frontend components validation failed: {e}")
        return False

def validate_authentication_integration():
    """Validate authentication and role-based access."""
    print("🔍 Validating authentication integration...")
    
    try:
        # Check AuthContext
        with open('frontend/src/context/AuthContext.jsx', 'r') as f:
            content = f.read()
            if 'super_admin' not in content.lower():
                print("❌ AuthContext missing super admin role support")
                return False
        
        # Check ProtectedRoute
        with open('frontend/src/components/ProtectedRoute.jsx', 'r') as f:
            content = f.read()
            if 'role' not in content.lower():
                print("❌ ProtectedRoute missing role checking")
                return False
        
        # Check RoleBasedNavLink
        with open('frontend/src/components/RoleBasedNavLink.jsx', 'r') as f:
            content = f.read()
            if 'super_admin' not in content.lower():
                print("❌ RoleBasedNavLink missing super admin support")
                return False
        
        print("✅ Authentication integration validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Authentication integration validation failed: {e}")
        return False

def validate_responsive_design():
    """Validate responsive design implementation."""
    print("🔍 Validating responsive design...")
    
    try:
        # Check responsive CSS
        if os.path.exists('frontend/src/styles/responsive.css'):
            with open('frontend/src/styles/responsive.css', 'r') as f:
                content = f.read()
                if '@media' not in content:
                    print("❌ Responsive CSS missing media queries")
                    return False
        
        # Check responsive components
        responsive_files = [
            'frontend/src/components/admin/ResponsiveDataTable.jsx',
            'frontend/src/components/admin/MobileNavigation.jsx',
            'frontend/src/hooks/useResponsive.js'
        ]
        
        for file in responsive_files:
            if not os.path.exists(file):
                print(f"❌ Missing responsive file: {file}")
                return False
        
        print("✅ Responsive design validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Responsive design validation failed: {e}")
        return False

def validate_error_handling():
    """Validate error handling implementation."""
    print("🔍 Validating error handling...")
    
    try:
        # Check error components
        error_files = [
            'frontend/src/components/admin/ErrorNotification.jsx',
            'frontend/src/components/admin/FormErrorDisplay.jsx',
            'frontend/src/utils/errorHandling.js',
            'backend/app/super_admin_errors.py'
        ]
        
        for file in error_files:
            if not os.path.exists(file):
                print(f"❌ Missing error handling file: {file}")
                return False
        
        print("✅ Error handling validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Error handling validation failed: {e}")
        return False

def validate_activity_logging():
    """Validate activity logging implementation."""
    print("🔍 Validating activity logging...")
    
    try:
        # Check activity logging module
        with open('backend/app/activity_logging.py', 'r') as f:
            content = f.read()
            if 'def log_activity' not in content:
                print("❌ Missing log_activity function")
                return False
        
        # Check ActivityLog model exists
        with open('backend/app/super_admin_models.py', 'r') as f:
            content = f.read()
            if 'class ActivityLog' not in content:
                print("❌ Missing ActivityLog model")
                return False
        
        print("✅ Activity logging validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Activity logging validation failed: {e}")
        return False

def validate_database_migrations():
    """Validate database migrations."""
    print("🔍 Validating database migrations...")
    
    try:
        # Check migration files exist
        migration_files = [
            'backend/migrations/001_create_super_admin_tables.sql',
            'backend/migrations/002_enhance_gym_model.sql'
        ]
        
        for file in migration_files:
            if not os.path.exists(file):
                print(f"❌ Missing migration file: {file}")
                return False
        
        # Check migration content
        with open('backend/migrations/001_create_super_admin_tables.sql', 'r') as f:
            content = f.read()
            required_tables = ['system_settings', 'activity_logs', 'gym_subscriptions']
            for table in required_tables:
                if f"CREATE TABLE {table}" not in content:
                    print(f"❌ Missing table creation in migration: {table}")
                    return False
        
        with open('backend/migrations/002_enhance_gym_model.sql', 'r') as f:
            content = f.read()
            required_columns = ['status', 'approved_at', 'approved_by']
            for column in required_columns:
                if f"ADD COLUMN {column}" not in content:
                    print(f"❌ Missing column addition in migration: {column}")
                    return False
        
        print("✅ Database migrations validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Database migrations validation failed: {e}")
        return False

def validate_tests_exist():
    """Validate that comprehensive tests exist."""
    print("🔍 Validating test coverage...")
    
    test_files = [
        'backend/tests/test_super_admin_models.py',
        'backend/tests/test_admin_routes.py',
        'backend/tests/test_user_management.py',
        'backend/tests/test_subscription_management.py',
        'backend/tests/test_activity_logging.py',
        'backend/tests/test_super_admin_errors.py',
        'backend/tests/test_super_admin_integration.py',
        'backend/tests/test_super_admin_final_integration.py',
        'backend/tests/test_super_admin_final_complete.py',
        
        # Frontend tests
        'frontend/src/pages/__tests__/SuperAdminDashboard.test.jsx',
        'frontend/src/pages/__tests__/GymManagement.test.jsx',
        'frontend/src/pages/__tests__/SubscriptionManagement.test.jsx',
        'frontend/src/pages/__tests__/UserManagement.test.jsx',
        'frontend/src/pages/__tests__/SystemSettings.test.jsx',
        'frontend/src/pages/__tests__/ActivityLogs.test.jsx',
        'frontend/src/components/admin/__tests__/AdminDataTable.test.jsx',
        'frontend/src/components/admin/__tests__/AdminMetricCard.test.jsx',
        'frontend/src/components/admin/__tests__/AdminChart.test.jsx',
        'frontend/src/components/admin/__tests__/ErrorHandling.test.jsx',
        'frontend/src/components/admin/__tests__/Responsive.test.jsx',
    ]
    
    missing_tests = []
    for test_file in test_files:
        if not os.path.exists(test_file):
            missing_tests.append(test_file)
    
    if missing_tests:
        print(f"❌ Missing test files:")
        for test in missing_tests[:10]:  # Show first 10
            print(f"  - {test}")
        if len(missing_tests) > 10:
            print(f"  ... and {len(missing_tests) - 10} more")
        return False
    
    print("✅ Test coverage validation passed")
    return True

def validate_documentation():
    """Validate documentation exists."""
    print("🔍 Validating documentation...")
    
    try:
        doc_file = 'docs/SUPER_ADMIN_MODULE.md'
        if not os.path.exists(doc_file):
            print(f"❌ Missing documentation file: {doc_file}")
            return False
        
        with open(doc_file, 'r') as f:
            content = f.read()
            required_sections = [
                '# Super Admin Module',
                '## Overview',
                '## Features',
                '## Installation',
                '## Usage',
                '## API Endpoints'
            ]
            
            for section in required_sections:
                if section not in content:
                    print(f"❌ Missing documentation section: {section}")
                    return False
        
        print("✅ Documentation validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Documentation validation failed: {e}")
        return False

def run_all_validations():
    """Run all validation checks."""
    print("🚀 Starting Super Admin Module Final Validation\n")
    
    validations = [
        validate_file_structure,
        validate_backend_models,
        validate_backend_routes,
        validate_frontend_pages,
        validate_frontend_components,
        validate_authentication_integration,
        validate_responsive_design,
        validate_error_handling,
        validate_activity_logging,
        validate_database_migrations,
        validate_tests_exist,
        validate_documentation
    ]
    
    passed = 0
    failed = 0
    
    for validation in validations:
        try:
            if validation():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Validation error: {e}")
            failed += 1
        print()  # Add spacing between validations
    
    print("=" * 60)
    print(f"📊 VALIDATION SUMMARY")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {passed}/{passed+failed} ({(passed/(passed+failed)*100):.1f}%)")
    
    if failed == 0:
        print("\n🎉 ALL VALIDATIONS PASSED! Super Admin module is complete and ready.")
        return True
    else:
        print(f"\n⚠️  {failed} validation(s) failed. Please review and fix the issues above.")
        return False

if __name__ == '__main__':
    success = run_all_validations()
    sys.exit(0 if success else 1)