import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDataTable from '../AdminDataTable';

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'gym_owner', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'member', status: 'inactive' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'super_admin', status: 'active' }
];

const mockColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status', render: (value) => (
    <span className={`badge ${value === 'active' ? 'badge-green' : 'badge-gray'}`}>
      {value}
    </span>
  )}
];

describe('AdminDataTable', () => {
  it('should render table with data', () => {
    render(<AdminDataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('super_admin')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<AdminDataTable data={[]} columns={mockColumns} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<AdminDataTable data={mockData} columns={mockColumns} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle search functionality', () => {
    render(<AdminDataTable data={mockData} columns={mockColumns} searchable={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should handle sorting', () => {
    render(<AdminDataTable data={mockData} columns={mockColumns} sortable={true} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    // Should show sort indicator
    expect(nameHeader.parentElement).toContainHTML('↑');
  });

  it('should handle row clicks', () => {
    const onRowClick = jest.fn();
    render(<AdminDataTable data={mockData} columns={mockColumns} onRowClick={onRowClick} />);
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow);
    
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('should render custom cell content', () => {
    render(<AdminDataTable data={mockData} columns={mockColumns} />);
    
    // Check if custom status render function is working
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('should show results count', () => {
    render(<AdminDataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Showing 3 of 3 results')).toBeInTheDocument();
  });

  it('should handle filters', () => {
    const filters = [
      {
        key: 'role',
        label: 'Role',
        options: [
          { value: 'gym_owner', label: 'Gym Owner' },
          { value: 'member', label: 'Member' }
        ]
      }
    ];

    render(
      <AdminDataTable 
        data={mockData} 
        columns={mockColumns} 
        filterable={true}
        filters={filters}
      />
    );
    
    const roleFilter = screen.getByDisplayValue('All Role');
    fireEvent.change(roleFilter, { target: { value: 'gym_owner' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});