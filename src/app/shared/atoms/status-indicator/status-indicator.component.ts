import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-indicator',
  standalone: false,
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.scss']
})
export class StatusIndicatorComponent {
  @Input() active: boolean = true;
  @Input() showLabel: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() customLabel?: string;
  @Input() position: 'left' | 'right' = 'left';

  /**
   * Obtiene el texto a mostrar
   */
  get displayLabel(): string {
    if (this.customLabel) {
      return this.customLabel;
    }
    return this.active ? 'Activo' : 'Inactivo';
  }

  /**
   * Obtiene las clases CSS del componente
   */
  getClasses(): string[] {
    return [
      'status-indicator',
      this.active ? 'active' : 'inactive',
      this.size,
      `position-${this.position}`
    ];
  }
}