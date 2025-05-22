import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Componente atómico para botones.
 * Proporciona diferentes variantes, tamaños y estados para botones.
 * 
 * Ejemplo de uso:
 * <app-button variant="primary" (buttonClick)="onSave()">Guardar</app-button>
 * <app-button variant="danger" [disabled]="true">Eliminar</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  /**
   * Variante del botón que determina su estilo
   */
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'neutral' = 'primary';
  
  /**
   * Tamaño del botón
   */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  /**
   * Si el botón debe ocupar todo el ancho disponible
   */
  @Input() fullWidth: boolean = false;
  
  /**
   * Si el botón está deshabilitado
   */
  @Input() disabled: boolean = false;
  
  /**
   * Si el botón está en estado de carga
   */
  @Input() loading: boolean = false;
  
  /**
   * Si el botón es de tipo submit
   */
  @Input() submit: boolean = false;
  
  /**
   * Si el botón es de sólo icono (circular)
   */
  @Input() iconOnly: boolean = false;
  
  /**
   * Icono a mostrar (si se proporciona)
   */
  @Input() icon: string = '';
  
  /**
   * Posición del icono respecto al texto
   */
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  /**
   * Evento emitido al hacer clic en el botón
   */
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  
  /**
   * Maneja el evento de clic en el botón
   */
  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
  
  /**
   * Obtiene el tipo de botón (submit o button)
   */
  get buttonType(): string {
    return this.submit ? 'submit' : 'button';
  }
  
  /**
   * Obtiene las clases CSS del botón
   */
  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.variant}`, `btn-${this.size}`];
    
    if (this.fullWidth) {
      classes.push('btn-full-width');
    }
    
    if (this.iconOnly) {
      classes.push('btn-icon-only');
    }
    
    if (this.loading) {
      classes.push('btn-loading');
    }
    
    return classes.join(' ');
  }
}