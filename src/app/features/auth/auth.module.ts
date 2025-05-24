import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Páginas
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

// Componentes
import { LoginFormComponent } from './components/login-form/login-form.component';
import { ResetPasswordFormComponent } from './components/reset-password-form/reset-password-form.component';

@NgModule({
  declarations: [
    // Páginas
    LoginComponent,
    ForgotPasswordComponent,
    
    // Componentes (Organismos específicos de auth)
    LoginFormComponent,
    ResetPasswordFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule, // Aquí están todos los átomos y moléculas
    AuthRoutingModule
  ]
})
export class AuthModule { }