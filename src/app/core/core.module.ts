import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Servicios
import { AuthService } from './auth/services/auth.service';
import { HttpService } from './http/http.service';
import { LoaderService } from './services/loader.service';
import { ToastService } from './services/toast.service';

// Guards
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';

// Interceptors
import { TokenInterceptor } from './auth/interceptors/token.interceptor';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    // Servicios
    AuthService,
    HttpService,
    LoaderService,
    ToastService,
    
    // Guards
    AuthGuard,
    RoleGuard,
    
    // Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ya está cargado. Importe solo en AppModule');
    }
  }
}