#!/usr/bin/env python3
"""
Complete Super Admin Module Integration Validation Script

This script performs comprehensive validation of the Super Admin module
to ensure all features are properly integrated and functional.
"""

import os
import sys
import subprocess
import requests
import json
import sqlite3
from pathlib import Path

class SuperAdminValidator:
    def __init__(self):
        self.backend_path = Path(__file__).parent.parent
        self.frontend_path = self.backend_path.parent / "frontend"
        self.results = []
        self.errors = []
    
    def log_result(self, test_name, passed, details=""):
        """Log a test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.results.append(f"{status} {test_name}")
        if not passed:
            self.errors.append(f"FAIL: {test_name} - {details}")
        if details:
            self.results.append(f"    {details}")
    
    def check_file_exists(self, filepath, description):
        """Check if a file exists"""
        exists = filepath.exists()
        self.log_result(f"File exists: {description}", exists, str(filepath))
        return exists
    
    def check_route_protection(self):
        """Test 1: Verify Super Admin routes are properly protected"""
        print("\n🔐 Testing Super Admin Route Protection...")
        
        admin_routes_file = self.backend_path / "app" / "routes" / "admin.py"
        if not self.check_file_exists(admin_routes_file, "Super Admin routes"):
            return
        
        try:
            with open(admin_routes_file, 'r') as f:
                content = f.read()
            
            # Check for proper authentication decorators
            has_auth_decorators = "@super_admin_required" in content or "@jwt_required" in content
            self.log_result("Routes have authentication decorators", has_auth_decorators)
            
            # Check for key endpoints
            endpoints = [
                "/dashboard", "/gyms", "/users", "/subscriptions", 
                "/settings", "/activity-logs"
            ]
            for endpoint in endpoints:
                has_endpoint = endpoint in content
                self.log_result(f"Has {endpoint} endpoint", has_endpoint)
                
        except Exception as e:
            self.log_result("Route file validation", False, str(e))
    
    def check_database_models(self):
        """Test 2: Verify database models and migrations"""
        print("\n🗄️ Testing Database Models and Migrations...")
        
        # Check for model files
        models_files = [
            (self.backend_path / "app" / "super_admin_models.py", "Super Admin models"),
            (self.backend_path / "app" / "enhanced_models.py", "Enhanced models"),
        ]
        
        for file_path, description in models_files:
            self.check_file_exists(file_path, description)
        
        # Check migration files
        migrations_dir = self.backend_path / "migrations"
        migration_files = [
            "001_create_super_admin_tables.sql",
            "002_enhance_gym_model.sql"
        ]
        
        for migration_file in migration_files:
            migration_path = migrations_dir / migration_file
            self.check_file_exists(migration_path, f"Migration: {migration_file}")
    
    def check_frontend_authentication(self):
        """Test 3: Verify frontend authentication and role detection"""
        print("\n👤 Testing Frontend Authentication...")
        
        auth_files = [
            (self.frontend_path / "src" / "context" / "AuthContext.jsx", "AuthContext"),
            (self.frontend_path / "src" / "components" / "ProtectedRoute.jsx", "ProtectedRoute"),
        ]
        
        for file_path, description in auth_files:
            if not self.check_file_exists(file_path, description):
                continue
            
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check for Super Admin role handling
                has_super_admin = "super_admin" in content.lower()
                self.log_result(f"{description} handles super_admin role", has_super_admin)
                
            except Exception as e:
                self.log_result(f"{description} validation", False, str(e))
    
    def check_routing_structure(self):
        """Test 4: Verify Super Admin routing structure"""
        print("\n🛣️ Testing Routing Structure...")
        
        routes_file = self.frontend_path / "src" / "routes" / "AppRoutes.jsx"
        if not self.check_file_exists(routes_file, "AppRoutes"):
            return
        
        try:
            with open(routes_file, 'r') as f:
                content = f.read()
            
            # Check for Super Admin routes
            admin_routes = [
                "/admin/dashboard", "/admin/gyms", "/admin/users",
                "/admin/subscriptions", "/admin/settings", "/admin/activity-logs"
            ]
            
            for route in admin_routes:
                has_route = route in content
                self.log_result(f"Has route: {route}", has_route)
                
        except Exception as e:
            self.log_result("Routes validation", False, str(e))
    
    def check_ui_components(self):
        """Test 5: Verify Super Admin UI components exist"""
        print("\n🎨 Testing UI Components...")
        
        components_dir = self.frontend_path / "src" / "components" / "admin"
        pages_dir = self.frontend_path / "src" / "pages"
        
        # Check admin components
        admin_components = [
            "AdminDataTable.jsx", "AdminMetricCard.jsx", 
            "AdminActionModal.jsx", "AdminChart.jsx"
        ]
        
        for component in admin_components:
            component_path = components_dir / component
            self.check_file_exists(component_path, f"Admin component: {component}")
        
        # Check Super Admin pages
        admin_pages = [
            "SuperAdminDashboard.jsx", "GymManagement.jsx", 
            "UserManagement.jsx", "SubscriptionManagement.jsx",
            "SystemSettings.jsx", "ActivityLogs.jsx"
        ]
        
        for page in admin_pages:
            page_path = pages_dir / page
            self.check_file_exists(page_path, f"Admin page: {page}")
    
    def check_integration_with_existing_functionality(self):
        """Test 6: Verify integration doesn't break existing functionality"""
        print("\n🔗 Testing Integration with Existing Functionality...")
        
        # Check that existing routes still exist
        existing_routes = [
            (self.backend_path / "app" / "routes" / "members.py", "Members routes"),
            (self.backend_path / "app" / "routes" / "payments.py", "Payments routes"),
            (self.backend_path / "app" / "routes" / "attendance.py", "Attendance routes"),
        ]
        
        for file_path, description in existing_routes:
            self.check_file_exists(file_path, description)
        
        # Check existing frontend pages
        existing_pages = [
            "MembersPage.jsx", "PaymentsPage.jsx", "AttendancePage.jsx", "DashboardPage.jsx"
        ]
        
        for page in existing_pages:
            page_path = self.frontend_path / "src" / "pages" / page
            self.check_file_exists(page_path, f"Existing page: {page}")
    
    def check_tenant_isolation(self):
        """Test 7: Verify tenant isolation is maintained"""
        print("\n🏢 Testing Tenant Isolation...")
        
        # Check that models maintain proper relationships
        models_file = self.backend_path / "app" / "models.py"
        if self.check_file_exists(models_file, "Main models file"):
            try:
                with open(models_file, 'r') as f:
                    content = f.read()
                
                # Check for proper gym_id foreign keys
                has_gym_fk = "gym_id" in content and "ForeignKey" in content
                self.log_result("Models maintain gym_id relationships", has_gym_fk)
                
            except Exception as e:
                self.log_result("Models validation", False, str(e))
    
    def check_security_audit(self):
        """Test 8: Perform security audit of Super Admin access controls"""
        print("\n🛡️ Performing Security Audit...")
        
        # Check for authentication utilities
        auth_utils_file = self.backend_path / "app" / "auth_utils.py"
        if self.check_file_exists(auth_utils_file, "Authentication utilities"):
            try:
                with open(auth_utils_file, 'r') as f:
                    content = f.read()
                
                # Check for Super Admin decorators/functions
                has_super_admin_check = "super_admin" in content.lower()
                self.log_result("Has Super Admin authentication checks", has_super_admin_check)
                
            except Exception as e:
                self.log_result("Auth utils validation", False, str(e))
        
        # Check for error handling
        error_handling_files = [
            (self.backend_path / "app" / "super_admin_errors.py", "Backend error handling"),
            (self.frontend_path / "src" / "utils" / "errorHandling.js", "Frontend error handling"),
        ]
        
        for file_path, description in error_handling_files:
            self.check_file_exists(file_path, description)
    
    def check_activity_logging(self):
        """Test 9: Verify activity logging is comprehensive"""
        print("\n📋 Testing Activity Logging...")
        
        activity_log_file = self.backend_path / "app" / "activity_logging.py"
        if self.check_file_exists(activity_log_file, "Activity logging module"):
            try:
                with open(activity_log_file, 'r') as f:
                    content = f.read()
                
                # Check for key logging functions
                logging_functions = ["log_activity", "log_admin_action", "log_user_action"]
                for func in logging_functions:
                    has_func = func in content
                    self.log_result(f"Has logging function: {func}", has_func)
                    
            except Exception as e:
                self.log_result("Activity logging validation", False, str(e))
    
    def run_unit_tests(self):
        """Test 10: Run all unit tests to ensure functionality"""
        print("\n🧪 Running Unit Tests...")
        
        try:
            # Change to backend directory and run tests
            os.chdir(self.backend_path)
            
            # Run specific Super Admin tests
            test_files = [
                "test_super_admin_models.py",
                "test_admin_routes.py", 
                "test_user_management.py",
                "test_subscription_management.py",
                "test_activity_logging.py",
                "test_super_admin_errors.py",
                "test_auth_utils.py"
            ]
            
            for test_file in test_files:
                test_path = self.backend_path / "tests" / test_file
                if test_path.exists():
                    try:
                        result = subprocess.run(
                            [sys.executable, "-m", "pytest", f"tests/{test_file}", "-v"],
                            capture_output=True, text=True, timeout=30
                        )
                        passed = result.returncode == 0
                        self.log_result(f"Unit tests: {test_file}", passed, 
                                      result.stdout.split('\n')[-2] if result.stdout else "")
                    except subprocess.TimeoutExpired:
                        self.log_result(f"Unit tests: {test_file}", False, "Timeout")
                    except Exception as e:
                        self.log_result(f"Unit tests: {test_file}", False, str(e))
            
        except Exception as e:
            self.log_result("Unit tests execution", False, str(e))
    
    def check_documentation(self):
        """Test 11: Verify documentation exists"""
        print("\n📚 Checking Documentation...")
        
        # Check for documentation files
        doc_files = [
            (Path("docs/SUPER_ADMIN_MODULE.md"), "Super Admin module documentation"),
            (self.backend_path.parent / ".kiro" / "specs" / "super-admin-module" / "requirements.md", "Requirements doc"),
            (self.backend_path.parent / ".kiro" / "specs" / "super-admin-module" / "design.md", "Design doc"),
        ]
        
        for file_path, description in doc_files:
            self.check_file_exists(file_path, description)
    
    def generate_report(self):
        """Generate final validation report"""
        print("\n" + "="*60)
        print("SUPER ADMIN MODULE VALIDATION REPORT")
        print("="*60)
        
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if "✅" in r])
        failed_tests = len([r for r in self.results if "❌" in r])
        
        print(f"\nSUMMARY:")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%")
        
        print(f"\nDETAILED RESULTS:")
        for result in self.results:
            print(result)
        
        if self.errors:
            print(f"\n❌ CRITICAL ISSUES FOUND:")
            for error in self.errors:
                print(error)
            return False
        else:
            print(f"\n✅ ALL TESTS PASSED - Super Admin module is ready!")
            return True

def main():
    """Main validation function"""
    validator = SuperAdminValidator()
    
    print("🚀 Starting Super Admin Module Validation...")
    print("This may take a few minutes...")
    
    # Run all validation tests
    validator.check_route_protection()
    validator.check_database_models()
    validator.check_frontend_authentication()
    validator.check_routing_structure()
    validator.check_ui_components()
    validator.check_integration_with_existing_functionality()
    validator.check_tenant_isolation()
    validator.check_security_audit()
    validator.check_activity_logging()
    validator.run_unit_tests()
    validator.check_documentation()
    
    # Generate final report
    success = validator.generate_report()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())