import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserSession } from '../../../core/auth/models/user-session.interface';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  currentUser: UserSession | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Verificar el estado inicial de colapso desde localStorage
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    this.isCollapsed = savedCollapsedState === 'true';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Alterna el estado de colapso del sidebar
   */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    // Guardar el estado en localStorage
    localStorage.setItem('sidebar-collapsed', this.isCollapsed.toString());
  }

  /**
   * Obtiene el nombre mostrable del rol del usuario
   */
  getUserRoleDisplay(role: string): string {
    const roleDisplayMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinario',
      'RECEPTIONIST': 'Recepcionista'
    };
    return roleDisplayMap[role] || role;
  }

  /**
   * Verifica si el usuario puede acceder a la gestión de usuarios
   */
  canAccessUsers(): boolean {
    return this.authService.hasPermission('MANAGE_USERS') || this.authService.hasAdminRole();
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
