import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-admin-banners",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="banners-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Hero Banners</h1>
          <p class="page-sub">Manage homepage slideshow</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          + Add Banner
        </button>
      </div>

      <div class="banners-list">
        @if (loading()) {
          @for (i of [1, 2, 3]; track i) {
            <div
              class="skeleton"
              style="height:180px;border-radius:12px;margin-bottom:16px"
            ></div>
          }
        }
        @for (banner of banners(); track banner.id) {
          <div class="banner-card card" [class.inactive]="!banner.isActive">
            <div class="banner-preview">
              <img [src]="resolveUrl(banner.imageUrl)" [alt]="banner.title" />
              <div class="banner-preview-overlay">
                <span class="banner-order"
                  >Position {{ banner.displayOrder + 1 }}</span
                >
              </div>
            </div>
            <div class="banner-info">
              <div>
                <h4>{{ banner.title }}</h4>
                @if (banner.subtitle) {
                  <p>{{ banner.subtitle }}</p>
                }
                @if (banner.ctaText) {
                  <div class="banner-cta-preview">
                    <span class="badge badge-accent">{{ banner.ctaText }}</span>
                    @if (banner.ctaLink) {
                      <span
                        style="font-size:0.75rem;color:var(--color-text-muted)"
                        >→ {{ banner.ctaLink }}</span
                      >
                    }
                  </div>
                }
              </div>
              <div class="banner-actions">
                <span
                  class="badge"
                  [class]="banner.isActive ? 'badge-success' : 'badge-muted'"
                >
                  {{ banner.isActive ? "Active" : "Hidden" }}
                </span>
                <button
                  class="btn btn-ghost btn-sm"
                  (click)="editBanner(banner)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  (click)="deleteBanner(banner.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        }
        @if (!loading() && !banners().length) {
          <div class="empty-state" style="text-align:center;padding:60px 24px">
            <div style="font-size:3rem;margin-bottom:16px">🖼️</div>
            <h3>No banners yet</h3>
            <p style="margin-bottom:24px">
              Add hero banners to display on the homepage slideshow.
            </p>
            <button class="btn btn-primary" (click)="openModal()">
              Add First Banner
            </button>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">
                {{ editing ? "Edit Banner" : "New Banner" }}
              </h2>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>

            <div class="form-group">
              <label class="form-label">Banner Image *</label>
              <div class="upload-area" (click)="imgInput.click()">
                @if (form.imageUrl) {
                  <img
                    [src]="resolveUrl(form.imageUrl)"
                    style="max-height:140px;border-radius:8px;margin:0 auto;object-fit:cover;width:100%"
                  />
                } @else {
                  <div class="upload-icon">🖼️</div>
                  <p
                    style="font-size:0.875rem;color:var(--color-text-secondary)"
                  >
                    Click to upload banner image
                  </p>
                  <p style="font-size:0.75rem;color:var(--color-text-muted)">
                    Recommended: 1920×800px, landscape
                  </p>
                }
              </div>
              <input
                #imgInput
                type="file"
                accept="image/*"
                style="display:none"
                (change)="onImageSelected($event)"
              />
              @if (uploading()) {
                <p
                  style="font-size:0.8rem;color:var(--color-text-muted);margin-top:6px"
                >
                  Uploading…
                </p>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Title *</label>
              <input
                class="form-input"
                [(ngModel)]="form.title"
                placeholder="e.g. New Arrivals – Spring Collection"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Subtitle</label>
              <input
                class="form-input"
                [(ngModel)]="form.subtitle"
                placeholder="e.g. Handcrafted with love"
              />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label class="form-label">CTA Button Text</label>
                <input
                  class="form-input"
                  [(ngModel)]="form.ctaText"
                  placeholder="e.g. Shop Now"
                />
              </div>
              <div class="form-group">
                <label class="form-label">CTA Link</label>
                <input
                  class="form-input"
                  [(ngModel)]="form.ctaLink"
                  placeholder="/products"
                />
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label class="form-label">Display Order</label>
                <input
                  class="form-input"
                  type="number"
                  [(ngModel)]="form.displayOrder"
                  placeholder="0"
                />
              </div>
            </div>
            <label
              class="toggle-label"
              style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:8px"
            >
              <input
                type="checkbox"
                [(ngModel)]="form.isActive"
                style="accent-color:var(--color-accent)"
              />
              Active (show on homepage)
            </label>

            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="closeModal()">
                Cancel
              </button>
              <button
                class="btn btn-primary"
                [disabled]="saving()"
                (click)="save()"
              >
                {{ saving() ? "Saving…" : "Save Banner" }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .banners-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .banner-card {
        display: flex;
        gap: 0;
        overflow: hidden;
      }
      .banner-card.inactive {
        opacity: 0.6;
      }
      .banner-preview {
        width: 280px;
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
      }
      .banner-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        min-height: 140px;
      }
      .banner-preview-overlay {
        position: absolute;
        top: 8px;
        left: 8px;
      }
      .banner-order {
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
      }
      .banner-info {
        flex: 1;
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }
      .banner-info h4 {
        font-size: 1.0625rem;
        margin-bottom: 4px;
      }
      .banner-info p {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
      }
      .banner-cta-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }
      .banner-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      @media (max-width: 640px) {
        .banner-card {
          flex-direction: column;
        }
        .banner-preview {
          width: 100%;
          height: 160px;
        }
      }
    `,
  ],
})
export class AdminBannersComponent implements OnInit {
  banners = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  uploading = signal(false);
  editing: any = null;

  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }
  emptyForm() {
    return {
      title: "",
      subtitle: "",
      imageUrl: "",
      ctaText: "",
      ctaLink: "/products",
      displayOrder: 0,
      isActive: true,
    };
  }

  load() {
    this.loading.set(true);
    this.api.get<any[]>("/banners/admin").subscribe({
      next: (b) => {
        this.banners.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal() {
    this.form = this.emptyForm();
    this.editing = null;
    this.showModal.set(true);
  }
  closeModal() {
    this.showModal.set(false);
    this.editing = null;
  }

  editBanner(banner: any) {
    this.editing = banner;
    this.form = { ...banner };
    this.showModal.set(true);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading.set(true);
    const fd = new FormData();
    fd.append("file", file);
    this.api.upload("/uploads/image", fd).subscribe({
      next: (res: any) => {
        this.form.imageUrl = res.url;
        this.uploading.set(false);
      },
      error: (err) => {
        console.error("Upload failed:", err);
        alert(
          "Upload failed: " +
            (err.error?.message || err.message || "Unknown error"),
        );
        this.uploading.set(false);
      },
    });
  }

  save() {
    if (!this.form.title || !this.form.imageUrl) {
      alert("Title and image are required");
      return;
    }
    this.saving.set(true);
    const req = this.editing
      ? this.api.put(`/banners/${this.editing.id}`, this.form)
      : this.api.post("/banners", this.form);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: () => {
        this.saving.set(false);
        alert("Failed to save");
      },
    });
  }

  deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;
    this.api.delete(`/banners/${id}`).subscribe({ next: () => this.load() });
  }

  resolveUrl(url: string) {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
  }
}
