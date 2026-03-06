import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-admin-about",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="about-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">About & Branding</h1>
          <p class="page-sub">
            Manage your brand story, owner profile, contact info and social
            links
          </p>
        </div>
        <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
          {{ saving() ? "Saving…" : "Save All Changes" }}
        </button>
      </div>

      @if (loading()) {
        <div class="skeleton" style="height:400px;border-radius:12px"></div>
      } @else {
        <div class="about-sections">
          <!-- Branding -->
          <div class="card" style="margin-bottom:24px">
            <div class="card-header"><h3>Branding</h3></div>
            <div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
                <div class="form-group">
                  <label class="form-label">Logo</label>
                  <div class="upload-area" (click)="logoInput.click()">
                    @if (form.logoUrl) {
                      <img
                        [src]="resolveUrl(form.logoUrl)"
                        style="max-height:80px;margin:0 auto"
                      />
                    } @else {
                      <div class="upload-icon">🏷️</div>
                      <p
                        style="font-size:0.875rem;color:var(--color-text-secondary)"
                      >
                        Upload logo
                      </p>
                    }
                  </div>
                  <input
                    #logoInput
                    type="file"
                    accept="image/*"
                    style="display:none"
                    (change)="uploadFile($event, 'logoUrl')"
                  />
                </div>
                <div>
                  <div class="form-group">
                    <label class="form-label">Favicon</label>
                    <div
                      class="upload-area"
                      style="padding:16px"
                      (click)="faviconInput.click()"
                    >
                      @if (form.faviconUrl) {
                        <img
                          [src]="resolveUrl(form.faviconUrl)"
                          style="max-height:48px;margin:0 auto"
                        />
                      } @else {
                        <p
                          style="font-size:0.8125rem;color:var(--color-text-secondary)"
                        >
                          Upload favicon (32×32)
                        </p>
                      }
                    </div>
                    <input
                      #faviconInput
                      type="file"
                      accept="image/*"
                      style="display:none"
                      (change)="uploadFile($event, 'faviconUrl')"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Accent Colour</label>
                    <div style="display:flex;gap:10px;align-items:center">
                      <input
                        type="color"
                        [(ngModel)]="form.accentColor"
                        style="width:48px;height:36px;border-radius:6px;border:1px solid var(--color-border);cursor:pointer"
                      />
                      <input
                        class="form-input"
                        [(ngModel)]="form.accentColor"
                        placeholder="#d4a373"
                        style="flex:1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hero Section -->
          <div class="card" style="margin-bottom:24px">
            <div class="card-header">
              <h3>Hero Banner Text</h3>
              <span class="card-hint"
                >This is the large text shown on the About page banner</span
              >
            </div>
            <div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                  <label class="form-label"
                    >Label (small text above title)</label
                  >
                  <input
                    class="form-input"
                    [(ngModel)]="form.heroSubtitle"
                    placeholder="e.g. Our Identity"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Hero Title</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.heroTitle"
                    placeholder="e.g. Crafting Stories, One Stitch at a Time"
                  />
                  <p class="field-hint">
                    Use a comma to split title into two lines
                  </p>
                </div>
              </div>
              <div class="hero-preview">
                <span class="preview-label">{{
                  form.heroSubtitle || "Our Identity"
                }}</span>
                <div class="preview-title">
                  <em>{{ getHeroLine1() }}</em
                  ><br />{{ getHeroLine2() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Brand Story -->
          <div class="card" style="margin-bottom:24px">
            <div class="card-header"><h3>Brand Story</h3></div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Our Story</label>
                <textarea
                  class="form-textarea"
                  rows="5"
                  [(ngModel)]="form.brandStory"
                  placeholder="Tell your brand story…"
                ></textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                  <label class="form-label">Mission</label>
                  <textarea
                    class="form-textarea"
                    rows="4"
                    [(ngModel)]="form.mission"
                    placeholder="Our mission statement…"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Vision</label>
                  <textarea
                    class="form-textarea"
                    rows="4"
                    [(ngModel)]="form.vision"
                    placeholder="Our vision statement…"
                  ></textarea>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Crafting Process</label>
                <textarea
                  class="form-textarea"
                  rows="4"
                  [(ngModel)]="form.craftingProcess"
                  placeholder="Describe your crafting process…"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Owner / Designer Profile -->
          <div class="card" style="margin-bottom:24px">
            <div class="card-header">
              <h3>Meet the Designer</h3>
              <span class="card-hint"
                >Add a personal touch — show the face behind Complementary
                Fashions</span
              >
            </div>
            <div class="card-body">
              <div
                style="display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:start"
              >
                <div class="form-group">
                  <label class="form-label">Owner Photo</label>
                  <div class="owner-upload" (click)="ownerInput.click()">
                    @if (form.ownerImageUrl) {
                      <img
                        [src]="resolveUrl(form.ownerImageUrl)"
                        class="owner-preview-img"
                      />
                      <div class="owner-overlay">Change Photo</div>
                    } @else {
                      <div class="owner-placeholder-icon">👤</div>
                      <p
                        style="font-size:0.8125rem;color:var(--color-text-secondary);margin-top:8px"
                      >
                        Upload photo
                      </p>
                    }
                  </div>
                  <input
                    #ownerInput
                    type="file"
                    accept="image/*"
                    style="display:none"
                    (change)="uploadFile($event, 'ownerImageUrl')"
                  />
                </div>
                <div>
                  <div class="form-group">
                    <label class="form-label">Owner / Designer Name</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.ownerName"
                      placeholder="e.g. Jane Wanjiku"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Personal Story / Bio</label>
                    <textarea
                      class="form-textarea"
                      rows="6"
                      [(ngModel)]="form.ownerBio"
                      placeholder="Share the story of the person behind the brand — your journey, passion for crochet, inspiration…"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="card" style="margin-bottom:24px">
            <div class="card-header"><h3>Contact Information</h3></div>
            <div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input
                    class="form-input"
                    type="email"
                    [(ngModel)]="form.contactEmail"
                    placeholder="hello@yourstore.com"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.contactPhone"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Address</label>
                  <textarea
                    class="form-textarea"
                    rows="2"
                    [(ngModel)]="form.contactAddress"
                    placeholder="Physical address…"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div class="card">
            <div class="card-header"><h3>Social Media Links</h3></div>
            <div class="card-body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                  <label class="form-label">Instagram URL</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.instagramUrl"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Facebook URL</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.facebookUrl"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">TikTok URL</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.tiktokUrl"
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">WhatsApp Number</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.whatsappNumber"
                    placeholder="254700000000"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Twitter/X URL</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.twitterUrl"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (saved()) {
        <div class="save-toast">✅ Changes saved successfully!</div>
      }
    </div>
  `,
  styles: [
    `
      .card-hint {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-left: 12px;
      }
      .field-hint {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        margin-top: 4px;
      }
      .hero-preview {
        background: var(--color-bg);
        border: 1px dashed var(--color-border);
        border-radius: 8px;
        padding: 24px;
        margin-top: 12px;
        text-align: center;
      }
      .preview-label {
        font-size: 0.75rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
        display: block;
        margin-bottom: 8px;
      }
      .preview-title {
        font-size: 1.75rem;
        font-weight: 300;
        line-height: 1.3;
      }
      .preview-title em {
        font-style: italic;
      }
      .owner-upload {
        width: 200px;
        height: 200px;
        border: 2px dashed var(--color-border);
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        background: var(--color-bg);
      }
      .owner-upload:hover {
        border-color: var(--color-accent);
      }
      .owner-preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .owner-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .owner-upload:hover .owner-overlay {
        opacity: 1;
      }
      .owner-placeholder-icon {
        font-size: 3rem;
      }
      .save-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-success);
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        font-size: 0.9rem;
        animation: slide-in 0.3s ease;
        z-index: 9999;
      }
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class AdminAboutComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  form: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>("/about").subscribe({
      next: (data) => {
        this.form = { ...data };
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getHeroLine1() {
    const title =
      this.form.heroTitle || "Crafting Stories, One Stitch at a Time";
    const parts = title.split(",");
    return parts[0] + (parts.length > 1 ? "," : "");
  }

  getHeroLine2() {
    const title =
      this.form.heroTitle || "Crafting Stories, One Stitch at a Time";
    const idx = title.indexOf(",");
    return idx !== -1 ? title.substring(idx + 1).trim() : "";
  }

  uploadFile(event: any, field: string) {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("files", file);
    this.api.upload("/uploads/images", fd).subscribe({
      next: (res: any) => (this.form[field] = res[0]?.url || res.url),
      error: (err) => {
        console.error("Upload failed:", err);
        alert(
          "Upload failed: " +
            (err.error?.message || err.message || "Unknown error"),
        );
      },
    });
  }

  save() {
    this.saving.set(true);
    this.api.put("/about", this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        alert("Failed to save changes");
      },
    });
  }

  resolveUrl(url: string) {
    if (!url) return "";
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
  }
}
