import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SuperAdminDashboard from '../SuperAdminDashboard';
import api from '../../services/api';

// Mock only the API, use real admin components
jest.mock('../../services/api');

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
    { date: '2023-12-03', count: 1 },
    { date: '2023-12-04', count: 4 },
    { date: '2023-12-05', count: 2 }
  ],
  member_growth: [
    { date: '2023-12-01', count: 45 },
    { date: '2023-12-02', count: 52 },
    { date: '2023-12-03', count: 38 },
    { date: '2023-12-04', count: 61 },
    { date: '2023-12-05', count: 43 }
  ],
  revenue_growth: [
    { date: '2023-12-01', amount: 2500.00 },
    { date: '2023-12-02', amount: 2800.00 },
    { date: '2023-12-03', amount: 2200.00 },
    { date: '2023-12-04', amount: 3100.00 },
    { date: '2023-12-05', amount: 2700.00 }
  ]
};

const mockActivityLogs = [
  {
    id: 1,
    timestamp: '2023-12-03T10:30:00Z',
    action_type: 'approve',
    description: 'Approved gym: FitZone Gym',
    severity: 'info',
    user_id: 1,
    gym_id: 123
  },
  {
    id: 2,
    timestamp: '2023-12-03T09:15:00Z',
    action_type: 'suspend',
    description: 'Suspended gym: Bad Gym due to policy violation',
    severity: 'warning',
    user_id: 1,
    gym_id: 456
  },
  {
    id: 3,
    timestamp: '2023-12-03T08:45:00Z',
    action_type: 'create',
    description: 'Created new subscription for Elite Fitness',
    severity: 'info',
    user_id: 1,
    gym_id: 789
  }
];

const TestDashboard = () => (
  <BrowserRouter>
    <SuperAdminDashboard />
  </BrowserRouter>
);

describe('SuperAdminDashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
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

  describe('Real Component Integration', () => {
    it('should render with real AdminMetricCard components', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Gyms')).toBeInTheDocument();
      });
      
      // Check if actual metric values are displayed
      expect(screen.getByText('247')).toBeInTheDocument(); // total_gyms
      expect(screen.getByText('15,420')).toBeInTheDocument(); // total_members (formatted)
      expect(screen.getByText('$89,240')).toBeInTheDocument(); // revenue (formatted)
      expect(screen.getByText('235')).toBeInTheDocument(); // active_subscriptions
      
      // Check subtitles
      expect(screen.getByText('235 active')).toBeInTheDocument(); // active gyms
      expect(screen.getByText('14,680 active')).toBeInTheDocument(); // active members
    });

    it('should render with real AdminChart components', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Growth Analytics (30 Days)')).toBeInTheDocument();
      });
      
      // Charts should be rendered with actual SVG elements for line/pie charts
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
      
      // Chart titles should be present
      expect(screen.getByText('Gym Registrations')).toBeInTheDocument();
      expect(screen.getByText('Member Growth')).toBeInTheDocument();
      expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
      expect(screen.getByText('Gym Status Distribution')).toBeInTheDocument();
    });

    it('should render with real AdminDataTable component', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Platform Activity')).toBeInTheDocument();
      });
      
      // Should show actual table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Should show activity descriptions
      expect(screen.getByText('Approved gym: FitZone Gym')).toBeInTheDocument();
      expect(screen.getByText('Suspended gym: Bad Gym due to policy violation')).toBeInTheDocument();
      
      // Should show formatted timestamps
      expect(screen.getByText(/12\/3\/2023/)).toBeInTheDocument();
      
      // Should show severity badges
      const severityBadges = document.querySelectorAll('.bg-blue-100, .bg-yellow-100');
      expect(severityBadges.length).toBeGreaterThan(0);
    });

    it('should handle trend indicators correctly', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Gyms')).toBeInTheDocument();
      });
      
      // Should show trend information
      expect(screen.getByText('+12 this week')).toBeInTheDocument(); // new gyms
      expect(screen.getByText('+134 this week')).toBeInTheDocument(); // new members
      
      // Should show expiring subscriptions warning
      expect(screen.getByText('5 expiring soon')).toBeInTheDocument();
    });

    it('should display platform health indicators correctly', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Platform Health')).toBeInTheDocument();
      });
      
      // Health metrics
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // pending_gyms value
      expect(screen.getByText('Gyms awaiting approval')).toBeInTheDocument();
      
      expect(screen.getByText('Suspended Gyms')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument(); // suspended_gyms value
      
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Operational')).toBeInTheDocument();
    });
  });

  describe('Data Transformation and Formatting', () => {
    it('should format large numbers correctly', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('15,420')).toBeInTheDocument(); // Formatted total members
      });
      
      expect(screen.getByText('$89,240')).toBeInTheDocument(); // Formatted revenue
      expect(screen.getByText('247')).toBeInTheDocument(); // Total gyms
    });

    it('should transform chart data correctly', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Growth Analytics (30 Days)')).toBeInTheDocument();
      });
      
      // Check if bars are rendered for bar chart (member growth)
      const barElements = document.querySelectorAll('.bg-green-500');
      expect(barElements.length).toBeGreaterThan(0);
      
      // Check if line chart elements exist
      const lineElements = document.querySelectorAll('polyline, circle');
      expect(lineElements.length).toBeGreaterThan(0);
      
      // Check pie chart segments
      const pieSegments = document.querySelectorAll('path[fill]');
      expect(pieSegments.length).toBeGreaterThan(0);
    });

    it('should format timestamps in activity table', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Platform Activity')).toBeInTheDocument();
      });
      
      // Should format the timestamp from ISO to local format
      const formattedTime = screen.getByText(/12\/3\/2023.*10:30/);
      expect(formattedTime).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should handle table row interactions', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Platform Activity')).toBeInTheDocument();
      });
      
      // Should be able to click on table rows (though we can't easily test the click handler with JSDOM)
      const tableRows = document.querySelectorAll('tbody tr');
      expect(tableRows.length).toBe(3); // Should have 3 activity log entries
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading States with Real Components', () => {
    it('should show loading states in real components', async () => {
      // Mock delayed API response
      let resolvePromise;
      api.get.mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve;
        });
      });
      
      render(<TestDashboard />);
      
      // Should show initial loading spinner
      expect(screen.getByText('Loading platform analytics...')).toBeInTheDocument();
      
      // Resolve the promises
      resolvePromise({
        data: { platform_metrics: mockPlatformMetrics }
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Loading platform analytics...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Verification', () => {
    it('should render grid layouts correctly', async () => {
      render(<TestDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Platform Overview')).toBeInTheDocument();
      });
      
      // Check CSS grid classes are applied (testing class presence)
      const gridContainers = document.querySelectorAll('.grid');
      expect(gridContainers.length).toBeGreaterThan(0);
      
      // Check responsive classes
      const responsiveElements = document.querySelectorAll('[class*="md:grid-cols"], [class*="lg:grid-cols"]');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });
  });
});