import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { ResetPasswordFormComponent } from './components/reset-password-form/reset-password-form.component';


@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    LoginFormComponent,
    ResetPasswordFormComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
