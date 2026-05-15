import { Component, computed, effect, inject, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatChannel, ChatMessage } from '../../core/models/chat-message.model';
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RoleBadgeComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageList') messageListRef!: ElementRef<HTMLDivElement>;

  protected auth = inject(AuthService);
  private chatService = inject(ChatService);

  channels = signal<ChatChannel[]>([]);
  activeChannelId = signal('general');
  messageInput = new FormControl('', [Validators.required, Validators.maxLength(500)]);
  private shouldScroll = false;

  allMessages = this.chatService.messages;

  activeMessages = computed(() =>
    this.allMessages().filter((m) => m.channelId === this.activeChannelId())
  );

  ngOnInit() {
    this.chatService.getChannels().subscribe((ch) => this.channels.set(ch));
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  selectChannel(id: string) {
    this.activeChannelId.set(id);
    this.shouldScroll = true;
  }

  send() {
    const content = this.messageInput.value?.trim();
    if (!content || !this.auth.currentUser()) return;

    const user = this.auth.currentUser()!;
    this.chatService.sendMessage(this.activeChannelId(), user.id, user.username, user.role, content);
    this.messageInput.reset();
    this.shouldScroll = true;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(date);
  }

  private scrollToBottom() {
    try {
      const el = this.messageListRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
