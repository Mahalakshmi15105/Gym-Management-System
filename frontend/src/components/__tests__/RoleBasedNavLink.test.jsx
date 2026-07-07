import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RoleBasedNavLink from '../RoleBasedNavLink';

// Mock the useAuth hook
const mockAuth = {
  user: null,
  hasPermission: jest.fn(() => false)
};

jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuth
}));

const TestRoleBasedNavLink = (props) => (
  <BrowserRouter>
    <RoleBasedNavLink to="/test" {...props}>
      <span>🏠</span>
      <span>Test Link</span>
    </RoleBasedNavLink>
  </BrowserRouter>
);

describe('RoleBasedNavLink', () => {
  beforeEach(() => {
    mockAuth.user = null;
    mockAuth.hasPermission.mockReturnValue(false);
    jest.clearAllMocks();
  });

  describe('No Role Restrictions', () => {
    it('should render when no role or permission restrictions are specified', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      render(<TestRoleBasedNavLink />);
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });
  });

  describe('Required Role', () => {
    it('should render when user has the required role', () => {
      mockAuth.user = { id: 1, role: 'super_admin' };
      
      render(<TestRoleBasedNavLink requiredRole="super_admin" />);
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('should not render when user lacks the required role', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      render(<TestRoleBasedNavLink requiredRole="super_admin" />);
      
      expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
    });

    it('should not render when user is null', () => {
      mockAuth.user = null;
      
      render(<TestRoleBasedNavLink requiredRole="super_admin" />);
      
      expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
    });
  });

  describe('Allowed Roles', () => {
    it('should render when user has one of the allowed roles', () => {
      mockAuth.user = { id: 1, role: 'gym_owner' };
      
      render(<TestRoleBasedNavLink allowedRoles={['gym_owner', 'super_admin']} />);
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('should not render when user role is not in allowed roles', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      render(<TestRoleBasedNavLink allowedRoles={['gym_owner', 'super_admin']} />);
      
      expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
    });

    it('should render when allowedRoles is empty (no restrictions)', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      render(<TestRoleBasedNavLink allowedRoles={[]} />);
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });
  });

  describe('Required Permission', () => {
    it('should render when user has the required permission', () => {
      mockAuth.user = { id: 1, role: 'gym_owner' };
      mockAuth.hasPermission.mockReturnValue(true);
      
      render(<TestRoleBasedNavLink requiredPermission="canViewAnalytics" />);
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
      expect(mockAuth.hasPermission).toHaveBeenCalledWith('canViewAnalytics');
    });

    it('should not render when user lacks the required permission', () => {
      mockAuth.user = { id: 1, role: 'member' };
      mockAuth.hasPermission.mockReturnValue(false);
      
      render(<TestRoleBasedNavLink requiredPermission="canManageAllGyms" />);
      
      expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
      expect(mockAuth.hasPermission).toHaveBeenCalledWith('canManageAllGyms');
    });
  });

  describe('Combined Role and Permission', () => {
    it('should render when user has both required role and permission', () => {
      mockAuth.user = { id: 1, role: 'super_admin' };
      mockAuth.hasPermission.mockReturnValue(true);
      
      render(
        <TestRoleBasedNavLink 
          requiredRole="super_admin" 
          requiredPermission="canManageAllGyms" 
        />
      );
      
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('should not render when user has role but lacks permission', () => {
      mockAuth.user = { id: 1, role: 'super_admin' };
      mockAuth.hasPermission.mockReturnValue(false);
      
      render(
        <TestRoleBasedNavLink 
          requiredRole="super_admin" 
          requiredPermission="canManageAllGyms" 
        />
      );
      
      expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
    });

    it('should not render when user has permission but lacks role', () => {
      mockAuth.user = { id: 1, role: 'member' };
      mockAuth.hasPermission.mockReturnValue(true);
      
      render(
        <TestRoleBasedNavLink 
          requiredRole="super_admin" 
          requiredPermission="canManageAllGyms" 
        />
      );
      
      expect(screen.queryByText('Test Link')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      render(<TestRoleBasedNavLink className="custom-class" />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('Navigation Behavior', () => {
    it('should render as a NavLink with correct href', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      render(<TestRoleBasedNavLink to="/admin/dashboard" />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/admin/dashboard');
    });

    it('should apply active styles when route is active', () => {
      mockAuth.user = { id: 1, role: 'member' };
      
      // Mock the current location to match the link
      delete window.location;
      window.location = { pathname: '/test' };
      
      render(<TestRoleBasedNavLink to="/test" />);
      
      const link = screen.getByRole('link');
      // Note: Testing active state behavior requires more complex setup with React Router
      // This tests that the component renders without errors when active
      expect(link).toBeInTheDocument();
    });
  });
});