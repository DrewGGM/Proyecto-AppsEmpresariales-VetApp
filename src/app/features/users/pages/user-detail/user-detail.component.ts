import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

// Servicios
import { UserService } from '../../services/user.service';
import { PermissionService } from '../../services/permission.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoaderService } from '../../../../core/services/loader.service';

// Modelos
import { User } from '../../models/user.interface';
import { UserRole } from '../../models/role.enum';
import { Permission } from '../../models/permission.interface';
import { UserActivity, ActivityType } from '../../models/user-activity.interface';

// Interfaces para estadísticas
export interface UserStats {
  consultations: number;
  vaccinations: number;
  appointments: number;
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
  permissions: Permission[] = [];
  userStats: UserStats = {
    consultations: 0,
    vaccinations: 0,
    appointments: 0
  };

  // Estados de carga
  loading = true;
  loadingActivities = false;
  loadingPermissions = false;
  loadingStats = false;

  // Permisos del usuario actual
  isAdmin = false;
  canEditUser = false;
  canDeleteUser = false;
  canManagePermissions = false;

  // Configuración
  userId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private permissionService: PermissionService,
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
      this.canManagePermissions = this.isAdmin || this.authService.hasPermission('MANAGE_PERMISSIONS');
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
            this.loadUserPermissions(),
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
   * Carga los permisos del usuario
   */
  private loadUserPermissions(): Promise<void> {
    if (!this.userId) return Promise.resolve();

    this.loadingPermissions = true;

    return this.permissionService.getUserPermissions(this.userId)
      .pipe(takeUntil(this.destroy$))
      .toPromise()
      .then(permissions => {
        this.permissions = permissions || [];
        this.loadingPermissions = false;
      })
      .catch(error => {
        console.error('Error loading permissions:', error);
        this.loadingPermissions = false;
        this.toastService.warning('No se pudieron cargar los permisos del usuario');
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
    const confirmMessage = `¿Estás seguro de que deseas eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`;

    if (confirm(confirmMessage)) {
      this.loaderService.show();

      this.userService.deleteUser(this.user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success(`Usuario "${userName}" eliminado correctamente`);
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
   * Actualiza el estado de un permiso
   */
  onPermissionChange(permissionId: number, event: Event): void {
    if (!this.user || !this.canManagePermissions) return;

    const target = event.target as HTMLInputElement;
    const granted = target.checked;

    this.loaderService.show();

    this.permissionService.updateUserPermission(this.user.id, permissionId, granted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Permiso actualizado correctamente');
          this.loadUserPermissions();
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error updating permission:', error);
          this.toastService.error('No se pudo actualizar el permiso');
          this.loaderService.hide();
        }
      });
  }

  /**
   * Abre el gestor de permisos
   */
  managePermissions(): void {
    if (!this.user) return;

    // Aquí se podría abrir un modal o navegar a otra página
    this.toastService.info('Funcionalidad de gestión avanzada de permisos en desarrollo');
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
        return 'medical_services';
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
}