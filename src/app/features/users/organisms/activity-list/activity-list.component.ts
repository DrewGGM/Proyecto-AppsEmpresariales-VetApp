import { Component, Input } from '@angular/core';
import { UserActivity } from '../../models/user-activity.interface';

@Component({
  selector: 'app-activity-list',
  standalone: false,
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent {
  @Input() activities: UserActivity[] = [];
  @Input() viewAllLink: string = '';
  @Input() limit: number = 5;
  
  /**
   * Determina el icono según el tipo de actividad
   */
  getActivityIcon(activity: UserActivity): string {
    switch(activity.type) {
      case 'consultation':
        return 'medical_services';
      case 'vaccination':
        return 'healing';
      case 'login':
        return 'login';
      default:
        return 'history';
    }
  }
  
  /**
   * Obtiene la clase CSS según el tipo de actividad
   */
  getActivityClass(activity: UserActivity): string {
    return activity.type;
  }
  
  /**
   * Limita el número de actividades mostradas
   */
  get limitedActivities(): UserActivity[] {
    return this.activities.slice(0, this.limit);
  }
}