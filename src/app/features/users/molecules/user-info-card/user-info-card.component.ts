import { Component, Input } from '@angular/core';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-user-info-card',
  standalone: false,
  templateUrl: './user-info-card.component.html',
  styleUrls: ['./user-info-card.component.scss']
})
export class UserInfoCardComponent {
  @Input() user: User | null = null;
}