import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { UnderDevelopmentComponent } from './shared/pages/under-development/under-development.component';

const routes: Routes = [
  // Página principal pública (Home/Landing Page)
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  
  // Rutas de autenticación (solo para usuarios no logueados)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    // canActivate: [NonAuthGuard] // Opcional: guard para evitar que usuarios logueados accedan al login
  },
  
  // Dashboard principal (área protegida por defecto después del login)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  
  // Rutas protegidas específicas (acceso directo desde URLs)
  {
    path: 'usuarios',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard]
  },

  // Rutas para funcionalidades en desarrollo
  {
    path: 'under-development',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Esta funcionalidad' }
  },
  {
    path: 'mascotas',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Gestión de Mascotas' }
  },
  {
    path: 'citas',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Sistema de Citas' }
  },
  {
    path: 'consultas',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Gestión de Consultas' }
  },
  {
    path: 'inventario',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Control de Inventario' }
  },
  {
    path: 'clientes',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Gestión de Clientes' }
  },
  {
    path: 'configuracion',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard],
    data: { featureName: 'Configuración del Sistema' }
  },
  
  // Ruta por defecto - redirige a home para usuarios no autenticados
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  
  // Ruta wildcard - redirige al home si no encuentra la ruta
  {
    path: '**',
    redirectTo: '/home'
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