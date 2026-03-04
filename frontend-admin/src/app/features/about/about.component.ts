import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="about-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">About & Branding</h1>
          <p class="page-sub">Manage your brand story, contact info and social links</p>
        </div>
        <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
          {{ saving() ? 'Saving…' : 'Save All Changes' }}
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
                      <img [src]="resolveUrl(form.logoUrl)" style="max-height:80px;margin:0 auto">
                    } @else {
                      <div class="upload-icon">🏷️</div>
                      <p style="font-size:0.875rem;color:var(--color-text-secondary)">Upload logo</p>
                    }
                  </div>
                  <input #logoInput type="file" accept="image/*" style="display:none" (change)="uploadFile($event, 'logoUrl')">
                </div>
                <div>
                  <div class="form-group">
                    <label class="form-label">Favicon</label>
                    <div class="upload-area" style="padding:16px" (click)="faviconInput.click()">
                      @if (form.faviconUrl) {
                        <img [src]="resolveUrl(form.faviconUrl)" style="max-height:48px;margin:0 auto">
                      } @else {
                        <p style="font-size:0.8125rem;color:var(--color-text-secondary)">Upload favicon (32×32)</p>
                      }
                    </div>
                    <input #faviconInput type="file" accept="image/*" style="display:none" (change)="uploadFile($event, 'faviconUrl')">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Accent Colour</label>
                    <div style="display:flex;gap:10px;align-items:center">
                      <input type="color" [(ngModel)]="form.accentColor" style="width:48px;height:36px;border-radius:6px;border:1px solid var(--color-border);cursor:pointer">
                      <input class="form-input" [(ngModel)]="form.accentColor" placeholder="#d4a373" style="flex:1">
                    </div>
                  </div>
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
                <textarea class="form-textarea" rows="5" [(ngModel)]="form.brandStory" placeholder="Tell your brand story…"></textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                  <label class="form-label">Mission</label>
                  <textarea class="form-textarea" rows="4" [(ngModel)]="form.mission" placeholder="Our mission statement…"></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Vision</label>
                  <textarea class="form-textarea" rows="4" [(ngModel)]="form.vision" placeholder="Our vision statement…"></textarea>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Crafting Process</label>
                <textarea class="form-textarea" rows="4" [(ngModel)]="form.craftingProcess" placeholder="Describe your crafting process…"></textarea>
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
                  <input class="form-input" type="email" [(ngModel)]="form.contactEmail" placeholder="hello@yourstore.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input class="form-input" [(ngModel)]="form.contactPhone" placeholder="+254 700 000 000">
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Address</label>
                  <textarea class="form-textarea" rows="2" [(ngModel)]="form.contactAddress" placeholder="Physical address…"></textarea>
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
                  <input class="form-input" [(ngModel)]="form.instagramUrl" placeholder="https://instagram.com/yourhandle">
                </div>
                <div class="form-group">
                  <label class="form-label">Facebook URL</label>
                  <input class="form-input" [(ngModel)]="form.facebookUrl" placeholder="https://facebook.com/yourpage">
                </div>
                <div class="form-group">
                  <label class="form-label">TikTok URL</label>
                  <input class="form-input" [(ngModel)]="form.tiktokUrl" placeholder="https://tiktok.com/@yourhandle">
                </div>
                <div class="form-group">
                  <label class="form-label">WhatsApp Number</label>
                  <input class="form-input" [(ngModel)]="form.whatsappNumber" placeholder="254700000000">
                </div>
                <div class="form-group">
                  <label class="form-label">Twitter/X URL</label>
                  <input class="form-input" [(ngModel)]="form.twitterUrl" placeholder="https://twitter.com/yourhandle">
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
  styles: [`
    .save-toast {
      position: fixed; bottom: 24px; right: 24px;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-success);
      padding: 14px 20px; border-radius: 8px;
      box-shadow: var(--shadow-lg); font-size: 0.9rem;
      animation: slide-in 0.3s ease;
    }
    @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class AdminAboutComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  form: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('/about').subscribe({
      next: (data) => { this.form = { ...data }; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  uploadFile(event: any, field: string) {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    this.api.upload('/uploads/image', fd).subscribe({
      next: (res: any) => this.form[field] = res.url,
      error: () => alert('Upload failed'),
    });
  }

  save() {
    this.saving.set(true);
    this.api.put('/about', this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => { this.saving.set(false); alert('Failed to save changes'); },
    });
  }

  resolveUrl(url: string) {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
