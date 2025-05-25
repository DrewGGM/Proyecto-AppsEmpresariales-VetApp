import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, delay } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InitialRedirectGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Agregar un pequeño delay para asegurar que el estado de auth se haya inicializado
    return this.authService.isAuthenticated$.pipe(
      delay(100), // Esperar 100ms para que se complete la inicialización
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Si está autenticado, redirigir al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          // Si no está autenticado, redirigir al home
          this.router.navigate(['/home']);
        }
        return false; // Siempre retorna false porque siempre redirige
      })
    );
  }
} 