import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubscriptionManagement from '../SubscriptionManagement';
import api from '../../services/api';

// Mock the API
jest.mock('../../services/api');

// Mock admin components
jest.mock('../../components/admin', () => ({
  AdminDataTable: ({ data, columns, loading, filters, onRowClick }) => (
    <div data-testid="subscription-table">
      {loading ? (
        <div>Loading table...</div>
      ) : (
        <div>
          <div data-testid="subscription-count">{data.length} subscriptions</div>
          {data.map((subscription, index) => (
            <div key={subscription.id} data-testid={`subscription-row-${subscription.id}`} onClick={() => onRowClick(subscription)}>
              <span>{subscription.gym_name}</span>
              <span>{subscription.plan_name}</span>
              <span>{subscription.status}</span>
              {/* Render action buttons */}
              {columns.find(col => col.key === 'actions')?.render(null, subscription)}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
  AdminActionModal: ({ isOpen, title, onConfirm, onClose, loading, children }) => (
    isOpen ? (
      <div data-testid="action-modal">
        <div>{title}</div>
        {children}
        <button onClick={onConfirm} disabled={loading} data-testid="modal-confirm">
          {loading ? 'Loading...' : 'Confirm'}
        </button>
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    ) : null
  ),
  AdminMetricCard: ({ title, value, trend }) => (
    <div data-testid="metric-card">
      <div>{title}</div>
      <div>{value}</div>
      {trend && <div>{trend}</div>}
    </div>
  ),
  AdminChart: ({ title, type, loading }) => (
    <div data-testid="chart">
      <div>{title}</div>
      <div>Type: {type}</div>
      {loading && <div>Loading chart...</div>}
    </div>
  )
}));

const mockSubscriptions = [
  {
    id: 1,
    gym_name: 'FitZone Gym',
    plan_name: 'Premium Plan',
    monthly_price: 299.99,
    max_members: 500,
    current_members: 350,
    status: 'Active',
    next_billing_date: '2023-12-25',
    days_until_expiry: 15,
    auto_renew: true
  },
  {
    id: 2,
    gym_name: 'PowerHouse Fitness',
    plan_name: 'Basic Plan',
    monthly_price: 149.99,
    max_members: 200,
    current_members: 180,
    status: 'Active',
    next_billing_date: '2023-12-15',
    days_until_expiry: 5,
    auto_renew: false
  },
  {
    id: 3,
    gym_name: 'Elite Training',
    plan_name: 'Enterprise Plan',
    monthly_price: 599.99,
    max_members: 1000,
    current_members: 0,
    status: 'Suspended',
    next_billing_date: '2023-12-20',
    days_until_expiry: 10,
    auto_renew: true
  }
];

const TestSubscriptionManagement = () => (
  <BrowserRouter>
    <SubscriptionManagement />
  </BrowserRouter>
);

describe('SubscriptionManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    api.get.mockResolvedValue({
      data: {
        subscriptions: mockSubscriptions,
        pagination: {
          page: 1,
          pages: 1,
          per_page: 20,
          total: 3,
          has_next: false,
          has_prev: false
        }
      }
    });
  });

  describe('Initial Rendering', () => {
    it('should render subscription management page', async () => {
      render(<TestSubscriptionManagement />);
      
      expect(screen.getByText('💳 Subscription Management')).toBeInTheDocument();
      expect(screen.getByText('Manage gym subscriptions, billing cycles, and revenue analytics')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('subscription-table')).toBeInTheDocument();
      });
    });

    it('should display subscription metrics', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
      });
      
      expect(screen.getByText('Total Subscriptions')).toBeInTheDocument();
      expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
      expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should display revenue analytics charts', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
      });
      
      expect(screen.getAllByTestId('chart')).toHaveLength(2);
      expect(screen.getByText('Monthly Recurring Revenue')).toBeInTheDocument();
      expect(screen.getByText('Subscription Status Distribution')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should fetch subscriptions on component mount', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/admin/subscriptions?page=1&per_page=20');
      });
      
      expect(screen.getByText('3 subscriptions')).toBeInTheDocument();
    });

    it('should display subscription data correctly', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('FitZone Gym')).toBeInTheDocument();
        expect(screen.getByText('PowerHouse Fitness')).toBeInTheDocument();
        expect(screen.getByText('Elite Training')).toBeInTheDocument();
      });
    });

    it('should show loading state', async () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      
      render(<TestSubscriptionManagement />);
      
      expect(screen.getByText('Loading table...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state when API fails', async () => {
      api.get.mockRejectedValue({
        response: { data: { error: 'Database connection failed' } }
      });
      
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Subscriptions')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should retry loading when try again is clicked', async () => {
      api.get.mockRejectedValueOnce({
        response: { data: { error: 'Network error' } }
      }).mockResolvedValueOnce({
        data: {
          subscriptions: mockSubscriptions,
          pagination: { page: 1, pages: 1, per_page: 20, total: 3 }
        }
      });
      
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Try Again'));
      
      await waitFor(() => {
        expect(screen.getByText('3 subscriptions')).toBeInTheDocument();
      });
    });
  });

  describe('Subscription Actions', () => {
    beforeEach(() => {
      api.put = jest.fn();
    });

    it('should show edit button for all subscriptions', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Edit')).toHaveLength(3);
      });
    });

    it('should show renew button for expiring subscriptions', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('subscription-row-2')).toBeInTheDocument();
      });
      
      const expiringRow = screen.getByTestId('subscription-row-2');
      expect(expiringRow).toHaveTextContent('Renew');
    });

    it('should show suspend button for active subscriptions', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('subscription-row-1')).toBeInTheDocument();
      });
      
      const activeRow = screen.getByTestId('subscription-row-1');
      expect(activeRow).toHaveTextContent('Suspend');
    });

    it('should open edit modal when edit is clicked', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getAllByText('Edit')[0]);
      
      expect(screen.getByTestId('action-modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Subscription')).toBeInTheDocument();
    });

    it('should handle subscription renewal', async () => {
      api.put.mockResolvedValue({
        data: { message: 'Subscription renewed successfully' }
      });
      
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Renew')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Renew'));
      
      await waitFor(() => {
        expect(screen.getByText('Renew Subscription')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('modal-confirm'));
      
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/api/admin/subscriptions/2', expect.objectContaining({
          billing_cycle_end: expect.any(String)
        }));
      });
    });

    it('should handle subscription suspension', async () => {
      api.put.mockResolvedValue({
        data: { message: 'Subscription suspended successfully' }
      });
      
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Suspend')[0]).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getAllByText('Suspend')[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Suspend Subscription')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('modal-confirm'));
      
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/api/admin/subscriptions/1', {
          status: 'Suspended'
        });
      });
    });
  });

  describe('Filtering', () => {
    it('should toggle expiring soon filter', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Show Expiring Soon')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Show Expiring Soon'));
      
      expect(screen.getByText('Show All')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/admin/subscriptions?expiring_soon=true&page=1&per_page=20');
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should close modal when close button is clicked', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getAllByText('Edit')[0]);
      
      expect(screen.getByTestId('action-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('modal-close'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('action-modal')).not.toBeInTheDocument();
      });
    });

    it('should show loading state in modal during action', async () => {
      api.put.mockImplementation(() => new Promise(() => {}));
      
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Renew')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Renew'));
      fireEvent.click(screen.getByTestId('modal-confirm'));
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate subscription metrics correctly', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('3 subscriptions')).toBeInTheDocument();
      });
      
      // Based on mockSubscriptions: 2 active, 0 expired, 1 expiring soon, 3 total
      const metricCards = screen.getAllByTestId('metric-card');
      expect(metricCards).toHaveLength(4);
    });

    it('should show expiring soon warning', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        // Should show warning for expiring subscriptions
        expect(screen.getByText('1 need attention')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(1);
      });
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Responsive Design', () => {
    it('should render all sections correctly', async () => {
      render(<TestSubscriptionManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('💳 Subscription Management')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Subscription Overview')).toBeInTheDocument();
      expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
      expect(screen.getByText('All Subscriptions')).toBeInTheDocument();
    });
  });
});