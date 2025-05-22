import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { Toast, ToastType } from '../models/toast.interface';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Toast Creation', () => {
    it('should create success toast', () => {
      const toastId = service.success('Test success message');
      expect(toastId).toBeTruthy();
      expect(service.getToastCount()).toBe(1);
      
      const toast = service.getToast(toastId);
      expect(toast?.type).toBe('success');
      expect(toast?.message).toBe('Test success message');
    });

    it('should create error toast with longer duration', () => {
      const toastId = service.error('Test error message');
      const toast = service.getToast(toastId);
      expect(toast?.duration).toBe(8000); // Los errores duran más
    });

    it('should create toast with custom options', () => {
      const toastId = service.success('Test message', {
        title: 'Success!',
        duration: 3000,
        position: 'bottom-left'
      });
      
      const toast = service.getToast(toastId);
      expect(toast?.title).toBe('Success!');
      expect(toast?.duration).toBe(3000);
      expect(toast?.position).toBe('bottom-left');
    });
  });

  describe('Toast Management', () => {
    it('should remove specific toast', () => {
      const toastId = service.success('Test message');
      expect(service.getToastCount()).toBe(1);
      
      service.remove(toastId);
      expect(service.getToastCount()).toBe(0);
      expect(service.hasToast(toastId)).toBeFalsy();
    });

    it('should clear all toasts', () => {
      service.success('Message 1');
      service.error('Message 2');
      service.warning('Message 3');
      expect(service.getToastCount()).toBe(3);
      
      service.clear();
      expect(service.getToastCount()).toBe(0);
    });

    it('should clear toasts by type', () => {
      service.success('Success message');
      service.error('Error message 1');
      service.error('Error message 2');
      expect(service.getToastCount()).toBe(3);
      
      service.clearByType('error');
      expect(service.getToastCount()).toBe(1);
    });

    it('should limit maximum toasts', () => {
      service.updateConfig({ maxToasts: 2 });
      
      service.success('Message 1');
      service.success('Message 2');
      service.success('Message 3'); // Este debería eliminar el primero
      
      expect(service.getToastCount()).toBe(2);
    });
  });

  describe('Toast Updates', () => {
    it('should update existing toast', () => {
      const toastId = service.success('Original message');
      
      service.updateToast(toastId, {
        message: 'Updated message',
        type: 'warning'
      });
      
      const toast = service.getToast(toastId);
      expect(toast?.message).toBe('Updated message');
      expect(toast?.type).toBe('warning');
    });

    it('should pause and resume toast', () => {
      const toastId = service.success('Test message');
      let toast = service.getToast(toastId);
      const originalDuration = toast?.duration;
      
      service.pauseToast(toastId);
      toast = service.getToast(toastId);
      expect(toast?.duration).toBe(0);
      
      service.resumeToast(toastId);
      toast = service.getToast(toastId);
      expect(toast?.duration).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should update default configuration', () => {
      service.updateConfig({
        duration: 10000,
        position: 'bottom-center',
        maxToasts: 10
      });
      
      const config = service.getConfig();
      expect(config.duration).toBe(10000);
      expect(config.position).toBe('bottom-center');
      expect(config.maxToasts).toBe(10);
    });

    it('should use default configuration for new toasts', () => {
      service.updateConfig({ duration: 15000 });
      
      const toastId = service.success('Test message');
      const toast = service.getToast(toastId);
      expect(toast?.duration).toBe(15000);
    });
  });

  describe('Filtering', () => {
    it('should filter toasts by position', (done) => {
      service.success('Top right message', { position: 'top-right' });
      service.success('Bottom left message', { position: 'bottom-left' });
      
      service.getToastsByPosition('top-right').subscribe(toasts => {
        expect(toasts.length).toBe(1);
        expect(toasts[0].message).toBe('Top right message');
        done();
      });
    });
  });

  describe('Convenience Methods', () => {
    it('should have convenience methods', () => {
      service.showSuccess('Success');
      service.showError('Error');
      service.showInfo('Info');
      service.showWarning('Warning');
      
      expect(service.getToastCount()).toBe(4);
    });

    it('should create persistent toast', () => {
      const toastId = service.showPersistent('info', 'Persistent message');
      const toast = service.getToast(toastId);
      expect(toast?.duration).toBe(0);
      expect(toast?.showCloseButton).toBeTruthy();
    });
  });
});