import { Component, OnInit, signal, HostListener } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { CartService } from "../../../core/services/cart.service";
import { ApiService } from "../../../core/services/api.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav
      class="navbar"
      [class.scrolled]="scrolled()"
      [class.menu-open]="menuOpen()"
    >
      <div class="nav-container">
        <a routerLink="/" class="brand">
          @if (logoUrl()) {
            <img
              [src]="logoUrl()"
              alt="Logo"
              style="height:40px;width:auto;object-fit:contain;"
            />
          } @else {
            <span class="brand-icon">✦</span>
          }
          <div class="brand-text">
            <span class="brand-name">Complementary</span>
            <span class="brand-sub">Fashions</span>
          </div>
        </a>

        <ul class="nav-links">
          <li>
            <a
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              >Home</a
            >
          </li>
          <li><a routerLink="/products" routerLinkActive="active">Shop</a></li>
          <li><a routerLink="/about" routerLinkActive="active">About</a></li>
        </ul>

        <div class="nav-actions">
          <button
            class="btn-icon"
            (click)="themeService.toggle()"
            title="Toggle theme"
          >
            {{ themeService.isDark() ? "☀️" : "🌙" }}
          </button>

          @if (auth.isLoggedIn()) {
            <a routerLink="/favorites" class="btn-icon" title="Favorites">
              <span>♡</span>
            </a>
            <a routerLink="/cart" class="btn-icon cart-btn" title="Cart">
              <span>🛒</span>
              @if (cart.itemCount() > 0) {
                <span class="cart-badge">{{ cart.itemCount() }}</span>
              }
            </a>
            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="user-avatar">{{
                  auth.user()?.firstName?.[0]
                }}</span>
              </button>
              @if (userMenuOpen()) {
                <div class="user-dropdown">
                  <a routerLink="/account" (click)="closeUserMenu()"
                    >My Account</a
                  >
                  <a routerLink="/orders" (click)="closeUserMenu()"
                    >My Orders</a
                  >
                  <a routerLink="/favorites" (click)="closeUserMenu()"
                    >Favorites</a
                  >
                  <hr />
                  <button (click)="logout()">Sign Out</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn btn-sm btn-outline-accent"
              >Sign In</a
            >
          }

          <button
            class="hamburger"
            (click)="menuOpen.set(!menuOpen())"
            [class.active]="menuOpen()"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="menuOpen.set(false)">Home</a>
          <a routerLink="/products" (click)="menuOpen.set(false)">Shop</a>
          <a routerLink="/about" (click)="menuOpen.set(false)">About</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/account" (click)="menuOpen.set(false)"
              >My Account</a
            >
            <a routerLink="/orders" (click)="menuOpen.set(false)">Orders</a>
            <a routerLink="/favorites" (click)="menuOpen.set(false)"
              >Favorites</a
            >
            <a routerLink="/cart" (click)="menuOpen.set(false)"
              >Cart ({{ cart.itemCount() }})</a
            >
            <button (click)="logout()">Sign Out</button>
          } @else {
            <a routerLink="/auth/login" (click)="menuOpen.set(false)"
              >Sign In</a
            >
            <a routerLink="/auth/register" (click)="menuOpen.set(false)"
              >Register</a
            >
          }
        </div>
      }
    </nav>
  `,
  styles: [
    `
      .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 16px 0;
        transition: all 0.3s ease;
        background: rgba(250, 248, 245, 0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid transparent;
      }
      [data-theme="dark"] .navbar {
        background: rgba(26, 16, 8, 0.85);
      }
      .navbar.scrolled {
        padding: 10px 0;
        box-shadow: var(--shadow-md);
        border-bottom-color: var(--color-border);
      }
      .nav-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        flex-shrink: 0;
      }
      .brand-icon {
        font-size: 1.5rem;
        color: var(--color-accent);
      }
      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1;
      }
      .brand-name {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--color-text);
        letter-spacing: 0.01em;
      }
      .brand-sub {
        font-family: var(--font-accent);
        font-size: 0.875rem;
        color: var(--color-accent);
        letter-spacing: 0.05em;
      }
      .nav-links {
        display: flex;
        list-style: none;
        gap: 36px;
        align-items: center;
      }
      .nav-links a {
        font-size: 0.875rem;
        font-weight: 400;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-text-secondary);
        text-decoration: none;
        position: relative;
        transition: color 0.3s;
      }
      .nav-links a::after {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 1.5px;
        background: var(--color-accent);
        transition: width 0.3s;
      }
      .nav-links a:hover,
      .nav-links a.active {
        color: var(--color-text);
      }
      .nav-links a:hover::after,
      .nav-links a.active::after {
        width: 100%;
      }
      .nav-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--color-border);
        cursor: pointer;
        color: var(--color-text);
        transition: all 0.3s;
        text-decoration: none;
        font-size: 1rem;
        position: relative;
      }
      .btn-icon:hover {
        background: var(--color-surface-2);
        border-color: var(--color-accent);
      }
      .cart-btn {
        position: relative;
      }
      .cart-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--color-accent);
        color: white;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        font-size: 0.65rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .user-menu {
        position: relative;
      }
      .user-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-accent);
        color: white;
        border: none;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9375rem;
        font-family: var(--font-display);
      }
      .user-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 8px 0;
        min-width: 160px;
        box-shadow: var(--shadow-lg);
        z-index: 10;
      }
      .user-dropdown a,
      .user-dropdown button {
        display: block;
        width: 100%;
        padding: 10px 16px;
        font-size: 0.875rem;
        color: var(--color-text);
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s;
      }
      .user-dropdown a:hover,
      .user-dropdown button:hover {
        background: var(--color-surface-2);
      }
      .user-dropdown hr {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 4px 0;
      }
      .hamburger {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
      }
      .hamburger span {
        display: block;
        width: 24px;
        height: 2px;
        background: var(--color-text);
        transition: all 0.3s;
      }
      .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      .hamburger.active span:nth-child(2) {
        opacity: 0;
      }
      .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
      }
      .mobile-menu {
        display: flex;
        flex-direction: column;
        padding: 16px 24px 24px;
        border-top: 1px solid var(--color-border);
        background: var(--color-surface);
      }
      .mobile-menu a,
      .mobile-menu button {
        padding: 14px 0;
        font-size: 1.125rem;
        color: var(--color-text);
        text-decoration: none;
        border-bottom: 1px solid var(--color-border);
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
        cursor: pointer;
        text-align: left;
        font-family: var(--font-body);
      }
      .mobile-menu a:last-child,
      .mobile-menu button:last-child {
        border-bottom: none;
      }
      @media (max-width: 768px) {
        .nav-links {
          display: none;
        }
        .hamburger {
          display: flex;
        }
        .btn.btn-sm {
          display: none;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  scrolled = signal(false);
  menuOpen = signal(false);
  userMenuOpen = signal(false);
  logoUrl = signal<string>("");

  constructor(
    public auth: AuthService,
    public themeService: ThemeService,
    public cart: CartService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.api.get<any>("/about").subscribe({
      next: (data) => {
        const base = environment.apiUrl.replace("/api", "");
        if (data.logoUrl) {
          this.logoUrl.set(
            data.logoUrl.startsWith("https")
              ? data.logoUrl
              : `${base}${data.logoUrl}`,
          );
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty(
            "--color-accent",
            data.accentColor,
          );
          document.documentElement.style.setProperty(
            "--accent",
            data.accentColor,
          );
        }
        if (data.faviconUrl) {
          const faviconUrl = data.faviconUrl.startsWith("http")
            ? data.faviconUrl
            : `${base}${data.faviconUrl}`;
          let link = document.querySelector(
            "link[rel~='icon']",
          ) as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }
      },
    });
  }

  @HostListener("window:scroll")
  onScroll() {
    this.scrolled.set(window.scrollY > 50);
  }

  toggleUserMenu() {
    this.userMenuOpen.update((v) => !v);
  }
  closeUserMenu() {
    this.userMenuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeUserMenu();
  }
}
