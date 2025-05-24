import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginCredentials } from '../../../../core/auth/models/credentials.interface';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  @Output() submitForm = new EventEmitter<LoginCredentials>();
  @Output() forgotPassword = new EventEmitter<void>();

  loginForm!: FormGroup;
  isLoading: boolean = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa el formulario de login
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      remember: this.loginForm.value.remember
    };

    this.submitForm.emit(credentials);
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(field => {
      const control = this.loginForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  /**
   * Maneja el click en "Olvidé mi contraseña"
   */
  onForgotPassword(): void {
    this.forgotPassword.emit();
  }

  /**
   * Setters para controlar el estado desde el componente padre
   */
  setLoading(loading: boolean): void {
    this.isLoading = loading;
    
    if (loading) {
      this.loginForm.disable();
    } else {
      this.loginForm.enable();
    }
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.loginForm.reset();
    this.setLoading(false);
  }

  /**
   * Getters para acceso fácil a los controles
   */
  get email() { 
    return this.loginForm.get('email'); 
  }

  get password() { 
    return this.loginForm.get('password'); 
  }

  get remember() { 
    return this.loginForm.get('remember'); 
  }
}