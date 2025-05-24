import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
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
  isMobileOpen: boolean = false;
  isMobile: boolean = false;
  currentUser: UserSession | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Detectar si es móvil al inicializar - múltiple detección
    this.checkIsMobile();
    
    // Verificar el estado inicial de colapso desde localStorage
    // En desktop: abierto por defecto, en móvil: cerrado por defecto
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      // Si hay estado guardado, usarlo solo para desktop
      this.isCollapsed = !this.isMobile && savedCollapsedState === 'true';
    } else {
      // Estado por defecto: abierto en desktop, cerrado en móvil
      this.isCollapsed = false;
    }
    
    // Detección adicional después de un breve delay
    setTimeout(() => {
      this.checkIsMobile();
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Escucha cambios en el tamaño de la ventana
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkIsMobile();
    // Cerrar sidebar móvil al cambiar a escritorio
    if (!this.isMobile && this.isMobileOpen) {
      this.isMobileOpen = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Detecta si estamos en un dispositivo móvil
   */
  private checkIsMobile(): void {
    const previousIsMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768; // $breakpoint-md equivale a 768px
    
    // Si cambió el estado móvil, forzar detección de cambios
    if (previousIsMobile !== this.isMobile) {
      this.cdr.detectChanges();
    }
  }

  /**
   * Alterna el estado de colapso del sidebar (solo escritorio)
   */
  toggleSidebar(): void {
    if (this.isMobile) {
      this.toggleMobileSidebar();
    } else {
      this.isCollapsed = !this.isCollapsed;
      // Guardar el estado en localStorage
      localStorage.setItem('sidebar-collapsed', this.isCollapsed.toString());
    }
  }

  /**
   * Alterna el sidebar móvil
   */
  toggleMobileSidebar(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.cdr.detectChanges();
  }

  /**
   * Cierra el sidebar móvil
   */
  closeMobileSidebar(): void {
    if (this.isMobile) {
      this.isMobileOpen = false;
      this.cdr.detectChanges();
    }
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
