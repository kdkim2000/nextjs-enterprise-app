'use client';

import { toast, ToastOptions, ToastContainer, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastProps extends Partial<ToastOptions> {
  /**
   * Toast message
   */
  message: string;

  /**
   * Toast type
   */
  type?: ToastType;

  /**
   * Position on screen
   */
  position?: ToastPosition;

  /**
   * Auto close duration (ms), false to disable
   */
  autoClose?: number | false;

  /**
   * Show close button
   */
  closeButton?: boolean;

  /**
   * Show progress bar
   */
  hideProgressBar?: boolean;

  /**
   * Pause on hover
   */
  pauseOnHover?: boolean;

  /**
   * Draggable
   */
  draggable?: boolean;
}

/**
 * Show a toast notification
 */
export const showToast = ({
  message,
  type = 'default',
  position = 'top-right',
  autoClose = 3000,
  closeButton = true,
  hideProgressBar = false,
  pauseOnHover = true,
  draggable = true,
  ...rest
}: ToastProps): Id => {
  const options: ToastOptions = {
    position,
    autoClose,
    closeButton,
    hideProgressBar,
    pauseOnHover,
    draggable,
    ...rest
  };

  switch (type) {
    case 'success':
      return toast.success(message, options);
    case 'error':
      return toast.error(message, options);
    case 'warning':
      return toast.warning(message, options);
    case 'info':
      return toast.info(message, options);
    default:
      return toast(message, options);
  }
};

/**
 * Show success toast
 */
export const showSuccess = (message: string, options?: Partial<ToastProps>) =>
  showToast({ message, type: 'success', ...options });

/**
 * Show error toast
 */
export const showError = (message: string, options?: Partial<ToastProps>) =>
  showToast({ message, type: 'error', ...options });

/**
 * Show warning toast
 */
export const showWarning = (message: string, options?: Partial<ToastProps>) =>
  showToast({ message, type: 'warning', ...options });

/**
 * Show info toast
 */
export const showInfo = (message: string, options?: Partial<ToastProps>) =>
  showToast({ message, type: 'info', ...options });

/**
 * Show loading toast with promise
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    pending: string;
    success: string;
    error: string;
  },
  options?: Partial<ToastProps>
): Promise<T> => {
  return toast.promise(
    promise,
    {
      pending: messages.pending,
      success: messages.success,
      error: messages.error
    },
    {
      position: options?.position || 'top-right',
      autoClose: options?.autoClose !== undefined ? options.autoClose : 3000,
      ...options
    }
  );
};

/**
 * Dismiss a specific toast
 */
export const dismissToast = (toastId?: Id) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Update an existing toast
 */
export const updateToast = (
  toastId: Id,
  updates: Partial<ToastOptions>
) => {
  toast.update(toastId, updates);
};

/**
 * Check if a toast is active
 */
export const isToastActive = (toastId: Id): boolean => {
  return toast.isActive(toastId);
};

// Export ToastContainer for app layout
export { ToastContainer };

// Default export
export default {
  show: showToast,
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  promise: showPromise,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  update: updateToast,
  isActive: isToastActive
};
