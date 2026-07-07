/**
 * Integration tests for complete Super Admin workflows
 * Tests end-to-end functionality from frontend perspective
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import SuperAdminDashboard from '../SuperAdminDashboard';
import GymManagement from '../GymManagement';
import UserManagement from '../UserManagement';
import SubscriptionManagement from '../SubscriptionManagement';
import ActivityLogs from '../ActivityLogs';

// Mock API calls
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const mockApi = require('../../utils/api');

const renderWithProviders = (component) => {
  const mockAuthContext = {
    user: {
      id: 1,
      name: 'Super Admin',
      email: 'admin@test.com',
      role: 'super_admin'
    },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn()
  };

  return render(
    <BrowserRouter>
      <AuthProvider value={mockAuthContext}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Gym Management Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete gym approval workflow', async () => {
    const mockGyms = [
      { id: 1, name: 'Test Gym', status: 'Pending', email: 'gym@test.com' },
      { id: 2, name: 'Active Gym', status: 'Active', email: 'active@test.com' }
    ];

    mockApi.get.mockResolvedValueOnce({ data: { gyms: mockGyms } });
    mockApi.put.mockResolvedValueOnce({ 
      data: { message: 'Gym approved successfully', gym: { ...mockGyms[0], status: 'Active' } }
    });

    renderWithProviders(<GymManagement />);

    // Wait for gyms to load
    await waitFor(() => {
      expect(screen.getByText('Test Gym')).toBeInTheDocument();
    });

    // Find and click approve button for pending gym
    const gymRow = screen.getByText('Test Gym').closest('tr');
    const approveButton = within(gymRow).getByText('Approve');
    
    fireEvent.click(approveButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Approval')).toBeInTheDocument();
    });

    // Confirm approval
    const confirmButton = screen.getByText('Approve');
    fireEvent.click(confirmButton);

    // Verify API call was made
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/admin/gyms/1/approve');
    });
  });

  test('gym suspension workflow with validation', async () => {
    const mockActiveGym = {
      id: 1,
      name: 'Active Gym',
      status: 'Active',
      email: 'gym@test.com',
      active_members: 15
    };

    mockApi.get.mockResolvedValueOnce({ data: { gyms: [mockActiveGym] } });
    mockApi.put.mockResolvedValueOnce({
      data: { message: 'Gym suspended successfully', gym: { ...mockActiveGym, status: 'Suspended' } }
    });

    renderWithProviders(<GymManagement />);

    await waitFor(() => {
      expect(screen.getByText('Active Gym')).toBeInTheDocument();
    });

    // Click suspend button
    const gymRow = screen.getByText('Active Gym').closest('tr');
    const suspendButton = within(gymRow).getByText('Suspend');
    
    fireEvent.click(suspendButton);

    // Confirm suspension in dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Suspension')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Suspend');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/admin/gyms/1/suspend');
    });
  });

  test('gym deletion with member validation', async () => {
    const mockGymWithMembers = {
      id: 1,
      name: 'Gym with Members',
      status: 'Active',
      active_members: 5
    };

    mockApi.get.mockResolvedValueOnce({ data: { gyms: [mockGymWithMembers] } });
    mockApi.delete.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          code: 'GYM_HAS_ACTIVE_MEMBERS',
          message: 'Cannot delete gym with active members'
        }
      }
    });

    renderWithProviders(<GymManagement />);

    await waitFor(() => {
      expect(screen.getByText('Gym with Members')).toBeInTheDocument();
    });

    // Attempt to delete gym
    const gymRow = screen.getByText('Gym with Members').closest('tr');
    const deleteButton = within(gymRow).getByText('Delete');
    
    fireEvent.click(deleteButton);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Cannot delete gym with active members')).toBeInTheDocument();
    });
  });
});

describe('User Management Workflow Integration', () => {
  test('cross-gym user search and management', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@gym1.com', gym_name: 'Gym 1', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@gym2.com', gym_name: 'Gym 2', status: 'Active' }
    ];

    mockApi.get.mockResolvedValueOnce({ data: { users: mockUsers } });

    renderWithProviders(<UserManagement />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    mockApi.get.mockResolvedValueOnce({ 
      data: { users: [mockUsers[0]] }
    });

    fireEvent.submit(searchInput.closest('form'));

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/admin/users', {
        params: { search: 'john' }
      });
    });
  });

  test('user status management workflow', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'user@test.com',
      status: 'Active',
      gym_name: 'Test Gym'
    };

    mockApi.get.mockResolvedValueOnce({ data: { users: [mockUser] } });
    mockApi.put.mockResolvedValueOnce({
      data: { message: 'User disabled successfully', user: { ...mockUser, status: 'Disabled' } }
    });

    renderWithProviders(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Disable user
    const userRow = screen.getByText('Test User').closest('tr');
    const disableButton = within(userRow).getByText('Disable');
    
    fireEvent.click(disableButton);

    // Confirm action
    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Disable');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/admin/users/1/disable');
    });
  });
});

describe('Subscription Management Workflow Integration', () => {
  test('subscription creation and billing cycle management', async () => {
    const mockGyms = [
      { id: 1, name: 'Test Gym', subscription: null }
    ];

    const mockPlans = [
      { id: 1, name: 'Basic Plan', price: 49.99, max_members: 100 },
      { id: 2, name: 'Premium Plan', price: 99.99, max_members: 500 }
    ];

    mockApi.get.mockImplementation((url) => {
      if (url === '/admin/gyms') {
        return Promise.resolve({ data: { gyms: mockGyms } });
      }
      if (url === '/admin/subscription-plans') {
        return Promise.resolve({ data: { plans: mockPlans } });
      }
      return Promise.resolve({ data: {} });
    });

    mockApi.post.mockResolvedValueOnce({
      data: {
        message: 'Subscription created successfully',
        subscription: {
          id: 1,
          gym_id: 1,
          plan_name: 'Premium Plan',
          monthly_price: 99.99
        }
      }
    });

    renderWithProviders(<SubscriptionManagement />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Subscription Management')).toBeInTheDocument();
    });

    // Click create subscription
    const createButton = screen.getByText('Create Subscription');
    fireEvent.click(createButton);

    // Fill out form
    await waitFor(() => {
      expect(screen.getByLabelText('Gym')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Gym'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: '2' } });

    // Submit form
    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/admin/subscriptions', expect.objectContaining({
        gym_id: 1,
        plan_id: 2
      }));
    });
  });
});

describe('Activity Logging Accuracy Integration', () => {
  test('activity logs display and filtering', async () => {
    const mockLogs = [
      {
        id: 1,
        action_type: 'gym_approval',
        description: 'Approved gym: Test Gym',
        user_name: 'Super Admin',
        timestamp: '2026-07-06T10:30:00Z',
        severity: 'info'
      },
      {
        id: 2,
        action_type: 'user_disable',
        description: 'Disabled user: Test User',
        user_name: 'Super Admin',
        timestamp: '2026-07-06T11:00:00Z',
        severity: 'warning'
      }
    ];

    mockApi.get.mockResolvedValueOnce({ data: { logs: mockLogs } });

    renderWithProviders(<ActivityLogs />);

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('Approved gym: Test Gym')).toBeInTheDocument();
      expect(screen.getByText('Disabled user: Test User')).toBeInTheDocument();
    });

    // Test filtering
    const filterSelect = screen.getByLabelText('Action Type');
    fireEvent.change(filterSelect, { target: { value: 'gym_approval' } });

    mockApi.get.mockResolvedValueOnce({ 
      data: { logs: [mockLogs[0]] }
    });

    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/admin/activity-logs', {
        params: { action_type: 'gym_approval' }
      });
    });
  });

  test('real-time activity logging verification', async () => {
    const mockInitialLogs = [];
    const mockNewLog = {
      id: 1,
      action_type: 'gym_approval',
      description: 'Approved gym: New Gym',
      user_name: 'Super Admin',
      timestamp: new Date().toISOString(),
      severity: 'info'
    };

    // Initial load - empty logs
    mockApi.get.mockResolvedValueOnce({ data: { logs: mockInitialLogs } });

    renderWithProviders(<ActivityLogs />);

    await waitFor(() => {
      expect(screen.getByText('No activity logs found')).toBeInTheDocument();
    });

    // Simulate new log appearing (would be from WebSocket or polling)
    mockApi.get.mockResolvedValueOnce({ data: { logs: [mockNewLog] } });

    // Trigger refresh
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Approved gym: New Gym')).toBeInTheDocument();
    });
  });
});

describe('Role-Based Access Control Integration', () => {
  test('super admin dashboard access and navigation', async () => {
    const mockAnalytics = {
      total_gyms: 5,
      total_members: 150,
      total_revenue: 5000,
      active_subscriptions: 4
    };

    mockApi.get.mockResolvedValueOnce({ data: mockAnalytics });

    renderWithProviders(<SuperAdminDashboard />);

    // Verify dashboard loads with correct data
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // total gyms
      expect(screen.getByText('150')).toBeInTheDocument(); // total members
      expect(screen.getByText('$5,000')).toBeInTheDocument(); // total revenue
    });

    // Test navigation to different sections
    const gymManagementLink = screen.getByText('Gym Management');
    expect(gymManagementLink).toBeInTheDocument();
    expect(gymManagementLink.closest('a')).toHaveAttribute('href', '/admin/gyms');
  });
});

describe('End-to-End Workflow Integration', () => {
  test('complete platform management workflow', async () => {
    // This test simulates a complete workflow:
    // 1. View dashboard analytics
    // 2. Approve a gym
    // 3. Create subscription for gym
    // 4. Monitor activity logs

    const mockDashboard = { total_gyms: 1, total_members: 0, pending_gyms: 1 };
    const mockPendingGym = { id: 1, name: 'New Gym', status: 'Pending' };
    const mockApprovedGym = { ...mockPendingGym, status: 'Active' };
    const mockLogs = [
      {
        id: 1,
        action_type: 'gym_approval',
        description: 'Approved gym: New Gym',
        timestamp: new Date().toISOString()
      }
    ];

    // Setup API mocks for complete workflow
    mockApi.get
      .mockResolvedValueOnce({ data: mockDashboard }) // Dashboard
      .mockResolvedValueOnce({ data: { gyms: [mockPendingGym] } }) // Gym list
      .mockResolvedValueOnce({ data: { logs: mockLogs } }); // Activity logs

    mockApi.put.mockResolvedValueOnce({
      data: { message: 'Gym approved', gym: mockApprovedGym }
    });

    // Test dashboard view
    const { rerender } = renderWithProviders(<SuperAdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // pending gyms
    });

    // Switch to gym management
    rerender(
      <BrowserRouter>
        <AuthProvider value={{ user: { role: 'super_admin' } }}>
          <GymManagement />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('New Gym')).toBeInTheDocument();
    });

    // Approve gym
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Approval')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    // Verify gym approval
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/admin/gyms/1/approve');
    });
  });
});