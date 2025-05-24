import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { UserActivity } from '../models/user-activity.interface';
import { environment } from '../../../../environments/environment';

export interface UserSearchParams {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

// Respuesta paginada del backend
export interface UserSearchResponse {
  content: User[];
  pageable: {
    sort: { sorted: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

export interface UserStats {
  consultations: number;
  vaccinations: number;
  appointments: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient) {}
  
  // ========================================
  // MÉTODOS PRINCIPALES DE CONSULTA
  // ========================================
  
  /**
   * Obtiene todos los usuarios (sin filtros)
   * GET /users
   * Usar para: Lista inicial, estadísticas, dropdown de usuarios
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Busca usuarios con filtros específicos y paginación
   * GET /users/search
   * Usar para: Búsquedas con criterios específicos
   */
  searchUsers(params: UserSearchParams): Observable<UserSearchResponse> {
    let httpParams = new HttpParams();
    
    // Siempre incluir paginación en búsquedas
    httpParams = httpParams.set('page', (params.page || 0).toString());
    httpParams = httpParams.set('size', (params.size || 10).toString());
    
    // Agregar filtros si existen
    if (params.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    if (params.role?.trim()) httpParams = httpParams.set('role', params.role.trim());
    if (params.active !== undefined) httpParams = httpParams.set('active', params.active.toString());

    return this.http.get<UserSearchResponse>(`${this.apiUrl}/search`, { params: httpParams });
  }
  
  /**
   * Obtiene un usuario por su ID
   * GET /users/{id}
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene un usuario por su email
   * GET /users/email/{email}
   */
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  // ========================================
  // MÉTODOS DE GESTIÓN DE USUARIOS
  // ========================================

  /**
   * Crea un nuevo usuario
   * POST /users
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  /**
   * Actualiza un usuario existente
   * PUT /users/{id}
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }
  
  /**
   * Elimina un usuario (eliminación lógica)
   * DELETE /users/{id}
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina un usuario permanentemente
   * DELETE /users/{id}/permanent
   */
  deleteUserPermanently(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/permanent`);
  }

  // ========================================
  // MÉTODOS DE ACTIVIDAD Y ESTADÍSTICAS
  // ========================================
  
  /**
   * Obtiene la actividad reciente de un usuario
   * GET /users/{userId}/activity
   */
  getUserActivity(userId: number): Observable<UserActivity[]> {
    return this.http.get<UserActivity[]>(`${this.apiUrl}/${userId}/activity`);
  }
  
  /**
   * Obtiene estadísticas de un usuario (veterinario)
   * GET /users/{userId}/stats
   */
  getUserStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/${userId}/stats`);
  }

  // ========================================
  // MÉTODOS DE GESTIÓN DE ARCHIVOS
  // ========================================

  /**
   * Sube la foto de perfil de un usuario
   * POST /users/{userId}/photo
   */
  uploadUserPhoto(userId: number, file: File): Observable<{ photoUrl: string; success: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ photoUrl: string; success: boolean }>(`${this.apiUrl}/${userId}/photo`, formData);
  }

  // ========================================
  // MÉTODOS DE UTILIDAD Y VALIDACIÓN
  // ========================================

  /**
   * Verifica si un email ya está en uso
   * Útil para validación en tiempo real
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.getUserByEmail(email).pipe(
      map(() => true),
      catchError(() => {
        return of(false); // Email no existe
      })
    );
  }

  /**
   * Obtiene usuarios por rol específico
   */
  getUsersByRole(role: string): Observable<User[]> {
    return this.searchUsers({ role, size: 1000 }).pipe(
      map(response => response.content)
    );
  }

  /**
   * Obtiene solo usuarios activos
   */
  getActiveUsers(): Observable<User[]> {
    return this.searchUsers({ active: true, size: 1000 }).pipe(
      map(response => response.content)
    );
  }
}