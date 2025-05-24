import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserService } from '../../../users/services/user.service';
import { UserSession } from '../../../../core/auth/models/user-session.interface';
import { User } from '../../../users/models/user.interface';

interface QuickStat {
  icon: string;
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  color: string;
}

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  route: string;
  color: string;
  implemented: boolean;
}

interface RecentActivity {
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-main',
  standalone: false,
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  
  // Estado de carga
  loading = true;
  
  // Datos
  currentUser: UserSession | null = null;
  quickStats: QuickStat[] = [];
  recentActivity: RecentActivity[] = [];
  
  // Quick Actions (configurables)
  quickActions: QuickAction[] = [
    {
      icon: 'person_add',
      label: 'Nuevo Usuario',
      description: 'Registrar nuevo miembro del equipo',
      route: '/usuarios/nuevo',
      color: 'primary',
      implemented: true
    },
    {
      icon: 'pets',
      label: 'Nueva Mascota',
      description: 'Registrar nueva mascota en el sistema',
      route: '/under-development',
      color: 'secondary',
      implemented: false
    },
    {
      icon: 'calendar_today',
      label: 'Agendar Cita',
      description: 'Programar nueva cita médica',
      route: '/under-development',
      color: 'accent',
      implemented: false
    },
    {
      icon: 'inventory',
      label: 'Gestionar Inventario',
      description: 'Actualizar stock de medicamentos',
      route: '/under-development',
      color: 'warning',
      implemented: false
    }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la información del usuario actual
   */
  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  /**
   * Carga todos los datos del dashboard
   */
  private loadDashboardData(): void {
    this.loading = true;
    
    // Cargar datos reales de usuarios
    forkJoin({
      allUsers: this.userService.getAllUsers(),
      activeUsers: this.userService.getActiveUsers(),
      veterinarians: this.userService.getUsersByRole('VETERINARIAN')
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.updateQuickStats(data);
        this.generateRecentActivity(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loadFallbackStats();
        this.loading = false;
      }
    });
  }

  /**
   * Actualiza las estadísticas con datos reales
   */
  private updateQuickStats(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    const totalUsers = data.allUsers.length;
    const activeUsers = data.activeUsers.length;
    const veterinarians = data.veterinarians.length;
    const recentUsers = this.getRecentUsersCount(data.allUsers);

    this.quickStats = [
      {
        icon: 'people',
        label: 'Total Usuarios',
        value: totalUsers,
        change: `${recentUsers} nuevos esta semana`,
        changeType: recentUsers > 0 ? 'positive' : 'neutral',
        color: 'primary'
      },
      {
        icon: 'verified_user',
        label: 'Usuarios Activos',
        value: activeUsers,
        change: `${Math.round((activeUsers / totalUsers) * 100)}% del total`,
        changeType: 'positive',
        color: 'secondary'
      },
      {
        icon: 'medical_services',
        label: 'Veterinarios',
        value: veterinarians,
        change: `${Math.round((veterinarians / totalUsers) * 100)}% del equipo`,
        changeType: 'positive',
        color: 'accent'
      },
      {
        icon: 'admin_panel_settings',
        label: 'Sistema Operativo',
        value: '99.9%',
        change: 'Uptime últimos 30 días',
        changeType: 'positive',
        color: 'success'
      }
    ];
  }

  /**
   * Genera actividad reciente basada en datos reales de usuarios
   */
  private generateRecentActivity(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    const recentUsers = data.allUsers
      .filter(user => this.isRecentUser(user))
      .slice(0, 3);

    this.recentActivity = [
      ...recentUsers.map(user => ({
        icon: 'person_add',
        title: 'Nuevo usuario registrado',
        description: `${user.name} ${user.lastName} se unió como ${this.getRoleDisplayName(user.role)}`,
        time: user.createdAt ? this.getTimeAgo(user.createdAt.toString()) : 'Fecha desconocida',
        color: 'primary'
      })),
      {
        icon: 'system_update',
        title: 'Sistema actualizado',
        description: 'Se implementaron mejoras en la gestión de usuarios',
        time: 'Hace 2 días',
        color: 'info'
      },
      {
        icon: 'backup',
        title: 'Backup completado',
        description: 'Respaldo automático de datos realizado exitosamente',
        time: 'Hace 1 día',
        color: 'success'
      }
    ].slice(0, 4);
  }

  /**
   * Carga estadísticas de respaldo en caso de error
   */
  private loadFallbackStats(): void {
    this.quickStats = [
      {
        icon: 'people',
        label: 'Usuarios del Sistema',
        value: 'N/A',
        change: 'Error al cargar datos',
        changeType: 'neutral',
        color: 'primary'
      }
    ];
    
    this.recentActivity = [
      {
        icon: 'error',
        title: 'Error de conexión',
        description: 'No se pudieron cargar los datos recientes',
        time: 'Ahora',
        color: 'error'
      }
    ];
  }

  /**
   * Cuenta usuarios creados en la última semana
   */
  private getRecentUsersCount(users: User[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return users.filter(user => 
      user.createdAt && new Date(user.createdAt) > oneWeekAgo
    ).length;
  }

  /**
   * Verifica si un usuario es reciente (último mes)
   */
  private isRecentUser(user: User): boolean {
    if (!user.createdAt) return false;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(user.createdAt) > oneMonthAgo;
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
   * Calcula tiempo transcurrido desde una fecha
   */
  private getTimeAgo(dateString: string): string {
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
   * Actualiza los datos del dashboard
   */
  refreshData(): void {
    this.loadDashboardData();
  }

  /**
   * Obtiene el saludo según la hora del día
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  /**
   * Obtiene el nombre para mostrar del usuario
   */
  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.name} ${this.currentUser.lastName}`;
    }
    return 'Usuario';
  }

  /**
   * Obtiene la clase CSS para el tipo de cambio
   */
  getChangeClass(changeType: string): string {
    return `change-${changeType}`;
  }

  /**
   * Obtiene la clase CSS para el color del stat
   */
  getStatColorClass(color: string): string {
    return `stat-${color}`;
  }

  /**
   * Obtiene la clase CSS para el color de la acción
   */
  getActionColorClass(color: string): string {
    return `action-${color}`;
  }
} 