import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div data-testid="test-component">
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="role">{auth.user?.role || 'none'}</div>
      <div data-testid="is-super-admin">{auth.isSuperAdmin.toString()}</div>
      <div data-testid="is-gym-owner">{auth.isGymOwner.toString()}</div>
      <div data-testid="is-member">{auth.isMember.toString()}</div>
      <div data-testid="can-access-admin">{auth.canAccessAdminFeatures.toString()}</div>
      <div data-testid="can-access-gym-management">{auth.canAccessGymManagement.toString()}</div>
    </div>
  );
};

// Helper function to create valid JWT token for testing
const createTestToken = (payload) => {
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
  const body = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    ...payload
  }));
  const signature = 'test_signature';
  
  return `${header}.${body}.${signature}`;
};

describe('AuthContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with no user and not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('role')).toHaveTextContent('none');
      expect(screen.getByTestId('is-super-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('is-gym-owner')).toHaveTextContent('false');
      expect(screen.getByTestId('is-member')).toHaveTextContent('false');
    });
  });

  describe('Super Admin Authentication', () => {
    it('should handle super admin user correctly', async () => {
      const superAdminUser = {
        id: 1,
        email: 'admin@flexigym.com',
        name: 'Super Admin',
        role: 'super_admin',
        gym_id: null
      };
      
      const token = createTestToken({ role: 'super_admin', gym_id: null });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return token;
        if (key === 'flexigym_user') return JSON.stringify(superAdminUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('role')).toHaveTextContent('super_admin');
      expect(screen.getByTestId('is-super-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('is-gym-owner')).toHaveTextContent('false');
      expect(screen.getByTestId('is-member')).toHaveTextContent('false');
      expect(screen.getByTestId('can-access-admin')).toHaveTextContent('true');
      expect(screen.getByTestId('can-access-gym-management')).toHaveTextContent('true');
    });
  });

  describe('Gym Owner Authentication', () => {
    it('should handle gym owner user correctly', async () => {
      const gymOwnerUser = {
        id: 2,
        email: 'owner@testgym.com',
        name: 'Gym Owner',
        role: 'gym_owner',
        gym_id: 1
      };
      
      const token = createTestToken({ role: 'gym_owner', gym_id: 1 });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return token;
        if (key === 'flexigym_user') return JSON.stringify(gymOwnerUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('role')).toHaveTextContent('gym_owner');
      expect(screen.getByTestId('is-super-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('is-gym-owner')).toHaveTextContent('true');
      expect(screen.getByTestId('is-member')).toHaveTextContent('false');
      expect(screen.getByTestId('can-access-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('can-access-gym-management')).toHaveTextContent('true');
    });
  });

  describe('Member Authentication', () => {
    it('should handle member user correctly', async () => {
      const memberUser = {
        id: 3,
        email: 'member@testgym.com',
        name: 'Gym Member',
        role: 'member',
        gym_id: 1
      };
      
      const token = createTestToken({ role: 'member', gym_id: 1 });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return token;
        if (key === 'flexigym_user') return JSON.stringify(memberUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('role')).toHaveTextContent('member');
      expect(screen.getByTestId('is-super-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('is-gym-owner')).toHaveTextContent('false');
      expect(screen.getByTestId('is-member')).toHaveTextContent('true');
      expect(screen.getByTestId('can-access-admin')).toHaveTextContent('false');
      expect(screen.getByTestId('can-access-gym-management')).toHaveTextContent('false');
    });
  });

  describe('Token Validation', () => {
    it('should logout user if token is expired', async () => {
      const expiredToken = createTestToken({ 
        role: 'super_admin', 
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      });
      
      const superAdminUser = {
        id: 1,
        email: 'admin@flexigym.com',
        name: 'Super Admin',
        role: 'super_admin'
      };
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return expiredToken;
        if (key === 'flexigym_user') return JSON.stringify(superAdminUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flexigym_user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flexigym_token');
    });
  });

  describe('Login and Logout Functions', () => {
    let TestComponentWithActions;
    
    beforeEach(() => {
      TestComponentWithActions = () => {
        const auth = useAuth();
        return (
          <div>
            <TestComponent />
            <button 
              onClick={() => auth.login('test_token', { id: 1, role: 'super_admin', name: 'Test Admin' })}
              data-testid="login-btn"
            >
              Login
            </button>
            <button 
              onClick={() => auth.logout()}
              data-testid="logout-btn"
            >
              Logout
            </button>
          </div>
        );
      };
    });

    it('should login user correctly', async () => {
      render(
        <AuthProvider>
          <TestComponentWithActions />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      act(() => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('is-super-admin')).toHaveTextContent('true');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('flexigym_token', 'test_token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('flexigym_user', JSON.stringify({ 
        id: 1, 
        role: 'super_admin', 
        name: 'Test Admin' 
      }));
    });

    it('should logout user correctly', async () => {
      // First login
      const superAdminUser = {
        id: 1,
        email: 'admin@flexigym.com',
        name: 'Super Admin',
        role: 'super_admin'
      };
      
      const token = createTestToken({ role: 'super_admin' });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return token;
        if (key === 'flexigym_user') return JSON.stringify(superAdminUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestComponentWithActions />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      act(() => {
        screen.getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flexigym_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flexigym_user');
    });
  });

  describe('Permission System', () => {
    let TestPermissionComponent;
    
    beforeEach(() => {
      TestPermissionComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="can-manage-all-gyms">{auth.hasPermission('canManageAllGyms').toString()}</div>
            <div data-testid="can-view-analytics">{auth.hasPermission('canViewAnalytics').toString()}</div>
            <div data-testid="can-access-admin-panel">{auth.hasPermission('canAccessAdminPanel').toString()}</div>
            <div data-testid="belongs-to-gym-1">{auth.belongsToGym(1).toString()}</div>
            <div data-testid="belongs-to-gym-2">{auth.belongsToGym(2).toString()}</div>
          </div>
        );
      };
    });

    it('should provide correct permissions for super admin', async () => {
      const superAdminUser = {
        id: 1,
        role: 'super_admin',
        gym_id: null
      };
      
      const token = createTestToken({ role: 'super_admin' });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return token;
        if (key === 'flexigym_user') return JSON.stringify(superAdminUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestPermissionComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('can-manage-all-gyms')).toHaveTextContent('true');
        expect(screen.getByTestId('can-view-analytics')).toHaveTextContent('true');
        expect(screen.getByTestId('can-access-admin-panel')).toHaveTextContent('true');
        expect(screen.getByTestId('belongs-to-gym-1')).toHaveTextContent('true'); // Super admin has access to all gyms
        expect(screen.getByTestId('belongs-to-gym-2')).toHaveTextContent('true');
      });
    });

    it('should provide correct permissions for gym owner', async () => {
      const gymOwnerUser = {
        id: 2,
        role: 'gym_owner',
        gym_id: 1
      };
      
      const token = createTestToken({ role: 'gym_owner', gym_id: 1 });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return token;
        if (key === 'flexigym_user') return JSON.stringify(gymOwnerUser);
        return null;
      });

      render(
        <AuthProvider>
          <TestPermissionComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('can-manage-all-gyms')).toHaveTextContent('false');
        expect(screen.getByTestId('can-view-analytics')).toHaveTextContent('true');
        expect(screen.getByTestId('can-access-admin-panel')).toHaveTextContent('false');
        expect(screen.getByTestId('belongs-to-gym-1')).toHaveTextContent('true'); // Owns gym 1
        expect(screen.getByTestId('belongs-to-gym-2')).toHaveTextContent('false'); // Doesn't own gym 2
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted user data in localStorage', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'flexigym_token') return 'valid_token';
        if (key === 'flexigym_user') return 'invalid_json_data';
        return null;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flexigym_user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flexigym_token');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});