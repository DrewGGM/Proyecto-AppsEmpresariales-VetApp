import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserService } from '../../services/user.service';
import { ActivityService, RecentActivity } from '../../../../core/services/activity.service';
import { UserSession } from '../../../../core/auth/models/user-session.interface';
import { User } from '../../models/user.interface';
import { UserActivity } from '../../models/user-activity.interface';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Estado de carga
  loading = true;
  updating = false;
  uploadingPhoto = false;
  
  // Datos del usuario
  currentUser: UserSession | null = null;
  userDetails: User | null = null;
  userPhotoUrl: string | null = null; // URL de la foto separada
  recentActivity: RecentActivity[] = [];
  userStats: any = null;
  
  // Formularios
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  // Estados de UI
  editingProfile = false;
  editingPassword = false;
  showPasswordForm = false;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private activityService: ActivityService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserData();
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
    if (!this.currentUser) {
      this.toastService.error('No se pudo obtener la información del usuario');
      return;
    }
  }

  /**
   * Carga todos los datos del usuario
   */
  loadUserData(): void {
    if (!this.currentUser) return;
    
    this.loading = true;
    
    // Cargar detalles del usuario
    this.userService.getUserById(this.currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('👤 Usuario cargado desde el backend:', {
            id: user.id,
            name: user.name,
            photoUrl: user.photoUrl,
            hasPhotoUrl: !!user.photoUrl
          });
          
          this.userDetails = user;
          this.populateProfileForm();
          this.loadUserPhoto(); // Cargar foto por separado
          this.loadUserActivity();
          this.loadUserStats();
        },
        error: (error) => {
          console.error('Error loading user details:', error);
          this.toastService.error('Error al cargar los datos del usuario');
          this.loading = false;
        }
      });
  }

  /**
   * Carga la actividad reciente del usuario
   */
  private loadUserActivity(): void {
    if (!this.currentUser) return;
    
    this.userService.getUserActivity(this.currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities: UserActivity[]) => {
          this.recentActivity = this.mapUserActivitiesToRecentActivities(activities);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading user activity:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Convierte UserActivity[] a RecentActivity[]
   */
  private mapUserActivitiesToRecentActivities(activities: UserActivity[]): RecentActivity[] {
    return activities.slice(0, 5).map(activity => ({
      icon: this.getActivityIcon(activity.type),
      title: activity.description,
      description: activity.details || '',
             time: this.formatTimeAgo(activity.date.toString()),
      color: this.getActivityColor(activity.type)
    }));
  }

  /**
   * Obtiene el color para el tipo de actividad
   */
  private getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'login': 'primary',
      'consultation': 'success',
      'vaccination': 'info',
      'appointment': 'secondary',
      'profile_update': 'warning',
      'password_change': 'accent'
    };
    
    return colors[type] || 'primary';
  }

  /**
   * Formatea la fecha a "Hace X tiempo"
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
   * Carga la foto del usuario por separado
   */
  private loadUserPhoto(): void {
    if (!this.currentUser) return;
    
    this.userService.getUserPhoto(this.currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.userPhotoUrl = response.photoUrl;
        },
        error: (error) => {
          console.error('Error al cargar foto del usuario:', error);
          this.userPhotoUrl = null;
        }
      });
  }

  /**
   * Carga las estadísticas del usuario (solo para veterinarios)
   */
  private loadUserStats(): void {
    if (!this.currentUser || this.currentUser.role !== 'VETERINARIAN') return;
    
    this.userService.getUserStats(this.currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.userStats = stats;
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
        }
      });
  }

  /**
   * Crea el formulario de perfil
   */
  private createProfileForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Crea el formulario de contraseña
   */
  private createPasswordForm(): FormGroup {
    return this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador para confirmar que las contraseñas coinciden
   */
  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Llena el formulario con los datos del usuario
   */
  private populateProfileForm(): void {
    if (this.userDetails) {
      this.profileForm.patchValue({
        name: this.userDetails.name,
        lastName: this.userDetails.lastName,
        email: this.userDetails.email
      });
    }
  }

  /**
   * Inicia la edición del perfil
   */
  startEditingProfile(): void {
    this.editingProfile = true;
    this.populateProfileForm();
  }

  /**
   * Cancela la edición del perfil
   */
  cancelEditingProfile(): void {
    this.editingProfile = false;
    this.populateProfileForm();
  }

  /**
   * Guarda los cambios del perfil
   */
  saveProfile(): void {
    if (this.profileForm.invalid || !this.currentUser) return;
    
    this.updating = true;
    const formData = this.profileForm.value;
    
    // Incluir el rol actual para mantenerlo
    const updateData = {
      ...formData,
      role: this.userDetails!.role
    };
    
    this.userService.updateUser(this.currentUser.userId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.userDetails = updatedUser;
          this.editingProfile = false;
          this.updating = false;
          this.toastService.success('Perfil actualizado correctamente');
          
          // Actualizar la información del usuario en el localStorage/sessionStorage
          // No podemos usar updateUserSession porque no existe, pero podemos recargar la página
          // o manejar la actualización de otra manera
          this.currentUser = {
            ...this.currentUser!,
            name: updatedUser.name,
            lastName: updatedUser.lastName,
            email: updatedUser.email
          };
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.updating = false;
          this.toastService.error('Error al actualizar el perfil');
        }
      });
  }

  /**
   * Muestra el formulario de cambio de contraseña
   */
  showChangePassword(): void {
    this.showPasswordForm = true;
    this.editingPassword = true;
    this.passwordForm.reset();
  }

  /**
   * Cancela el cambio de contraseña
   */
  cancelChangePassword(): void {
    this.showPasswordForm = false;
    this.editingPassword = false;
    this.passwordForm.reset();
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(): void {
    if (this.passwordForm.invalid || !this.currentUser) return;
    
    this.updating = true;
    const formData = this.passwordForm.value;
    
    // Actualizar usuario con nueva contraseña
    const updateData = {
      name: this.userDetails!.name,
      lastName: this.userDetails!.lastName,
      email: this.userDetails!.email,
      password: formData.newPassword,
      role: this.userDetails!.role
    };
    
    this.userService.updateUser(this.currentUser.userId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showPasswordForm = false;
          this.editingPassword = false;
          this.updating = false;
          this.passwordForm.reset();
          this.toastService.success('Contraseña actualizada correctamente');
        },
        error: (error) => {
          console.error('Error updating password:', error);
          this.updating = false;
          this.toastService.error('Error al actualizar la contraseña');
        }
      });
  }

  /**
   * Abre el selector de archivos para la foto
   */
  openPhotoSelector(): void {
    const fileInput = document.getElementById('photoUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }



  /**
   * Fuerza la actualización del avatar
   */
  private forceAvatarUpdate(): void {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  /**
   * Recarga solo los detalles del usuario sin afectar otros datos
   */
  private refreshUserDetails(): void {
    if (!this.currentUser) return;
    
    console.log('🔄 Recargando detalles del usuario...');
    this.userService.getUserById(this.currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('🔄 Usuario actualizado:', {
            id: user.id,
            name: user.name,
            photoUrl: user.photoUrl,
            hasPhotoUrl: !!user.photoUrl
          });
          
          this.userDetails = user;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error al recargar usuario:', error);
        }
      });
  }

  /**
   * Maneja la subida de foto de perfil
   */
  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.currentUser) return;
    
    const file = input.files[0];
    

    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      this.toastService.error('El archivo es demasiado grande. Máximo 10MB');
      return;
    }
    
    this.uploadingPhoto = true;
    
    this.userService.uploadUserPhoto(this.currentUser.userId, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.uploadingPhoto = false;
          
          // Actualizar inmediatamente la photoUrl
          if (response.photoUrl) {
            // Agregar timestamp para evitar cache del navegador
            const timestamp = new Date().getTime();
            this.userPhotoUrl = `${response.photoUrl}?t=${timestamp}`;
            
            // Forzar actualización del avatar
            this.forceAvatarUpdate();
          }
          
          this.toastService.success('Foto de perfil actualizada');
          
          // Recargar foto del usuario después de un pequeño delay para verificar sincronización
          setTimeout(() => {
            this.loadUserPhoto();
          }, 1000);
          
          // Limpiar el input para permitir subir la misma imagen nuevamente
          input.value = '';
        },
        error: (error) => {
          console.error('Error al subir foto:', error);
          this.uploadingPhoto = false;
          
          let errorMessage = 'Error al subir la foto de perfil';
          
          if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Archivo inválido. Verifica el formato y tamaño.';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado.';
          } else if (error.status === 413) {
            errorMessage = 'El archivo es demasiado grande.';
          } else if (error.status === 415) {
            errorMessage = 'Tipo de archivo no soportado.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor. Intenta nuevamente en unos momentos.';

          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.toastService.error(errorMessage);
          
          // Limpiar el input en caso de error también
          input.value = '';
        }
      });
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    if (this.userDetails) {
      return `${this.userDetails.name} ${this.userDetails.lastName}`;
    }
    return 'Usuario';
  }

  /**
   * Getter para la photoUrl del usuario
   */
  get currentPhotoUrl(): string | null | undefined {
    return this.userPhotoUrl;
  }

  /**
   * Obtiene el nombre del rol en español
   */
  getRoleDisplayName(): string {
    if (!this.userDetails) return '';
    
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinario',
      'RECEPTIONIST': 'Recepcionista'
    };
    
    return roleNames[this.userDetails.role] || this.userDetails.role;
  }

  /**
   * Verifica si el usuario es veterinario
   */
  isVeterinarian(): boolean {
    return this.userDetails?.role === 'VETERINARIAN';
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string, formGroup: FormGroup = this.profileForm): string {
    const field = formGroup.get(fieldName);
    if (!field || !field.errors) return '';
    
    const errors = field.errors;
    
    if (errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['email']) return 'Formato de email inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    
    return 'Campo inválido';
  }

  /**
   * Obtiene la etiqueta del campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'name': 'Nombre',
      'lastName': 'Apellido',
      'email': 'Email',
      'currentPassword': 'Contraseña actual',
      'newPassword': 'Nueva contraseña',
      'confirmPassword': 'Confirmar contraseña'
    };
    
    return labels[fieldName] || fieldName;
  }

  /**
   * Obtiene el ícono para el tipo de actividad
   */
  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'login': 'login',
      'consultation': 'local_hospital',
      'vaccination': 'vaccines',
      'appointment': 'calendar_today',
      'profile_update': 'person',
      'password_change': 'lock'
    };
    
    return icons[type] || 'info';
  }

  // Getters para formularios
  get name() { return this.profileForm.get('name'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }
} 