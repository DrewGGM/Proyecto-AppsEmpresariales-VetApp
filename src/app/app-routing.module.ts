import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';

const routes: Routes = [
  // Rutas de autenticación (solo para usuarios no logueados)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  
  // Rutas protegidas (solo para usuarios logueados)
  {
    path: 'usuarios',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
  },
  
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/usuarios',
    pathMatch: 'full'
  },
  
  // Ruta wildcard
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }