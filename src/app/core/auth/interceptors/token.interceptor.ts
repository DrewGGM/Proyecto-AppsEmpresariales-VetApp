import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token a las peticiones si está disponible
    const authRequest = this.addTokenToRequest(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores 401 (Unauthorized)
        if (error.status === 401 && this.authService.isAuthenticated()) {
          return this.handle401Error(authRequest, next);
        }

        // Manejar otros errores
        return throwError(() => error);
      })
    );
  }

  /**
   * Agrega el token de autorización a la petición
   */
  private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (token && !this.isAuthRequest(request)) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return request;
  }

  /**
   * Verifica si es una petición de autenticación
   */
  private isAuthRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/auth/');
  }

  /**
   * Maneja errores 401 intentando refrescar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getCurrentUser()?.refreshToken;
      
      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.token);
            
            // Reintentar la petición original con el nuevo token
            return next.handle(this.addTokenToRequest(request));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.logout(false);
            return throwError(() => error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.logout(false);
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Si ya se está refrescando el token, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => next.handle(this.addTokenToRequest(request)))
      );
    }
  }
}