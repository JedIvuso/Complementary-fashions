import { Component, inject, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header [class.scrolled]="scrolled()" class="navbar">
      <div class="navbar-container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">🧶</span>
          <div class="logo-text">
            <span class="logo-main">Complementary</span>
            <span class="logo-sub">Fashions</span>
          </div>
        </a>

        <!-- Desktop Nav -->
        <nav class="nav-links desktop-only">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/products" routerLinkActive="active">Shop</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
        </nav>

        <!-- Actions -->
        <div class="nav-actions">
          <!-- Search (coming soon trigger) -->
          <button class="icon-btn" title="Search" routerLink="/products">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          <!-- Theme Toggle -->
          <button class="icon-btn theme-toggle" (click)="toggleTheme()" [title]="themeService.isDark() ? 'Light mode' : 'Dark mode'">
            <svg *ngIf="!themeService.isDark()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg *ngIf="themeService.isDark()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>

          <!-- Favorites -->
          <a routerLink="/favorites" class="icon-btn" title="Favorites">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </a>

          <!-- Cart -->
          <a routerLink="/cart" class="icon-btn cart-btn" title="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="cart-badge" *ngIf="cartService.itemCount() > 0">{{ cartService.itemCount() }}</span>
          </a>

          <!-- Auth -->
          <ng-container *ngIf="authService.isAuthenticated(); else loginBtn">
            <div class="user-menu-wrapper">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="user-avatar">{{ getUserInitials() }}</span>
              </button>
              <div class="user-dropdown" *ngIf="showUserMenu()">
                <div class="dropdown-header">
                  <span>{{ authService.currentUser()?.firstName }}</span>
                  <small>{{ authService.currentUser()?.email }}</small>
                </div>
                <a routerLink="/orders" (click)="showUserMenu.set(false)">My Orders</a>
                <a routerLink="/favorites" (click)="showUserMenu.set(false)">Favorites</a>
                <button (click)="logout()" class="logout-btn">Logout</button>
              </div>
            </div>
          </ng-container>
          <ng-template #loginBtn>
            <a routerLink="/auth/login" class="btn-login">Login</a>
          </ng-template>

          <!-- Mobile menu -->
          <button class="icon-btn mobile-menu-btn mobile-only" (click)="toggleMobileMenu()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div class="mobile-nav" [class.open]="mobileMenuOpen()">
        <a routerLink="/" (click)="mobileMenuOpen.set(false)">Home</a>
        <a routerLink="/products" (click)="mobileMenuOpen.set(false)">Shop</a>
        <a routerLink="/about" (click)="mobileMenuOpen.set(false)">About</a>
        <a routerLink="/favorites" (click)="mobileMenuOpen.set(false)">Favorites</a>
        <a routerLink="/orders" (click)="mobileMenuOpen.set(false)">My Orders</a>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--bg-nav);
      border-bottom: 1px solid var(--border-color);
      transition: all 0.3s ease;
      backdrop-filter: blur(12px);
    }
    .navbar.scrolled {
      box-shadow: 0 2px 20px var(--shadow);
    }
    .navbar-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-icon { font-size: 28px; }
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .logo-main {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--accent);
    }
    .logo-sub {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    .nav-links {
      display: flex;
      gap: 32px;
    }
    .nav-links a {
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 14px;
      letter-spacing: 0.5px;
      position: relative;
      padding-bottom: 2px;
      transition: color 0.2s;
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1.5px;
      background: var(--accent);
      transition: width 0.3s ease;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--accent);
    }
    .nav-links a:hover::after, .nav-links a.active::after { width: 100%; }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .icon-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      transition: background 0.2s;
      text-decoration: none;
    }
    .icon-btn:hover { background: var(--hover-bg); }
    .cart-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--accent);
      color: white;
      font-size: 10px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    .btn-login {
      padding: 8px 20px;
      background: var(--accent);
      color: white;
      border-radius: 50px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: opacity 0.2s;
    }
    .btn-login:hover { opacity: 0.9; }
    .user-menu-wrapper { position: relative; }
    .user-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-avatar {
      color: white;
      font-size: 14px;
      font-weight: 700;
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      min-width: 200px;
      box-shadow: 0 8px 32px var(--shadow);
      overflow: hidden;
      animation: dropIn 0.2s ease;
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dropdown-header span { font-weight: 600; color: var(--text-primary); }
    .dropdown-header small { color: var(--text-secondary); font-size: 12px; }
    .user-dropdown a, .logout-btn {
      display: block;
      padding: 12px 16px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 14px;
      transition: background 0.15s;
      width: 100%;
      text-align: left;
      border: none;
      background: none;
      cursor: pointer;
    }
    .user-dropdown a:hover, .logout-btn:hover { background: var(--hover-bg); }
    .logout-btn { color: #ef4444; }
    .mobile-nav {
      display: none;
      flex-direction: column;
      border-top: 1px solid var(--border-color);
      background: var(--bg-nav);
    }
    .mobile-nav.open { display: flex; }
    .mobile-nav a {
      padding: 14px 24px;
      text-decoration: none;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
    }
    .desktop-only { display: flex; }
    .mobile-only { display: none; }
    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only { display: flex; }
    }
  `],
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  themeService = inject(ThemeService);
  scrolled = signal(false);
  mobileMenuOpen = signal(false);
  showUserMenu = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleTheme() { this.themeService.toggle(); }
  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  toggleUserMenu() { this.showUserMenu.update(v => !v); }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  logout() {
    this.showUserMenu.set(false);
    this.authService.logout();
  }
}
