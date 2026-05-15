import { Component, input } from '@angular/core';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  template: `
    <div class="avatar avatar--{{ size() }}" [class.avatar--online]="user().isOnline">
      @if (user().avatarUrl) {
        <img [src]="user().avatarUrl" [alt]="user().username" />
      } @else {
        <span class="avatar__initials">{{ initials() }}</span>
      }
    </div>
  `,
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  user = input.required<User>();
  size = input<'sm' | 'md' | 'lg'>('md');

  initials() {
    return this.user().username.slice(0, 2).toUpperCase();
  }
}
