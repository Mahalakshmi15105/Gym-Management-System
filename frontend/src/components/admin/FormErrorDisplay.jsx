/**
 * Form Error Display Component
 * Consistent error display for Super Admin forms
 */

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const FormErrorDisplay = ({ errors, touched, fieldName }) => {
  const fieldError = errors[fieldName];
  const fieldTouched = touched[fieldName];
  
  if (!fieldError || !fieldTouched) return null;
  
  return (
    <div className="mt-1 flex items-center text-sm text-red-600">
      <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{fieldError}</span>
    </div>
  );
};

export const FormSummaryError = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {error.message || 'Please correct the following errors:'}
          </h3>
          {error.fieldErrors && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {Object.entries(error.fieldErrors).map(([field, message]) => (
                <li key={field}>{field}: {message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormErrorDisplay;