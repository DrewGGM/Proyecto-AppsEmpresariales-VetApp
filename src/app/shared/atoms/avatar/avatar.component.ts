import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: false,
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() lastName: string = '';
  @Input() photoUrl: string | null | undefined = null;
  @Input() active: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get initials(): string {
    const firstInitial = this.name ? this.name.charAt(0).toUpperCase() : '';
    const lastInitial = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  get altText(): string {
    return `Avatar de ${this.name} ${this.lastName}`.trim();
  }

  get avatarClasses(): string[] {
    const classes = ['avatar', `avatar-${this.size}`];
    if (!this.active) {
      classes.push('avatar-inactive');
    }
    return classes;
  }

  onImageError(): void {
    this.photoUrl = null;
  }
}
