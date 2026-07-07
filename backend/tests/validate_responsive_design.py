"""
Validation script for Task 19 - Responsive Design and Mobile Optimization
Validates mobile-friendly Super Admin interface implementation
"""

import os
import sys
import re

def validate_file_content(file_path, patterns):
    """Validate file contains required patterns"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        results = {}
        for name, pattern in patterns.items():
            results[name] = bool(re.search(pattern, content, re.MULTILINE | re.DOTALL | re.IGNORECASE))
        return results
    except FileNotFoundError:
        return None

def validate_task_19():
    """Validate Task 19 completion"""
    print("🔍 Validating Task 19: Responsive Design and Mobile Optimization")
    print("=" * 80)
    
    checks = {
        'responsive_styles': False,
        'mobile_navigation': False,
        'responsive_data_table': False,
        'responsive_hooks': False,
        'mobile_dashboard': False,
        'touch_friendly_interactions': False,
        'responsive_tests': False
    }
    
    # 1. Check responsive CSS styles
    print("\n1. Checking Responsive CSS Styles...")
    css_patterns = {
        'mobile_first': r'@media.*max-width.*640px',
        'tablet_styles': r'@media.*min-width.*641px.*max-width.*1024px',
        'desktop_styles': r'@media.*min-width.*1025px',
        'touch_targets': r'\.touch-target',
        'mobile_cards': r'\.table-cards-mobile',
        'loading_spinner': r'\.loading-spinner'
    }
    
    css_file = 'frontend/src/styles/responsive.css'
    if os.path.exists(css_file):
        css_results = validate_file_content(css_file, css_patterns)
        if css_results and all(css_results.values()):
            print("   ✅ Responsive CSS styles implemented")
            checks['responsive_styles'] = True
        else:
            print("   ❌ Responsive CSS styles incomplete")
            if css_results:
                for pattern, found in css_results.items():
                    print(f"      - {pattern}: {'✅' if found else '❌'}")
    else:
        print("   ❌ Responsive CSS file missing")
    
    # 2. Check mobile navigation component
    print("\n2. Checking Mobile Navigation Component...")
    nav_patterns = {
        'mobile_header': r'mobile.*header|header.*mobile',
        'hamburger_menu': r'bars.*icon|menu.*button',
        'overlay_menu': r'overlay.*menu|menu.*overlay',
        'touch_target': r'touch-target'
    }
    
    nav_file = 'frontend/src/components/admin/MobileNavigation.jsx'
    if os.path.exists(nav_file):
        nav_results = validate_file_content(nav_file, nav_patterns)
        if nav_results and sum(nav_results.values()) >= 3:
            print("   ✅ Mobile navigation component implemented")
            checks['mobile_navigation'] = True
        else:
            print("   ❌ Mobile navigation component incomplete")
    else:
        print("   ❌ Mobile navigation component missing")
    
    # 3. Check responsive data table
    print("\n3. Checking Responsive Data Table...")
    table_patterns = {
        'desktop_table': r'desktop.*table|table.*desktop',
        'mobile_cards': r'mobile.*card|card.*mobile',
        'responsive_layout': r'md:block.*md:hidden|hidden.*md:block',
        'touch_friendly': r'touch.*target|touch.*friendly'
    }
    
    table_file = 'frontend/src/components/admin/ResponsiveDataTable.jsx'
    if os.path.exists(table_file):
        table_results = validate_file_content(table_file, table_patterns)
        if table_results and sum(table_results.values()) >= 3:
            print("   ✅ Responsive data table component implemented")
            checks['responsive_data_table'] = True
        else:
            print("   ❌ Responsive data table incomplete")
    else:
        print("   ❌ Responsive data table missing")
    
    # 4. Check responsive hooks
    print("\n4. Checking Responsive React Hooks...")
    hooks_patterns = {
        'use_responsive': r'useResponsive',
        'media_query': r'useMediaQuery',
        'touch_device': r'useTouchDevice',
        'screen_size': r'screenSize|isMobile|isTablet|isDesktop'
    }
    
    hooks_file = 'frontend/src/hooks/useResponsive.js'
    if os.path.exists(hooks_file):
        hooks_results = validate_file_content(hooks_file, hooks_patterns)
        if hooks_results and all(hooks_results.values()):
            print("   ✅ Responsive hooks implemented")
            checks['responsive_hooks'] = True
        else:
            print("   ❌ Responsive hooks incomplete")
    else:
        print("   ❌ Responsive hooks missing")
    
    # 5. Check mobile dashboard optimization
    print("\n5. Checking Mobile Dashboard Optimization...")
    dashboard_patterns = {
        'mobile_grid': r'mobile.*grid|grid.*mobile',
        'responsive_metrics': r'metric.*mobile|mobile.*metric',
        'responsive_charts': r'chart.*mobile|mobile.*chart'
    }
    
    # Check if dashboard component uses responsive classes
    dashboard_file = 'frontend/src/pages/SuperAdminDashboard.jsx'
    if os.path.exists(dashboard_file):
        dashboard_results = validate_file_content(dashboard_file, dashboard_patterns)
        if dashboard_results and sum(dashboard_results.values()) >= 1:
            print("   ✅ Mobile dashboard optimization present")
            checks['mobile_dashboard'] = True
        else:
            print("   ❌ Mobile dashboard needs optimization")
    else:
        print("   ❌ Dashboard component not found")
    
    # 6. Check touch-friendly interactions
    print("\n6. Checking Touch-Friendly Interactions...")
    touch_patterns = {
        'touch_target_class': r'touch-target',
        'min_touch_size': r'min-height.*44px|min-width.*44px',
        'touch_events': r'onClick|onTouch'
    }
    
    # Check across multiple component files
    touch_coverage = 0
    component_files = [
        'frontend/src/components/admin/MobileNavigation.jsx',
        'frontend/src/components/admin/ResponsiveDataTable.jsx',
        'frontend/src/components/admin/ConfirmationDialog.jsx'
    ]
    
    for file_path in component_files:
        if os.path.exists(file_path):
            results = validate_file_content(file_path, touch_patterns)
            if results:
                touch_coverage += sum(results.values())
    
    if touch_coverage >= 4:
        print("   ✅ Touch-friendly interactions implemented")
        checks['touch_friendly_interactions'] = True
    else:
        print(f"   ❌ Touch-friendly interactions incomplete ({touch_coverage}/6+)")
    
    # 7. Check responsive tests
    print("\n7. Checking Responsive Design Tests...")
    test_patterns = {
        'mobile_navigation_test': r'MobileNavigation.*test|test.*MobileNavigation',
        'responsive_table_test': r'ResponsiveDataTable.*test|test.*ResponsiveDataTable',
        'responsive_hook_test': r'useResponsive.*test|responsive.*hook.*test',
        'mobile_behavior_test': r'mobile.*behavior|behavior.*mobile'
    }
    
    test_file = 'frontend/src/components/admin/__tests__/Responsive.test.jsx'
    if os.path.exists(test_file):
        test_results = validate_file_content(test_file, test_patterns)
        if test_results and sum(test_results.values()) >= 3:
            print("   ✅ Responsive design tests implemented")
            checks['responsive_tests'] = True
        else:
            print("   ❌ Responsive design tests incomplete")
    else:
        print("   ❌ Responsive design tests missing")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TASK 19 VALIDATION SUMMARY")
    print("=" * 80)
    
    completed = sum(checks.values())
    total = len(checks)
    percentage = (completed / total) * 100
    
    print(f"Components Completed: {completed}/{total} ({percentage:.1f}%)")
    print()
    
    for component, status in checks.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {component.replace('_', ' ').title()}")
    
    if completed == total:
        print("\n🎉 TASK 19 COMPLETED SUCCESSFULLY!")
        print("Responsive design and mobile optimization implemented for Super Admin interface.")
        print("\nKey Features Implemented:")
        print("• Mobile-first responsive CSS with breakpoints")
        print("• Touch-friendly mobile navigation with hamburger menu")
        print("• Responsive data tables that adapt to screen size")
        print("• React hooks for responsive behavior detection")
        print("• Optimized dashboard metrics display for smaller screens")
        print("• Touch-friendly interactions with proper target sizes")
        print("• Comprehensive tests for responsive behavior")
        return True
    else:
        print(f"\n⚠️  TASK 19 PARTIALLY COMPLETE ({percentage:.1f}%)")
        return False

if __name__ == "__main__":
    success = validate_task_19()
    sys.exit(0 if success else 1)