import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardMainComponent } from './pages/dashboard-main/dashboard-main.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardMainComponent
  },
  // Rutas para futuras secciones del dashboard
  {
    path: 'usuarios',
    loadChildren: () => import('../users/users.module').then(m => m.UsersModule)
  }
  // TODO: Agregar más rutas cuando se implementen las otras secciones
  // { path: 'mascotas', loadChildren: ... },
  // { path: 'citas', loadChildren: ... },
  // { path: 'inventario', loadChildren: ... },
  // { path: 'actividad', loadChildren: ... },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { } 