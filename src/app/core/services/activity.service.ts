import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ActivityResponse {
  status: string;
  message: string;
  timestamp: string;
  limit: number;
  data: {
    recent_consultations: any[];
    recent_appointments: any[];
    new_users: any[];
    new_pets: any[];
    recent_vaccinations: any[];
    statistics: {
      total_consultations: number;
      total_appointments: number;
      today_consultations: number;
      today_appointments: number;
      total_users: number;
      total_pets: number;
      total_vaccinations: number;
    };
  };
}

export interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las actividades recientes del sistema
   */
  getRecentActivities(limit: number = 10): Observable<ActivityResponse> {
    const timestamp = new Date().getTime();
    return this.http.get<ActivityResponse>(`${this.apiUrl}/activities/recent?limit=${limit}&_t=${timestamp}`).pipe(
      catchError(error => {
        console.error('❌ Error fetching recent activities:', error);
        return of({
          status: 'error',
          message: 'Error al cargar actividades',
          timestamp: new Date().toISOString(),
          limit: limit,
          data: {
            recent_consultations: [],
            recent_appointments: [],
            new_users: [],
            new_pets: [],
            recent_vaccinations: [],
            statistics: {
              total_consultations: 0,
              total_appointments: 0,
              today_consultations: 0,
              today_appointments: 0,
              total_users: 0,
              total_pets: 0,
              total_vaccinations: 0
            }
          }
        });
      })
    );
  }

  /**
   * Convierte la respuesta del backend en actividades para mostrar en el dashboard
   */
  mapToRecentActivities(activityData: ActivityResponse['data']): RecentActivity[] {
    const activities: RecentActivity[] = [];

    // Nuevos usuarios (prioridad alta)
    activityData.new_users.slice(0, 3).forEach(user => {
      activities.push({
        icon: 'person_add',
        title: 'Nuevo usuario registrado',
        description: `${user.name} ${user.last_name} se unió como ${this.getRoleDisplayName(user.role)}`,
        time: this.formatTimeAgo(user.created_at),
        color: 'success'
      });
    });

    // Consultas recientes
    activityData.recent_consultations.slice(0, 2).forEach(consultation => {
      activities.push({
        icon: 'local_hospital',
        title: 'Nueva consulta médica',
        description: `${consultation.pet_name} atendido por Dr. ${consultation.veterinarian_name}`,
        time: this.formatTimeAgo(consultation.created_at),
        color: 'primary'
      });
    });

    // Citas recientes
    activityData.recent_appointments.slice(0, 2).forEach(appointment => {
      activities.push({
        icon: 'calendar_today',
        title: 'Cita programada',
        description: `${appointment.pet_name} - ${appointment.reason}`,
        time: this.formatTimeAgo(appointment.created_at),
        color: 'secondary'
      });
    });

    // Nuevas mascotas
    activityData.new_pets.slice(0, 1).forEach(pet => {
      activities.push({
        icon: 'pets',
        title: 'Nueva mascota registrada',
        description: `${pet.name} (${pet.species}) de ${pet.owner_name}`,
        time: this.formatTimeAgo(pet.created_at),
        color: 'accent'
      });
    });

    // Vacunaciones recientes
    activityData.recent_vaccinations.slice(0, 1).forEach(vaccination => {
      activities.push({
        icon: 'vaccines',
        title: 'Vacunación aplicada',
        description: `${vaccination.vaccine_type} a ${vaccination.pet_name}`,
        time: this.formatTimeAgo(vaccination.created_at),
        color: 'info'
      });
    });

    // Limitar a máximo 5 actividades y ordenar por fecha
    return activities
      .sort((a, b) => this.getTimeStamp(b.time) - this.getTimeStamp(a.time))
      .slice(0, 5);
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getSystemStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activities/stats`).pipe(
      catchError(error => {
        console.error('Error fetching system stats:', error);
        return of({
          status: 'error',
          message: 'Error al cargar estadísticas',
          data: {}
        });
      })
    );
  }

  /**
   * Convierte la fecha del backend a formato "Hace X tiempo"
   */
  private formatTimeAgo(dateString: string): string {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Hace ${diffInWeeks} semanas`;
  }

  /**
   * Obtiene el nombre legible del rol
   */
  private getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinario',
      'RECEPTIONIST': 'Recepcionista'
    };
    return roleNames[role] || role;
  }

  /**
   * Convierte string de tiempo a timestamp para ordenamiento
   */
  private getTimeStamp(timeString: string): number {
    const now = Date.now();
    
    if (timeString.includes('menos de 1 hora')) return now;
    if (timeString.includes('horas')) {
      const hours = parseInt(timeString.match(/\d+/)?.[0] || '0');
      return now - (hours * 60 * 60 * 1000);
    }
    if (timeString.includes('días')) {
      const days = parseInt(timeString.match(/\d+/)?.[0] || '0');
      return now - (days * 24 * 60 * 60 * 1000);
    }
    if (timeString.includes('semanas')) {
      const weeks = parseInt(timeString.match(/\d+/)?.[0] || '0');
      return now - (weeks * 7 * 24 * 60 * 60 * 1000);
    }
    
    return now;
  }
} 