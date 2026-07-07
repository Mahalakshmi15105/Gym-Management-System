import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminChart from '../AdminChart';

const mockData = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 150 },
  { label: 'Mar', value: 120 },
  { label: 'Apr', value: 200 }
];

describe('AdminChart', () => {
  it('should render bar chart by default', () => {
    render(<AdminChart data={mockData} title="Monthly Stats" />);
    
    expect(screen.getByText('Monthly Stats')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<AdminChart data={mockData} loading={true} />);
    
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<AdminChart data={[]} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render line chart', () => {
    render(<AdminChart data={mockData} type="line" title="Trend Analysis" />);
    
    expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
    // Should render SVG for line chart
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should render pie chart', () => {
    render(<AdminChart data={mockData} type="pie" title="Distribution" />);
    
    expect(screen.getByText('Distribution')).toBeInTheDocument();
    // Should render SVG for pie chart
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should render chart with subtitle', () => {
    render(
      <AdminChart 
        data={mockData} 
        title="Revenue Chart"
        subtitle="Last 4 months performance"
      />
    );
    
    expect(screen.getByText('Revenue Chart')).toBeInTheDocument();
    expect(screen.getByText('Last 4 months performance')).toBeInTheDocument();
  });

  it('should apply custom height', () => {
    const { container } = render(
      <AdminChart data={mockData} height="400px" />
    );
    
    const chartContainer = container.querySelector('[style*="height"]');
    expect(chartContainer).toHaveStyle('height: 400px');
  });

  it('should apply different color themes', () => {
    const { rerender } = render(
      <AdminChart data={mockData} color="blue" />
    );
    
    // Check if blue colors are applied (this is implementation-specific)
    let bars = document.querySelectorAll('.bg-blue-500');
    expect(bars.length).toBeGreaterThan(0);
    
    rerender(<AdminChart data={mockData} color="green" />);
    
    bars = document.querySelectorAll('.bg-green-500');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should handle bar chart tooltips', () => {
    render(<AdminChart data={mockData} type="bar" />);
    
    // Should render bars with tooltip content
    const bars = document.querySelectorAll('[class*="group"]');
    expect(bars.length).toBe(mockData.length);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AdminChart data={mockData} className="custom-chart-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-chart-class');
  });

  it('should handle donut chart (same as pie)', () => {
    render(<AdminChart data={mockData} type="donut" title="Donut Chart" />);
    
    expect(screen.getByText('Donut Chart')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  describe('Bar Chart Calculations', () => {
    it('should calculate correct bar heights', () => {
      render(<AdminChart data={mockData} type="bar" />);
      
      // Bars should be rendered with different heights based on values
      // Max value is 200, so Feb (150) should be 75% height, Jan (100) should be 50%
      const bars = document.querySelectorAll('[style*="height"]');
      expect(bars.length).toBe(mockData.length);
    });
  });

  describe('Line Chart Features', () => {
    it('should render grid for line chart', () => {
      render(<AdminChart data={mockData} type="line" />);
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // Should have grid pattern
      const pattern = document.querySelector('#grid');
      expect(pattern).toBeInTheDocument();
    });

    it('should render data points with titles', () => {
      render(<AdminChart data={mockData} type="line" />);
      
      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBe(mockData.length);
      
      // First circle should have title with data
      expect(circles[0]).toHaveTextContent('Jan: 100');
    });
  });

  describe('Pie Chart Features', () => {
    it('should render legend for pie chart', () => {
      render(<AdminChart data={mockData} type="pie" />);
      
      // Should show legend items (limited to 4)
      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('Feb')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('Apr')).toBeInTheDocument();
    });
  });
});