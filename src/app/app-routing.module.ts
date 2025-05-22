import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/usuarios/1', // Redirigir directamente al usuario 1 para pruebas
    pathMatch: 'full'
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
  },
  {
    path: '**',
    redirectTo: '/usuarios/1'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }