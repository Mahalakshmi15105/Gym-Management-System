import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActivityLogs from '../ActivityLogs';

jest.mock('../../services/api');
jest.mock('../../components/admin', () => ({
  AdminDataTable: ({ data, loading }) => (
    <div data-testid="logs-table">
      {loading ? <div>Loading...</div> : <div>{data.length} logs</div>}
    </div>
  ),
  AdminMetricCard: ({ title, value }) => <div data-testid="metric">{title}: {value}</div>
}));

describe('ActivityLogs', () => {
  it('should render activity logs interface', async () => {
    render(<BrowserRouter><ActivityLogs /></BrowserRouter>);
    
    expect(screen.getByText('📋 Activity Logs')).toBeInTheDocument();
    expect(screen.getByText('Log Summary')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('logs-table')).toBeInTheDocument();
    });
  });

  it('should display log metrics', async () => {
    render(<BrowserRouter><ActivityLogs /></BrowserRouter>);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('metric')).toHaveLength(4);
    });
  });
});