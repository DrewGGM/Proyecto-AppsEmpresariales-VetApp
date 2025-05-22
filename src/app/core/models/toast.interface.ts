export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
  position?: ToastPosition;
  createdAt: Date;
}

export type ToastPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'top-center' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'bottom-center';

export interface ToastConfig {
  duration?: number;
  showCloseButton?: boolean;
  position?: ToastPosition;
  maxToasts?: number;
}

export interface CreateToastOptions {
  title?: string;
  duration?: number;
  showCloseButton?: boolean;
  position?: ToastPosition;
}