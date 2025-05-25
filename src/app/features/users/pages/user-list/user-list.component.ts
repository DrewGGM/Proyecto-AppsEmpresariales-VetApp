import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService, UserSearchResponse } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  
  users: User[] = [];
  loading: boolean = false;
  totalUsers: number = 0;
  activeUsers: number = 0;
  veterinarians: number = 0;
  
  // Mapa para almacenar las fotos de los usuarios
  userPhotos: Map<number, string | null> = new Map();
  
  // Filtros y paginación
  currentPage: number = 0;
  pageSize: number = 6;
  totalPages: number = 0;
  totalElements: number = 0;
  
  // Filtros generales
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: boolean | undefined = undefined;
  
  // Sistema de búsqueda específica
  searchType: string = 'general'; // Tipo de búsqueda seleccionado
  searchValue: string = ''; // Valor para búsquedas específicas
  
  // Opciones de búsqueda disponibles
  searchTypes = [
    { value: 'general', label: 'Búsqueda General', description: 'Buscar por nombre, email con filtros' },
    { value: 'id', label: 'Por ID de Usuario', description: 'Buscar usuario específico por ID' },
    { value: 'email', label: 'Por Email', description: 'Buscar usuario por dirección de email' },
    { value: 'role', label: 'Por Rol Específico', description: 'Mostrar todos los usuarios de un rol' },
    { value: 'active', label: 'Solo Usuarios Activos', description: 'Mostrar únicamente usuarios activos' }
  ];
  
  // Estado de búsqueda
  isSearching: boolean = false;
  searchResultType: string = ''; // Tipo de resultado actual
  
  private destroy$ = new Subject<void>();

  /**
   * Getter para obtener la descripción del tipo de búsqueda actual
   */
  get currentSearchTypeDescription(): string {
    const searchType = this.searchTypes.find(t => t.value === this.searchType);
    return searchType?.description || '';
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAllUsers(); // Cargar lista inicial completa
    this.loadUserStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los usuarios (lista inicial sin filtros)
   * Usa GET /users
   */
  loadAllUsers(): void {
    this.loading = true;
    this.isSearching = false;
    
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allUsers: User[]) => {
          // Aplicar paginación manual para la lista completa
          this.totalElements = allUsers.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          
          const startIndex = this.currentPage * this.pageSize;
          const endIndex = startIndex + this.pageSize;
          this.users = allUsers.slice(startIndex, endIndex);
          
          // Cargar fotos de los usuarios visibles
          this.loadUserPhotos(this.users);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this.toastService.error('Error al cargar la lista de usuarios');
          this.loading = false;
        }
      });
  }

  /**
   * Carga las fotos de una lista de usuarios
   */
  private loadUserPhotos(users: User[]): void {
    users.forEach(user => {
      // Solo cargar si no está ya en el mapa
      if (!this.userPhotos.has(user.id)) {
        this.userService.getUserPhoto(user.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.userPhotos.set(user.id, response.photoUrl);
            },
            error: (error) => {
              console.error(`Error al cargar foto del usuario ${user.id}:`, error);
              this.userPhotos.set(user.id, null);
            }
          });
      }
    });
  }

  /**
   * Obtiene la foto de un usuario específico
   */
  getUserPhotoUrl(userId: number): string | null {
    return this.userPhotos.get(userId) || null;
  }

  /**
   * Busca usuarios con filtros específicos
   * Usa GET /users/search
   */
  searchUsers(): void {
    // Solo buscar si hay al menos un filtro activo
    if (!this.hasActiveFilters()) {
      this.loadAllUsers();
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.currentPage = 0; // Reset a primera página
    
    const searchParams = {
      search: this.searchTerm || undefined,
      role: this.selectedRole || undefined,
      active: this.selectedStatus,
      page: this.currentPage,
      size: this.pageSize
    };

    this.userService.searchUsers(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserSearchResponse) => {
          this.users = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          
          // Cargar fotos de los usuarios encontrados
          this.loadUserPhotos(this.users);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error en búsqueda:', error);
          this.toastService.error('Error al buscar usuarios');
          this.loading = false;
        }
      });
  }

  /**
   * Carga estadísticas generales de usuarios
   */
  loadUserStats(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allUsers: User[]) => {
          this.totalUsers = allUsers.length;
          this.activeUsers = allUsers.filter(user => user.active).length;
          this.veterinarians = allUsers.filter(user => user.role === 'VETERINARIAN').length;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
  }

  /**
   * Navega a la página de creación de usuario
   */
  createUser(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  /**
   * Navega a la página de detalle de usuario
   */
  viewUser(userId: number): void {
    this.router.navigate(['/usuarios', userId]);
  }

  /**
   * Navega a la página de edición de usuario
   */
  editUser(userId: number): void {
    this.router.navigate(['/usuarios', userId, 'editar']);
  }

  /**
   * Elimina un usuario
   */
  deleteUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const confirmMessage = `¿Estás seguro de que deseas eliminar al usuario "${user.name} ${user.lastName}"?\n\n` +
      `Esta acción desactivará al usuario. Si deseas eliminarlo permanentemente, selecciona "Eliminar permanentemente".`;
    
    const deleteType = confirm(confirmMessage) ? 
      (confirm('¿Deseas eliminar permanentemente al usuario? Esta acción no se puede deshacer.') ? 'permanent' : 'soft') : 
      null;

    if (deleteType) {
      const deleteOperation = deleteType === 'permanent' ? 
        this.userService.deleteUserPermanently(userId) : 
        this.userService.deleteUser(userId);

      deleteOperation
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const actionType = deleteType === 'permanent' ? 'eliminado permanentemente' : 'desactivado';
            this.toastService.success(`Usuario "${user.name} ${user.lastName}" ${actionType} correctamente`);
            
            // Recargar manteniendo el contexto actual
            this.refreshData();
            this.loadUserStats(); // Actualizar estadísticas
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            this.toastService.error('Error al eliminar el usuario');
          }
        });
    }
  }

  /**
   * Obtiene el nombre mostrable del rol
   */
  getRoleDisplay(role: string): string {
    const roleDisplayMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinario',
      'RECEPTIONIST': 'Recepcionista'
    };
    return roleDisplayMap[role] || role;
  }

  /**
   * Filtra usuarios por búsqueda
   */
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    // No buscar automáticamente, esperar a que el usuario haga clic en "Buscar"
  }

  /**
   * Filtra usuarios por rol
   */
  onRoleFilter(role: string): void {
    this.selectedRole = role;
    // No buscar automáticamente
  }

  /**
   * Filtra usuarios por estado
   */
  onStatusFilter(status: string): void {
    if (status === '') {
      this.selectedStatus = undefined;
    } else {
      this.selectedStatus = status === 'true';
    }
    // No buscar automáticamente
  }

  /**
   * Ejecuta la búsqueda según el tipo seleccionado
   */
  executeSearch(): void {
    switch (this.searchType) {
      case 'general':
        this.searchGeneral();
        break;
      case 'id':
        this.searchById();
        break;
      case 'email':
        this.searchByEmail();
        break;
      case 'role':
        this.searchByRole();
        break;
      case 'active':
        this.searchActiveUsers();
        break;
      default:
        this.loadAllUsers();
    }
  }

  /**
   * Búsqueda general con filtros - GET /users/search
   */
  searchGeneral(): void {
    if (!this.hasActiveFilters()) {
      this.loadAllUsers();
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.searchResultType = 'Búsqueda General';
    this.currentPage = 0;
    
    const searchParams = {
      search: this.searchTerm || undefined,
      role: this.selectedRole || undefined,
      active: this.selectedStatus,
      page: this.currentPage,
      size: this.pageSize
    };

    this.userService.searchUsers(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserSearchResponse) => {
          this.users = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          
          // Cargar fotos de los usuarios encontrados
          this.loadUserPhotos(this.users);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error en búsqueda general:', error);
          this.toastService.error('Error al buscar usuarios');
          this.loading = false;
        }
      });
  }

  /**
   * Búsqueda por ID específico - GET /users/{id}
   */
  searchById(): void {
    const userId = parseInt(this.searchValue);
    if (!userId || userId <= 0) {
      this.toastService.warning('Por favor, ingresa un ID válido');
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.searchResultType = `Usuario con ID: ${userId}`;

    this.userService.getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.users = [user];
          this.totalElements = 1;
          this.totalPages = 1;
          this.currentPage = 0;
          
          // Cargar foto del usuario encontrado
          this.loadUserPhotos([user]);
          
          this.loading = false;
          this.toastService.success(`Usuario encontrado: ${user.name} ${user.lastName}`);
        },
        error: (error) => {
          console.error('Error al buscar por ID:', error);
          this.toastService.error(`No se encontró usuario con ID: ${userId}`);
          this.users = [];
          this.totalElements = 0;
          this.loading = false;
        }
      });
  }

  /**
   * Búsqueda por email específico - GET /users/email/{email}
   */
  searchByEmail(): void {
    const email = this.searchValue.trim();
    if (!email || !this.isValidEmail(email)) {
      this.toastService.warning('Por favor, ingresa un email válido');
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.searchResultType = `Usuario con email: ${email}`;

    this.userService.getUserByEmail(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.users = [user];
          this.totalElements = 1;
          this.totalPages = 1;
          this.currentPage = 0;
          
          // Cargar foto del usuario encontrado
          this.loadUserPhotos([user]);
          
          this.loading = false;
          this.toastService.success(`Usuario encontrado: ${user.name} ${user.lastName}`);
        },
        error: (error) => {
          console.error('Error al buscar por email:', error);
          this.toastService.error(`No se encontró usuario con email: ${email}`);
          this.users = [];
          this.totalElements = 0;
          this.loading = false;
        }
      });
  }

  /**
   * Búsqueda por rol específico - Método personalizado
   */
  searchByRole(): void {
    const role = this.searchValue.trim().toUpperCase();
    const validRoles = ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'];
    
    if (!role || !validRoles.includes(role)) {
      this.toastService.warning('Roles válidos: ADMIN, VETERINARIAN, RECEPTIONIST');
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.searchResultType = `Usuarios con rol: ${this.getRoleDisplayName(role)}`;

    this.userService.getUsersByRole(role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.totalElements = users.length;
          this.totalPages = Math.ceil(users.length / this.pageSize);
          this.currentPage = 0;
          
          // Aplicar paginación manual
          this.users = users.slice(0, this.pageSize);
          
          // Cargar fotos de los usuarios encontrados
          this.loadUserPhotos(this.users);
          
          this.loading = false;
          
          this.toastService.success(`${users.length} usuarios encontrados con rol ${this.getRoleDisplayName(role)}`);
        },
        error: (error) => {
          console.error('Error al buscar por rol:', error);
          this.toastService.error('Error al buscar usuarios por rol');
          this.loading = false;
        }
      });
  }

  /**
   * Búsqueda de usuarios activos únicamente
   */
  searchActiveUsers(): void {
    this.loading = true;
    this.isSearching = true;
    this.searchResultType = 'Usuarios Activos';

    this.userService.getActiveUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.totalElements = users.length;
          this.totalPages = Math.ceil(users.length / this.pageSize);
          this.currentPage = 0;
          
          // Aplicar paginación manual
          this.users = users.slice(0, this.pageSize);
          
          // Cargar fotos de los usuarios encontrados
          this.loadUserPhotos(this.users);
          
          this.loading = false;
          
          this.toastService.success(`${users.length} usuarios activos encontrados`);
        },
        error: (error) => {
          console.error('Error al buscar usuarios activos:', error);
          this.toastService.error('Error al buscar usuarios activos');
          this.loading = false;
        }
      });
  }

  /**
   * Métodos de utilidad
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinario',
      'RECEPTIONIST': 'Recepcionista'
    };
    return roleNames[role] || role;
  }

  /**
   * Cambio de tipo de búsqueda
   */
  onSearchTypeChange(): void {
    // Limpiar valores cuando cambia el tipo
    this.searchValue = '';
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = undefined;
    
    // Si no es búsqueda general y hay resultados, limpiar
    if (this.searchType !== 'general' && this.isSearching) {
      this.clearFilters();
    }
  }

  /**
   * Cambia de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    
    if (this.isSearching) {
      this.executeSearch(); // Si está en modo búsqueda, ejecutar la búsqueda actual
    } else {
      this.loadAllUsers(); // Si está en modo lista completa, usar findAll
    }
  }

  /**
   * Recarga los datos
   */
  refreshData(): void {
    if (this.isSearching) {
      this.executeSearch(); // Si está en modo búsqueda, ejecutar la búsqueda actual
    } else {
      this.loadAllUsers(); // Sino, cargar lista completa
    }
    this.loadUserStats();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = undefined;
    this.currentPage = 0;
    this.loadAllUsers(); // Volver a lista completa
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedRole || this.selectedStatus !== undefined);
  }

  /**
   * Obtiene los números de página a mostrar en la paginación
   */
  getPageNumbers(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    // Calcular el rango de páginas a mostrar
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  deactivateUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`¿Seguro que deseas desactivar a "${user.name} ${user.lastName}"?`)) {
      this.userService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success(`Usuario desactivado correctamente`);
            this.refreshData();
          },
          error: () => this.toastService.error('Error al desactivar usuario')
        });
    }
  }

  activateUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`¿Seguro que deseas ACTIVAR a "${user.name} ${user.lastName}"?`)) {
      this.userService.activateUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success(`Usuario activado correctamente`);
            this.refreshData();
          },
          error: () => this.toastService.error('Error al activar usuario')
        });
    }
  }
}
