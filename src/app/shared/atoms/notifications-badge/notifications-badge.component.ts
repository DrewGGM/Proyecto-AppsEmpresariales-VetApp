import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-notifications-badge',
  standalone: false,
  templateUrl: './notifications-badge.component.html',
  styleUrls: ['./notifications-badge.component.scss']
})
export class NotificationsBadgeComponent {
  @Input() count: number = 0;
  @Input() maxCount: number = 99;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'danger';
  @Input() showZero: boolean = false;
  @Input() animated: boolean = true;
  @Input() icon: string = 'notifications';
  @Input() disabled: boolean = false;
  
  @Output() click = new EventEmitter<void>();
  @Output() badgeClick = new EventEmitter<number>();

  /**
   * Obtiene el texto a mostrar en la insignia
   */
  get displayCount(): string {
    if (this.count <= 0 && !this.showZero) return '';
    if (this.count > this.maxCount) return `${this.maxCount}+`;
    return this.count.toString();
  }

  /**
   * Determina si debe mostrar la insignia
   */
  get shouldShowBadge(): boolean {
    return this.count > 0 || this.showZero;
  }

  /**
   * Obtiene las clases CSS del componente
   */
  getClasses(): string[] {
    const classes = [
      'notifications-badge',
      this.size,
      this.variant
    ];

    if (this.disabled) classes.push('disabled');
    if (this.animated && this.count > 0) classes.push('animated');

    return classes;
  }

  /**
   * Obtiene las clases CSS de la insignia
   */
  getBadgeClasses(): string[] {
    const classes = ['badge', `badge-${this.variant}`];
    
    if (this.animated && this.count > 0) classes.push('pulse');
    
    return classes;
  }

  /**
   * Maneja el click en el componente
   */
  onClick(): void {
    if (!this.disabled) {
      this.click.emit();
    }
  }

  /**
   * Maneja el click específico en la insignia
   */
  onBadgeClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.badgeClick.emit(this.count);
    }
  }
}