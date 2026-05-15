import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface ServerStat {
  name: string;
  ip: string;
  map: string;
  players: number;
  maxPlayers: number;
  online: boolean;
  uptime: string;
  tickrate: number;
}

@Component({
  selector: 'app-server-stats',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './server-stats.component.html',
  styleUrl: './server-stats.component.scss',
})
export class ServerStatsComponent {
  servers: ServerStat[] = [
    {
      name: 'Servidor 1',
      ip: '192.168.1.100:27015',
      map: 'Dead Center',
      players: 7,
      maxPlayers: 8,
      online: true,
      uptime: '14d 6h 22m',
      tickrate: 100,
    },
    {
      name: 'Servidor 2',
      ip: '192.168.1.100:27016',
      map: 'Blood Harvest',
      players: 3,
      maxPlayers: 8,
      online: true,
      uptime: '7d 2h 45m',
      tickrate: 100,
    },
  ];

  occupancy(s: ServerStat): number {
    return Math.round((s.players / s.maxPlayers) * 100);
  }
}
