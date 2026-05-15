import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RoleBadgeComponent,
    UserAvatarComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  private auth = inject(AuthService);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal(true);

  searchControl = new FormControl('');
  roleFilter = new FormControl<UserRole | ''>('');

  displayedColumns = ['user', 'role', 'posts', 'joined', 'status', 'actions'];

  roles: { value: UserRole | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'guest', label: 'Invitado' },
    { value: 'player', label: 'Jugador' },
    { value: 'vip', label: 'VIP' },
    { value: 'moderator', label: 'Moderador' },
    { value: 'admin', label: 'Admin' },
  ];

  roleOptions: { value: UserRole; label: string }[] = [
    { value: 'guest', label: 'Invitado' },
    { value: 'player', label: 'Jugador' },
    { value: 'vip', label: 'VIP' },
    { value: 'moderator', label: 'Moderador' },
    { value: 'admin', label: 'Admin' },
  ];

  ngOnInit() {
    this.auth.getUsers().subscribe((users) => {
      this.users.set(users);
      this.filteredUsers.set(users);
      this.loading.set(false);
    });

    this.searchControl.valueChanges.subscribe(() => this.applyFilter());
    this.roleFilter.valueChanges.subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const search = (this.searchControl.value ?? '').toLowerCase();
    const role = this.roleFilter.value;

    this.filteredUsers.set(
      this.users().filter((u) => {
        const matchesSearch = u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
        const matchesRole = !role || u.role === role;
        return matchesSearch && matchesRole;
      })
    );
  }

  setRole(user: User, role: UserRole) {
    this.auth.updateUserRole(user.id, role).subscribe((updated) => {
      this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      this.applyFilter();
    });
  }

  toggleBan(user: User) {
    this.auth.banUser(user.id, !user.isBanned).subscribe((updated) => {
      this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      this.applyFilter();
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(date);
  }
}
