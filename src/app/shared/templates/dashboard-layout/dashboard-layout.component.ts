import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  @Input() showHeader: boolean = false;
  
  isSidebarCollapsed: boolean = false;
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Escuchar cambios en el estado del sidebar desde localStorage
    this.checkSidebarState();
    
    // Escuchar cambios en localStorage (si se cambia desde otro componente)
    window.addEventListener('storage', this.onStorageChange.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('storage', this.onStorageChange.bind(this));
  }

  /**
   * Verifica el estado actual del sidebar
   */
  private checkSidebarState(): void {
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    this.isSidebarCollapsed = savedCollapsedState === 'true';
  }

  /**
   * Maneja cambios en localStorage
   */
  private onStorageChange(event: StorageEvent): void {
    if (event.key === 'sidebar-collapsed') {
      this.isSidebarCollapsed = event.newValue === 'true';
    }
  }
}
