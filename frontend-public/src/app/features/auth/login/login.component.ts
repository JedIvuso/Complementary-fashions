import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { CartService } from "../../../core/services/cart.service";
import { FavoritesService } from "../../../core/services/favorites.service";
import { ApiService } from "../../../core/services/api.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page page-enter">
      <div class="auth-layout">
        <div class="auth-visual">
          <div class="auth-pattern"></div>
          <div class="auth-brand">
            @if (logoUrl()) {
              <img
                [src]="logoUrl()"
                alt="Logo"
                style="height:56px;width:auto;object-fit:contain;margin-bottom:20px;display:block;margin-left:auto;margin-right:auto;"
              />
            } @else {
              <span class="brand-icon">✦</span>
            }
            <h2>Welcome Back</h2>
            <p>Sign in to continue your journey with handcrafted fashion</p>
          </div>
        </div>

        <div class="auth-form-panel">
          <div class="auth-form-wrap">
            <div class="form-header">
              <span class="section-label">Account</span>
              <h1>Sign In</h1>
            </div>

            <form (ngSubmit)="login()">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input
                  class="form-input"
                  type="email"
                  placeholder="you@example.com"
                  [(ngModel)]="email"
                  name="email"
                  required
                />
              </div>
              <div class="form-group" style="margin-top:16px;">
                <label class="form-label">Password</label>
                <div class="input-with-icon">
                  <input
                    class="form-input"
                    [type]="showPassword() ? 'text' : 'password'"
                    placeholder="••••••••"
                    [(ngModel)]="password"
                    name="password"
                    required
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

              @if (error()) {
                <div class="error-msg">{{ error() }}</div>
              }

              <button
                type="submit"
                class="btn btn-primary"
                style="width:100%;margin-top:24px;"
                [disabled]="loading()"
              >
                {{ loading() ? "Signing in..." : "Sign In" }}
              </button>
            </form>

            <p class="auth-switch">
              Don't have an account?
              <a routerLink="/auth/register">Create one →</a> <br /><a
                routerLink="/auth/forgot-password"
                style="color:var(--color-text-muted);font-size:0.875rem"
                >Forgot your password?</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
      }
      .auth-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 100vh;
      }
      .auth-visual {
        background: linear-gradient(
          135deg,
          var(--color-bg-secondary),
          var(--color-surface-2)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .auth-pattern {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            circle at 30% 40%,
            rgba(201, 112, 58, 0.15) 0%,
            transparent 60%
          ),
          radial-gradient(
            circle at 70% 70%,
            rgba(201, 169, 110, 0.1) 0%,
            transparent 50%
          );
      }
      .auth-brand {
        position: relative;
        z-index: 1;
        text-align: center;
        padding: 40px;
      }
      .brand-icon {
        font-size: 3rem;
        color: var(--color-accent);
        display: block;
        margin-bottom: 20px;
      }
      .auth-brand h2 {
        font-family: var(--font-display);
        font-size: 2.5rem;
        font-style: italic;
        margin-bottom: 12px;
      }
      .auth-brand p {
        color: var(--color-text-secondary);
        font-size: 1.0625rem;
      }
      .auth-form-panel {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
        background: var(--color-bg);
      }
      .auth-form-wrap {
        width: 100%;
        max-width: 420px;
      }
      .form-header {
        margin-bottom: 36px;
      }
      .form-header h1 {
        font-style: italic;
      }
      .input-with-icon {
        position: relative;
      }
      .input-with-icon .form-input {
        padding-right: 48px;
      }
      .toggle-pw {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
      }
      .error-msg {
        margin-top: 12px;
        padding: 10px 14px;
        border-radius: 8px;
        background: rgba(201, 74, 58, 0.1);
        color: var(--color-error);
        font-size: 0.875rem;
      }
      .auth-switch {
        margin-top: 24px;
        text-align: center;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
      .auth-switch a {
        color: var(--color-accent);
        font-weight: 500;
      }
      @media (max-width: 768px) {
        .auth-layout {
          grid-template-columns: 1fr;
        }
        .auth-visual {
          display: none;
        }
        .auth-form-panel {
          padding: 80px 24px 48px;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  email = "";
  password = "";
  loading = signal(false);
  error = signal("");
  showPassword = signal(false);

  logoUrl = signal<string>("");

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cart: CartService,
    private favs: FavoritesService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.api.get<any>("/about").subscribe({
      next: (data) => {
        if (data.logoUrl) {
          const base = environment.apiUrl.replace("/api", "");
          this.logoUrl.set(
            data.logoUrl.startsWith("https")
              ? data.logoUrl
              : `${base}${data.logoUrl}`,
          );
        }
      },
    });
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  login() {
    if (!this.email || !this.password) {
      this.error.set("Please fill in all fields");
      return;
    }
    this.loading.set(true);
    this.error.set("");
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.success("Welcome back!");
        this.cart.loadCart().subscribe();
        this.favs.load().subscribe();
        this.router.navigate(["/"]);
      },
      error: (e) => {
        this.error.set(e.error?.message || "Invalid credentials");
        this.loading.set(false);
      },
    });
  }
}
