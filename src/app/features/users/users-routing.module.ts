import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserCreateEditComponent } from './pages/user-create-edit/user-create-edit.component';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent
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