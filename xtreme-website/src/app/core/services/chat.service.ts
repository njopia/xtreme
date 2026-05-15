import { Injectable, signal } from '@angular/core';
import { Observable, of, interval } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ChatChannel, ChatMessage } from '../models/chat-message.model';

const MOCK_CHANNELS: ChatChannel[] = [
  { id: 'general', name: 'general', description: 'Chat principal de la comunidad', icon: 'tag', unreadCount: 0 },
  { id: 'server1', name: 'servidor-1', description: 'Chat del Servidor 1', icon: 'sports_esports', unreadCount: 3 },
  { id: 'server2', name: 'servidor-2', description: 'Chat del Servidor 2', icon: 'sports_esports', unreadCount: 0 },
  { id: 'offtopic', name: 'off-topic', description: 'Charla libre', icon: 'chat_bubble', unreadCount: 7 },
];

const BASE_MESSAGES: ChatMessage[] = [
  {
    id: 'm1', channelId: 'general', authorId: '1', authorUsername: 'Admin_Xtreme',
    authorRole: 'admin', content: 'Bienvenidos al chat de Xtreme L4D2 🔴',
    createdAt: new Date(Date.now() - 1000 * 60 * 60), isSystem: false,
  },
  {
    id: 'm2', channelId: 'general', authorId: '4', authorUsername: 'ModWatcher',
    authorRole: 'moderator', content: 'Recuerden seguir las reglas del chat.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45), isSystem: false,
  },
  {
    id: 'm3', channelId: 'general', authorId: '2', authorUsername: 'SurvivorPro',
    authorRole: 'vip', content: '¿Alguien para partida en servidor 1?',
    createdAt: new Date(Date.now() - 1000 * 60 * 20), isSystem: false,
  },
  {
    id: 'm4', channelId: 'general', authorId: '3', authorUsername: 'ZombiSlayer99',
    authorRole: 'player', content: 'Yo me uno! En 10 minutos estoy',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), isSystem: false,
  },
  {
    id: 'm5', channelId: 'general', authorId: '2', authorUsername: 'SurvivorPro',
    authorRole: 'vip', content: 'Perfecto, nos vemos ahí 💀',
    createdAt: new Date(Date.now() - 1000 * 60 * 14), isSystem: false,
  },
  {
    id: 'm6', channelId: 'server1', authorId: '3', authorUsername: 'ZombiSlayer99',
    authorRole: 'player', content: 'GG ese Tank casi nos mata a todos',
    createdAt: new Date(Date.now() - 1000 * 60 * 5), isSystem: false,
  },
  {
    id: 'm7', channelId: 'server1', authorId: '2', authorUsername: 'SurvivorPro',
    authorRole: 'vip', content: 'Jajaja me revivieron en el último segundo',
    createdAt: new Date(Date.now() - 1000 * 60 * 4), isSystem: false,
  },
];

@Injectable({ providedIn: 'root' })
export class ChatService {
  private _messages = signal<ChatMessage[]>([...BASE_MESSAGES]);

  readonly messages = this._messages.asReadonly();

  getChannels(): Observable<ChatChannel[]> {
    return of([...MOCK_CHANNELS]).pipe(delay(200));
  }

  getMessages(channelId: string): Observable<ChatMessage[]> {
    return of(this._messages().filter((m) => m.channelId === channelId)).pipe(delay(200));
  }

  sendMessage(channelId: string, authorId: string, authorUsername: string, authorRole: string, content: string): void {
    const msg: ChatMessage = {
      id: 'm' + Date.now(),
      channelId,
      authorId,
      authorUsername,
      authorRole: authorRole as ChatMessage['authorRole'],
      content,
      createdAt: new Date(),
      isSystem: false,
    };
    this._messages.update((msgs) => [...msgs, msg]);
  }

  getMessagesSignal(channelId: string) {
    return {
      filter: () => this._messages().filter((m) => m.channelId === channelId),
    };
  }
}
