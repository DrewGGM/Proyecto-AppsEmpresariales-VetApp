import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserCreateEditComponent } from './pages/user-create-edit/user-create-edit.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent
  },
  {
    path: 'mi-perfil',
    component: MyProfileComponent
  },
  {
    path: 'nuevo',
    component: UserCreateEditComponent
  },
  {
    path: ':id/editar',
    component: UserCreateEditComponent
  },
  {
    path: ':id',
    component: UserDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }