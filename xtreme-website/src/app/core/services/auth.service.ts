import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';

const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'Admin_Xtreme',
    email: 'admin@xtreme.gg',
    role: 'admin',
    joinedAt: new Date('2022-01-15'),
    isOnline: true,
    postCount: 842,
    isBanned: false,
  },
  {
    id: '2',
    username: 'SurvivorPro',
    email: 'survivor@xtreme.gg',
    role: 'vip',
    joinedAt: new Date('2023-03-22'),
    isOnline: true,
    postCount: 234,
    isBanned: false,
  },
  {
    id: '3',
    username: 'ZombiSlayer99',
    email: 'zombie@xtreme.gg',
    role: 'player',
    joinedAt: new Date('2024-01-10'),
    isOnline: false,
    postCount: 47,
    isBanned: false,
  },
  {
    id: '4',
    username: 'ModWatcher',
    email: 'mod@xtreme.gg',
    role: 'moderator',
    joinedAt: new Date('2022-08-05'),
    isOnline: true,
    postCount: 512,
    isBanned: false,
  },
  {
    id: '5',
    username: 'NewSurvivor',
    email: 'new@xtreme.gg',
    role: 'player',
    joinedAt: new Date('2025-11-20'),
    isOnline: false,
    postCount: 3,
    isBanned: true,
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isModerator = computed(() =>
    ['admin', 'moderator'].includes(this._currentUser()?.role ?? '')
  );

  login(email: string, password: string): Observable<User> {
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user || password.length < 6) {
      return throwError(() => new Error('Credenciales inválidas'));
    }
    return of(user).pipe(
      delay(700),
      tap((u) => this._currentUser.set(u))
    );
  }

  register(username: string, email: string): Observable<User> {
    const newUser: User = {
      id: String(Date.now()),
      username,
      email,
      role: 'player',
      joinedAt: new Date(),
      isOnline: true,
      postCount: 0,
      isBanned: false,
    };
    return of(newUser).pipe(
      delay(900),
      tap((u) => this._currentUser.set(u))
    );
  }

  logout(): void {
    this._currentUser.set(null);
  }

  getUsers(): Observable<User[]> {
    return of([...MOCK_USERS]).pipe(delay(300));
  }

  updateUserRole(userId: string, role: UserRole): Observable<User> {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (!user) return throwError(() => new Error('Usuario no encontrado'));
    user.role = role;
    return of({ ...user }).pipe(delay(400));
  }

  banUser(userId: string, ban: boolean): Observable<User> {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (!user) return throwError(() => new Error('Usuario no encontrado'));
    user.isBanned = ban;
    return of({ ...user }).pipe(delay(400));
  }
}
