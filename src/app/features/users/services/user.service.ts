import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { UserActivity } from '../models/user-activity.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene un usuario por su ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Elimina un usuario
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Obtiene la actividad reciente de un usuario
   * Nota: Esta es una simulación ya que el backend no proporciona este endpoint
   */
  getUserActivity(userId: number): Observable<UserActivity[]> {
    // En un caso real, esto haría una petición al API
    // return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activity`);
    
    // Simulación de datos
    const activities: UserActivity[] = [
      {
        id: 1,
        type: 'consultation',
        description: 'Consulta realizada',
        details: 'Mascota: Max (Labrador) - Cliente: Ana Martínez',
        date: new Date('2025-05-20T10:30:00')
      },
      {
        id: 2,
        type: 'vaccination',
        description: 'Vacunación registrada',
        details: 'Mascota: Luna (Gato) - Cliente: Pedro Sánchez',
        date: new Date('2025-05-19T15:45:00')
      },
      {
        id: 3,
        type: 'login',
        description: 'Inicio de sesión',
        details: 'IP: 192.168.1.45 - Navegador: Chrome',
        date: new Date('2025-05-19T08:00:00')
      }
    ];
    
    return of(activities);
  }
  
  /**
   * Obtiene estadísticas de un usuario (veterinario)
   * Nota: Esta es una simulación ya que el backend no proporciona este endpoint
   */
  getUserStats(userId: number): Observable<any> {
    // En un caso real, esto haría una petición al API
    // return this.http.get<any>(`${this.apiUrl}/${userId}/stats`);
    
    // Simulación de datos
    const stats = {
      consultations: 152,
      vaccinations: 87,
      appointments: 245
    };
    
    return of(stats);
  }
}