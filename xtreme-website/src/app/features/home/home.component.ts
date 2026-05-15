import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ForumService } from '../../core/services/forum.service';
import { AuthService } from '../../core/services/auth.service';
import { ServerService } from '../../core/services/server.service';
import { ForumThread } from '../../core/models/forum.model';
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, RoleBadgeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected auth = inject(AuthService);
  protected serverService = inject(ServerService);
  private forumService = inject(ForumService);

  recentThreads = signal<ForumThread[]>([]);

  protected onlineServers = computed(() =>
    (this.serverService.servers() ?? []).filter(s => s.online).length
  );

  stats = computed(() => [
    { label: 'Miembros', value: '1,247', icon: 'group' },
    { label: 'Mensajes del foro', value: '8,941', icon: 'forum' },
    { label: 'Jugadores online', value: String(this.serverService.totalPlayers()), icon: 'sports_esports' },
    { label: 'Años activos', value: '4+', icon: 'military_tech' },
  ]);

  ngOnInit() {
    this.forumService.getRecentThreads(4).subscribe((threads) => this.recentThreads.set(threads));
  }

  timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    return `hace ${Math.floor(hrs / 24)} días`;
  }
}
