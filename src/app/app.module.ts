import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonComponent } from './shared/atoms/button/button.component';
import { InputComponent } from './shared/atoms/input/input.component';
import { BadgeComponent } from './shared/atoms/badge/badge.component';
import { IconComponent } from './shared/atoms/icon/icon.component';
import { AvatarComponent } from './shared/atoms/avatar/avatar.component';
import { SpinnerComponent } from './shared/atoms/spinner/spinner.component';
import { FormFieldComponent } from './shared/molecules/form-field/form-field.component';
import { SearchBarComponent } from './shared/molecules/search-bar/search-bar.component';
import { StatusIndicatorComponent } from './shared/molecules/status-indicator/status-indicator.component';
import { CardComponent } from './shared/molecules/card/card.component';
import { AlertComponent } from './shared/molecules/alert/alert.component';
import { UserCardComponent } from './shared/molecules/user-card/user-card.component';
import { HeaderComponent } from './shared/organisms/header/header.component';
import { SidebarComponent } from './shared/organisms/sidebar/sidebar.component';
import { PaginationComponent } from './shared/organisms/pagination/pagination.component';
import { FiltersComponent } from './shared/organisms/filters/filters.component';
import { DataTableComponent } from './shared/organisms/data-table/data-table.component';
import { UserFormComponent } from './shared/organisms/user-form/user-form.component';
import { StatsPanelComponent } from './shared/organisms/stats-panel/stats-panel.component';
import { MainLayoutComponent } from './shared/templates/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/templates/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './shared/templates/dashboard-layout/dashboard-layout.component';
import { ClickOutsideDirective } from './shared/directives/click-outside.directive';
import { HasPermissionDirective } from './shared/directives/has-permission.directive';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { SortPipe } from './shared/pipes/sort.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    IconComponent,
    AvatarComponent,
    SpinnerComponent,
    FormFieldComponent,
    SearchBarComponent,
    StatusIndicatorComponent,
    CardComponent,
    AlertComponent,
    UserCardComponent,
    HeaderComponent,
    SidebarComponent,
    PaginationComponent,
    FiltersComponent,
    DataTableComponent,
    UserFormComponent,
    StatsPanelComponent,
    MainLayoutComponent,
    AuthLayoutComponent,
    DashboardLayoutComponent,
    ClickOutsideDirective,
    HasPermissionDirective,
    FilterPipe,
    SortPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    IconComponent,
    AvatarComponent,
    SpinnerComponent,
    FormFieldComponent,
    SearchBarComponent,
    StatusIndicatorComponent,
    CardComponent,
    AlertComponent,
    UserCardComponent,
    HeaderComponent,
    SidebarComponent,
    PaginationComponent,
    FiltersComponent,
    DataTableComponent,
    UserFormComponent,
    StatsPanelComponent,
    MainLayoutComponent,
    AuthLayoutComponent,
    DashboardLayoutComponent,
    ClickOutsideDirective,
    HasPermissionDirective,
    FilterPipe,
    SortPipe
  ]
})
export class AppModule { }
