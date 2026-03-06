import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { AdminAuthService } from "../core/services/admin-auth.service";
import { ThemeService } from "../core/services/theme.service";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-brand">
          <div class="sidebar-logo">Complementary Fashions</div>
          <div class="sidebar-role">Admin Panel</div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-label">Overview</div>
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">📊</span> Dashboard
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-label">Catalogue</div>
            <a
              routerLink="/products"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">👗</span> Products
            </a>
            <a
              routerLink="/categories"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">🏷️</span> Categories
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-label">Sales</div>
            <a
              routerLink="/orders"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">📦</span> Orders
            </a>
            <a
              routerLink="/users"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">👥</span> Customers
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-label">Content</div>
            <a
              routerLink="/banners"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">🖼️</span> Banners
            </a>
            <a
              routerLink="/about"
              routerLinkActive="active"
              class="nav-item"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon">✍️</span> About & Branding
            </a>
          </div>
        </nav>

        <!-- Sidebar footer -->
        <div class="sidebar-footer">
          <a [href]="publicUrl" target="_blank" class="nav-item view-store-btn">
            <span class="nav-icon">🌐</span> View Public Site
          </a>
          <a
            routerLink="/settings"
            routerLinkActive="active"
            class="nav-item"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span class="nav-icon">⚙️</span> Settings
          </a>
          <button class="nav-item" (click)="auth.logout()">
            <span class="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="admin-main">
        <!-- Top header -->
        <header class="admin-header">
          <button class="menu-toggle btn-icon" (click)="toggleSidebar()">
            ☰
          </button>

          <div class="header-breadcrumb">
            <span class="header-brand">CF Admin</span>
          </div>

          <div class="header-actions">
            <!-- Theme toggle -->
            <button
              class="btn-icon"
              (click)="themeService.toggle()"
              title="Toggle theme"
            >
              {{ themeService.theme() === "light" ? "🌙" : "☀️" }}
            </button>

            <!-- Admin info -->
            <div class="admin-profile">
              <div class="admin-avatar">
                {{ getInitials() }}
              </div>
              <div class="admin-info">
                <span class="admin-name">{{ auth.admin()?.firstName }}</span>
                <span class="admin-role-badge">{{
                  auth.admin()?.role | titlecase
                }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 49;
      }
      @media (max-width: 1024px) {
        .sidebar-overlay {
          display: block;
        }
      }

      .sidebar-footer {
        padding: 12px 0;
        border-top: 1px solid var(--color-border);
      }
      .view-store-btn {
        color: var(--color-accent);
      }
      .view-store-btn:hover {
        background: var(--color-accent-light);
        color: var(--color-accent);
      }

      .menu-toggle {
        display: none;
        font-size: 1.2rem;
      }
      @media (max-width: 1024px) {
        .menu-toggle {
          display: flex;
        }
      }

      .header-breadcrumb {
        flex: 1;
        padding-left: 8px;
      }
      .header-brand {
        font-family: var(--font-display);
        font-style: italic;
        font-size: 1.1rem;
        color: var(--color-text-muted);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
      }

      .admin-profile {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .admin-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--color-accent);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8125rem;
        font-weight: 600;
      }
      .admin-info {
        display: flex;
        flex-direction: column;
      }
      .admin-name {
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.2;
      }
      .admin-role-badge {
        font-size: 0.6875rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      @media (max-width: 640px) {
        .admin-info {
          display: none;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
  publicUrl = environment.publicUrl || "http://localhost:4200";

  constructor(
    public auth: AdminAuthService,
    public themeService: ThemeService,
  ) {}

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  getInitials() {
    const admin = this.auth.admin();
    if (!admin) return "A";
    return `${admin.firstName?.[0] || ""}${admin.lastName?.[0] || ""}`.toUpperCase();
  }
}
