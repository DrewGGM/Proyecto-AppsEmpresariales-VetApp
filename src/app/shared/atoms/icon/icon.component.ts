import { Component, Input } from '@angular/core';

/**
 * Componente atómico para mostrar iconos.
 * Actúa como wrapper para Material Icons u otras bibliotecas de iconos.
 * 
 * Ejemplo de uso:
 * <app-icon name="edit"></app-icon>
 * <app-icon name="delete" [clickable]="true" (click)="onDelete()"></app-icon>
 */
@Component({
  selector: 'app-icon',
  standalone: false,
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  /**
   * Nombre del icono según la biblioteca de iconos usada
   * (Material Icons, FontAwesome, etc.)
   */
  @Input() name: string = '';
  
  /**
   * Tamaño del icono
   */
  @Input() size: 'small' | 'medium' | 'large' | 'custom' = 'medium';
  
  /**
   * Color del icono
   * Puede ser un color predefinido o una clase CSS
   */
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | string = '';
  
  /**
   * Si el icono debe comportarse como un elemento clickeable
   */
  @Input() clickable: boolean = false;
  
  /**
   * Si el icono debe girar (útil para indicadores de carga)
   */
  @Input() spin: boolean = false;
  
  /**
   * Obtiene las clases CSS del icono
   */
  get iconClasses(): string {
    const classes = ['material-icons'];
    
    if (this.size !== 'custom') {
      classes.push(`icon-${this.size}`);
    }
    
    if (this.color) {
      if (['primary', 'secondary', 'success', 'warning', 'error', 'neutral'].includes(this.color)) {
        classes.push(`icon-${this.color}`);
      } else {
        // Si es una clase CSS personalizada
        classes.push(this.color);
      }
    }
    
    if (this.clickable) {
      classes.push('icon-clickable');
    }
    
    if (this.spin) {
      classes.push('icon-spin');
    }
    
    return classes.join(' ');
  }
}