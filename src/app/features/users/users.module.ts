import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UsersRoutingModule } from './users-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Páginas
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserCreateEditComponent } from './pages/user-create-edit/user-create-edit.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';

// Átomos
import { UserAvatarComponent } from './atoms/user-avatar/user-avatar.component';
import { RoleBadgeComponent } from './atoms/role-badge/role-badge.component';

// Moléculas
import { UserInfoCardComponent } from './molecules/user-info-card/user-info-card.component';
import { RoleSelectorComponent } from './molecules/role-selector/role-selector.component';
import { UserSearchInputComponent } from './molecules/user-search-input/user-search-input.component';

// Organismos
import { UserProfileCardComponent } from './organisms/user-profile-card/user-profile-card.component';
import { PermissionsPanelComponent } from './organisms/permissions-panel/permissions-panel.component';
import { ActivityListComponent } from './organisms/activity-list/activity-list.component';
import { StatsPanelComponent } from './organisms/stats-panel/stats-panel.component';
import { UserTableComponent } from './organisms/user-table/user-table.component';
import { UserFormComponent } from './organisms/user-form/user-form.component';

@NgModule({
  declarations: [
    // Páginas
    UserDetailComponent,
    UserListComponent,
    UserCreateEditComponent,
    MyProfileComponent,
    
    // Átomos
    UserAvatarComponent,
    RoleBadgeComponent,
    
    // Moléculas
    UserInfoCardComponent,
    RoleSelectorComponent,
    UserSearchInputComponent,
    
    // Organismos
    UserProfileCardComponent,
    PermissionsPanelComponent,
    ActivityListComponent,
    StatsPanelComponent,
    UserTableComponent,
    UserFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    SharedModule
  ],
  providers: [
    DatePipe
  ]
})
export class UsersModule { }