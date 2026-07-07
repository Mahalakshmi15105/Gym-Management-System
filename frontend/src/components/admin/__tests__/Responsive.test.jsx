/**
 * Tests for responsive Super Admin components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MobileNavigation from '../MobileNavigation';
import ResponsiveDataTable from '../ResponsiveDataTable';
import { useResponsive } from '../../../hooks/useResponsive';

// Mock the responsive hook
jest.mock('../../../hooks/useResponsive');
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'super_admin' } })
}));

const mockMenuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: null },
  { name: 'Gyms', path: '/admin/gyms', icon: null },
  { name: 'Users', path: '/admin/users', icon: null }
];

describe('MobileNavigation', () => {
  beforeEach(() => {
    useResponsive.mockReturnValue({ isMobile: true, isTablet: false, isDesktop: false });
  });

  test('renders mobile header', () => {
    render(
      <BrowserRouter>
        <MobileNavigation menuItems={mockMenuItems} />
      </BrowserRouter>
    );

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('opens menu when button clicked', () => {
    render(
      <BrowserRouter>
        <MobileNavigation menuItems={mockMenuItems} />
      </BrowserRouter>
    );

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Gyms')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('closes menu when overlay clicked', () => {
    render(
      <BrowserRouter>
        <MobileNavigation menuItems={mockMenuItems} />
      </BrowserRouter>
    );

    // Open menu
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Click overlay (the div with bg-black bg-opacity-50)
    const overlay = document.querySelector('.bg-black.bg-opacity-50');
    fireEvent.click(overlay);

    // Menu should be closed (Menu text should not be visible)
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
  });
});

describe('ResponsiveDataTable', () => {
  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@test.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com', status: 'Inactive' }
  ];

  const mockActions = [
    { label: 'Edit', onClick: jest.fn() },
    { label: 'Delete', onClick: jest.fn() }
  ];

  test('renders desktop table view', () => {
    useResponsive.mockReturnValue({ isMobile: false, isTablet: false, isDesktop: true });

    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={mockData}
        actions={mockActions}
      />
    );

    // Should show table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Should show data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@test.com')).toBeInTheDocument();
  });

  test('renders mobile card view', () => {
    useResponsive.mockReturnValue({ isMobile: true, isTablet: false, isDesktop: false });

    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={mockData}
        actions={mockActions}
        mobileCardLayout={true}
      />
    );

    // Should show cards instead of table
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Should show action buttons
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  test('handles sorting on desktop', () => {
    useResponsive.mockReturnValue({ isMobile: false, isTablet: false, isDesktop: true });

    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    // Data should be sorted (Jane Smith comes before John Doe alphabetically)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[2]).toHaveTextContent('John Doe');
  });

  test('handles row click', () => {
    const mockOnRowClick = jest.fn();
    useResponsive.mockReturnValue({ isMobile: false, isTablet: false, isDesktop: true });

    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={mockData}
        onRowClick={mockOnRowClick}
      />
    );

    const firstRow = screen.getAllByRole('row')[1]; // Skip header row
    fireEvent.click(firstRow);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  test('shows loading state', () => {
    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={[]}
        loading={true}
      />
    );

    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  test('shows empty state', () => {
    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={[]}
        loading={false}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  test('action buttons work correctly', () => {
    const mockEditAction = { label: 'Edit', onClick: jest.fn() };
    const mockDeleteAction = { label: 'Delete', onClick: jest.fn() };

    render(
      <ResponsiveDataTable
        columns={mockColumns}
        data={mockData}
        actions={[mockEditAction, mockDeleteAction]}
      />
    );

    // Click edit button for first item
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockEditAction.onClick).toHaveBeenCalledWith(mockData[0]);
  });
});