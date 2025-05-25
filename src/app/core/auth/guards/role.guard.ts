import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        // Obtener roles requeridos de la configuración de la ruta
        const requiredRoles: string[] = route.data['roles'] || [];
        const requiredPermissions: string[] = route.data['permissions'] || [];

        // Si no hay roles o permisos requeridos, permitir acceso
        if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
          return true;
        }

        // Verificar roles
        const hasRequiredRole = requiredRoles.length === 0 || 
                               requiredRoles.includes(user.role);

        // Verificar permisos
        const hasRequiredPermissions = requiredPermissions.length === 0 ||
                                     requiredPermissions.every(permission => 
                                       this.authService.hasPermission(permission)
                                     );

        if (hasRequiredRole && hasRequiredPermissions) {
          return true;
        } else {
          // Mostrar mensaje de acceso denegado
          this.toastService.error('No tienes permisos para acceder a esta sección');
          // Redirigir al dashboard si no tiene permisos
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}