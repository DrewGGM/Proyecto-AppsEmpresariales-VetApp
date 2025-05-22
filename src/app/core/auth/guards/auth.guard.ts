import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuthentication(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  /**
   * Verifica la autenticación del usuario
   */
  private checkAuthentication(url: string): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Verificar si el token ha expirado
          if (this.authService.isTokenExpired()) {
            this.authService.logout();
            this.redirectToLogin(url);
            return false;
          }
          return true;
        } else {
          this.redirectToLogin(url);
          return false;
        }
      })
    );
  }

  /**
   * Redirige al login con la URL de retorno
   */
  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl } 
    });
  }
}