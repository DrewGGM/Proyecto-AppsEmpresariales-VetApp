import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UserAvatarComponent } from './atoms/user-avatar/user-avatar.component';
import { RoleBadgeComponent } from './atoms/role-badge/role-badge.component';
import { StatusIndicatorComponent } from './atoms/status-indicator/status-indicator.component';
import { UserInfoCardComponent } from './molecules/user-info-card/user-info-card.component';
import { RoleSelectorComponent } from './molecules/role-selector/role-selector.component';
import { UserSearchInputComponent } from './molecules/user-search-input/user-search-input.component';
import { UserTableComponent } from './organisms/user-table/user-table.component';
import { UserFormComponent } from './organisms/user-form/user-form.component';
import { PermissionsPanelComponent } from './organisms/permissions-panel/permissions-panel.component';
import { ActivityListComponent } from './organisms/activity-list/activity-list.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserCreateEditComponent } from './pages/user-create-edit/user-create-edit.component';


@NgModule({
  declarations: [
    UserAvatarComponent,
    RoleBadgeComponent,
    StatusIndicatorComponent,
    UserInfoCardComponent,
    RoleSelectorComponent,
    UserSearchInputComponent,
    UserTableComponent,
    UserFormComponent,
    PermissionsPanelComponent,
    ActivityListComponent,
    UserListComponent,
    UserDetailComponent,
    UserCreateEditComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule
  ]
})
export class UsersModule { }
