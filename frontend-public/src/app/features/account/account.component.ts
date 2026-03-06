import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-account",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="account-page page-enter">
      <div class="page-header">
        <div class="container">
          <span class="section-label">Your Profile</span>
          <h1>Account Settings</h1>
        </div>
      </div>

      <div class="container section">
        @if (toast()) {
          <div
            class="toast-banner"
            [class.toast-error]="toastType() === 'error'"
          >
            {{ toast() }}
          </div>
        }

        <div class="account-grid">
          <!-- Personal Info -->
          <div class="account-card card">
            <h2>Personal Information</h2>
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input
                  class="form-input"
                  [(ngModel)]="profile.firstName"
                  placeholder="First name"
                />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input
                  class="form-input"
                  [(ngModel)]="profile.lastName"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input
                class="form-input"
                type="email"
                [(ngModel)]="profile.email"
                placeholder="your@email.com"
              />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input
                class="form-input"
                [(ngModel)]="profile.phoneNumber"
                placeholder="+254 700 000 000"
              />
            </div>
            <div class="form-group">
              <label>Delivery Address</label>
              <textarea
                class="form-input"
                rows="3"
                [(ngModel)]="profile.address"
                placeholder="Your default delivery address"
              ></textarea>
            </div>
            <button
              class="btn btn-primary"
              [disabled]="savingProfile()"
              (click)="saveProfile()"
            >
              {{ savingProfile() ? "Saving..." : "Save Changes" }}
            </button>
          </div>

          <!-- Change Password -->
          <div class="account-card card">
            <h2>Change Password</h2>
            <div class="form-group">
              <label>Current Password</label>
              <div class="pw-field">
                <input
                  class="form-input"
                  [type]="showCurrent() ? 'text' : 'password'"
                  [(ngModel)]="passwords.current"
                  placeholder="Current password"
                />
                <button
                  class="pw-toggle"
                  (click)="showCurrent.set(!showCurrent())"
                >
                  {{ showCurrent() ? "🙈" : "👁" }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>New Password</label>
              <div class="pw-field">
                <input
                  class="form-input"
                  [type]="showNew() ? 'text' : 'password'"
                  [(ngModel)]="passwords.new"
                  placeholder="At least 8 characters"
                />
                <button class="pw-toggle" (click)="showNew.set(!showNew())">
                  {{ showNew() ? "🙈" : "👁" }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input
                class="form-input"
                type="password"
                [(ngModel)]="passwords.confirm"
                placeholder="Confirm new password"
              />
            </div>
            <button
              class="btn btn-primary"
              [disabled]="savingPassword()"
              (click)="changePassword()"
            >
              {{ savingPassword() ? "Updating..." : "Update Password" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        padding: 80px 0 40px;
      }
      .page-header h1 {
        font-style: italic;
      }
      .account-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .account-card {
        padding: 32px;
      }
      .account-card h2 {
        font-family: var(--font-display);
        font-size: 1.25rem;
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border);
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 6px;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
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
        font-family: inherit;
      }
      textarea.form-input {
        resize: vertical;
      }
      .pw-field {
        position: relative;
        display: flex;
      }
      .pw-field .form-input {
        padding-right: 44px;
      }
      .pw-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      .btn {
        padding: 11px 24px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9375rem;
        margin-top: 8px;
      }
      .btn-primary {
        background: var(--color-accent);
        color: white;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .toast-banner {
        padding: 14px 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        font-size: 0.9375rem;
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }
      .toast-banner.toast-error {
        background: #fef2f2;
        color: #dc2626;
        border-color: #fca5a5;
      }
      @media (max-width: 768px) {
        .account-grid {
          grid-template-columns: 1fr;
        }
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AccountComponent implements OnInit {
  profile: any = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  };
  passwords = { current: "", new: "", confirm: "" };
  savingProfile = signal(false);
  savingPassword = signal(false);
  toast = signal("");
  toastType = signal<"success" | "error">("success");
  showCurrent = signal(false);
  showNew = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>("/auth/me").subscribe({
      next: (user) => {
        this.profile.firstName = user.firstName || "";
        this.profile.lastName = user.lastName || "";
        this.profile.email = user.email || "";
        this.profile.phoneNumber = user.phoneNumber || "";
        this.profile.address = user.address || "";
      },
    });
  }

  saveProfile() {
    if (!this.profile.firstName || !this.profile.email) {
      return this.showToast("First name and email are required", "error");
    }
    this.savingProfile.set(true);
    this.api.put("/auth/profile", this.profile).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.showToast("Profile updated successfully");
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.showToast(
          err.error?.message || "Failed to update profile",
          "error",
        );
      },
    });
  }

  changePassword() {
    if (!this.passwords.current || !this.passwords.new)
      return this.showToast("Please fill all password fields", "error");
    if (this.passwords.new.length < 8)
      return this.showToast("Password must be at least 8 characters", "error");
    if (this.passwords.new !== this.passwords.confirm)
      return this.showToast("Passwords do not match", "error");
    this.savingPassword.set(true);
    this.api
      .put("/auth/profile", {
        currentPassword: this.passwords.current,
        newPassword: this.passwords.new,
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwords = { current: "", new: "", confirm: "" };
          this.showToast("Password updated successfully");
        },
        error: (err) => {
          this.savingPassword.set(false);
          this.showToast(
            err.error?.message || "Failed to update password",
            "error",
          );
        },
      });
  }

  showToast(msg: string, type: "success" | "error" = "success") {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(""), 4000);
  }
}
