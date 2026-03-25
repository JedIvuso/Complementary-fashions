import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-admin-legal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Data Protection & Legal</h1>
          <p class="page-sub">
            Manage your Privacy Policy and Terms & Conditions
          </p>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
          {{ saving() ? "Saving..." : "Save Changes" }}
        </button>
      </div>

      @if (loading()) {
        <div
          class="card"
          style="padding:40px;text-align:center;color:var(--color-text-muted)"
        >
          Loading...
        </div>
      } @else {
        <!-- Tabs -->
        <div class="tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'privacy'"
            (click)="activeTab.set('privacy')"
          >
            🔒 Privacy Policy
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'terms'"
            (click)="activeTab.set('terms')"
          >
            📄 Terms & Conditions
          </button>
        </div>

        <!-- Privacy Policy -->
        @if (activeTab() === "privacy") {
          <div class="card" style="padding:32px">
            <div class="section-header" style="margin-bottom:16px">
              <h3 style="font-size:1.1rem">Privacy Policy</h3>
              @if (lastUpdated("privacy")) {
                <span style="font-size:0.8rem;color:var(--color-text-muted)">
                  Last updated: {{ lastUpdated("privacy") }}
                </span>
              }
            </div>
            <p
              style="color:var(--color-text-muted);font-size:0.875rem;margin-bottom:16px"
            >
              Write your privacy policy below. Explain what data you collect,
              how you use it, and customer rights. This will be displayed on
              your public Privacy Policy page.
            </p>
            <textarea
              [(ngModel)]="form.privacyPolicy"
              class="legal-textarea"
              placeholder="Enter your Privacy Policy here...

Example sections to include:
- What information we collect (name, email, phone, delivery address)
- How we use your information (order processing, delivery, communication)
- How we protect your data
- Whether we share data with third parties
- Customer rights (access, deletion)
- Contact information for data concerns"
              rows="25"
            ></textarea>
          </div>
        }

        <!-- Terms & Conditions -->
        @if (activeTab() === "terms") {
          <div class="card" style="padding:32px">
            <div class="section-header" style="margin-bottom:16px">
              <h3 style="font-size:1.1rem">Terms & Conditions</h3>
              @if (lastUpdated("terms")) {
                <span style="font-size:0.8rem;color:var(--color-text-muted)">
                  Last updated: {{ lastUpdated("terms") }}
                </span>
              }
            </div>
            <p
              style="color:var(--color-text-muted);font-size:0.875rem;margin-bottom:16px"
            >
              Write your terms and conditions below. These govern how customers
              use your store and place orders. This will be displayed on your
              public Terms & Conditions page.
            </p>
            <textarea
              [(ngModel)]="form.termsAndConditions"
              class="legal-textarea"
              placeholder="Enter your Terms & Conditions here...

Example sections to include:
- Acceptance of terms
- Products and pricing
- Order process and confirmation
- Payment terms
- Delivery and shipping policy
- Returns and refunds policy
- Intellectual property
- Limitation of liability
- Governing law"
              rows="25"
            ></textarea>
          </div>
        }

        <div style="margin-top:16px;display:flex;justify-content:flex-end">
          <button
            class="btn btn-primary"
            (click)="save()"
            [disabled]="saving()"
          >
            {{ saving() ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
      }
      .tab-btn {
        padding: 10px 24px;
        border-radius: 8px;
        border: 1.5px solid var(--color-border);
        background: transparent;
        color: var(--color-text-muted);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .tab-btn.active {
        background: var(--color-accent);
        color: white;
        border-color: var(--color-accent);
      }
      .legal-textarea {
        width: 100%;
        padding: 16px;
        border-radius: 8px;
        border: 1.5px solid var(--color-border);
        background: var(--color-surface-2);
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.7;
        resize: vertical;
        font-family: inherit;
        box-sizing: border-box;
      }
      .legal-textarea:focus {
        outline: none;
        border-color: var(--color-accent);
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `,
  ],
})
export class AdminLegalComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  activeTab = signal<"privacy" | "terms">("privacy");
  private raw: any = null;

  form = {
    privacyPolicy: "",
    termsAndConditions: "",
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.api.get<any>("/legal").subscribe({
      next: (data) => {
        this.raw = data;
        this.form.privacyPolicy = data.privacyPolicy || "";
        this.form.termsAndConditions = data.termsAndConditions || "";
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  lastUpdated(type: "privacy" | "terms"): string {
    if (!this.raw) return "";
    const date =
      type === "privacy"
        ? this.raw.privacyPolicyUpdatedAt
        : this.raw.termsUpdatedAt;
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  save() {
    this.saving.set(true);
    this.api.put<any>("/legal", this.form).subscribe({
      next: (data) => {
        this.raw = data;
        this.saving.set(false);
        this.toast.success("Legal content saved successfully");
      },
      error: () => {
        this.saving.set(false);
        this.toast.error("Failed to save");
      },
    });
  }
}
