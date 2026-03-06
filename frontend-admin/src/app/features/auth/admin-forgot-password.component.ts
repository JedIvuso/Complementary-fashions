import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-admin-forgot-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="forgot-page">
      <div class="forgot-card">
        <div class="logo">
          <span class="logo-mark">✦</span>
          <span class="logo-text">Admin Panel</span>
        </div>

        @if (step() === "request") {
          <h1>Forgot Password</h1>
          <p class="subtitle">Enter your admin email to get a reset token</p>
          <div class="form-group">
            <label>Admin Email</label>
            <input
              class="form-input"
              type="email"
              [(ngModel)]="email"
              placeholder="admin@example.com"
              (keyup.enter)="requestReset()"
            />
          </div>
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }
          <button
            class="btn-submit"
            [disabled]="loading()"
            (click)="requestReset()"
          >
            {{ loading() ? "Generating..." : "Get Reset Token" }}
          </button>
          <a routerLink="/login" class="back-link">← Back to login</a>
        }

        @if (step() === "token") {
          <h1>Reset Token Generated</h1>
          <div class="token-box">
            <p class="token-label">Your reset token (copy this):</p>
            <code class="token-value">{{ resetToken() }}</code>
            <button class="copy-btn" (click)="copyToken()">
              {{ copied() ? "✓ Copied" : "Copy" }}
            </button>
          </div>
          <p class="token-note">
            ⚠️ This token expires in 1 hour. Once email is configured, this will
            be sent automatically.
          </p>
          <button class="btn-submit" (click)="step.set('reset')">
            Continue to Reset →
          </button>
        }

        @if (step() === "reset") {
          <h1>Set New Password</h1>
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
              placeholder="Min 8 characters"
            />
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input
              class="form-input"
              type="password"
              [(ngModel)]="confirmPassword"
              placeholder="Confirm new password"
            />
          </div>
          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }
          <button class="btn-submit" [disabled]="loading()" (click)="doReset()">
            {{ loading() ? "Resetting..." : "Reset Password" }}
          </button>
        }

        @if (step() === "done") {
          <div class="success-state">
            <div class="success-icon">✓</div>
            <h1>Password Reset!</h1>
            <p>Your password has been updated successfully.</p>
            <a routerLink="/login" class="btn-submit">Go to Login</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .forgot-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg);
        padding: 24px;
      }
      .forgot-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 40px;
        width: 100%;
        max-width: 440px;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 28px;
      }
      .logo-mark {
        color: var(--color-accent, #c9703a);
        font-size: 1.5rem;
      }
      .logo-text {
        font-weight: 600;
        font-size: 1rem;
      }
      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .subtitle {
        color: var(--color-text-muted);
        margin-bottom: 24px;
        font-size: 0.9375rem;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 6px;
      }
      .form-input {
        width: 100%;
        padding: 11px 14px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.9375rem;
        box-sizing: border-box;
      }
      .btn-submit {
        width: 100%;
        padding: 12px;
        background: var(--color-accent, #c9703a);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        margin-top: 8px;
        text-align: center;
        display: block;
        text-decoration: none;
      }
      .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .back-link {
        display: block;
        text-align: center;
        margin-top: 16px;
        color: var(--color-text-muted);
        font-size: 0.875rem;
        text-decoration: none;
      }
      .error-msg {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        color: #dc2626;
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 0.875rem;
      }
      .token-box {
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
      }
      .token-label {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-bottom: 8px;
      }
      .token-value {
        display: block;
        font-family: monospace;
        font-size: 0.8rem;
        word-break: break-all;
        color: var(--color-accent, #c9703a);
        margin-bottom: 10px;
      }
      .copy-btn {
        padding: 6px 16px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-surface);
        cursor: pointer;
        font-size: 0.8125rem;
      }
      .token-note {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-bottom: 16px;
      }
      .success-state {
        text-align: center;
      }
      .success-icon {
        width: 56px;
        height: 56px;
        background: #d1fae5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: #059669;
        margin: 0 auto 16px;
      }
    `,
  ],
})
export class AdminForgotPasswordComponent {
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
    if (!this.email) return this.error.set("Please enter your email");
    this.loading.set(true);
    this.error.set("");
    this.api
      .post("/auth/admin/forgot-password", { email: this.email })
      .subscribe({
        next: (res: any) => {
          this.loading.set(false);
          this.resetToken.set(res.token);
          this.step.set("token");
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || "Failed to generate token");
        },
      });
  }

  copyToken() {
    navigator.clipboard.writeText(this.resetToken());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
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
      .post("/auth/admin/reset-password", {
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
          this.error.set(err.error?.message || "Reset failed");
        },
      });
  }
}
