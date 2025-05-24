import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';

const routes: Routes = [
  // Rutas de autenticación (solo para usuarios no logueados)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    // canActivate: [NonAuthGuard] // Opcional: guard para evitar que usuarios logueados accedan al login
  },
  
  // Rutas protegidas (solo para usuarios logueados)
  {
    path: 'usuarios',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },
  
  // Ruta por defecto - redirige según estado de autenticación
  {
    path: '',
    redirectTo: '/usuarios',
    pathMatch: 'full'
  },
  
  // Ruta wildcard - redirige al login si no encuentra la ruta
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    preloadingStrategy: PreloadAllModules // Opcional: para precargar módulos
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }