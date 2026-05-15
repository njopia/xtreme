import { UserRole } from './user.model';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  postCount: number;
  lastPost?: ForumLastPost;
  order: number;
}

export interface ForumLastPost {
  threadTitle: string;
  threadId: string;
  authorUsername: string;
  createdAt: Date;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  title: string;
  authorId: string;
  authorUsername: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  authorUsername: string;
  authorRole: UserRole;
  authorPostCount: number;
  authorJoinedAt: Date;
  content: string;
  createdAt: Date;
  isEdited: boolean;
}
