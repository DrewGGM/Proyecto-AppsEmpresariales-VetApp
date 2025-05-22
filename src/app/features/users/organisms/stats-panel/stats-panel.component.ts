import { Component, Input } from '@angular/core';

interface Stat {
  label: string;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-stats-panel',
  standalone: false,
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.scss']
})
export class StatsPanelComponent {
  @Input() title: string = 'Estadísticas';
  @Input() icon: string = 'analytics';
  @Input() stats: Stat[] = [];
}