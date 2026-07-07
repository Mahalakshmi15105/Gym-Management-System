import React from 'react';

/**
 * Simple chart component for Super Admin analytics visualization
 * Uses CSS-only charts for lightweight implementation without external dependencies
 */
const AdminChart = ({
  type = 'bar', // 'bar', 'line', 'pie', 'donut'
  data = [],
  title = null,
  subtitle = null,
  height = '300px',
  color = 'orange',
  loading = false,
  className = ""
}) => {
  const colorClasses = {
    orange: {
      primary: 'bg-orange-500',
      secondary: 'bg-orange-200',
      text: 'text-orange-600'
    },
    blue: {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-200',
      text: 'text-blue-600'
    },
    green: {
      primary: 'bg-green-500',
      secondary: 'bg-green-200',
      text: 'text-green-600'
    },
    red: {
      primary: 'bg-red-500',
      secondary: 'bg-red-200',
      text: 'text-red-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.orange;

  // Calculate max value for bar charts
  const maxValue = data.length > 0 ? Math.max(...data.map(item => item.value)) : 0;

  const renderBarChart = () => (
    <div className="flex items-end justify-between h-full gap-2 p-4">
      {data.map((item, index) => {
        const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div 
              className={`w-full ${colors.primary} rounded-t transition-all duration-500 min-h-[4px] flex items-end justify-center relative group`}
              style={{ height: `${heightPercentage}%` }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value.toLocaleString()}
              </div>
            </div>
            <span className="text-xs text-gray-600 text-center truncate w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => {
    if (data.length === 0) return null;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value / maxValue) * 80); // Leave 20% padding
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-full p-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            points={points}
            className="transition-all duration-500"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value / maxValue) * 80);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#f97316"
                className="hover:r-3 transition-all cursor-pointer"
              >
                <title>{`${item.label}: ${item.value}`}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-gray-600 text-center flex-1 truncate">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (item.value / total) * 360;
              const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              const segment = (
                <path
                  key={index}
                  d={pathData}
                  fill={index % 2 === 0 ? '#f97316' : '#fed7aa'}
                  stroke="white"
                  strokeWidth="1"
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                >
                  <title>{`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}</title>
                </path>
              );
              
              currentAngle += angle;
              return segment;
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 space-y-1">
            {data.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: index % 2 === 0 ? '#f97316' : '#fed7aa' }}
                ></div>
                <span className="text-gray-600 truncate max-w-24">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            Loading chart...
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          No data available
        </div>
      );
    }

    switch (type) {
      case 'line':
        return renderLineChart();
      case 'pie':
      case 'donut':
        return renderPieChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="p-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ height }} className="relative">
        {renderChart()}
      </div>
    </div>
  );
};

export default AdminChart;