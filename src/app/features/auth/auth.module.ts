import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Páginas
import { LoginComponent } from './pages/login/login.component';

// Componentes
import { LoginFormComponent } from './components/login-form/login-form.component';

@NgModule({
  declarations: [
    // Páginas
    LoginComponent,
    
    // Componentes (Organismos específicos de auth)
    LoginFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule, // Aquí están todos los átomos y moléculas
    AuthRoutingModule
  ]
})
export class AuthModule { }