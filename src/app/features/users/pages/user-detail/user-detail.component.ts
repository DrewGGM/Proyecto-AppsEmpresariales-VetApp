import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

// Servicios
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoaderService } from '../../../../core/services/loader.service';

// Modelos
import { User } from '../../models/user.interface';
import { UserRole } from '../../models/role.enum';
import { UserActivity, ActivityType } from '../../models/user-activity.interface';

// Interfaces para estadísticas
export interface UserStats {
  consultations: number;
  vaccinations: number;
  appointments: number;
}

// Interfaces para capacidades
export interface CapabilityCategory {
  name: string;
  icon: string;
  capabilities: string[];
}

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  // Datos del usuario
  user: User | null = null;
  activities: UserActivity[] = [];
  userStats: UserStats = {
    consultations: 0,
    vaccinations: 0,
    appointments: 0
  };

  // Estados de carga
  loading = true;
  loadingActivities = false;
  loadingStats = false;

  // Permisos del usuario actual
  isAdmin = false;
  canEditUser = false;
  canDeleteUser = false;

  // Configuración
  userId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.initializePermissions();
    this.loadUserFromRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa los permisos del usuario actual
   */
  private initializePermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isAdmin = currentUser.role === 'ADMIN';
      this.canEditUser = this.isAdmin || this.authService.hasPermission('EDIT_USERS');
      this.canDeleteUser = this.isAdmin || this.authService.hasPermission('DELETE_USERS');
    }
  }

  /**
   * Carga el usuario desde la ruta
   */
  private loadUserFromRoute(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id && !isNaN(+id)) {
          this.userId = +id;
          this.loadUserData();
        } else {
          this.handleError('ID de usuario inválido');
        }
      });
  }

  /**
   * Carga todos los datos del usuario
   */
  private loadUserData(): void {
    if (!this.userId) return;

    this.loading = true;
    this.loaderService.show();

    this.userService.getUserById(this.userId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(user => {
          this.user = user;

          // Cargar datos relacionados en paralelo
          const requests = [
            this.loadUserActivities()
          ];

          // Solo cargar estadísticas para veterinarios
          if (user.role === UserRole.VETERINARIAN) {
            requests.push(this.loadUserStatistics());
          }

          return forkJoin(requests);
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.handleError('No se pudo cargar la información del usuario');
        }
      });
  }

  /**
   * Carga las actividades del usuario
   */
  private loadUserActivities(): Promise<void> {
    if (!this.userId) return Promise.resolve();

    this.loadingActivities = true;

    return this.userService.getUserActivity(this.userId)
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(activities => {
        this.activities = activities || [];
        this.loadingActivities = false;
      })
      .catch(error => {
        console.error('Error loading activities:', error);
        this.loadingActivities = false;
        this.toastService.warning('No se pudo cargar el historial de actividad');
      });
  }

  /**
   * Carga las estadísticas del usuario (solo veterinarios)
   */
  private loadUserStatistics(): Promise<void> {
    if (!this.userId) return Promise.resolve();

    this.loadingStats = true;

    return this.userService.getUserStats(this.userId)
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(stats => {
        this.userStats = stats || { consultations: 0, vaccinations: 0, appointments: 0 };
        this.loadingStats = false;
      })
      .catch(error => {
        console.error('Error loading stats:', error);
        this.loadingStats = false;
        this.toastService.warning('No se pudieron cargar las estadísticas');
      });
  }

  /**
   * Navega a la edición del usuario
   */
  editUser(): void {
    if (this.user) {
      this.router.navigate(['/usuarios/editar', this.user.id]);
    }
  }

  /**
   * Elimina el usuario
   */
  deleteUser(): void {
    if (!this.user) return;

    const userName = `${this.user.name} ${this.user.lastName}`;
    const confirmMessage = `¿Estás seguro de que deseas eliminar al usuario "${userName}"?\n\n` +
      `Esta acción desactivará al usuario. Si deseas eliminarlo permanentemente, selecciona "Eliminar permanentemente".`;

    const deleteType = confirm(confirmMessage) ? 
      (confirm('¿Deseas eliminar permanentemente al usuario? Esta acción no se puede deshacer.') ? 'permanent' : 'soft') : 
      null;

    if (deleteType) {
      this.loaderService.show();

      const deleteOperation = deleteType === 'permanent' ? 
        this.userService.deleteUserPermanently(this.user.id) : 
        this.userService.deleteUser(this.user.id);

      deleteOperation
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const actionType = deleteType === 'permanent' ? 'eliminado permanentemente' : 'desactivado';
            this.toastService.success(`Usuario "${userName}" ${actionType} correctamente`);
            this.router.navigate(['/usuarios']);
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.toastService.error('No se pudo eliminar el usuario');
            this.loaderService.hide();
          }
        });
    }
  }

  /**
   * Navega de vuelta al listado
   */
  goBack(): void {
    this.router.navigate(['/usuarios']);
  }

  /**
   * Obtiene el porcentaje para las barras de progreso de estadísticas
   */
  getStatsPercentage(value: number, maxValue: number = 300): number {
    return Math.min(100, Math.max(0, (value / maxValue) * 100));
  }

  /**
   * Obtiene la etiqueta legible del rol
   */
  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.VETERINARIAN:
        return 'Veterinario';
      case UserRole.RECEPTIONIST:
        return 'Recepcionista';
      default:
        return role;
    }
  }

  /**
   * Verifica si el usuario es veterinario
   */
  isVeterinarian(): boolean {
    return this.user?.role === UserRole.VETERINARIAN;
  }

  /**
   * Obtiene el icono según el tipo de actividad
   */
  getActivityIcon(activityType: ActivityType): string {
    switch (activityType) {
      case 'consultation':
        return 'local_hospital';
      case 'vaccination':
        return 'healing';
      case 'login':
        return 'login';
      default:
        return 'history';
    }
  }

  /**
   * Maneja errores y navega al listado
   */
  private handleError(message: string): void {
    this.toastService.error(message);
    this.loading = false;
    this.loaderService.hide();
    this.router.navigate(['/usuarios']);
  }

  /**
   * Actualiza la información del usuario (para uso futuro)
   */
  refreshUserData(): void {
    if (this.userId) {
      this.loadUserData();
    }
  }

  /**
   * Verifica si el usuario está activo
   */
  isUserActive(): boolean {
    return this.user?.active || false;
  }

  /**
   * Obtiene el tiempo transcurrido desde la creación
   */
  getMemberSince(): string {
    if (!this.user?.createdAt) return 'Fecha no disponible';

    const createdDate = new Date(this.user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} año${years > 1 ? 's' : ''}`;
    }
  }

  deactivateUser(userId: number): void {
    const user = this.user;
    if (!user || user.id !== userId) return;
    if (confirm(`¿Seguro que deseas desactivar a "${user.name} ${user.lastName}"?`)) {
      this.userService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success(`Usuario desactivado correctamente`);
            this.refreshUserData();
          },
          error: () => this.toastService.error('Error al desactivar usuario')
        });
    }
  }

  deleteUserPermanently(userId: number): void {
    const user = this.user;
    if (!user || user.id !== userId) return;
    if (confirm(`¿Seguro que deseas eliminar PERMANENTEMENTE a "${user.name} ${user.lastName}"? Esta acción no se puede deshacer.`)) {
      this.userService.deleteUserPermanently(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success(`Usuario eliminado permanentemente`);
            this.refreshUserData();
          },
          error: () => this.toastService.error('Error al eliminar usuario')
        });
    }
  }

  /**
   * Obtiene el ícono del rol
   */
  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'admin_panel_settings';
      case 'VETERINARIAN':
        return 'local_hospital';
      case 'RECEPTIONIST':
        return 'support_agent';
      default:
        return 'person';
    }
  }

  /**
   * Obtiene la descripción del rol
   */
  getRoleDescription(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Acceso completo al sistema con capacidades de administración y gestión de usuarios.';
      case 'VETERINARIAN':
        return 'Profesional médico veterinario con acceso a consultas, diagnósticos y tratamientos.';
      case 'RECEPTIONIST':
        return 'Personal de recepción con acceso a gestión de citas, clientes y mascotas.';
      default:
        return 'Usuario del sistema con permisos básicos.';
    }
  }

  /**
   * Obtiene las capacidades del usuario según su rol
   */
  getUserCapabilities(): CapabilityCategory[] {
    if (!this.user) return [];

    const baseCapabilities: CapabilityCategory[] = [
      {
        name: 'Acceso General',
        icon: 'login',
        capabilities: [
          'Iniciar sesión en el sistema',
          'Ver su perfil personal',
          'Cambiar su contraseña'
        ]
      }
    ];

    switch (this.user.role) {
      case 'ADMIN':
        return [
          ...baseCapabilities,
          {
            name: 'Gestión de Usuarios',
            icon: 'people',
            capabilities: [
              'Crear nuevos usuarios',
              'Editar información de usuarios',
              'Activar/desactivar usuarios',
              'Eliminar usuarios permanentemente',
              'Ver estadísticas de usuarios'
            ]
          },
          {
            name: 'Administración del Sistema',
            icon: 'settings',
            capabilities: [
              'Configurar parámetros del sistema',
              'Ver logs y actividad del sistema',
              'Gestionar roles y permisos',
              'Acceso a todas las funcionalidades'
            ]
          }
        ];

      case 'VETERINARIAN':
        return [
          ...baseCapabilities,
          {
            name: 'Atención Médica',
            icon: 'local_hospital',
            capabilities: [
              'Realizar consultas médicas',
              'Crear diagnósticos y tratamientos',
              'Aplicar vacunas',
              'Ver historial médico de mascotas'
            ]
          },
          {
            name: 'Gestión de Citas',
            icon: 'calendar_today',
            capabilities: [
              'Ver citas asignadas',
              'Programar nuevas citas',
              'Modificar citas existentes',
              'Acceder a información de clientes'
            ]
          }
        ];

      case 'RECEPTIONIST':
        return [
          ...baseCapabilities,
          {
            name: 'Gestión de Clientes',
            icon: 'people',
            capabilities: [
              'Registrar nuevos clientes',
              'Editar información de clientes',
              'Ver historial de clientes',
              'Gestionar información de mascotas'
            ]
          },
          {
            name: 'Gestión de Citas',
            icon: 'calendar_today',
            capabilities: [
              'Programar citas para clientes',
              'Modificar citas existentes',
              'Cancelar citas',
              'Ver calendario de citas'
            ]
          }
        ];

      default:
        return baseCapabilities;
    }
  }

  /**
   * Obtiene las restricciones de acceso del usuario
   */
  getAccessRestrictions(): string[] {
    if (!this.user) return [];

    const restrictions: string[] = [];

    if (!this.user.active) {
      restrictions.push('Cuenta desactivada - No puede iniciar sesión');
    }

    switch (this.user.role) {
      case 'VETERINARIAN':
        restrictions.push('No puede gestionar otros usuarios');
        restrictions.push('No puede acceder a configuración del sistema');
        restrictions.push('No puede eliminar registros permanentemente');
        break;

      case 'RECEPTIONIST':
        restrictions.push('No puede realizar consultas médicas');
        restrictions.push('No puede gestionar otros usuarios');
        restrictions.push('No puede acceder a configuración del sistema');
        restrictions.push('No puede eliminar registros permanentemente');
        break;
    }

    return restrictions;
  }
}