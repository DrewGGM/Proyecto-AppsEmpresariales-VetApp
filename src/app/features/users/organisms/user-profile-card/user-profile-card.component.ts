import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-user-profile-card',
  standalone: false,
  templateUrl: './user-profile-card.component.html',
  styleUrls: ['./user-profile-card.component.scss']
})
export class UserProfileCardComponent {
  @Input() user: User | null = null;
  @Input() canEdit: boolean = false;
  @Output() editRequest = new EventEmitter<void>();
  @Output() deleteRequest = new EventEmitter<void>();
  @Output() editPhotoRequest = new EventEmitter<void>();
  
  /**
   * Emite evento para editar usuario
   */
  onEdit(): void {
    this.editRequest.emit();
  }
  
  /**
   * Emite evento para eliminar usuario
   */
  onDelete(): void {
    this.deleteRequest.emit();
  }
  
  /**
   * Emite evento para editar foto
   */
  onEditPhoto(): void {
    this.editPhotoRequest.emit();
  }
}