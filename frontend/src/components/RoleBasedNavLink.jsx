import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Role-based navigation link component that only renders if user has required role or permission
 */
const RoleBasedNavLink = ({ 
  to, 
  children, 
  requiredRole = null, 
  requiredPermission = null, 
  allowedRoles = [], 
  className = '',
  onClick = null 
}) => {
  const { user, hasPermission } = useAuth();

  // Check role access
  const hasRoleAccess = () => {
    if (requiredRole) {
      // Explicit support for super_admin role
      return user?.role === requiredRole || (requiredRole === 'super_admin' && user?.role === 'super_admin');
    }
    
    if (allowedRoles.length > 0) {
      return allowedRoles.includes(user?.role) || allowedRoles.includes('super_admin') && user?.role === 'super_admin';
    }
    
    return true; // No role restriction
  };

  // Check permission access
  const hasPermissionAccess = () => {
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    return true; // No permission restriction
  };

  // Don't render if user doesn't have access
  if (!hasRoleAccess() || !hasPermissionAccess()) {
    return null;
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-orange-500 text-white shadow-md'
            : 'hover:bg-orange-50 hover:text-orange-600'
        } ${className}`
      }
    >
      {children}
    </NavLink>
  );
};

export default RoleBasedNavLink;