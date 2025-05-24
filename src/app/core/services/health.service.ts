import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HealthResponse {
  service: string;
  status: 'OK' | 'ERROR';
  timestamp: string;
  message: string;
  error?: string;
}

export interface SystemHealthResponse {
  timestamp: string;
  overall_status: 'HEALTHY' | 'DEGRADED';
  services: {
    backend: HealthResponse;
    database: HealthResponse;
  };
  system: string;
  version: string;
}

export interface SystemStatus {
  icon: string;
  title: string;
  description: string;
  status: string;
  type: 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  private readonly baseUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  /**
   * Verifica el estado del backend
   */
  checkBackendHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health/backend`).pipe(
      catchError(error => of({
        service: 'Backend',
        status: 'ERROR' as const,
        timestamp: new Date().toISOString(),
        message: 'Error de conexión con el backend',
        error: error.message
      }))
    );
  }

  /**
   * Verifica el estado de la base de datos
   */
  checkDatabaseHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health/database`).pipe(
      catchError(error => of({
        service: 'Database',
        status: 'ERROR' as const,
        timestamp: new Date().toISOString(),
        message: 'Error de conexión con la base de datos',
        error: error.message
      }))
    );
  }

  /**
   * Verifica el estado completo del sistema
   */
  checkSystemHealth(): Observable<SystemHealthResponse> {
    return this.http.get<SystemHealthResponse>(`${this.baseUrl}/health`).pipe(
      catchError(error => of({
        timestamp: new Date().toISOString(),
        overall_status: 'DEGRADED' as const,
        services: {
          backend: {
            service: 'Backend',
            status: 'ERROR' as const,
            timestamp: new Date().toISOString(),
            message: 'Error de conexión con el backend'
          },
          database: {
            service: 'Database',
            status: 'ERROR' as const,
            timestamp: new Date().toISOString(),
            message: 'Error de conexión con la base de datos'
          }
        },
        system: 'Sistema Veterinario VetAPI',
        version: '1.0.0'
      }))
    );
  }

  /**
   * Obtiene el estado de todos los servicios individualmente
   */
  getAllServicesHealth(): Observable<SystemStatus[]> {
    return forkJoin({
      backend: this.checkBackendHealth(),
      database: this.checkDatabaseHealth()
    }).pipe(
      map(results => {
        const systemStatuses: SystemStatus[] = [
          {
            icon: 'check_circle',
            title: 'API Backend',
            description: results.backend.message,
            status: results.backend.status === 'OK' ? 'Operativo' : 'Error',
            type: results.backend.status === 'OK' ? 'success' : 'error'
          },
          {
            icon: 'storage',
            title: 'Base de Datos',
            description: results.database.message,
            status: results.database.status === 'OK' ? 'Operativo' : 'Error',
            type: results.database.status === 'OK' ? 'success' : 'error'
          },
          {
            icon: 'construction',
            title: 'Módulos Adicionales',
            description: 'Mascotas, citas, inventario',
            status: 'En desarrollo',
            type: 'warning'
          }
        ];

        return systemStatuses;
      }),
      catchError(error => {
        console.error('Error checking system health:', error);
        return of([
          {
            icon: 'error',
            title: 'API Backend',
            description: 'Error de conexión',
            status: 'Error',
            type: 'error' as const
          },
          {
            icon: 'error',
            title: 'Base de Datos',
            description: 'Error de conexión',
            status: 'Error',
            type: 'error' as const
          },
          {
            icon: 'construction',
            title: 'Módulos Adicionales',
            description: 'Mascotas, citas, inventario',
            status: 'En desarrollo',
            type: 'warning' as const
          }
        ]);
      })
    );
  }
} 