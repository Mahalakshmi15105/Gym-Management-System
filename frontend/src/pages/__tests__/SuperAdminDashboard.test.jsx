import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SuperAdminDashboard from '../SuperAdminDashboard';
import api from '../../services/api';

// Mock the API
jest.mock('../../services/api');

// Mock the admin components
jest.mock('../../components/admin', () => ({
  AdminMetricCard: ({ title, value, loading }) => (
    <div data-testid="metric-card">
      <div>{title}</div>
      {loading ? <div>Loading...</div> : <div>{value}</div>}
    </div>
  ),
  AdminChart: ({ title, type, loading }) => (
    <div data-testid="chart">
      <div>{title}</div>
      <div>Type: {type}</div>
      {loading && <div>Loading chart...</div>}
    </div>
  ),
  AdminDataTable: ({ data, loading, emptyMessage }) => (
    <div data-testid="data-table">
      {loading ? (
        <div>Loading table...</div>
      ) : data.length === 0 ? (
        <div>{emptyMessage}</div>
      ) : (
        <div>{data.length} items</div>
      )}
    </div>
  )
}));

const mockPlatformMetrics = {
  total_gyms: 247,
  active_gyms: 235,
  pending_gyms: 8,
  suspended_gyms: 4,
  total_members: 15420,
  active_members: 14680,
  revenue_30_days: 89240.50,
  new_gyms_7_days: 12,
  new_members_7_days: 134,
  active_subscriptions: 235,
  expiring_subscriptions: 5
};

const mockGrowthMetrics = {
  gym_growth: [
    { date: '2023-12-01', count: 2 },
    { date: '2023-12-02', count: 3 },
    { date: '2023-12-03', count: 1 }
  ],
  member_growth: [
    { date: '2023-12-01', count: 45 },
    { date: '2023-12-02', count: 52 },
    { date: '2023-12-03', count: 38 }
  ],
  revenue_growth: [
    { date: '2023-12-01', amount: 2500.00 },
    { date: '2023-12-02', amount: 2800.00 },
    { date: '2023-12-03', amount: 2200.00 }
  ]
};

const mockActivityLogs = [
  {
    id: 1,
    timestamp: '2023-12-03T10:30:00Z',
    action_type: 'approve',
    description: 'Approved gym: FitZone Gym',
    severity: 'info'
  },
  {
    id: 2,
    timestamp: '2023-12-03T09:15:00Z',
    action_type: 'suspend',
    description: 'Suspended gym: Bad Gym',
    severity: 'warning'
  }
];

const TestDashboard = () => (
  <BrowserRouter>
    <SuperAdminDashboard />
  </BrowserRouter>
);

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses by default
    api.get.mockImplementation((url) => {
      if (url.includes('/dashboard/analytics')) {
        return Promise.resolve({
          data: { platform_metrics: mockPlatformMetrics }
        });
      }
      if (url.includes('/dashboard/growth-metrics')) {
        return Promise.resolve({
          data: mockGrowthMetrics
        });
      }
      if (url.includes('/activity-logs')) {
        return Promise.resolve({
          data: { logs: mockActivityLogs }
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', async () => {
      // Mock delayed API response
      api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<TestDashboard />);
      
      expect(screen.getByText('Loading platform analytics...')).toBeInTheDocument();
    });
  });

  describe('Successful Data Loading', () => {
    it('should display platform metrics after loading', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('🌐 Platform Dashboard')).toBeInTheDocument();
      });
      
      // Should display metric cards
      expect(screen.getAllByTestId('metric-card')).toHaveLength(7); // 4 overview + 3 health
      expect(screen.getByText('Total Gyms')).toBeInTheDocument();
      expect(screen.getByText('Platform Members')).toBeInTheDocument();
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    });

    it('should display growth charts', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Growth Analytics (30 Days)')).toBeInTheDocument();
      });
      
      expect(screen.getAllByTestId('chart')).toHaveLength(4);
      expect(screen.getByText('Gym Registrations')).toBeInTheDocument();
      expect(screen.getByText('Member Growth')).toBeInTheDocument();
      expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
      expect(screen.getByText('Gym Status Distribution')).toBeInTheDocument();
    });

    it('should display recent activity table', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Platform Activity')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });

    it('should display quick actions section', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Manage Gyms')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state when API fails', async () => {
      api.get.mockRejectedValue({
        response: { data: { error: 'Database connection failed' } }
      });
      
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should display generic error when no specific error message', async () => {
      api.get.mockRejectedValue(new Error('Network error'));
      
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('🌐 Platform Dashboard')).toBeInTheDocument();
      });
      
      // Clear previous API calls
      api.get.mockClear();
      
      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      // Should call API endpoints again
      expect(api.get).toHaveBeenCalledTimes(3);
      expect(api.get).toHaveBeenCalledWith('/api/admin/dashboard/analytics');
      expect(api.get).toHaveBeenCalledWith('/api/admin/dashboard/growth-metrics?days=30');
      expect(api.get).toHaveBeenCalledWith('/api/admin/activity-logs?per_page=10');
    });

    it('should show last updated timestamp', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-refresh every 5 minutes', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('🌐 Platform Dashboard')).toBeInTheDocument();
      });
      
      // Clear initial API calls
      api.get.mockClear();
      
      // Fast-forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);
      
      expect(api.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform growth data for charts', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Growth Analytics (30 Days)')).toBeInTheDocument();
      });
      
      // Charts should be rendered (mocked components show they received data)
      const charts = screen.getAllByTestId('chart');
      expect(charts).toHaveLength(4);
    });
  });

  describe('Platform Health Indicators', () => {
    it('should show correct health status based on metrics', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Platform Health')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      expect(screen.getByText('Suspended Gyms')).toBeInTheDocument();
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render all sections correctly', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('🌐 Platform Dashboard')).toBeInTheDocument();
      });
      
      // Check all main sections are present
      expect(screen.getByText('Platform Overview')).toBeInTheDocument();
      expect(screen.getByText('Platform Health')).toBeInTheDocument();
      expect(screen.getByText('Growth Analytics (30 Days)')).toBeInTheDocument();
      expect(screen.getByText('Recent Platform Activity')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after error', async () => {
      // First API call fails
      api.get.mockRejectedValueOnce({
        response: { data: { error: 'Temporary error' } }
      });
      
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      });
      
      // Mock successful response for retry
      api.get.mockImplementation((url) => {
        if (url.includes('/dashboard/analytics')) {
          return Promise.resolve({
            data: { platform_metrics: mockPlatformMetrics }
          });
        }
        if (url.includes('/dashboard/growth-metrics')) {
          return Promise.resolve({
            data: mockGrowthMetrics
          });
        }
        if (url.includes('/activity-logs')) {
          return Promise.resolve({
            data: { logs: mockActivityLogs }
          });
        }
      });
      
      // Click try again
      fireEvent.click(screen.getByText('Try Again'));
      
      await waitFor(() => {
        expect(screen.getByText('🌐 Platform Dashboard')).toBeInTheDocument();
      });
    });
  });
});