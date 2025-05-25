import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserService } from '../../../users/services/user.service';
import { HealthService, SystemStatus } from '../../../../core/services/health.service';
import { ActivityService, RecentActivity } from '../../../../core/services/activity.service';
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
  requiredPermission?: string;
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
  
  // Debug flag - cambiar a false en producción
  private debugMode = false;
  
  // Datos
  currentUser: UserSession | null = null;
  quickStats: QuickStat[] = [];
  recentActivity: RecentActivity[] = [];
  currentDate = new Date();
  systemStatus: SystemStatus[] = [];
  
  // Quick Actions (configurables por rol)
  private allQuickActions: QuickAction[] = [
    {
      icon: 'account_circle',
      label: 'Mi Perfil',
      description: 'Ver y editar mi información personal',
      route: '/usuarios/mi-perfil',
      color: 'info',
      implemented: true
    },
    {
      icon: 'person_add',
      label: 'Nuevo Usuario',
      description: 'Registrar nuevo miembro del equipo',
      route: '/usuarios/nuevo',
      color: 'primary',
      implemented: true,
      requiredPermission: 'MANAGE_USERS'
    },
    {
      icon: 'pets',
      label: 'Nueva Mascota',
      description: 'Registrar nueva mascota en el sistema',
      route: '/under-development',
      color: 'secondary',
      implemented: false,
      requiredPermission: 'MANAGE_PETS'
    },
    {
      icon: 'calendar_today',
      label: 'Agendar Cita',
      description: 'Programar nueva cita médica',
      route: '/under-development',
      color: 'accent',
      implemented: false,
      requiredPermission: 'MANAGE_APPOINTMENTS'
    },
    {
      icon: 'local_hospital',
      label: 'Nueva Consulta',
      description: 'Registrar consulta médica',
      route: '/under-development',
      color: 'success',
      implemented: false,
      requiredPermission: 'MANAGE_CONSULTATIONS'
    },
    {
      icon: 'folder',
      label: 'Gestionar Inventario',
      description: 'Actualizar stock de medicamentos',
      route: '/under-development',
      color: 'warning',
      implemented: false,
      requiredPermission: 'MANAGE_INVENTORY'
    },
    {
      icon: 'settings',
      label: 'Configuración',
      description: 'Configurar sistema',
      route: '/under-development',
      color: 'info',
      implemented: false,
      requiredPermission: 'MANAGE_SETTINGS'
    }
  ];

  // Quick Actions filtradas por permisos
  quickActions: QuickAction[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private healthService: HealthService,
    private activityService: ActivityService
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.filterActionsByRole();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Detecta cuando la ventana vuelve a tener foco y actualiza los datos
   */
  @HostListener('window:focus', ['$event'])
  onWindowFocus(): void {
    this.loadDashboardData();
  }

  /**
   * Carga la información del usuario actual
   */
  private loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  /**
   * Filtra las acciones rápidas según el rol del usuario
   */
  private filterActionsByRole(): void {
    this.quickActions = this.allQuickActions.filter(action => {
      if (!action.requiredPermission) return true;
      return this.authService.hasPermission(action.requiredPermission);
    });
  }

  /**
   * Carga todos los datos del dashboard
   */
  private loadDashboardData(): void {
    this.loading = true;
    
    // Cargar datos reales de usuarios, estado del sistema y actividades
    forkJoin({
      allUsers: this.userService.getAllUsers(),
      activeUsers: this.userService.getActiveUsers(),
      veterinarians: this.userService.getUsersByRole('VETERINARIAN'),
      systemHealth: this.healthService.getAllServicesHealth(),
      recentActivities: this.activityService.getRecentActivities(10) // Cargar actividades reales
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.updateQuickStats({
          allUsers: data.allUsers,
          activeUsers: data.activeUsers,
          veterinarians: data.veterinarians
        });
        // Usar actividades reales del backend
        this.recentActivity = this.activityService.mapToRecentActivities(data.recentActivities.data);
        this.systemStatus = data.systemHealth;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        this.loadFallbackStats();
        this.loadFallbackSystemStatus();
        this.loading = false;
      }
    });
  }

  /**
   * Actualiza las estadísticas con datos específicos por rol
   */
  private updateQuickStats(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    const userRole = this.authService.getUserRole();
    
    switch (userRole) {
      case 'ADMIN':
        this.updateAdminStats(data);
        break;
      case 'VETERINARIAN':
        this.updateVeterinarianStats(data);
        break;
      case 'RECEPTIONIST':
        this.updateReceptionistStats(data);
        break;
      default:
        this.updateBasicStats(data);
    }
  }

  /**
   * Estadísticas para administradores
   */
  private updateAdminStats(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    const totalUsers = data.allUsers.length;
    const activeUsers = data.activeUsers.length;
    const veterinarians = data.veterinarians.length;
    const recentUsers = this.getRecentUsersCount(data.allUsers);

    this.quickStats = [
      {
        icon: 'people',
        label: 'Total Usuarios',
        value: totalUsers,
        change: recentUsers > 0 ? `${recentUsers} nuevos esta semana` : 'Sin nuevos usuarios esta semana',
        changeType: recentUsers > 0 ? 'positive' : 'neutral',
        color: 'primary'
      },
      {
        icon: 'verified_user',
        label: 'Usuarios Activos',
        value: activeUsers,
        change: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}% del total` : '0% del total',
        changeType: 'positive',
        color: 'secondary'
      },
      {
        icon: 'local_hospital',
        label: 'Veterinarios',
        value: veterinarians,
        change: totalUsers > 0 ? `${Math.round((veterinarians / totalUsers) * 100)}% del equipo` : '0% del equipo',
        changeType: 'positive',
        color: 'accent'
      },
      {
        icon: 'admin_panel_settings',
        label: 'Sistema',
        value: 'Operativo',
        change: 'Todos los servicios funcionando',
        changeType: 'positive',
        color: 'success'
      }
    ];
  }

  /**
   * Estadísticas para veterinarios
   */
  private updateVeterinarianStats(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    this.quickStats = [
      {
        icon: 'pets',
        label: 'Mascotas Registradas',
        value: 'N/A',
        change: 'Próximamente disponible',
        changeType: 'neutral',
        color: 'primary'
      },
      {
        icon: 'calendar_today',
        label: 'Citas Hoy',
        value: 'N/A',
        change: 'Próximamente disponible',
        changeType: 'neutral',
        color: 'secondary'
      },
      {
        icon: 'local_hospital',
        label: 'Consultas Pendientes',
        value: 'N/A',
        change: 'Próximamente disponible',
        changeType: 'neutral',
        color: 'accent'
      }
    ];
  }

  /**
   * Estadísticas para recepcionistas
   */
  private updateReceptionistStats(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    this.quickStats = [
      {
        icon: 'people',
        label: 'Clientes Registrados',
        value: 'N/A',
        change: 'Próximamente disponible',
        changeType: 'neutral',
        color: 'primary'
      },
      {
        icon: 'calendar_today',
        label: 'Citas del Día',
        value: 'N/A',
        change: 'Próximamente disponible',
        changeType: 'neutral',
        color: 'secondary'
      },
      {
        icon: 'pets',
        label: 'Mascotas Activas',
        value: 'N/A',
        change: 'Próximamente disponible',
        changeType: 'neutral',
        color: 'accent'
      }
    ];
  }

  /**
   * Estadísticas básicas para otros roles
   */
  private updateBasicStats(data: { allUsers: User[], activeUsers: User[], veterinarians: User[] }): void {
    this.quickStats = [
      {
        icon: 'dashboard',
        label: 'Bienvenido',
        value: 'VetApp',
        change: 'Sistema de gestión veterinaria',
        changeType: 'positive',
        color: 'primary'
      }
    ];
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
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0); // Inicio del día hace una semana
    
    if (this.debugMode) {
      console.log('📅 Fecha actual:', now);
      console.log('📅 Fecha límite para usuarios recientes:', oneWeekAgo);
      console.log('📊 Total usuarios a evaluar:', users.length);
    }
    
    const recentUsers = users.filter(user => {
      if (!user.createdAt) {
        if (this.debugMode) {
          console.log(`⚠️ Usuario sin fecha de creación: ${user.name} ${user.lastName}`);
        }
        return false;
      }
      
      // Intentar parsear la fecha en diferentes formatos
      let userCreatedDate: Date;
      
      if (typeof user.createdAt === 'string') {
        // Si es string, intentar parsearlo
        userCreatedDate = new Date(user.createdAt);
      } else if (user.createdAt instanceof Date) {
        // Si ya es Date
        userCreatedDate = user.createdAt;
      } else {
        if (this.debugMode) {
          console.log(`⚠️ Formato de fecha no reconocido para ${user.name}: ${user.createdAt}`);
        }
        return false;
      }
      
      // Verificar si la fecha es válida
      if (isNaN(userCreatedDate.getTime())) {
        if (this.debugMode) {
          console.log(`⚠️ Fecha inválida para ${user.name}: ${user.createdAt}`);
        }
        return false;
      }
      
      const isRecent = userCreatedDate > oneWeekAgo;
      
      if (this.debugMode) {
        console.log(`👤 ${user.name} ${user.lastName}:`);
        console.log(`   - Creado: ${userCreatedDate}`);
        console.log(`   - Es reciente: ${isRecent}`);
        console.log(`   - Días desde creación: ${Math.floor((now.getTime() - userCreatedDate.getTime()) / (1000 * 60 * 60 * 24))}`);
      }
      
      return isRecent;
    });
    
    if (this.debugMode) {
      console.log(`📊 Resultado final: ${recentUsers.length} usuarios recientes de ${users.length} totales`);
    }
    
    return recentUsers.length;
  }

  /**
   * Actualiza los datos del dashboard
   */
  refreshData(): void {
    this.currentDate = new Date();
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

  /**
   * Carga estado de sistema de respaldo en caso de error
   */
  private loadFallbackSystemStatus(): void {
    this.systemStatus = [
      {
        icon: 'error',
        title: 'API Backend',
        description: 'Error de conexión',
        status: 'Error',
        type: 'error'
      },
      {
        icon: 'error',
        title: 'Base de Datos',
        description: 'Error de conexión',
        status: 'Error',
        type: 'error'
      },
      {
        icon: 'construction',
        title: 'Módulos Adicionales',
        description: 'Mascotas, citas, inventario',
        status: 'En desarrollo',
        type: 'warning'
      }
    ];
  }

  /**
   * Obtiene el mensaje de bienvenida específico por rol
   */
  getRoleSpecificWelcome(): string {
    const userRole = this.authService.getUserRole();
    
    switch (userRole) {
      case 'ADMIN':
        return 'Aquí tienes un resumen completo del sistema y todos los usuarios';
      case 'VETERINARIAN':
        return 'Aquí tienes un resumen de tus consultas, citas y pacientes';
      case 'RECEPTIONIST':
        return 'Aquí tienes un resumen de las citas y clientes del día';
      default:
        return 'Aquí tienes un resumen de la actividad de tu clínica veterinaria';
    }
  }
} 