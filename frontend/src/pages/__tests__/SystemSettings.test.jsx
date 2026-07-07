import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SystemSettings from '../SystemSettings';

jest.mock('../../services/api');
jest.mock('../../components/admin', () => ({
  AdminActionModal: ({ isOpen, title }) => isOpen ? <div data-testid="modal">{title}</div> : null,
  AdminMetricCard: ({ title, value }) => <div data-testid="metric">{title}: {value}</div>
}));

describe('SystemSettings', () => {
  it('should render system settings interface', async () => {
    render(<BrowserRouter><SystemSettings /></BrowserRouter>);
    
    expect(screen.getByText('⚙️ System Settings')).toBeInTheDocument();
    expect(screen.getByText('Settings Categories')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('metric')).toHaveLength(4);
    });
  });

  it('should display settings categories', async () => {
    render(<BrowserRouter><SystemSettings /></BrowserRouter>);
    
    await waitFor(() => {
      expect(screen.getByText(/Security Settings/)).toBeInTheDocument();
      expect(screen.getByText(/Platform Features/)).toBeInTheDocument();
    });
  });
});