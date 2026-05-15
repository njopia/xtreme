export type UserRole = 'guest' | 'player' | 'vip' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  steamId?: string;
  joinedAt: Date;
  isOnline: boolean;
  postCount: number;
  isBanned: boolean;
}
