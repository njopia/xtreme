import { Component, input } from '@angular/core';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  template: `
    <span class="role-badge role-badge--{{ role() }}">
      <span class="material-symbols-outlined role-badge__icon">{{ icon() }}</span>
      {{ label() }}
    </span>
  `,
  styleUrl: './role-badge.component.scss',
})
export class RoleBadgeComponent {
  role = input.required<UserRole>();

  label() {
    const labels: Record<UserRole, string> = {
      guest: 'Invitado',
      player: 'Jugador',
      vip: 'VIP',
      moderator: 'Moderador',
      admin: 'Admin',
    };
    return labels[this.role()];
  }

  icon() {
    const icons: Record<UserRole, string> = {
      guest: 'person_outline',
      player: 'sports_esports',
      vip: 'workspace_premium',
      moderator: 'shield',
      admin: 'security',
    };
    return icons[this.role()];
  }
}
