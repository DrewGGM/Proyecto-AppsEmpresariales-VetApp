import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Toast } from '../../../core/models/toast.interface';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  @Input() toast!: Toast;
  @Output() close = new EventEmitter<string>();

  onClose(): void {
    if (this.toast?.id) {
      this.close.emit(this.toast.id);
    }
  }

  get iconName(): string {
    switch (this.toast.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  get typeClasses(): string[] {
    return ['toast', `toast-${this.toast.type}`];
  }
} 