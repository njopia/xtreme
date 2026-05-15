import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ForumService } from '../../../core/services/forum.service';
import { ForumCategory } from '../../../core/models/forum.model';

interface ServerStatus {
  name: string;
  map: string;
  players: number;
  maxPlayers: number;
  online: boolean;
}

const MOCK_SERVERS: ServerStatus[] = [
  { name: 'Servidor 1', map: 'Dead Center', players: 7, maxPlayers: 8, online: true },
  { name: 'Servidor 2', map: 'Blood Harvest', players: 3, maxPlayers: 8, online: true },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  isOpen = input(true);
  isCollapsed = input(false);
  collapseToggle = output<void>();

  protected servers = MOCK_SERVERS;
  protected categories = signal<ForumCategory[]>([]);

  private forumService = inject(ForumService);

  ngOnInit() {
    this.forumService.getCategories().subscribe((cats) => this.categories.set(cats));
  }
}
