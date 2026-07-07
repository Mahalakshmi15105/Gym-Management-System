import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminActionModal from '../AdminActionModal';

describe('AdminActionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AdminActionModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('should close on escape key press', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should close when clicking backdrop', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    const backdrop = screen.getByRole('dialog').parentElement;
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should not close when clicking modal content', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<AdminActionModal {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Should disable buttons when loading
    const confirmBtn = screen.getByText('Processing...');
    expect(confirmBtn).toBeDisabled();
  });

  it('should render different modal types', () => {
    const { rerender } = render(
      <AdminActionModal {...defaultProps} type="danger" />
    );
    
    expect(screen.getByText('🗑️')).toBeInTheDocument();
    
    rerender(
      <AdminActionModal {...defaultProps} type="info" />
    );
    
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
    
    rerender(
      <AdminActionModal {...defaultProps} type="warning" />
    );
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should render custom button text', () => {
    render(
      <AdminActionModal 
        {...defaultProps} 
        confirmText="Delete Now"
        cancelText="Keep It"
      />
    );
    
    expect(screen.getByText('Delete Now')).toBeInTheDocument();
    expect(screen.getByText('Keep It')).toBeInTheDocument();
  });

  it('should render custom children content', () => {
    render(
      <AdminActionModal {...defaultProps}>
        <div>Custom content goes here</div>
        <input placeholder="Enter confirmation text" />
      </AdminActionModal>
    );
    
    expect(screen.getByText('Custom content goes here')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter confirmation text')).toBeInTheDocument();
  });

  it('should prevent body scroll when open', () => {
    const originalOverflow = document.body.style.overflow;
    
    const { unmount } = render(<AdminActionModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    expect(document.body.style.overflow).toBe('unset');
    
    // Restore original
    document.body.style.overflow = originalOverflow;
  });

  it('should not call onConfirm when loading', () => {
    render(<AdminActionModal {...defaultProps} loading={true} />);
    
    // Try to click confirm button (should be disabled)
    const confirmBtn = screen.getByText('Processing...');
    fireEvent.click(confirmBtn);
    
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('should set correct accessibility attributes', () => {
    render(<AdminActionModal {...defaultProps} />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});