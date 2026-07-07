/**
 * Comprehensive error handling utilities for Super Admin features
 * Provides role-based error messages and centralized error processing
 */

import { ActivityLogger } from './activityLogger';

/**
 * Super Admin specific error codes and messages
 */
export const SUPER_ADMIN_ERRORS = {
  // Authentication & Authorization Errors
  SUPER_ADMIN_REQUIRED: {
    code: 'SUPER_ADMIN_REQUIRED',
    message: 'Super Admin access required',
    description: 'This action requires Super Admin privileges',
    severity: 'error',
    showNotification: true
  },
  
  INSUFFICIENT_PRIVILEGES: {
    code: 'INSUFFICIENT_PRIVILEGES', 
    message: 'Insufficient privileges',
    description: 'You do not have permission to perform this action',
    severity: 'warning',
    showNotification: true
  },
  
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Session expired', 
    description: 'Your session has expired. Please log in again.',
    severity: 'warning',
    showNotification: true,
    redirectTo: '/login'
  },
  
  // Gym Management Errors
  GYM_NOT_FOUND: {
    code: 'GYM_NOT_FOUND',
    message: 'Gym not found',
    description: 'The requested gym could not be found',
    severity: 'error',
    showNotification: true
  },
  
  GYM_HAS_ACTIVE_MEMBERS: {
    code: 'GYM_HAS_ACTIVE_MEMBERS',
    message: 'Cannot delete gym with active members',
    description: 'This gym has active members. Please deactivate or transfer members before deletion.',
    severity: 'warning',
    showNotification: true
  },
  
  GYM_ALREADY_APPROVED: {
    code: 'GYM_ALREADY_APPROVED',
    message: 'Gym already approved',
    description: 'This gym has already been approved',
    severity: 'info',
    showNotification: true
  },
  
  // User Management Errors
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    description: 'The requested user could not be found',
    severity: 'error',
    showNotification: true
  },
  
  CANNOT_MODIFY_SUPER_ADMIN: {
    code: 'CANNOT_MODIFY_SUPER_ADMIN',
    message: 'Cannot modify Super Admin',
    description: 'Super Admin accounts cannot be modified by other users',
    severity: 'error',
    showNotification: true
  },
  
  // Subscription Management Errors
  SUBSCRIPTION_NOT_FOUND: {
    code: 'SUBSCRIPTION_NOT_FOUND',
    message: 'Subscription not found',
    description: 'The requested subscription could not be found',
    severity: 'error',
    showNotification: true
  },
  
  INVALID_SUBSCRIPTION_DATA: {
    code: 'INVALID_SUBSCRIPTION_DATA',
    message: 'Invalid subscription data',
    description: 'The subscription data provided is invalid',
    severity: 'error',
    showNotification: true
  },
  
  // System Settings Errors  
  INVALID_SETTING_VALUE: {
    code: 'INVALID_SETTING_VALUE',
    message: 'Invalid setting value',
    description: 'The setting value provided is invalid',
    severity: 'error',
    showNotification: true
  },
  
  CRITICAL_SETTING_CHANGE: {
    code: 'CRITICAL_SETTING_CHANGE',
    message: 'Critical system setting',
    description: 'This setting affects core system functionality. Please confirm the change.',
    severity: 'warning',
    showNotification: true,
    requiresConfirmation: true
  },
  
  // Network & API Errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network error',
    description: 'Unable to connect to the server. Please check your connection.',
    severity: 'error',
    showNotification: true,
    retry: true
  },
  
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Server error',
    description: 'An unexpected server error occurred. Please try again later.',
    severity: 'error',
    showNotification: true,
    retry: true
  },
  
  // Validation Errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation error',
    description: 'Please check the form fields and try again',
    severity: 'warning',
    showNotification: true
  }
};

/**
 * Super Admin Error Handler Class
 */
export class SuperAdminErrorHandler {
  
  /**
   * Handle API errors with Super Admin specific logic
   */
  static async handleApiError(error, context = {}) {
    let errorInfo = null;
    
    // Extract error information from different response formats
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const errorCode = data?.code || data?.error_code;
      const errorMessage = data?.message || data?.error;
      const errorDetails = data?.details || data?.description;
      
      errorInfo = {
        status,
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
        data: data
      };
    } else if (error.request) {
      // Network error
      errorInfo = SUPER_ADMIN_ERRORS.NETWORK_ERROR;
    } else {
      // Other error
      errorInfo = {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error.toString()
      };
    }
    
    // Get mapped error or use generic server error
    const mappedError = this.mapErrorCode(errorInfo.code) || {
      ...SUPER_ADMIN_ERRORS.SERVER_ERROR,
      message: errorInfo.message,
      details: errorInfo.details
    };
    
    // Log error for Super Admin actions
    if (context.action) {
      await this.logSuperAdminError({
        action: context.action,
        error: errorInfo,
        context: context
      });
    }
    
    return {
      ...mappedError,
      originalError: errorInfo,
      context
    };
  }
  
  /**
   * Map error codes to Super Admin error definitions
   */
  static mapErrorCode(code) {
    return SUPER_ADMIN_ERRORS[code] || null;
  }
  
  /**
   * Handle form validation errors
   */
  static handleValidationErrors(errors) {
    const formattedErrors = {};
    
    // Handle different error formats
    if (Array.isArray(errors)) {
      // Array of error objects
      errors.forEach(error => {
        if (error.field) {
          formattedErrors[error.field] = error.message;
        }
      });
    } else if (typeof errors === 'object') {
      // Object with field names as keys
      Object.keys(errors).forEach(field => {
        formattedErrors[field] = errors[field];
      });
    } else if (typeof errors === 'string') {
      // Single error message
      formattedErrors.general = errors;
    }
    
    return {
      ...SUPER_ADMIN_ERRORS.VALIDATION_ERROR,
      fieldErrors: formattedErrors
    };
  }
  
  /**
   * Handle destructive action confirmation
   */
  static async handleDestructiveAction(actionType, entityName, confirmCallback) {
    const messages = {
      delete: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete ${entityName}?`,
        description: 'This action cannot be undone.',
        confirmText: 'Delete',
        confirmStyle: 'danger'
      },
      suspend: {
        title: 'Confirm Suspension', 
        message: `Are you sure you want to suspend ${entityName}?`,
        description: 'This will prevent access but preserve data.',
        confirmText: 'Suspend',
        confirmStyle: 'warning'
      },
      approve: {
        title: 'Confirm Approval',
        message: `Are you sure you want to approve ${entityName}?`,
        description: 'This will grant access to the platform.',
        confirmText: 'Approve',
        confirmStyle: 'primary'
      }
    };
    
    const config = messages[actionType] || messages.delete;
    
    return new Promise((resolve) => {
      // This would integrate with your confirmation modal component
      // For now, using browser confirm as fallback
      const confirmed = window.confirm(`${config.message}\n\n${config.description}`);
      
      if (confirmed && confirmCallback) {
        confirmCallback();
      }
      
      resolve(confirmed);
    });
  }
  
  /**
   * Log Super Admin errors for audit purposes
   */
  static async logSuperAdminError(errorData) {
    try {
      // Log to activity logger
      if (typeof ActivityLogger !== 'undefined') {
        await ActivityLogger.logActivity({
          action_type: 'error',
          description: `Super Admin Error: ${errorData.action}`,
          entity_type: 'system',
          severity: 'error',
          extra_data: {
            error_code: errorData.error.code,
            error_message: errorData.error.message,
            action: errorData.action,
            context: errorData.context
          }
        });
      }
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Super Admin Error:', errorData);
      }
    } catch (logError) {
      console.error('Failed to log Super Admin error:', logError);
    }
  }
  
  /**
   * Get user-friendly error message based on user role
   */
  static getUserFriendlyMessage(error, userRole = 'super_admin') {
    if (userRole === 'super_admin') {
      // Super Admins get detailed technical information
      return {
        title: error.message,
        description: error.details || error.description,
        technical: error.code ? `Error Code: ${error.code}` : null,
        severity: error.severity || 'error'
      };
    } else {
      // Regular users get simplified messages
      return {
        title: 'Access Denied',
        description: 'You do not have permission to access this feature.',
        severity: 'warning'
      };
    }
  }
  
  /**
   * Check if error requires special handling
   */
  static requiresSpecialHandling(error) {
    const specialCodes = [
      'SESSION_EXPIRED',
      'SUPER_ADMIN_REQUIRED', 
      'CRITICAL_SETTING_CHANGE',
      'GYM_HAS_ACTIVE_MEMBERS'
    ];
    
    return specialCodes.includes(error.code);
  }
  
  /**
   * Handle retry logic for recoverable errors
   */
  static async handleRetry(originalFunction, maxRetries = 3, delay = 1000) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await originalFunction();
      } catch (error) {
        lastError = error;
        
        const errorInfo = await this.handleApiError(error);
        
        // Don't retry if it's not a recoverable error
        if (!errorInfo.retry) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }
}

/**
 * Higher-order component for error boundary functionality
 */
export class SuperAdminErrorBoundary {
  static create(WrappedComponent, errorFallback = null) {
    return class extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true };
      }
      
      componentDidCatch(error, errorInfo) {
        this.setState({
          error: error,
          errorInfo: errorInfo
        });
        
        // Log the error
        SuperAdminErrorHandler.logSuperAdminError({
          action: 'component_error',
          error: {
            code: 'COMPONENT_ERROR',
            message: error.message,
            details: error.stack
          },
          context: {
            component: WrappedComponent.name,
            errorInfo: errorInfo
          }
        });
      }
      
      render() {
        if (this.state.hasError) {
          // Use custom error fallback or default
          if (errorFallback) {
            return errorFallback(this.state.error, this.state.errorInfo);
          }
          
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      Something went wrong
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  An unexpected error occurred in the Super Admin interface. 
                  The error has been logged for investigation.
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          );
        }
        
        return <WrappedComponent {...this.props} />;
      }
    };
  }
}

/**
 * Hook for handling Super Admin errors in functional components
 */
export const useSuperAdminErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleError = useCallback(async (error, context = {}) => {
    const processedError = await SuperAdminErrorHandler.handleApiError(error, context);
    setError(processedError);
    return processedError;
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const executeWithErrorHandling = useCallback(async (asyncFunction, context = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setIsLoading(false);
      return result;
    } catch (error) {
      const processedError = await handleError(error, context);
      setIsLoading(false);
      throw processedError;
    }
  }, [handleError]);
  
  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
};

export default SuperAdminErrorHandler;