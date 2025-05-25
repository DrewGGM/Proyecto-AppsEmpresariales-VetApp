import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-under-development',
  standalone: false,
  templateUrl: './under-development.component.html',
  styleUrls: ['./under-development.component.scss']
})
export class UnderDevelopmentComponent implements OnInit {

  featureName: string = 'Esta funcionalidad';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Obtener el nombre de la funcionalidad desde los datos de la ruta
    this.featureName = this.route.snapshot.data['featureName'] || 'Esta funcionalidad';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }
} 