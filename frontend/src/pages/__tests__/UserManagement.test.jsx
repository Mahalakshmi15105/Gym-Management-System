import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../UserManagement';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/admin', () => ({
  AdminDataTable: ({ data, loading }) => (
    <div data-testid="user-table">
      {loading ? <div>Loading...</div> : <div>{data.length} users</div>}
    </div>
  ),
  AdminActionModal: ({ isOpen, title, onConfirm }) => (
    isOpen ? <div data-testid="modal"><button onClick={onConfirm}>{title}</button></div> : null
  ),
  AdminMetricCard: ({ title, value }) => <div data-testid="metric">{title}: {value}</div>
}));

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user management interface', async () => {
    render(<BrowserRouter><UserManagement /></BrowserRouter>);
    
    expect(screen.getByText('👥 User Management')).toBeInTheDocument();
    expect(screen.getByText('User Overview')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
    });
  });

  it('should display user metrics', async () => {
    render(<BrowserRouter><UserManagement /></BrowserRouter>);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('metric')).toHaveLength(4);
    });
    
    expect(screen.getByText(/Total Users/)).toBeInTheDocument();
    expect(screen.getByText(/Active Users/)).toBeInTheDocument();
  });
});