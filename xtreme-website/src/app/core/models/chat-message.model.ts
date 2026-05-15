import { UserRole } from './user.model';

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorUsername: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
  isSystem: boolean;
}
