/**
 * Confirmation Dialog Component for Super Admin destructive operations
 * Provides consistent confirmation UX for dangerous actions
 */

import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  description, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger', // danger, warning, info, success
  entityName,
  isLoading = false,
  requiresTyping = false,
  confirmationText = '',
  additionalWarnings = []
}) => {
  const [typedConfirmation, setTypedConfirmation] = React.useState('');
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (requiresTyping && confirmationText) {
      setIsConfirmed(typedConfirmation.toLowerCase() === confirmationText.toLowerCase());
    } else {
      setIsConfirmed(true);
    }
  }, [typedConfirmation, confirmationText, requiresTyping]);

  React.useEffect(() => {
    if (!isOpen) {
      setTypedConfirmation('');
      setIsConfirmed(!requiresTyping);
    }
  }, [isOpen, requiresTyping]);

  const getTypeStyles = () => {
    const styles = {
      danger: {
        icon: ExclamationTriangleIcon,
        iconColor: 'text-red-400',
        iconBg: 'bg-red-100',
        confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        border: 'border-red-200'
      },
      warning: {
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-400',
        iconBg: 'bg-yellow-100',
        confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        border: 'border-yellow-200'
      },
      info: {
        icon: InformationCircleIcon,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-100',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        border: 'border-blue-200'
      },
      success: {
        icon: CheckCircleIcon,
        iconColor: 'text-green-400',
        iconBg: 'bg-green-100',
        confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        border: 'border-green-200'
      }
    };
    return styles[type] || styles.danger;
  };

  const typeStyles = getTypeStyles();
  const Icon = typeStyles.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-start p-6 pb-4">
          <div className={`flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full ${typeStyles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
            <Icon className={`h-6 w-6 ${typeStyles.iconColor}`} aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {title}
            </h3>
            {entityName && (
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {entityName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="ml-3 flex-shrink-0 bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {message}
            </p>
            {description && (
              <p className="text-sm text-gray-400 mt-2">
                {description}
              </p>
            )}
          </div>

          {/* Additional Warnings */}
          {additionalWarnings.length > 0 && (
            <div className={`mt-4 p-3 border rounded-md ${typeStyles.border} bg-gray-50`}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Important Notes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {additionalWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmation Input */}
          {requiresTyping && confirmationText && (
            <div className="mt-4">
              <label htmlFor="confirmation-input" className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-gray-900">"{confirmationText}"</span> to confirm:
              </label>
              <input
                id="confirmation-input"
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder={`Type "${confirmationText}" here`}
                disabled={isLoading}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-2 rounded-b-lg">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isLoading}
            className={`
              w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
              ${typeStyles.confirmButton}
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              sm:ml-3 sm:w-auto sm:text-sm
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="mt-3 w-full inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto sm:text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;