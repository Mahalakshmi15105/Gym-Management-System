/**
 * Unit tests for Super Admin error handling components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationDialog from '../ConfirmationDialog';
import ErrorNotification from '../ErrorNotification';
import FormErrorDisplay, { FormSummaryError } from '../FormErrorDisplay';

describe('ConfirmationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders confirmation dialog with basic props', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Gym"
        message="Are you sure you want to delete this gym?"
        confirmText="Delete"
      />
    );

    expect(screen.getByText('Delete Gym')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this gym?')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('handles confirm action', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Gym"
        message="Confirm deletion"
      />
    );

    fireEvent.click(screen.getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('requires typing confirmation when specified', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Gym"
        message="Confirm deletion"
        requiresTyping={true}
        confirmationText="DELETE"
      />
    );

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Type "DELETE" here');
    fireEvent.change(input, { target: { value: 'DELETE' } });

    expect(confirmButton).not.toBeDisabled();
  });
});

describe('ErrorNotification', () => {
  test('displays error notification with correct styling', () => {
    const error = {
      severity: 'error',
      message: 'Test Error',
      description: 'This is a test error message',
      code: 'TEST_ERROR'
    };

    render(<ErrorNotification error={error} />);

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('This is a test error message')).toBeInTheDocument();
    expect(screen.getByText('Error Code: TEST_ERROR')).toBeInTheDocument();
  });

  test('shows retry button when retry is available', () => {
    const mockOnRetry = jest.fn();
    const error = {
      severity: 'error',
      message: 'Network Error',
      retry: true
    };

    render(<ErrorNotification error={error} onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});

describe('FormErrorDisplay', () => {
  test('displays field error when touched', () => {
    const errors = { email: 'Email is required' };
    const touched = { email: true };

    render(<FormErrorDisplay errors={errors} touched={touched} fieldName="email" />);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  test('does not display error when field not touched', () => {
    const errors = { email: 'Email is required' };
    const touched = { email: false };

    render(<FormErrorDisplay errors={errors} touched={touched} fieldName="email" />);

    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });
});

describe('FormSummaryError', () => {
  test('displays summary error with field errors', () => {
    const error = {
      message: 'Validation failed',
      fieldErrors: {
        email: 'Email is required',
        name: 'Name is too short'
      }
    };

    render(<FormSummaryError error={error} />);

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('email: Email is required')).toBeInTheDocument();
    expect(screen.getByText('name: Name is too short')).toBeInTheDocument();
  });
});