import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginCredentials, ForgotPasswordRequest, ResetPasswordRequest } from '../models/credentials.interface';
import { UserSession, AuthState } from '../models/user-session.interface';
import { ToastService } from '../../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'vetapp_user_session';
  
  // Estado de autenticación
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });
  
  // Observables públicos
  public authState$ = this.authStateSubject.asObservable();
  public user$ = this.authState$.pipe(map(state => state.user));
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public loading$ = this.authState$.pipe(map(state => state.loading));

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {
    this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuthState(): void {
    try {
      const storedSession = localStorage.getItem(this.STORAGE_KEY);
      if (storedSession) {
        const userSession: UserSession = JSON.parse(storedSession);
        this.updateAuthState({
          isAuthenticated: true,
          user: userSession,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error al cargar sesión desde localStorage:', error);
      this.clearStoredSession();
    }
  }

  /**
   * Actualiza el estado de autenticación
   */
  private updateAuthState(newState: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...newState });
  }

  /**
   * Autentica al usuario
   */
  login(credentials: LoginCredentials): Observable<UserSession> {
    this.updateAuthState({ loading: true, error: null });
    
    return this.http.post<UserSession>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setUserSession(response, credentials.remember);
            this.updateAuthState({
              isAuthenticated: true,
              user: response,
              loading: false,
              error: null
            });
          } else {
            this.updateAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: response.message || 'Error de autenticación'
            });
          }
        }),
        catchError(error => {
          const errorMessage = error.error?.message || 'Error de conexión';
          this.updateAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: errorMessage
          });
          return throwError(() => error);
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.clearStoredSession();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    this.router.navigate(['/auth/login']);
    this.toastService.success('Sesión cerrada correctamente');
  }

  /**
   * Solicita restablecimiento de contraseña
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, request)
      .pipe(
        catchError(error => {
          const errorMessage = error.error?.message || 'Error al enviar solicitud';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Restablece la contraseña
   */
  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, request)
      .pipe(
        catchError(error => {
          const errorMessage = error.error?.message || 'Error al restablecer contraseña';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): UserSession | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string {
    const user = this.getCurrentUser();
    return user ? user.role : '';
  }

  /**
   * Verifica si el usuario tiene rol de administrador
   */
  hasAdminRole(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Lógica básica de permisos por rol
    switch (user.role) {
      case 'ADMIN':
        return true; // Admin tiene todos los permisos
      case 'VETERINARIAN':
        return ['MANAGE_CONSULTATIONS', 'MANAGE_APPOINTMENTS', 'MANAGE_CUSTOMERS'].includes(permission);
      case 'RECEPTIONIST':
        return ['MANAGE_APPOINTMENTS', 'MANAGE_CUSTOMERS'].includes(permission);
      default:
        return false;
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    const user = this.getCurrentUser();
    if (!user?.expiresAt) return false;
    
    return new Date() > new Date(user.expiresAt);
  }

  /**
   * Actualiza el token de acceso
   */
  refreshToken(): Observable<UserSession> {
    const user = this.getCurrentUser();
    if (!user?.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<UserSession>(`${this.API_URL}/refresh`, {
      refreshToken: user.refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setUserSession(response, true);
          this.updateAuthState({
            user: response,
            error: null
          });
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Guarda la sesión del usuario
   */
  private setUserSession(userSession: UserSession, remember: boolean = false): void {
    if (remember) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userSession));
    } else {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(userSession));
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Limpia la sesión almacenada
   */
  private clearStoredSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}