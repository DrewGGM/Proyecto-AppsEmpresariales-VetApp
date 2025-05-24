import { Component, Input, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SidebarComponent } from '../../organisms/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() showHeader: boolean = false;
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  isSidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  isMobileMenuOpen: boolean = false;
  
  // Debug temporal (remover después)
  showDebugInfo: boolean = false; // Desactivado para producción
  
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Escuchar cambios en el estado del sidebar desde localStorage
    this.checkSidebarState();
    
    // Detectar si es móvil al inicializar - múltiple detección
    this.checkIsMobile();
    
    // Detección adicional después de un breve delay para asegurar que la ventana esté completamente cargada
    setTimeout(() => {
      this.checkIsMobile();
      this.cdr.detectChanges();
    }, 100);
    
    // Escuchar cambios en localStorage (si se cambia desde otro componente)
    window.addEventListener('storage', this.onStorageChange.bind(this));
  }

  ngAfterViewInit(): void {
    // Verificar estado inicial del sidebar móvil
    if (this.sidebar) {
      this.isMobileMenuOpen = this.sidebar.isMobileOpen;
      // Sincronizar el estado de colapso con el sidebar
      this.isSidebarCollapsed = this.sidebar.isCollapsed;
    }
    
    // Detección adicional después de que la vista esté inicializada
    setTimeout(() => {
      this.checkIsMobile();
      this.syncWithSidebar();
      this.cdr.detectChanges();
    }, 50);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('storage', this.onStorageChange.bind(this));
  }

  /**
   * Escucha cambios en el tamaño de la ventana
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const wasMobile = this.isMobile;
    this.checkIsMobile();
    
    // Si cambió de móvil a desktop o viceversa, reajustar el estado
    if (wasMobile !== this.isMobile) {
      this.handleMobileDesktopTransition();
    }
    
    // Cerrar sidebar móvil al cambiar a escritorio
    if (!this.isMobile && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      if (this.sidebar) {
        this.sidebar.closeMobileSidebar();
      }
    }
  }

  /**
   * Maneja la transición entre móvil y desktop
   */
  private handleMobileDesktopTransition(): void {
    if (this.sidebar) {
      if (!this.isMobile) {
        // Cambió a desktop: restaurar estado de colapso desde localStorage
        const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
        this.sidebar.isCollapsed = savedCollapsedState === 'true';
        this.isSidebarCollapsed = this.sidebar.isCollapsed;
      } else {
        // Cambió a móvil: cerrar sidebar móvil
        this.sidebar.isMobileOpen = false;
        this.isMobileMenuOpen = false;
      }
      this.cdr.detectChanges();
    }
  }

  /**
   * Sincroniza el estado con el sidebar
   */
  private syncWithSidebar(): void {
    if (this.sidebar) {
      this.isSidebarCollapsed = this.sidebar.isCollapsed;
      this.isMobileMenuOpen = this.sidebar.isMobileOpen;
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
   * Alterna el sidebar móvil
   */
  toggleMobileSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleMobileSidebar();
      this.isMobileMenuOpen = this.sidebar.isMobileOpen;
      this.cdr.detectChanges();
    }
  }

  /**
   * Verifica el estado actual del sidebar
   */
  private checkSidebarState(): void {
    // Detectar si es móvil primero
    this.checkIsMobile();
    
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      // Si hay estado guardado, usarlo solo para desktop
      this.isSidebarCollapsed = !this.isMobile && savedCollapsedState === 'true';
    } else {
      // Estado por defecto: abierto en desktop, cerrado en móvil  
      this.isSidebarCollapsed = false;
    }
  }

  /**
   * Maneja cambios en localStorage
   */
  private onStorageChange(event: StorageEvent): void {
    if (event.key === 'sidebar-collapsed') {
      this.isSidebarCollapsed = event.newValue === 'true';
    }
  }

  /**
   * Debug: Obtiene el ancho actual de la ventana
   */
  getWindowWidth(): number {
    return window.innerWidth;
  }
}
