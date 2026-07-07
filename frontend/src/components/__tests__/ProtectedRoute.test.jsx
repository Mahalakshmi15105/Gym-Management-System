import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute, { 
  SuperAdminRoute, 
  GymOwnerRoute, 
  PermissionRoute, 
  RoleBasedComponent 
} from '../ProtectedRoute';

// Mock the useAuth hook
const mockAuth = {
  isAuthenticated: false,
  user: null,
  hasPermission: jest.fn(() => false),
  isSuperAdmin: false,
  isGymOwner: false
};

jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuth
}));

// Test components
const TestProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;
const TestLoginPage = () => <div data-testid="login-page">Login Page</div>;
const TestDashboard = () => <div data-testid="dashboard">Dashboard</div>;

const TestAppWithRoutes = ({ children }) => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<TestLoginPage />} />
      <Route path="/dashboard" element={<TestDashboard />} />
      <Route path="/protected" element={children} />
    </Routes>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset mock auth state
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    mockAuth.hasPermission.mockReturnValue(false);
    mockAuth.isSuperAdmin = false;
    mockAuth.isGymOwner = false;
    jest.clearAllMocks();
  });

  describe('Basic Authentication', () => {
    it('should redirect to login when not authenticated', () => {
      render(
        <TestAppWithRoutes>
          <ProtectedRoute>
            <TestProtectedContent />
          </ProtectedRoute>
        </TestAppWithRoutes>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render protected content when authenticated', () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 1, role: 'member' };

      render(
        <TestAppWithRoutes>
          <ProtectedRoute>
            <TestProtectedContent />
          </ProtectedRoute>
        </TestAppWithRoutes>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });

  describe('Role-based Protection', () => {
    beforeEach(() => {
      mockAuth.isAuthenticated = true;
    });

    it('should allow access when user has required role', () => {
      mockAuth.user = { id: 1, role: 'super_admin' };

      render(
        <TestAppWithRoutes>
          <ProtectedRoute requiredRole="super_admin">
            <TestProtectedContent />
          </ProtectedRoute>
        </TestAppWithRoutes>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should redirect to dashboard when user lacks required role', () => {
      mockAuth.user = { id: 1, role: 'member' };

      render(
        <TestAppWithRoutes>
          <ProtectedRoute requiredRole="super_admin">
            <TestProtectedContent />
          </ProtectedRoute>
        </TestAppWithRoutes>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Permission-based Protection', () => {
    beforeEach(() => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 1, role: 'gym_owner' };
    });

    it('should allow access when user has required permission', () => {
      mockAuth.hasPermission.mockReturnValue(true);

      render(
        <TestAppWithRoutes>
          <ProtectedRoute requiredPermission="canViewAnalytics">
            <TestProtectedContent />
          </ProtectedRoute>
        </TestAppWithRoutes>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockAuth.hasPermission).toHaveBeenCalledWith('canViewAnalytics');
    });

    it('should redirect to dashboard when user lacks required permission', () => {
      mockAuth.hasPermission.mockReturnValue(false);

      render(
        <TestAppWithRoutes>
          <ProtectedRoute requiredPermission="canManageAllGyms">
            <TestProtectedContent />
          </ProtectedRoute>
        </TestAppWithRoutes>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockAuth.hasPermission).toHaveBeenCalledWith('canManageAllGyms');
    });
  });
});

describe('SuperAdminRoute', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, role: 'member' };
    mockAuth.isSuperAdmin = false;
  });

  it('should allow access for super admin users', () => {
    mockAuth.user = { id: 1, role: 'super_admin' };
    mockAuth.isSuperAdmin = true;

    render(
      <TestAppWithRoutes>
        <SuperAdminRoute>
          <TestProtectedContent />
        </SuperAdminRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect non-super-admin users to dashboard', () => {
    render(
      <TestAppWithRoutes>
        <SuperAdminRoute>
          <TestProtectedContent />
        </SuperAdminRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('GymOwnerRoute', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, role: 'member' };
    mockAuth.isSuperAdmin = false;
    mockAuth.isGymOwner = false;
  });

  it('should allow access for gym owner users', () => {
    mockAuth.user = { id: 1, role: 'gym_owner' };
    mockAuth.isGymOwner = true;

    render(
      <TestAppWithRoutes>
        <GymOwnerRoute>
          <TestProtectedContent />
        </GymOwnerRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should allow access for super admin users', () => {
    mockAuth.user = { id: 1, role: 'super_admin' };
    mockAuth.isSuperAdmin = true;

    render(
      <TestAppWithRoutes>
        <GymOwnerRoute>
          <TestProtectedContent />
        </GymOwnerRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect regular members to dashboard', () => {
    render(
      <TestAppWithRoutes>
        <GymOwnerRoute>
          <TestProtectedContent />
        </GymOwnerRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('PermissionRoute', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, role: 'gym_owner' };
  });

  it('should allow access when user has the required permission', () => {
    mockAuth.hasPermission.mockReturnValue(true);

    render(
      <TestAppWithRoutes>
        <PermissionRoute permission="canViewAnalytics">
          <TestProtectedContent />
        </PermissionRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockAuth.hasPermission).toHaveBeenCalledWith('canViewAnalytics');
  });

  it('should redirect when user lacks the required permission', () => {
    mockAuth.hasPermission.mockReturnValue(false);

    render(
      <TestAppWithRoutes>
        <PermissionRoute permission="canManageAllGyms">
          <TestProtectedContent />
        </PermissionRoute>
      </TestAppWithRoutes>
    );

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(mockAuth.hasPermission).toHaveBeenCalledWith('canManageAllGyms');
  });
});

describe('RoleBasedComponent', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, role: 'member' };
    mockAuth.hasPermission.mockReturnValue(false);
  });

  it('should render content when user has allowed role', () => {
    mockAuth.user = { id: 1, role: 'gym_owner' };

    render(
      <RoleBasedComponent allowedRoles={['gym_owner', 'super_admin']}>
        <TestProtectedContent />
      </RoleBasedComponent>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks allowed role', () => {
    const fallback = <div data-testid="fallback-content">Access Denied</div>;

    render(
      <RoleBasedComponent allowedRoles={['gym_owner', 'super_admin']} fallback={fallback}>
        <TestProtectedContent />
      </RoleBasedComponent>
    );

    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render content when user has required permission', () => {
    mockAuth.hasPermission.mockReturnValue(true);

    render(
      <RoleBasedComponent 
        allowedRoles={['member']} 
        requiredPermission="canViewOwnData"
      >
        <TestProtectedContent />
      </RoleBasedComponent>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockAuth.hasPermission).toHaveBeenCalledWith('canViewOwnData');
  });

  it('should render fallback when user lacks required permission', () => {
    mockAuth.hasPermission.mockReturnValue(false);
    const fallback = <div data-testid="fallback-content">Permission Denied</div>;

    render(
      <RoleBasedComponent 
        allowedRoles={['member']} 
        requiredPermission="canManageAllGyms"
        fallback={fallback}
      >
        <TestProtectedContent />
      </RoleBasedComponent>
    );

    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(mockAuth.hasPermission).toHaveBeenCalledWith('canManageAllGyms');
  });

  it('should render content when no role restrictions are specified', () => {
    render(
      <RoleBasedComponent>
        <TestProtectedContent />
      </RoleBasedComponent>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render null when fallback is not provided and access is denied', () => {
    render(
      <RoleBasedComponent allowedRoles={['super_admin']}>
        <TestProtectedContent />
      </RoleBasedComponent>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});