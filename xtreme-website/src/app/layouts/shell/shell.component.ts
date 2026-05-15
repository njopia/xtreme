import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  sidebarOpen = signal(window.innerWidth > 767);
  sidebarCollapsed = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  toggleCollapse() {
    this.sidebarCollapsed.update((v) => !v);
  }
}
