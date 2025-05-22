import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: false,
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() name: string = '';
  @Input() lastName: string = '';
  // Cambia esta línea para permitir undefined también
  @Input() photoUrl: string | null | undefined = null;
  @Input() active: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showEditButton: boolean = false;
  @Output() editPhoto = new EventEmitter<void>();
  
  /**
   * Obtiene las iniciales del nombre y apellido
   */
  get initials(): string {
    const nameInitial = this.name.charAt(0) || '';
    const lastNameInitial = this.lastName.charAt(0) || '';
    return (nameInitial + lastNameInitial).toUpperCase();
  }
  
  /**
   * Emite el evento para editar la foto
   */
  onEditClick(): void {
    this.editPhoto.emit();
  }
}