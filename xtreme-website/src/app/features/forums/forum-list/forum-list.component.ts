import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ForumService } from '../../../core/services/forum.service';
import { ForumCategory } from '../../../core/models/forum.model';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './forum-list.component.html',
  styleUrl: './forum-list.component.scss',
})
export class ForumListComponent implements OnInit {
  private forumService = inject(ForumService);

  categories = signal<ForumCategory[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.forumService.getCategories().subscribe((cats) => {
      this.categories.set(cats);
      this.loading.set(false);
    });
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
