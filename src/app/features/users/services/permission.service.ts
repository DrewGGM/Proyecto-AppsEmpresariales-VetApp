import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Permission } from '../models/permission.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene los permisos de un usuario
   * Nota: Esta es una simulación ya que el backend no proporciona este endpoint
   */
  getUserPermissions(userId: number): Observable<Permission[]> {
    // En un caso real, esto haría una petición al API
    // return this.http.get<Permission[]>(`${this.apiUrl}/user/${userId}`);
    
    // Simulación de datos
    const permissions: Permission[] = [
      {
        id: 1,
        name: 'Gestionar Consultas',
        description: 'Crear, ver, modificar y eliminar consultas médicas',
        granted: true
      },
      {
        id: 2,
        name: 'Gestionar Citas',
        description: 'Programar, modificar y cancelar citas',
        granted: true
      },
      {
        id: 3,
        name: 'Gestionar Clientes',
        description: 'Administrar información de clientes',
        granted: true
      },
      {
        id: 4,
        name: 'Gestionar Usuarios',
        description: 'Crear y modificar cuentas de usuario del sistema',
        granted: false
      },
      {
        id: 5,
        name: 'Ver Reportes',
        description: 'Acceder a estadísticas y reportes del sistema',
        granted: false
      }
    ];
    
    return of(permissions);
  }
  
  /**
   * Actualiza un permiso de usuario
   * Nota: Esta es una simulación ya que el backend no proporciona este endpoint
   */
  updateUserPermission(userId: number, permissionId: number, granted: boolean): Observable<void> {
    // En un caso real, esto haría una petición al API
    // return this.http.put<void>(`${this.apiUrl}/user/${userId}/permission/${permissionId}`, { granted });
    
    // Simulación de éxito
    return of(undefined);
  }
}