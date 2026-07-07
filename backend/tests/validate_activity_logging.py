"""
Validation script for activity logging integration in Task 16.
Validates that activity logging is properly integrated throughout the application.
"""

import sys
import os
import re

def validate_file_content(file_path, expected_patterns):
    """Validate that a file contains expected patterns."""
    try:
        # Handle both absolute and relative paths
        if not os.path.exists(file_path):
            # Try with current directory
            file_path = os.path.join(os.getcwd(), file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        results = {}
        for pattern_name, pattern in expected_patterns.items():
            if re.search(pattern, content, re.MULTILINE | re.DOTALL):
                results[pattern_name] = True
            else:
                results[pattern_name] = False
        
        return results
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return None

def validate_activity_logging_integration():
    """Validate complete activity logging integration."""
    print("🔍 Validating Activity Logging Integration (Task 16)")
    print("=" * 60)
    
    validation_results = {
        'members_route': False,
        'payments_route': False,
        'membership_plans_route': False,
        'attendance_route': False,
        'auth_utils': False,
        'activity_logger': False,
        'tests': False
    }
    
    # 1. Validate Members Route Integration
    print("\n1. Checking Members Route Integration...")
    members_patterns = {
        'import_activity_logger': r'from app\.activity_logging import ActivityLogger',
        'log_create': r'ActivityLogger\.log_create\s*\(',
        'log_update': r'ActivityLogger\.log_update\s*\(',
        'log_delete': r'ActivityLogger\.log_delete\s*\(',
        'log_view': r'ActivityLogger\.log_view\s*\(',
        'log_search': r'ActivityLogger\.log_activity\s*\(\s*[\'"]search[\'"]'
    }
    
    members_results = validate_file_content('backend/app/routes/members.py', members_patterns)
    if members_results and all(members_results.values()):
        print("   ✅ Members route properly integrated")
        validation_results['members_route'] = True
    else:
        print("   ❌ Members route missing activity logging")
        if members_results:
            for pattern, found in members_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # 2. Validate Payments Route Integration
    print("\n2. Checking Payments Route Integration...")
    payments_patterns = {
        'import_activity_logger': r'from app\.activity_logging import ActivityLogger',
        'log_create': r'ActivityLogger\.log_create\(',
        'log_update': r'ActivityLogger\.log_update\(',
        'log_delete': r'ActivityLogger\.log_delete\(',
        'log_view': r'ActivityLogger\.log_view\(',
        'log_export': r'ActivityLogger\.log_activity\(\s*[\'"]export[\'"]'
    }
    
    payments_results = validate_file_content('backend/app/routes/payments.py', payments_patterns)
    if payments_results and all(payments_results.values()):
        print("   ✅ Payments route properly integrated")
        validation_results['payments_route'] = True
    else:
        print("   ❌ Payments route missing activity logging")
        if payments_results:
            for pattern, found in payments_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # 3. Validate Membership Plans Route Integration
    print("\n3. Checking Membership Plans Route Integration...")
    plans_patterns = {
        'import_activity_logger': r'from app\.activity_logging import ActivityLogger',
        'log_create': r'ActivityLogger\.log_create\(',
        'log_update': r'ActivityLogger\.log_update\(',
        'log_delete': r'ActivityLogger\.log_delete\(',
        'log_view': r'ActivityLogger\.log_view\('
    }
    
    plans_results = validate_file_content('backend/app/routes/membership_plans.py', plans_patterns)
    if plans_results and all(plans_results.values()):
        print("   ✅ Membership Plans route properly integrated")
        validation_results['membership_plans_route'] = True
    else:
        print("   ❌ Membership Plans route missing activity logging")
        if plans_results:
            for pattern, found in plans_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # 4. Validate Attendance Route Integration
    print("\n4. Checking Attendance Route Integration...")
    attendance_patterns = {
        'import_activity_logger': r'from app\.activity_logging import ActivityLogger',
        'log_create': r'ActivityLogger\.log_create\(',
        'log_update': r'ActivityLogger\.log_update\(',
        'log_view': r'ActivityLogger\.log_view\('
    }
    
    attendance_results = validate_file_content('backend/app/routes/attendance.py', attendance_patterns)
    if attendance_results and all(attendance_results.values()):
        print("   ✅ Attendance route properly integrated")
        validation_results['attendance_route'] = True
    else:
        print("   ❌ Attendance route missing activity logging")
        if attendance_results:
            for pattern, found in attendance_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # 5. Validate Auth Utils Integration
    print("\n5. Checking Authentication Utils Integration...")
    auth_patterns = {
        'import_activity_logger': r'from app\.activity_logging import ActivityLogger',
        'log_access_denied': r'ActivityLogger\.log_activity\(\s*[\'"]access_denied[\'"]',
        'log_authentication_event': r'def log_authentication_event\(',
        'auth_logging': r'ActivityLogger\.log_authentication\('
    }
    
    auth_results = validate_file_content('backend/app/auth_utils.py', auth_patterns)
    if auth_results and all(auth_results.values()):
        print("   ✅ Auth utils properly integrated")
        validation_results['auth_utils'] = True
    else:
        print("   ❌ Auth utils missing activity logging")
        if auth_results:
            for pattern, found in auth_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # 6. Validate Activity Logger Implementation
    print("\n6. Checking Activity Logger Implementation...")
    logger_patterns = {
        'activity_log_class': r'class ActivityLogger:',
        'log_activity_method': r'def log_activity\(',
        'log_authentication_method': r'def log_authentication\(',
        'log_create_method': r'def log_create\(',
        'log_update_method': r'def log_update\(',
        'log_delete_method': r'def log_delete\(',
        'log_view_method': r'def log_view\(',
        'log_export_method': r'def log_export\(',
        'log_super_admin_action': r'def log_super_admin_action\(',
        'ip_tracking': r'def _get_client_ip\(',
        'user_agent_tracking': r'def _get_user_agent\('
    }
    
    logger_results = validate_file_content('backend/app/activity_logging.py', logger_patterns)
    if logger_results and all(logger_results.values()):
        print("   ✅ Activity Logger properly implemented")
        validation_results['activity_logger'] = True
    else:
        print("   ❌ Activity Logger implementation incomplete")
        if logger_results:
            for pattern, found in logger_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # 7. Validate Unit Tests
    print("\n7. Checking Unit Tests...")
    test_patterns = {
        'test_class': r'class TestActivityLogger:',
        'test_log_activity': r'def test_log_activity_basic\(',
        'test_log_create': r'def test_log_create\(',
        'test_log_update': r'def test_log_update\(',
        'test_log_delete': r'def test_log_delete\(',
        'test_authentication': r'def test_log_authentication\(',
        'test_ip_extraction': r'def test_get_client_ip',
        'test_exception_handling': r'def test_log_activity_exception_handling\('
    }
    
    test_results = validate_file_content('backend/tests/test_activity_logging.py', test_patterns)
    if test_results and all(test_results.values()):
        print("   ✅ Unit tests properly implemented")
        validation_results['tests'] = True
    else:
        print("   ❌ Unit tests incomplete")
        if test_results:
            for pattern, found in test_results.items():
                print(f"      - {pattern}: {'✅' if found else '❌'}")
    
    # Final Summary
    print("\n" + "=" * 60)
    print("📊 TASK 16 VALIDATION SUMMARY")
    print("=" * 60)
    
    total_components = len(validation_results)
    completed_components = sum(validation_results.values())
    completion_percentage = (completed_components / total_components) * 100
    
    print(f"Components Completed: {completed_components}/{total_components} ({completion_percentage:.1f}%)")
    print()
    
    for component, status in validation_results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {component.replace('_', ' ').title()}")
    
    if completed_components == total_components:
        print("\n🎉 TASK 16 COMPLETED SUCCESSFULLY!")
        print("Activity logging has been fully integrated throughout the application.")
        return True
    else:
        print(f"\n⚠️  TASK 16 PARTIALLY COMPLETE ({completion_percentage:.1f}%)")
        print("Some components still need activity logging integration.")
        return False

if __name__ == "__main__":
    success = validate_activity_logging_integration()
    sys.exit(0 if success else 1)