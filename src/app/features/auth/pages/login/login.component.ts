import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoginCredentials } from '../../../../core/auth/models/credentials.interface';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild(LoginFormComponent) loginFormComponent!: LoginFormComponent;

  private destroy$ = new Subject<void>();
  private returnUrl: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getReturnUrl();
    this.checkIfAlreadyLoggedIn();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtiene la URL de retorno desde los query params
   */
  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  /**
   * Verifica si el usuario ya está logueado
   */
  private checkIfAlreadyLoggedIn(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
  onLoginSubmit(credentials: LoginCredentials): void {
    this.loginFormComponent.setLoading(true);

    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loginFormComponent.setLoading(false);
          
          if (response.success) {
            this.toastService.success(`¡Bienvenido ${response.name}!`);
            this.router.navigate([this.returnUrl]);
          } else {
            this.handleLoginError(response.message || 'Error de autenticación');
          }
        },
        error: (error) => {
          this.loginFormComponent.setLoading(false);
          
          let errorMessage = 'Error de conexión. Por favor, intenta de nuevo.';
          
          if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.handleLoginError(errorMessage);
        }
      });
  }

  /**
   * Maneja errores de login
   */
  private handleLoginError(message: string): void {
    this.loginFormComponent.setLoading(false);
    this.toastService.error(message);
  }



  /**
   * Maneja errores del estado de autenticación
   */
  private subscribeToAuthErrors(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.error) {
          this.handleLoginError(state.error);
        }
      });
  }
}