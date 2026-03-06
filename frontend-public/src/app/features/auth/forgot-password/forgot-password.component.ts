import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../../core/services/api.service";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page page-enter">
      <div class="auth-layout">
        <div class="auth-visual">
          <div class="auth-pattern"></div>
          <div class="auth-brand">
            <span class="brand-icon">✦</span>
            <h2>Complementary<br /><em>Fashions</em></h2>
          </div>
        </div>

        <div class="auth-form-side">
          <div class="auth-form-wrap">
            @if (step() === "request") {
              <h1>Forgot Password</h1>
              <p class="auth-subtitle">
                Enter your email and we'll generate a reset token for you
              </p>
              <div class="form-group">
                <label>Email Address</label>
                <input
                  class="form-input"
                  type="email"
                  [(ngModel)]="email"
                  placeholder="your@email.com"
                  (keyup.enter)="requestReset()"
                />
              </div>
              @if (error()) {
                <div class="form-error">{{ error() }}</div>
              }
              <button
                class="btn btn-primary btn-full"
                [disabled]="loading()"
                (click)="requestReset()"
              >
                {{ loading() ? "Sending..." : "Get Reset Token" }}
              </button>
              <p class="auth-switch">
                Remember your password? <a routerLink="/auth/login">Sign in</a>
              </p>
            }

            @if (step() === "token") {
              <h1>Check Your Token</h1>
              <p class="auth-subtitle">
                Your reset token has been generated. Copy it and use it below.
              </p>
              <div class="token-box">
                <p class="token-label">Reset Token:</p>
                <code class="token-code">{{ resetToken() }}</code>
                <button class="copy-btn" (click)="copyToken()">
                  {{ copied() ? "✓ Copied!" : "Copy Token" }}
                </button>
              </div>
              <p class="token-note">
                ⏱ Valid for 1 hour. Once email is set up, this will be sent to
                your inbox automatically.
              </p>
              <button
                class="btn btn-primary btn-full"
                (click)="step.set('reset')"
              >
                Continue to Reset Password →
              </button>
            }

            @if (step() === "reset") {
              <h1>Set New Password</h1>
              <p class="auth-subtitle">
                Enter the reset token and your new password
              </p>
              <div class="form-group">
                <label>Reset Token</label>
                <input
                  class="form-input"
                  [(ngModel)]="token"
                  placeholder="Paste your reset token"
                />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input
                  class="form-input"
                  type="password"
                  [(ngModel)]="newPassword"
                  placeholder="At least 8 characters"
                />
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input
                  class="form-input"
                  type="password"
                  [(ngModel)]="confirmPassword"
                  placeholder="Confirm new password"
                  (keyup.enter)="doReset()"
                />
              </div>
              @if (error()) {
                <div class="form-error">{{ error() }}</div>
              }
              <button
                class="btn btn-primary btn-full"
                [disabled]="loading()"
                (click)="doReset()"
              >
                {{ loading() ? "Resetting..." : "Reset Password" }}
              </button>
            }

            @if (step() === "done") {
              <div class="success-wrap">
                <div class="success-circle">✓</div>
                <h1>Password Reset!</h1>
                <p class="auth-subtitle">
                  Your password has been updated. You can now sign in.
                </p>
                <a routerLink="/auth/login" class="btn btn-primary btn-full"
                  >Go to Sign In</a
                >
              </div>
            }
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
        background: var(--color-surface);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .auth-pattern {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
          circle at 60% 40%,
          rgba(201, 112, 58, 0.12) 0%,
          transparent 60%
        );
      }
      .auth-brand {
        position: relative;
        text-align: center;
      }
      .brand-icon {
        font-size: 3rem;
        color: var(--color-accent);
        display: block;
        margin-bottom: 16px;
      }
      .auth-brand h2 {
        font-size: 2rem;
        font-weight: 300;
        line-height: 1.3;
      }
      .auth-form-side {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
      }
      .auth-form-wrap {
        width: 100%;
        max-width: 420px;
      }
      h1 {
        font-size: 1.75rem;
        margin-bottom: 8px;
      }
      .auth-subtitle {
        color: var(--color-text-secondary);
        margin-bottom: 28px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .form-input {
        width: 100%;
        padding: 12px 14px;
        border: 1.5px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.9375rem;
        box-sizing: border-box;
      }
      .btn {
        padding: 13px 24px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        font-size: 1rem;
      }
      .btn-primary {
        background: var(--color-accent);
        color: white;
      }
      .btn-full {
        width: 100%;
        margin-top: 8px;
        text-align: center;
        display: block;
        text-decoration: none;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .form-error {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        color: #dc2626;
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 0.875rem;
      }
      .auth-switch {
        text-align: center;
        margin-top: 20px;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
      }
      .auth-switch a {
        color: var(--color-accent);
        text-decoration: none;
        font-weight: 500;
      }
      .token-box {
        background: var(--color-surface);
        border: 1.5px solid var(--color-border);
        border-radius: 10px;
        padding: 18px;
        margin: 16px 0;
      }
      .token-label {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-bottom: 8px;
      }
      .token-code {
        display: block;
        font-family: monospace;
        font-size: 0.8rem;
        word-break: break-all;
        color: var(--color-accent);
        margin-bottom: 12px;
        line-height: 1.5;
      }
      .copy-btn {
        padding: 7px 18px;
        border: 1.5px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-bg);
        color: var(--color-text);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .token-note {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-bottom: 16px;
      }
      .success-wrap {
        text-align: center;
      }
      .success-circle {
        width: 64px;
        height: 64px;
        background: #d1fae5;
        color: #059669;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        margin: 0 auto 20px;
      }
      @media (max-width: 768px) {
        .auth-layout {
          grid-template-columns: 1fr;
        }
        .auth-visual {
          display: none;
        }
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  step = signal<"request" | "token" | "reset" | "done">("request");
  email = "";
  token = "";
  newPassword = "";
  confirmPassword = "";
  loading = signal(false);
  error = signal("");
  resetToken = signal("");
  copied = signal(false);

  constructor(private api: ApiService) {}

  requestReset() {
    if (!this.email) return this.error.set("Please enter your email address");
    this.loading.set(true);
    this.error.set("");
    this.api.post("/auth/forgot-password", { email: this.email }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.resetToken.set(res.token);
        this.step.set("token");
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || "No account found with that email",
        );
      },
    });
  }

  copyToken() {
    navigator.clipboard.writeText(this.resetToken());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }

  doReset() {
    if (!this.token) return this.error.set("Please enter the reset token");
    if (this.newPassword.length < 8)
      return this.error.set("Password must be at least 8 characters");
    if (this.newPassword !== this.confirmPassword)
      return this.error.set("Passwords do not match");
    this.loading.set(true);
    this.error.set("");
    this.api
      .post("/auth/reset-password", {
        token: this.token,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.step.set("done");
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.error?.message || "Reset failed. Token may have expired.",
          );
        },
      });
  }
}
