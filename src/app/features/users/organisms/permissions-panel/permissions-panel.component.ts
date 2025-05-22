import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Permission } from '../../models/permission.interface';

@Component({
  selector: 'app-permissions-panel',
  standalone: false,
  templateUrl: './permissions-panel.component.html',
  styleUrls: ['./permissions-panel.component.scss']
})
export class PermissionsPanelComponent {
  @Input() permissions: Permission[] = [];
  @Input() canEdit: boolean = false;
  @Output() permissionChange = new EventEmitter<{ id: number, granted: boolean }>();
  @Output() managePermissions = new EventEmitter<void>();

  /**
   * Emite evento para cambiar un permiso
   */
  onPermissionChange(permission: Permission, event: Event): void {
    if (this.canEdit) {
      const target = event.target as HTMLInputElement;
      const isGranted = target.checked;
      this.permissionChange.emit({ id: permission.id, granted: isGranted });
    }
  }

  /**
   * Emite evento para gestionar permisos
   */
  onManagePermissions(): void {
    this.managePermissions.emit();
  }
}