import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-privacy-policy",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="legal-page page-enter">
      <div class="legal-hero">
        <div class="container">
          <span class="section-label">Legal</span>
          <h1>Privacy Policy</h1>
          @if (updatedAt()) {
            <p class="updated">Last updated: {{ updatedAt() }}</p>
          }
        </div>
      </div>

      <div class="container legal-body">
        @if (loading()) {
          <div
            style="text-align:center;padding:60px;color:var(--color-text-muted)"
          >
            Loading...
          </div>
        } @else if (content()) {
          <div class="legal-content">
            @for (line of lines(); track $index) {
              @if (line.trim() === "") {
                <br />
              } @else if (line.startsWith("# ")) {
                <h2>{{ line.slice(2) }}</h2>
              } @else if (line.startsWith("- ")) {
                <li>{{ line.slice(2) }}</li>
              } @else {
                <p>{{ line }}</p>
              }
            }
          </div>
        } @else {
          <div class="empty-state">
            <p>Our privacy policy is being prepared. Please check back soon.</p>
            <a routerLink="/" class="btn btn-ghost" style="margin-top:16px"
              >← Back to Home</a
            >
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .legal-hero {
        padding: 120px 0 60px;
        background: linear-gradient(
          135deg,
          var(--color-bg),
          var(--color-bg-secondary)
        );
        border-bottom: 1px solid var(--color-border);
      }
      .legal-hero h1 {
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 300;
        margin: 8px 0;
      }
      .updated {
        color: var(--color-text-muted);
        font-size: 0.875rem;
        margin-top: 8px;
      }
      .legal-body {
        max-width: 800px;
        padding: 60px 24px;
      }
      .legal-content h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 40px 0 12px;
        color: var(--color-accent);
      }
      .legal-content p {
        color: var(--color-text-secondary);
        line-height: 1.8;
        margin-bottom: 12px;
      }
      .legal-content li {
        color: var(--color-text-secondary);
        line-height: 1.8;
        margin-left: 24px;
        margin-bottom: 6px;
      }
      .empty-state {
        text-align: center;
        padding: 60px;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class PrivacyPolicyComponent implements OnInit {
  loading = signal(true);
  content = signal<string>("");
  updatedAt = signal<string>("");

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>("/legal").subscribe({
      next: (data) => {
        this.content.set(data.privacyPolicy || "");
        if (data.privacyPolicyUpdatedAt) {
          this.updatedAt.set(
            new Date(data.privacyPolicyUpdatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          );
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  lines() {
    return this.content().split("\n");
  }
}
