import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminMetricCard from '../AdminMetricCard';

describe('AdminMetricCard', () => {
  it('should render basic metric card', () => {
    render(
      <AdminMetricCard
        title="Total Users"
        value={1234}
        subtitle="Active members"
        icon="👥"
      />
    );
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument(); // Should format numbers
    expect(screen.getByText('Active members')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <AdminMetricCard
        title="Revenue"
        value={5000}
        loading={true}
      />
    );
    
    // Should show loading placeholder instead of value
    expect(screen.queryByText('5,000')).not.toBeInTheDocument();
  });

  it('should render trend information', () => {
    render(
      <AdminMetricCard
        title="Monthly Growth"
        value="15%"
        trend="+5.2%"
        trendDirection="up"
      />
    );
    
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
    expect(screen.getByText('↗️')).toBeInTheDocument();
  });

  it('should handle different trend directions', () => {
    const { rerender } = render(
      <AdminMetricCard
        title="Test"
        value={100}
        trend="-2.1%"
        trendDirection="down"
      />
    );
    
    expect(screen.getByText('↘️')).toBeInTheDocument();
    
    rerender(
      <AdminMetricCard
        title="Test"
        value={100}
        trend="0%"
        trendDirection="neutral"
      />
    );
    
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('should handle different color themes', () => {
    const { rerender } = render(
      <AdminMetricCard
        title="Test Card"
        value={100}
        color="blue"
      />
    );
    
    const card = screen.getByText('Test Card').closest('div');
    expect(card).toHaveClass('bg-blue-50', 'border-blue-200');
    
    rerender(
      <AdminMetricCard
        title="Test Card"
        value={100}
        color="red"
      />
    );
    
    expect(card).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('should be clickable when onClick is provided', () => {
    const handleClick = jest.fn();
    
    render(
      <AdminMetricCard
        title="Clickable Card"
        value={42}
        onClick={handleClick}
      />
    );
    
    const card = screen.getByText('Clickable Card').closest('div');
    expect(card).toHaveClass('cursor-pointer');
    
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalled();
  });

  it('should not be clickable when onClick is not provided', () => {
    render(
      <AdminMetricCard
        title="Static Card"
        value={42}
      />
    );
    
    const card = screen.getByText('Static Card').closest('div');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('should handle string and number values', () => {
    const { rerender } = render(
      <AdminMetricCard
        title="Number Value"
        value={1234567}
      />
    );
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    
    rerender(
      <AdminMetricCard
        title="String Value"
        value="$12.3K"
      />
    );
    
    expect(screen.getByText('$12.3K')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <AdminMetricCard
        title="Custom Class"
        value={100}
        className="custom-test-class"
      />
    );
    
    const card = screen.getByText('Custom Class').closest('div');
    expect(card).toHaveClass('custom-test-class');
  });
});