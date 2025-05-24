import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { Toast, ToastPosition } from '../../../core/models/toast.interface';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts$: Observable<Toast[]>;
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {
    // Suscribirse a los cambios de toasts si es necesario
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToastClose(toastId: string): void {
    this.toastService.remove(toastId);
  }

  getToastsByPosition(position: ToastPosition): Observable<Toast[]> {
    return this.toastService.getToastsByPosition(position);
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }
} 