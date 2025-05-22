import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private router: Router) {
    // Redirigir directamente a la vista de detalle del usuario 1
    this.router.navigate(['/users/', 1]);
  }
}
