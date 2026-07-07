/**
 * Responsive Data Table Component
 * Adapts between table and card layouts based on screen size
 */

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ResponsiveDataTable = ({ 
  columns, 
  data, 
  onRowClick, 
  actions,
  loading = false,
  mobileCardLayout = true 
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${action.className || 'text-orange-600 hover:text-orange-900'}`}
                        >
                          {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {mobileCardLayout && (
        <div className="md:hidden space-y-4">
          {sortedData.map((row, index) => (
            <div
              key={row.id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">
                  {columns[0]?.render ? columns[0].render(row[columns[0].key], row) : row[columns[0].key]}
                </h3>
                {actions && actions.length > 0 && (
                  <div className="flex space-x-2">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                        className={`touch-target inline-flex items-center px-2 py-1 text-xs font-medium rounded ${action.className || 'text-orange-600 hover:text-orange-900 border border-orange-200'}`}
                      >
                        {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="space-y-2">
                {columns.slice(1).map((column) => (
                  <div key={column.key} className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{column.label}:</span>
                    <span className="text-gray-900 text-right ml-2">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </>
  );
};

export default ResponsiveDataTable;