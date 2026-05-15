import { Component, inject, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForumService } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth.service';
import { ForumPost, ForumThread } from '../../../core/models/forum.model';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-forum-thread',
  standalone: true,
  imports: [
    TitleCasePipe,
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RoleBadgeComponent,
  ],
  templateUrl: './forum-thread.component.html',
  styleUrl: './forum-thread.component.scss',
})
export class ForumThreadComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);
  private forumService = inject(ForumService);

  thread = signal<ForumThread | null>(null);
  posts = signal<ForumPost[]>([]);
  loading = signal(true);

  replyControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  submitting = signal(false);

  ngOnInit() {
    const threadId = this.route.snapshot.paramMap.get('threadId')!;
    const categoryId = this.route.snapshot.paramMap.get('categoryId')!;

    this.forumService.getThread(threadId).subscribe((t) => {
      this.thread.set(t ?? null);
    });

    this.forumService.getPostsByThread(threadId).subscribe((posts) => {
      this.posts.set(posts);
      this.loading.set(false);
    });
  }

  submitReply() {
    if (this.replyControl.invalid || this.submitting() || !this.auth.currentUser()) return;
    this.submitting.set(true);

    const user = this.auth.currentUser()!;
    const newPost: ForumPost = {
      id: 'p' + Date.now(),
      threadId: this.thread()!.id,
      authorId: user.id,
      authorUsername: user.username,
      authorRole: user.role,
      authorPostCount: user.postCount,
      authorJoinedAt: user.joinedAt,
      content: this.replyControl.value!,
      createdAt: new Date(),
      isEdited: false,
    };

    setTimeout(() => {
      this.posts.update((p) => [...p, newPost]);
      this.replyControl.reset();
      this.submitting.set(false);
    }, 500);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
}
