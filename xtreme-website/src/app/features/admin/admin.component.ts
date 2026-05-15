import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { UserManagementComponent } from './user-management/user-management.component';
import { ServerStatsComponent } from './server-stats/server-stats.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, UserManagementComponent, ServerStatsComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {}
