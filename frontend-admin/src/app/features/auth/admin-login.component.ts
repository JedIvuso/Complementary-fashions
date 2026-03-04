import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AdminAuthService } from "../../core/services/admin-auth.service";
import { ThemeService } from "../../core/services/theme.service";

@Component({
  selector: "app-admin-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="login-pattern"></div>
      </div>

      <div class="login-card">
        <div class="login-brand">
          <div class="brand-ornament">✦</div>
          <h1>Complementary Fashions</h1>
          <p>Admin Panel</p>
        </div>

        <form class="login-form" (ngSubmit)="submit()">
          <h2>Welcome back</h2>
          <p class="login-subtitle">Sign in to manage your store</p>

          @if (error()) {
            <div class="alert-error">
              {{ error() }}
            </div>
          }

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              class="form-input"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-with-toggle">
              <input
                class="form-input"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-pw"
                (click)="togglePassword()"
              >
                {{ showPassword() ? "🙈" : "👁️" }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary login-btn"
            [disabled]="loading()"
          >
            @if (loading()) {
              Signing in...
            } @else {
              Sign In →
            }
          </button>
        </form>

        <div class="login-footer">
          <button class="theme-toggle" (click)="themeService.toggle()">
            {{
              themeService.theme() === "light"
                ? "🌙 Dark mode"
                : "☀️ Light mode"
            }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        position: relative;
        background: var(--color-bg);
      }
      .login-bg {
        position: fixed;
        inset: 0;
        overflow: hidden;
        z-index: 0;
      }
      .login-pattern {
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(
            circle at 20% 30%,
            rgba(192, 98, 46, 0.08) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 70%,
            rgba(196, 154, 80, 0.06) 0%,
            transparent 50%
          );
      }
      .login-card {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 420px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        padding: 40px;
      }
      .login-brand {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 28px;
        border-bottom: 1px solid var(--color-border);
      }
      .brand-ornament {
        font-size: 1.75rem;
        color: var(--color-accent);
        margin-bottom: 10px;
      }
      .login-brand h1 {
        font-family: var(--font-display);
        font-size: 1.375rem;
        font-style: italic;
        margin-bottom: 4px;
      }
      .login-brand p {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .login-form h2 {
        font-size: 1.375rem;
        margin-bottom: 4px;
      }
      .login-subtitle {
        font-size: 0.875rem;
        margin-bottom: 24px;
      }
      .alert-error {
        padding: 12px 16px;
        border-radius: 8px;
        background: rgba(192, 56, 40, 0.08);
        color: var(--color-error);
        border: 1px solid rgba(192, 56, 40, 0.2);
        font-size: 0.875rem;
        margin-bottom: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .input-with-toggle {
        position: relative;
      }
      .input-with-toggle .form-input {
        padding-right: 44px;
      }
      .toggle-pw {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      .login-btn {
        width: 100%;
        padding: 12px;
        margin-top: 8px;
        font-size: 0.9375rem;
      }
      .login-footer {
        margin-top: 24px;
        text-align: center;
      }
      .theme-toggle {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        font-size: 0.8125rem;
        font-family: var(--font-body);
        padding: 4px 8px;
      }
      .theme-toggle:hover {
        color: var(--color-text);
      }
    `,
  ],
})
export class AdminLoginComponent {
  email = "";
  password = "";
  loading = signal(false);
  error = signal("");
  showPassword = signal(false);

  constructor(
    private authService: AdminAuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {
    themeService.init();
    if (authService.isLoggedIn()) router.navigate(["/dashboard"]);
  }

  submit() {
    if (!this.email || !this.password) {
      this.error.set("Please enter your email and password.");
      return;
    }
    this.loading.set(true);
    this.error.set("");

    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(["/dashboard"]),
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || "Invalid credentials. Please try again.",
        );
      },
    });
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }
}
