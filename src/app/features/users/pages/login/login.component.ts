import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoginCredentials } from '../../../../core/auth/models/credentials.interface'

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  hidePassword: boolean = true;
  loading: boolean = false;
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) { }


  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {

  }

  private initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.email, Validators.required],
      password: ['', Validators.required, Validators.minLength(6)],
      remember: [false]
    })
  }

  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/usuarios';
  }

  private checkIfAlreadyLoggedIn(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl])
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    this.performLogin();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(field => {
      const control = this.loginForm.get(field)
      control?.markAsTouched({ onlySelf: true })
    });
  }

  private performLogin(): void {
    this.loading = true;

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }

    this.authService.login(credentials)
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get email() { return this.loginForm.get('email') }
  get password() { return this.loginForm.get('password') }

  hasFieldError(fieldName: string): boolean {
  const field = this.loginForm.get(fieldName);
  return !!(field && field.touched && field.errors);
  }
  
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es obligatorio`;
      }
      if (field.errors['email']) {
        return 'Correo electrónico inválido';
      }
      if (field.errors['minlength']) {
        return `Debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    
    return '';
  }

    private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Correo electrónico',
      password: 'Contraseña'
    };
    return labels[fieldName] || fieldName;
  }

}
