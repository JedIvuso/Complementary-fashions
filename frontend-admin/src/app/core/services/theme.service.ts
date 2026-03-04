import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>('light');

  init() {
    const saved = localStorage.getItem('cf_admin_theme') as 'light' | 'dark' || 'light';
    this.setTheme(saved);
  }

  toggle() {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme.set(theme);
    localStorage.setItem('cf_admin_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
