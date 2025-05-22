import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-indicator',
  standalone: false,
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.scss']
})
export class StatusIndicatorComponent {
  @Input() active: boolean = true;
  @Input() showLabel: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}