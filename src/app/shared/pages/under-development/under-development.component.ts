import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-under-development',
  standalone: false,
  templateUrl: './under-development.component.html',
  styleUrls: ['./under-development.component.scss']
})
export class UnderDevelopmentComponent implements OnInit {

  featureName: string = 'Esta funcionalidad';
  
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Obtener el nombre de la funcionalidad desde los datos de la ruta
    this.featureName = this.route.snapshot.data['featureName'] || 'Esta funcionalidad';
  }
} 