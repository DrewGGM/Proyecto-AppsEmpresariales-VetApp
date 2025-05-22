import { Component, Input } from '@angular/core';
import { UserRole } from '../../models/role.enum';

@Component({
  selector: 'app-role-badge',
  standalone: false,
  templateUrl: './role-badge.component.html',
  styleUrls: ['./role-badge.component.scss']
})
export class RoleBadgeComponent {
  @Input() role: UserRole = UserRole.RECEPTIONIST;
  
  /**
   * Obtiene el nombre legible del rol
   */
  get roleLabel(): string {
    switch(this.role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.VETERINARIAN:
        return 'Veterinario';
      case UserRole.RECEPTIONIST:
        return 'Recepcionista';
      default:
        return this.role;
    }
  }
  
  /**
   * Obtiene la clase CSS según el rol
   */
  get roleClass(): string {
    return `role-${this.role.toLowerCase()}`;
  }
}