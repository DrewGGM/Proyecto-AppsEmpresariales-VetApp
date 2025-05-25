import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserService } from '../../../features/users/services/user.service';
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
  currentUserPhotoUrl: string | null = null;
  private destroy$ = new Subject<void>();
  @Output() mobileSidebarClosed = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadCurrentUserPhoto();
        }
      });

    this.checkIsMobile();
    
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      this.isCollapsed = !this.isMobile && savedCollapsedState === 'true';
    } else {
      this.isCollapsed = false;
    }
    
    setTimeout(() => {
      this.checkIsMobile();
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkIsMobile();
    if (!this.isMobile && this.isMobileOpen) {
      this.isMobileOpen = false;
      this.cdr.detectChanges();
      this.mobileSidebarClosed.emit();
    }
  }

  private checkIsMobile(): void {
    const previousIsMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (previousIsMobile !== this.isMobile) {
      this.cdr.detectChanges();
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.toggleMobileSidebar();
    } else {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebar-collapsed', this.isCollapsed.toString());
    }
  }

  toggleMobileSidebar(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.cdr.detectChanges();
    
    if (!this.isMobileOpen && this.isMobile) {
      this.mobileSidebarClosed.emit();
    }
  }

  closeMobileSidebar(): void {
    if (this.isMobile) {
      this.isMobileOpen = false;
      this.cdr.detectChanges();
      this.mobileSidebarClosed.emit();
    }
  }

  getUserRoleDisplay(role: string): string {
    const roleDisplayMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VETERINARIAN': 'Veterinario',
      'RECEPTIONIST': 'Recepcionista'
    };
    return roleDisplayMap[role] || role;
  }

  canAccessUsers(): boolean {
    return this.authService.hasPermission('MANAGE_USERS') || this.authService.hasAdminRole();
  }

  canAccessClients(): boolean {
    return this.authService.hasPermission('MANAGE_CUSTOMERS') || this.authService.hasAdminRole();
  }

  canAccessPets(): boolean {
    return this.authService.hasPermission('MANAGE_PETS') || this.authService.hasAdminRole();
  }

  canAccessAppointments(): boolean {
    return this.authService.hasPermission('MANAGE_APPOINTMENTS') || this.authService.hasAdminRole();
  }

  canAccessConsultations(): boolean {
    return this.authService.hasPermission('MANAGE_CONSULTATIONS') || this.authService.hasAdminRole();
  }

  canAccessInventory(): boolean {
    return this.authService.hasPermission('MANAGE_INVENTORY') || this.authService.hasAdminRole();
  }

  canAccessSettings(): boolean {
    return this.authService.hasPermission('MANAGE_SETTINGS') || this.authService.hasAdminRole();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  private loadCurrentUserPhoto(): void {
    if (!this.currentUser) return;
    
    this.userService.getUserPhoto(this.currentUser.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentUserPhotoUrl = response.photoUrl;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar foto del usuario en sidebar:', error);
          this.currentUserPhotoUrl = null;
        }
      });
  }
}
