import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-admin-settings",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>Account Settings</h1>
        <p>Manage your admin profile and password</p>
      </div>

      @if (toast()) {
        <div class="toast" [class.toast-error]="toastType() === 'error'">
          {{ toast() }}
        </div>
      }

      <div class="settings-grid">
        <!-- Profile Info -->
        <div class="settings-card">
          <h2>Profile Information</h2>
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
          <div class="form-group">
            <label>Email Address</label>
            <input
              class="form-input"
              type="email"
              [(ngModel)]="profile.email"
              placeholder="Email"
            />
          </div>
          <button
            class="btn btn-primary"
            [disabled]="savingProfile()"
            (click)="saveProfile()"
          >
            {{ savingProfile() ? "Saving..." : "Save Profile" }}
          </button>
        </div>

        <!-- Change Password -->
        <div class="settings-card">
          <h2>Change Password</h2>
          <div class="form-group">
            <label>Current Password</label>
            <div class="input-group">
              <input
                class="form-input"
                [type]="showCurrent() ? 'text' : 'password'"
                [(ngModel)]="passwords.current"
                placeholder="Current password"
              />
              <button
                class="toggle-pw"
                (click)="showCurrent.set(!showCurrent())"
              >
                {{ showCurrent() ? "🙈" : "👁" }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>New Password</label>
            <div class="input-group">
              <input
                class="form-input"
                [type]="showNew() ? 'text' : 'password'"
                [(ngModel)]="passwords.new"
                placeholder="New password (min 8 chars)"
              />
              <button class="toggle-pw" (click)="showNew.set(!showNew())">
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
  `,
  styles: [
    `
      .settings-page {
        padding: 32px;
        max-width: 900px;
      }
      .page-header {
        margin-bottom: 32px;
      }
      .page-header h1 {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .page-header p {
        color: var(--color-text-muted);
      }
      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .settings-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 28px;
      }
      .settings-card h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border);
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
      }
      .form-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.9375rem;
        box-sizing: border-box;
      }
      .input-group {
        position: relative;
        display: flex;
      }
      .input-group .form-input {
        padding-right: 40px;
      }
      .toggle-pw {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      .btn {
        padding: 10px 20px;
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
      .toast {
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 14px 20px;
        background: #2d6a4f;
        color: white;
        border-radius: 8px;
        z-index: 9999;
        font-size: 0.9375rem;
      }
      .toast-error {
        background: #c0392b;
      }
      @media (max-width: 700px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminSettingsComponent implements OnInit {
  profile: any = { firstName: "", lastName: "", email: "" };
  passwords = { current: "", new: "", confirm: "" };
  savingProfile = signal(false);
  savingPassword = signal(false);
  toast = signal("");
  toastType = signal<"success" | "error">("success");
  showCurrent = signal(false);
  showNew = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>("/auth/admin/me").subscribe({
      next: (admin) => {
        this.profile.firstName = admin.firstName || admin.first_name || "";
        this.profile.lastName = admin.lastName || admin.last_name || "";
        this.profile.email = admin.email || "";
      },
    });
  }

  saveProfile() {
    if (!this.profile.firstName || !this.profile.email) {
      return this.showToast("First name and email are required", "error");
    }
    this.savingProfile.set(true);
    this.api.put("/auth/admin/profile", this.profile).subscribe({
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
    if (!this.passwords.current || !this.passwords.new) {
      return this.showToast("Please fill in all password fields", "error");
    }
    if (this.passwords.new.length < 8) {
      return this.showToast(
        "New password must be at least 8 characters",
        "error",
      );
    }
    if (this.passwords.new !== this.passwords.confirm) {
      return this.showToast("New passwords do not match", "error");
    }
    this.savingPassword.set(true);
    this.api
      .put("/auth/admin/profile", {
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
