import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page page-enter">
      <div class="auth-layout">
        <div class="auth-visual">
          <div class="auth-pattern"></div>
          <div class="auth-brand">
            <span class="brand-icon">✦</span>
            <h2>Join the Family</h2>
            <p>Create your account and discover handcrafted crochet fashion</p>
          </div>
        </div>
        <div class="auth-form-panel">
          <div class="auth-form-wrap">
            <div class="form-header">
              <span class="section-label">Account</span>
              <h1>Create Account</h1>
            </div>
            <form (ngSubmit)="register()">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input
                    class="form-input"
                    placeholder="Jane"
                    [(ngModel)]="form.firstName"
                    name="firstName"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input
                    class="form-input"
                    placeholder="Doe"
                    [(ngModel)]="form.lastName"
                    name="lastName"
                    required
                  />
                </div>
              </div>
              <div class="form-group" style="margin-top:16px;">
                <label class="form-label">Email</label>
                <input
                  class="form-input"
                  type="email"
                  placeholder="you@example.com"
                  [(ngModel)]="form.email"
                  name="email"
                  required
                />
              </div>
              <div class="form-group" style="margin-top:16px;">
                <label class="form-label">Phone (optional)</label>
                <input
                  class="form-input"
                  placeholder="+254..."
                  [(ngModel)]="form.phone"
                  name="phone"
                />
              </div>
              <div class="form-group" style="margin-top:16px;">
                <label class="form-label">Password</label>
                <input
                  class="form-input"
                  type="password"
                  placeholder="Min. 8 characters"
                  [(ngModel)]="form.password"
                  name="password"
                  required
                  minlength="8"
                />
              </div>
              @if (error()) {
                <div class="error-msg">{{ error() }}</div>
              }
              <div
                class="consent-wrap"
                style="margin-top:20px;display:flex;align-items:flex-start;gap:10px;"
              >
                <input
                  type="checkbox"
                  id="consent"
                  [(ngModel)]="consentGiven"
                  name="consentGiven"
                  style="margin-top:3px;accent-color:var(--color-accent);width:16px;height:16px;flex-shrink:0;cursor:pointer;"
                />
                <label
                  for="consent"
                  style="font-size:0.85rem;color:var(--color-text-secondary);line-height:1.5;cursor:pointer;"
                >
                  I have read and agree to the
                  <a
                    routerLink="/privacy-policy"
                    target="_blank"
                    style="color:var(--color-accent);font-weight:500;"
                    >Privacy Policy</a
                  >
                  and
                  <a
                    routerLink="/terms"
                    target="_blank"
                    style="color:var(--color-accent);font-weight:500;"
                    >Terms & Conditions</a
                  >
                </label>
              </div>
              <button
                type="submit"
                class="btn btn-primary"
                style="width:100%;margin-top:20px;"
                [disabled]="loading() || !consentGiven"
              >
                {{ loading() ? "Creating..." : "Create Account" }}
              </button>
            </form>
            <p class="auth-switch">
              Already have an account? <a routerLink="/auth/login">Sign in →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Same as login */
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
export class RegisterComponent {
  form = { firstName: "", lastName: "", email: "", phone: "", password: "" };
  consentGiven = false;
  loading = signal(false);
  error = signal("");

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  register() {
    this.loading.set(true);
    this.error.set("");
    this.auth.register(this.form).subscribe({
      next: () => {
        this.toast.success("Welcome to Complementary Fashions!");
        this.router.navigate(["/"]);
      },
      error: (e) => {
        this.error.set(e.error?.message || "Registration failed");
        this.loading.set(false);
      },
    });
  }
}
