import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<'light' | 'dark'>('light');
  theme = this._theme.asReadonly();
  isDark = () => this._theme() === 'dark';

  constructor() {
    const saved = localStorage.getItem('cf_theme') as 'light' | 'dark';
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.applyTheme(saved || preferred);
  }

  toggle() {
    this.applyTheme(this._theme() === 'light' ? 'dark' : 'light');
  }

  applyTheme(theme: 'light' | 'dark') {
    this._theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cf_theme', theme);
  }
}
