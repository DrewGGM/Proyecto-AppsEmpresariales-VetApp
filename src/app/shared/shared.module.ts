import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Átomos
import { ButtonComponent } from './atoms/button/button.component';
import { InputComponent } from './atoms/input/input.component';
import { BadgeComponent } from './atoms/badge/badge.component';
import { IconComponent } from './atoms/icon/icon.component';
import { AvatarComponent } from './atoms/avatar/avatar.component';
import { SpinnerComponent } from './atoms/spinner/spinner.component';
import { StatusIndicatorComponent } from './atoms/status-indicator/status-indicator.component';
import { NotificationsBadgeComponent } from './atoms/notifications-badge/notifications-badge.component';

// Moléculas
import { FormFieldComponent } from './molecules/form-field/form-field.component';
import { SearchBarComponent } from './molecules/search-bar/search-bar.component';
import { StatusIndicatorComponent as MoleculeStatusIndicatorComponent } from './molecules/status-indicator/status-indicator.component';
import { CardComponent } from './molecules/card/card.component';
import { AlertComponent } from './molecules/alert/alert.component';
import { UserCardComponent } from './molecules/user-card/user-card.component';

// Organismos
import { HeaderComponent } from './organisms/header/header.component';
import { SidebarComponent } from './organisms/sidebar/sidebar.component';
import { PaginationComponent } from './organisms/pagination/pagination.component';
import { FiltersComponent } from './organisms/filters/filters.component';
import { DataTableComponent } from './organisms/data-table/data-table.component';
import { UserFormComponent } from './organisms/user-form/user-form.component';
import { StatsPanelComponent } from './organisms/stats-panel/stats-panel.component';

// Templates
import { MainLayoutComponent } from './templates/main-layout/main-layout.component';
import { AuthLayoutComponent } from './templates/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './templates/dashboard-layout/dashboard-layout.component';

// Directivas
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { HasPermissionDirective } from './directives/has-permission.directive';

// Pipes
import { FilterPipe } from './pipes/filter.pipe';
import { SortPipe } from './pipes/sort.pipe';

@NgModule({
  declarations: [
    // Átomos
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    IconComponent,
    AvatarComponent,
    SpinnerComponent,
    StatusIndicatorComponent,
    NotificationsBadgeComponent,
    
    // Moléculas
    FormFieldComponent,
    SearchBarComponent,
    MoleculeStatusIndicatorComponent,
    CardComponent,
    AlertComponent,
    UserCardComponent,
    
    // Organismos
    HeaderComponent,
    SidebarComponent,
    PaginationComponent,
    FiltersComponent,
    DataTableComponent,
    UserFormComponent,
    StatsPanelComponent,
    
    // Templates
    MainLayoutComponent,
    AuthLayoutComponent,
    DashboardLayoutComponent,
    
    // Directivas
    ClickOutsideDirective,
    HasPermissionDirective,
    
    // Pipes
    FilterPipe,
    SortPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    // Módulos Angular para que otros módulos puedan usarlos
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    
    // Átomos
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    IconComponent,
    AvatarComponent,
    SpinnerComponent,
    StatusIndicatorComponent,
    NotificationsBadgeComponent,
    
    // Moléculas
    FormFieldComponent,
    SearchBarComponent,
    MoleculeStatusIndicatorComponent,
    CardComponent,
    AlertComponent,
    UserCardComponent,
    
    // Organismos
    HeaderComponent,
    SidebarComponent,
    PaginationComponent,
    FiltersComponent,
    DataTableComponent,
    UserFormComponent,
    StatsPanelComponent,
    
    // Templates
    MainLayoutComponent,
    AuthLayoutComponent,
    DashboardLayoutComponent,
    
    // Directivas
    ClickOutsideDirective,
    HasPermissionDirective,
    
    // Pipes
    FilterPipe,
    SortPipe
  ]
})
export class SharedModule { }