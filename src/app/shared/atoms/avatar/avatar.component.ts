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
  @Input() photoUrl: string = '';
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
    return ['avatar', `avatar-${this.size}`];
  }

  onImageError(): void {
    this.photoUrl = '';
  }
}
