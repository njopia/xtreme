import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'xt-theme';

  theme = signal<Theme>(this.loadSaved());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.classList.toggle('theme-light', t === 'light');
      localStorage.setItem(this.STORAGE_KEY, t);
    });
  }

  toggle() {
    this.theme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  private loadSaved(): Theme {
    return localStorage.getItem(this.STORAGE_KEY) === 'light' ? 'light' : 'dark';
  }
}
