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
  
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.checkSidebarState();
    this.checkIsMobile();
    
    setTimeout(() => {
      this.checkIsMobile();
      this.cdr.detectChanges();
    }, 100);
    
    window.addEventListener('storage', this.onStorageChange.bind(this));
  }

  ngAfterViewInit(): void {
    if (this.sidebar) {
      this.isMobileMenuOpen = this.sidebar.isMobileOpen;
      this.isSidebarCollapsed = this.sidebar.isCollapsed;
    }
    
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const wasMobile = this.isMobile;
    this.checkIsMobile();
    
    if (wasMobile !== this.isMobile) {
      this.handleMobileDesktopTransition();
    }
    
    if (!this.isMobile && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      if (this.sidebar) {
        this.sidebar.closeMobileSidebar();
      }
    }
  }

  private handleMobileDesktopTransition(): void {
    if (this.sidebar) {
      if (!this.isMobile) {
        const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
        this.sidebar.isCollapsed = savedCollapsedState === 'true';
        this.isSidebarCollapsed = this.sidebar.isCollapsed;
      } else {
        this.sidebar.isMobileOpen = false;
        this.isMobileMenuOpen = false;
      }
      this.cdr.detectChanges();
    }
  }

  private syncWithSidebar(): void {
    if (this.sidebar) {
      this.isSidebarCollapsed = this.sidebar.isCollapsed;
      this.isMobileMenuOpen = this.sidebar.isMobileOpen;
    }
  }

  private checkIsMobile(): void {
    const previousIsMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (previousIsMobile !== this.isMobile) {
      this.cdr.detectChanges();
    }
  }

  toggleMobileSidebar(): void {
    if (this.sidebar) {
      this.sidebar.toggleMobileSidebar();
      this.isMobileMenuOpen = this.sidebar.isMobileOpen;
      this.cdr.detectChanges();
    }
  }

  private checkSidebarState(): void {
    this.checkIsMobile();
    
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      this.isSidebarCollapsed = !this.isMobile && savedCollapsedState === 'true';
    } else {
      this.isSidebarCollapsed = false;
    }
  }

  private onStorageChange(event: StorageEvent): void {
    if (event.key === 'sidebar-collapsed') {
      this.isSidebarCollapsed = event.newValue === 'true';
    }
  }

  onMobileSidebarClosed(): void {
    this.isMobileMenuOpen = false;
    this.cdr.detectChanges();
  }
}
