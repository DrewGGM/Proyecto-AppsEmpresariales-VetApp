import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { RoleGuard } from './core/auth/guards/role.guard';
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
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
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
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['ADMIN'],
      permissions: ['MANAGE_USERS']
    }
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
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      featureName: 'Gestión de Mascotas',
      roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'],
      permissions: ['MANAGE_PETS']
    }
  },
  {
    path: 'citas',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      featureName: 'Sistema de Citas',
      roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'],
      permissions: ['MANAGE_APPOINTMENTS']
    }
  },
  {
    path: 'consultas',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      featureName: 'Gestión de Consultas',
      roles: ['ADMIN', 'VETERINARIAN'],
      permissions: ['MANAGE_CONSULTATIONS']
    }
  },
  {
    path: 'inventario',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      featureName: 'Control de Inventario',
      roles: ['ADMIN'],
      permissions: ['MANAGE_INVENTORY']
    }
  },
  {
    path: 'clientes',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      featureName: 'Gestión de Clientes',
      roles: ['ADMIN', 'VETERINARIAN', 'RECEPTIONIST'],
      permissions: ['MANAGE_CUSTOMERS']
    }
  },
  {
    path: 'configuracion',
    component: UnderDevelopmentComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      featureName: 'Configuración del Sistema',
      roles: ['ADMIN'],
      permissions: ['MANAGE_SETTINGS']
    }
  },
  
  // Ruta por defecto - redirige al dashboard si está autenticado, sino al login
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Ruta wildcard - redirige al dashboard si está autenticado, sino al login
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Deshabilitado después del debugging exitoso
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }