import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-user-create-edit',
  standalone: false,
  templateUrl: './user-create-edit.component.html',
  styleUrls: ['./user-create-edit.component.scss']
})
export class UserCreateEditComponent implements OnInit, OnDestroy {
  
  userForm: FormGroup;
  isEditMode: boolean = false;
  userId: number | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  
  // Opciones de roles disponibles
  roles = [
    { value: 'ADMIN', label: 'Administrador', description: 'Acceso completo al sistema' },
    { value: 'VETERINARIAN', label: 'Veterinario', description: 'Gestión de consultas y tratamientos' },
    { value: 'RECEPTIONIST', label: 'Recepcionista', description: 'Gestión de citas y clientes' }
  ];
  
  // Control de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el componente y determina el modo (crear/editar)
   */
  private initializeComponent(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        // Modo edición
        this.isEditMode = true;
        this.userId = parseInt(params['id']);
        this.loadUserData();
      } else {
        // Modo creación
        this.isEditMode = false;
        this.userId = null;
        this.setupPasswordValidations();
      }
    });
  }

  /**
   * Configura las validaciones de contraseña según el modo
   */
  private setupPasswordValidations(): void {
    const passwordControl = this.userForm.get('password');
    const confirmPasswordControl = this.userForm.get('confirmPassword');

    if (!this.isEditMode) {
      // En modo creación, ambas contraseñas son requeridas
      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]);
      confirmPasswordControl?.setValidators([Validators.required]);
    } else {
      // En modo edición, contraseñas son opcionales
      passwordControl?.setValidators([
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]);
      confirmPasswordControl?.clearValidators();
    }

    passwordControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
    
    console.log('🔒 Password validations configured for mode:', this.isEditMode ? 'EDIT' : 'CREATE');
  }

  /**
   * Crea el formulario reactivo con validaciones
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: [''], // Validaciones se configuran dinámicamente
      confirmPassword: [''], // Validaciones se configuran dinámicamente
      role: ['', [Validators.required]]
    }, { 
      validators: this.createPasswordMatchValidator() 
    });
  }

  /**
   * Crea el validador de confirmación de contraseña con contexto
   */
  private createPasswordMatchValidator() {
    return (form: FormGroup) => {
      const password = form.get('password');
      const confirmPassword = form.get('confirmPassword');
      
      if (!password || !confirmPassword) {
        return null;
      }

      // Si hay contraseña pero no confirmación
      if (password.value && !confirmPassword.value) {
        confirmPassword.setErrors({ required: true });
        return { passwordMismatch: true };
      }
      
      // Si ambas tienen valor y no coinciden, es error
      if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
      
      // Todo está bien - limpiar errores de mismatch si coinciden
      if (confirmPassword.hasError('passwordMismatch') && password.value === confirmPassword.value) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
      
      return null;
    };
  }

  /**
   * Carga los datos del usuario para edición
   */
  private loadUserData(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          console.log('📥 User data loaded for editing:', user);
          
          // Configurar validaciones para modo edición
          this.setupPasswordValidations();

          // Cargar datos del usuario
          this.userForm.patchValue({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          });

          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar usuario:', error);
          this.toastService.error('Error al cargar los datos del usuario');
          this.router.navigate(['/usuarios']);
          this.loading = false;
        }
      });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    console.log('🚀 onSubmit called');
    console.log('📝 Form status:', {
      valid: this.userForm.valid,
      invalid: this.userForm.invalid,
      errors: this.userForm.errors,
      value: this.userForm.value
    });

    // Marcar todos los campos como touched para mostrar errores
    this.markFormGroupTouched();

    if (this.userForm.invalid) {
      console.log('❌ Form is invalid');
      console.log('🔍 Field errors:', {
        name: this.name?.errors,
        lastName: this.lastName?.errors,
        email: this.email?.errors,
        password: this.password?.errors,
        confirmPassword: this.confirmPassword?.errors,
        role: this.role?.errors
      });
      this.toastService.warning('Por favor, corrige los errores en el formulario');
      return;
    }

    console.log('✅ Form is valid, proceeding...');
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  /**
   * Crea un nuevo usuario
   */
  private createUser(): void {
    console.log('🆕 Creating user...');
    this.submitting = true;
    const formData = this.userForm.value;

    const createRequest = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role
    };

    console.log('📤 Sending create request:', createRequest);

    this.userService.createUser(createRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          console.log('✅ User created successfully:', user);
          this.toastService.success(`Usuario "${user.name} ${user.lastName}" creado exitosamente`);
          this.router.navigate(['/usuarios']);
          this.submitting = false;
        },
        error: (error) => {
          console.error('❌ Error creating user:', error);
          this.handleSubmitError(error);
          this.submitting = false;
        }
      });
  }

  /**
   * Actualiza un usuario existente
   */
  private updateUser(): void {
    if (!this.userId) return;

    this.submitting = true;
    const formData = this.userForm.value;

    const updateRequest: any = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role
    };

    // Solo incluir password si se proporcionó
    if (formData.password?.trim()) {
      updateRequest.password = formData.password;
    }

    this.userService.updateUser(this.userId, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.toastService.success(`Usuario "${user.name} ${user.lastName}" actualizado exitosamente`);
          this.router.navigate(['/usuarios']);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.handleSubmitError(error);
          this.submitting = false;
        }
      });
  }

  /**
   * Maneja errores del envío
   */
  private handleSubmitError(error: any): void {
    console.error('🚨 Error details:', error);
    
    // Limpiar errores previos del formulario
    this.clearFormErrors();
    
    if (error.status === 409) {
      // Conflicto - Email duplicado
      this.toastService.error('El email ya está registrado por otro usuario');
      this.userForm.get('email')?.setErrors({ emailExists: true });
      this.userForm.get('email')?.markAsTouched();
    } else if (error.status === 400) {
      // Datos inválidos - Procesar errores específicos del backend
      this.handleValidationErrors(error);
    } else if (error.status === 422) {
      // Entidad no procesable - Errores de validación específicos
      this.handleValidationErrors(error);
    } else if (error.status === 0) {
      // Error de conexión
      this.toastService.error('No se puede conectar con el servidor. Verifica tu conexión.');
    } else if (error.status === 500) {
      // Error interno del servidor
      this.toastService.error('Error interno del servidor. Intenta nuevamente en unos momentos.');
    } else {
      // Error genérico
      const errorMessage = error.error?.message || `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el usuario`;
      this.toastService.error(errorMessage);
    }
  }

  /**
   * Maneja errores de validación específicos del backend
   */
  private handleValidationErrors(error: any): void {
    const errorData = error.error;
    let hasSpecificErrors = false;
    
    // Si el backend envía errores específicos por campo
    if (errorData?.errors && typeof errorData.errors === 'object') {
      Object.keys(errorData.errors).forEach(fieldName => {
        const fieldError = errorData.errors[fieldName];
        const formControl = this.userForm.get(fieldName);
        
        if (formControl) {
          hasSpecificErrors = true;
          
          // Determinar el tipo de error basado en el mensaje
          let errorType = 'serverError';
          if (fieldError.includes('email') && fieldError.includes('uso')) {
            errorType = 'emailExists';
          } else if (fieldError.includes('requerido') || fieldError.includes('obligatorio')) {
            errorType = 'required';
          } else if (fieldError.includes('formato') || fieldError.includes('válido')) {
            errorType = 'format';
          }
          
          formControl.setErrors({ [errorType]: true, serverMessage: fieldError });
          formControl.markAsTouched();
        }
      });
    }
    
    // Si el backend envía un array de errores
    else if (errorData?.errors && Array.isArray(errorData.errors)) {
      errorData.errors.forEach((errorMsg: string) => {
        if (errorMsg.toLowerCase().includes('email')) {
          hasSpecificErrors = true;
          this.userForm.get('email')?.setErrors({ serverError: true, serverMessage: errorMsg });
          this.userForm.get('email')?.markAsTouched();
        } else if (errorMsg.toLowerCase().includes('nombre')) {
          hasSpecificErrors = true;
          this.userForm.get('name')?.setErrors({ serverError: true, serverMessage: errorMsg });
          this.userForm.get('name')?.markAsTouched();
        } else if (errorMsg.toLowerCase().includes('apellido')) {
          hasSpecificErrors = true;
          this.userForm.get('lastName')?.setErrors({ serverError: true, serverMessage: errorMsg });
          this.userForm.get('lastName')?.markAsTouched();
        } else if (errorMsg.toLowerCase().includes('contraseña') || errorMsg.toLowerCase().includes('password')) {
          hasSpecificErrors = true;
          this.userForm.get('password')?.setErrors({ serverError: true, serverMessage: errorMsg });
          this.userForm.get('password')?.markAsTouched();
        } else if (errorMsg.toLowerCase().includes('rol')) {
          hasSpecificErrors = true;
          this.userForm.get('role')?.setErrors({ serverError: true, serverMessage: errorMsg });
          this.userForm.get('role')?.markAsTouched();
        }
      });
    }
    
    // Mensaje específico basado en el contenido del error
    if (errorData?.message) {
      if (errorData.message.toLowerCase().includes('email')) {
        this.toastService.error('Error en el email: ' + errorData.message);
        if (!hasSpecificErrors) {
          this.userForm.get('email')?.setErrors({ serverError: true, serverMessage: errorData.message });
          this.userForm.get('email')?.markAsTouched();
        }
      } else if (errorData.message.toLowerCase().includes('duplicado') || errorData.message.toLowerCase().includes('existe')) {
        this.toastService.error('El email ya está registrado por otro usuario');
        this.userForm.get('email')?.setErrors({ emailExists: true });
        this.userForm.get('email')?.markAsTouched();
      } else {
        this.toastService.error(errorData.message);
      }
    } else if (hasSpecificErrors) {
      this.toastService.error('Por favor, corrige los errores marcados en el formulario');
    } else {
      this.toastService.error('Datos inválidos. Verifica la información ingresada');
    }
  }

  /**
   * Limpia errores previos del formulario
   */
  private clearFormErrors(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control?.errors) {
        // Mantener errores de validación del frontend, limpiar solo errores del servidor
        const errors = { ...control.errors };
        delete errors['serverError'];
        delete errors['emailExists'];
        delete errors['serverMessage'];
        
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    });
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Cancela la operación y regresa a la lista
   */
  onCancel(): void {
    if (this.userForm.dirty) {
      if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/usuarios']);
      }
    } else {
      this.router.navigate(['/usuarios']);
    }
  }

  /**
   * Getters para acceder fácilmente a los controles del formulario
   */
  get name() { return this.userForm.get('name'); }
  get lastName() { return this.userForm.get('lastName'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
  get role() { return this.userForm.get('role'); }

  /**
   * Verifica si un campo tiene errores específicos
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.dirty || field?.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors || (!field.dirty && !field.touched)) return '';

    const errors = field.errors;

    // Priorizar mensajes del servidor si existen
    if (errors['serverMessage']) {
      return errors['serverMessage'];
    }

    switch (fieldName) {
      case 'name':
      case 'lastName':
        if (errors['required']) return `${fieldName === 'name' ? 'Nombre' : 'Apellido'} es obligatorio`;
        if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
        if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        if (errors['pattern']) return 'Solo se permiten letras y espacios';
        if (errors['serverError']) return 'Error en el campo nombre/apellido';
        break;

      case 'email':
        if (errors['required']) return 'Email es obligatorio';
        if (errors['email']) return 'Formato de email inválido';
        if (errors['maxlength']) return 'Máximo 100 caracteres';
        if (errors['emailExists']) return 'Este email ya está registrado por otro usuario';
        if (errors['serverError']) return 'Error en el email';
        break;

      case 'password':
        if (errors['required']) return 'Contraseña es obligatoria';
        if (errors['minlength']) return 'Mínimo 8 caracteres';
        if (errors['pattern']) return 'Debe contener mayúscula, minúscula, número y símbolo';
        if (errors['serverError']) return 'Error en la contraseña';
        break;

      case 'confirmPassword':
        if (errors['required']) return 'Confirmar contraseña es obligatorio';
        if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
        if (errors['serverError']) return 'Error en la confirmación de contraseña';
        break;

      case 'role':
        if (errors['required']) return 'Rol es obligatorio';
        if (errors['serverError']) return 'Error en el rol seleccionado';
        break;
    }

    // Mensaje genérico para errores del servidor no específicos
    if (errors['serverError']) {
      return 'Error en este campo';
    }

    return 'Campo inválido';
  }

  /**
   * Obtiene el título de la página
   */
  get pageTitle(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  }

  /**
   * Obtiene el texto del botón de envío
   */
  get submitButtonText(): string {
    if (this.submitting) {
      return this.isEditMode ? 'Actualizando...' : 'Creando...';
    }
    return this.isEditMode ? 'Actualizar Usuario' : 'Crear Usuario';
  }

  /**
   * Getter para obtener la descripción del rol seleccionado
   */
  get selectedRoleDescription(): string {
    if (!this.role?.value) return '';
    const selectedRole = this.roles.find(r => r.value === this.role?.value);
    return selectedRole?.description || '';
  }

  /**
   * Método de desarrollo para probar diferentes tipos de errores
   * TODO: Remover en producción
   */
  private testErrorHandling(): void {
    // Simular diferentes tipos de errores para testing
    const testErrors = [
      {
        status: 409,
        error: { message: 'El email ya está en uso por otro usuario' }
      },
      {
        status: 400,
        error: { 
          message: 'Datos inválidos',
          errors: {
            email: 'El formato del email no es válido',
            name: 'El nombre es demasiado corto'
          }
        }
      },
      {
        status: 422,
        error: {
          errors: ['El email ya está registrado', 'La contraseña no cumple los requisitos']
        }
      }
    ];
    
    // Usar solo para testing: this.handleSubmitError(testErrors[0]);
  }
}
