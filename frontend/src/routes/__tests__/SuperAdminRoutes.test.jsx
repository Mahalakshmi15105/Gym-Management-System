import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AppRoutes from '../AppRoutes';

// Mock all the page components to avoid import issues
jest.mock('../../pages/LandingPage', () => () => <div data-testid="landing-page">Landing Page</div>);
jest.mock('../../pages/LoginPage', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../../pages/RegisterPage', () => () => <div data-testid="register-page">Register Page</div>);
jest.mock('../../pages/DashboardPage', () => () => <div data-testid="dashboard-page">Dashboard Page</div>);
jest.mock('../../pages/MembersPage', () => () => <div data-testid="members-page">Members Page</div>);
jest.mock('../../components/Layout', () => ({ children }) => <div data-testid="layout">{children}</div>);

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

const TestAppRoutes = ({ initialEntries = ['/'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AppRoutes />
  </MemoryRouter>
);

describe('Super Admin Routes', () => {
  beforeEach(() => {
    // Reset mock auth state
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    mockAuth.isSuperAdmin = false;
    mockAuth.isGymOwner = false;
    jest.clearAllMocks();
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login when accessing admin routes without authentication', () => {
      render(<TestAppRoutes initialEntries={['/admin/dashboard']} />);
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Super Admin Access', () => {
    beforeEach(() => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 1, role: 'super_admin', name: 'Super Admin' };
      mockAuth.isSuperAdmin = true;
    });

    it('should access admin dashboard', () => {
      render(<TestAppRoutes initialEntries={['/admin/dashboard']} />);
      
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByText('🌐 Super Admin Dashboard')).toBeInTheDocument();
    });

    it('should access gym management page', () => {
      render(<TestAppRoutes initialEntries={['/admin/gyms']} />);
      
      expect(screen.getByText('🏢 Gym Management')).toBeInTheDocument();
    });

    it('should access subscription management page', () => {
      render(<TestAppRoutes initialEntries={['/admin/subscriptions']} />);
      
      expect(screen.getByText('💳 Subscription Management')).toBeInTheDocument();
    });

    it('should access user management page', () => {
      render(<TestAppRoutes initialEntries={['/admin/users']} />);
      
      expect(screen.getByText('👥 User Management')).toBeInTheDocument();
    });

    it('should access system settings page', () => {
      render(<TestAppRoutes initialEntries={['/admin/settings']} />);
      
      expect(screen.getByText('⚙️ System Settings')).toBeInTheDocument();
    });

    it('should access activity logs page', () => {
      render(<TestAppRoutes initialEntries={['/admin/logs']} />);
      
      expect(screen.getByText('📋 Activity Logs')).toBeInTheDocument();
    });

    it('should redirect /admin to /admin/dashboard', () => {
      render(<TestAppRoutes initialEntries={['/admin']} />);
      
      expect(screen.getByText('🌐 Super Admin Dashboard')).toBeInTheDocument();
    });
  });

  describe('Non-Super Admin Access', () => {
    beforeEach(() => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 2, role: 'gym_owner', name: 'Gym Owner' };
      mockAuth.isSuperAdmin = false;
      mockAuth.isGymOwner = true;
    });

    it('should redirect gym owner to dashboard when accessing admin routes', () => {
      render(<TestAppRoutes initialEntries={['/admin/dashboard']} />);
      
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should redirect member to dashboard when accessing admin routes', () => {
      mockAuth.user = { id: 3, role: 'member', name: 'Member' };
      mockAuth.isGymOwner = false;
      
      render(<TestAppRoutes initialEntries={['/admin/gyms']} />);
      
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Route Guards', () => {
    it('should protect all admin routes with SuperAdminRoute', () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 2, role: 'member' };
      
      const adminRoutes = [
        '/admin/dashboard',
        '/admin/gyms',
        '/admin/subscriptions',
        '/admin/users',
        '/admin/settings',
        '/admin/logs'
      ];

      adminRoutes.forEach(route => {
        render(<TestAppRoutes initialEntries={[route]} />);
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Nested Admin Routing', () => {
    beforeEach(() => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 1, role: 'super_admin' };
      mockAuth.isSuperAdmin = true;
    });

    it('should handle nested admin routes correctly', () => {
      // Test that the nested Routes component works correctly
      render(<TestAppRoutes initialEntries={['/admin/dashboard']} />);
      
      // Should render within the layout
      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByText('🌐 Super Admin Dashboard')).toBeInTheDocument();
    });
  });

  describe('Public Routes (No Admin Access)', () => {
    it('should render landing page for unauthenticated users', () => {
      render(<TestAppRoutes initialEntries={['/']} />);
      
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should redirect authenticated users from landing to dashboard', () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = { id: 1, role: 'super_admin' };
      
      render(<TestAppRoutes initialEntries={['/']} />);
      
      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });
  });

  describe('Fallback Routes', () => {
    it('should redirect unknown routes to home', () => {
      render(<TestAppRoutes initialEntries={['/unknown-route']} />);
      
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });
});