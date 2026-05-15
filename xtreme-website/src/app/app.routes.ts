import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'forums',
        loadComponent: () => import('./features/forums/forum-list/forum-list.component').then((m) => m.ForumListComponent),
      },
      {
        path: 'forums/:categoryId',
        loadComponent: () => import('./features/forums/forum-list/forum-list.component').then((m) => m.ForumListComponent),
      },
      {
        path: 'forums/:categoryId/:threadId',
        loadComponent: () => import('./features/forums/forum-thread/forum-thread.component').then((m) => m.ForumThreadComponent),
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard('admin')],
        loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
