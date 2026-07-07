/**
 * Error Notification Component for Super Admin
 * Displays user-friendly error messages with appropriate styling and actions
 */

import React from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ErrorNotification = ({ 
  error, 
  onClose, 
  onRetry,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center
  autoClose = true,
  autoCloseDelay = 5000,
  showTechnical = true
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isClosing, setIsClosing] = React.useState(false);
  
  React.useEffect(() => {
    if (autoClose && error.severity !== 'error') {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, error.severity]);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Animation duration
  };
  
  const getErrorIcon = () => {
    switch (error.severity) {
      case 'error':
        return XCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
        return InformationCircleIcon;
      case 'success':
        return CheckCircleIcon;
      default:
        return XCircleIcon;
    }
  };
  
  const getErrorStyles = () => {
    const baseStyles = "rounded-lg shadow-lg border-l-4 p-4 max-w-md w-full";
    
    switch (error.severity) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400`;
      default:
        return `${baseStyles} bg-red-50 border-red-400`;
    }
  };
  
  const getIconStyles = () => {
    switch (error.severity) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-red-400';
    }
  };
  
  const getTextStyles = () => {
    switch (error.severity) {
      case 'error':
        return { title: 'text-red-800', description: 'text-red-700', technical: 'text-red-600' };
      case 'warning':
        return { title: 'text-yellow-800', description: 'text-yellow-700', technical: 'text-yellow-600' };
      case 'info':
        return { title: 'text-blue-800', description: 'text-blue-700', technical: 'text-blue-600' };
      case 'success':
        return { title: 'text-green-800', description: 'text-green-700', technical: 'text-green-600' };
      default:
        return { title: 'text-red-800', description: 'text-red-700', technical: 'text-red-600' };
    }
  };
  
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };
  
  if (!isVisible) return null;
  
  const Icon = getErrorIcon();
  const errorStyles = getErrorStyles();
  const iconStyles = getIconStyles();
  const textStyles = getTextStyles();
  const positionStyles = getPositionStyles();
  
  return (
    <div className={`fixed z-50 ${positionStyles} transition-all duration-300 ease-in-out ${
      isClosing ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
    }`}>
      <div className={errorStyles}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconStyles}`} aria-hidden="true" />
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${textStyles.title}`}>
              {error.message || error.title || 'An error occurred'}
            </h3>
            
            {error.description && (
              <div className={`mt-1 text-sm ${textStyles.description}`}>
                {error.description}
              </div>
            )}
            
            {/* Field-specific errors */}
            {error.fieldErrors && Object.keys(error.fieldErrors).length > 0 && (
              <div className="mt-2">
                <ul className={`text-sm ${textStyles.description} space-y-1`}>
                  {Object.entries(error.fieldErrors).map(([field, message]) => (
                    <li key={field}>
                      <strong className="capitalize">{field.replace('_', ' ')}:</strong> {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Technical details for Super Admins */}
            {showTechnical && error.code && (
              <div className={`mt-2 text-xs ${textStyles.technical} font-mono`}>
                Error Code: {error.code}
              </div>
            )}
            
            {/* Action buttons */}
            {(onRetry || error.retry) && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded 
                    ${error.severity === 'error' 
                      ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                      : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                    } 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  <ArrowPathIcon className="h-3 w-3 mr-1" />
                  Retry
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={handleClose}
              className={`rounded-md inline-flex ${textStyles.description} hover:${textStyles.title} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Notification Container Component
 * Manages multiple notifications with stacking
 */
export const NotificationContainer = ({ notifications, onRemove, onRetry }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 80}px)`
          }}
        >
          <ErrorNotification
            error={notification}
            onClose={() => onRemove(notification.id)}
            onRetry={notification.onRetry ? () => onRetry(notification.id) : null}
            position="top-right"
            showTechnical={true}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Hook for managing error notifications
 */
export const useErrorNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  
  const addNotification = React.useCallback((error, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      ...error,
      ...options,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    return notification.id;
  }, []);
  
  const removeNotification = React.useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);
  
  const retryNotification = React.useCallback((id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.onRetry) {
      notification.onRetry();
      removeNotification(id);
    }
  }, [notifications, removeNotification]);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    retryNotification
  };
};

export default ErrorNotification;