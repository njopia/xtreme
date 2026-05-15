import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServerService } from '../../../core/services/server.service';
import { ServerStatus } from '../../../core/models/server.model';

@Component({
  selector: 'app-server-stats',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './server-stats.component.html',
  styleUrl: './server-stats.component.scss',
})
export class ServerStatsComponent {
  protected serverService = inject(ServerService);

  occupancy(s: ServerStatus): number {
    return s.maxPlayers > 0 ? Math.round((s.players / s.maxPlayers) * 100) : 0;
  }
}
