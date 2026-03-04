import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="categories-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Categories</h1>
          <p class="page-sub">{{ categories().length }} categories</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">+ Add Category</button>
      </div>

      <div class="categories-grid">
        @if (loading()) {
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton" style="height:200px;border-radius:12px"></div>
          }
        }
        @for (cat of categories(); track cat.id) {
          <div class="cat-card card">
            <div class="cat-image">
              @if (cat.image) {
                <img [src]="resolveUrl(cat.image)" [alt]="cat.name">
              } @else {
                <div class="cat-placeholder">🏷️</div>
              }
              <div class="cat-overlay">
                <button class="btn btn-sm btn-primary" (click)="editCat(cat)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="deleteCat(cat.id)">Delete</button>
              </div>
            </div>
            <div class="cat-info">
              <h4>{{ cat.name }}</h4>
              <p>{{ cat.products?.length || 0 }} products</p>
              <span class="badge" [class]="cat.isActive ? 'badge-success' : 'badge-muted'">
                {{ cat.isActive ? 'Active' : 'Hidden' }}
              </span>
            </div>
          </div>
        }
        @if (!loading() && !categories().length) {
          <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:60px 0">
            <p style="color:var(--color-text-muted)">No categories yet. Add your first one!</p>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editing ? 'Edit Category' : 'New Category' }}</h2>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>

            <div class="form-group">
              <label class="form-label">Category Name *</label>
              <input class="form-input" [(ngModel)]="form.name" placeholder="e.g. Tops, Dresses…">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" [(ngModel)]="form.description" placeholder="Brief description"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Category Image</label>
              <div class="upload-area" (click)="imgInput.click()">
                @if (form.image) {
                  <img [src]="resolveUrl(form.image)" style="max-height:120px;border-radius:8px;margin:0 auto">
                } @else {
                  <div class="upload-icon">🖼️</div>
                  <p style="font-size:0.875rem;color:var(--color-text-secondary)">Click to upload image</p>
                }
              </div>
              <input #imgInput type="file" accept="image/*" style="display:none" (change)="onImageSelected($event)">
              @if (uploading()) { <p style="font-size:0.8rem;color:var(--color-text-muted);margin-top:6px">Uploading…</p> }
            </div>
            <div class="form-group">
              <label class="form-label">Display Order</label>
              <input class="form-input" type="number" [(ngModel)]="form.displayOrder" placeholder="0">
            </div>
            <label class="toggle-label" style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" [(ngModel)]="form.isActive" style="accent-color:var(--color-accent)">
              Active (visible on storefront)
            </label>

            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
              <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
                {{ saving() ? 'Saving…' : 'Save Category' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .cat-card { overflow: hidden; transition: box-shadow 0.2s; }
    .cat-card:hover { box-shadow: var(--shadow-md); }
    .cat-image { position: relative; aspect-ratio: 4/3; background: var(--color-surface-2); overflow: hidden; }
    .cat-image img { width: 100%; height: 100%; object-fit: cover; }
    .cat-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
    .cat-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity 0.2s; }
    .cat-card:hover .cat-overlay { opacity: 1; }
    .cat-info { padding: 14px; }
    .cat-info h4 { font-size: 1.0625rem; margin-bottom: 4px; }
    .cat-info p { font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 8px; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  uploading = signal(false);
  editing: any = null;

  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  emptyForm() { return { name: '', description: '', image: '', displayOrder: 0, isActive: true }; }

  load() {
    this.loading.set(true);
    this.api.get<any[]>('/categories/admin').subscribe({
      next: (c) => { this.categories.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openModal() { this.form = this.emptyForm(); this.editing = null; this.showModal.set(true); }
  closeModal() { this.showModal.set(false); this.editing = null; }

  editCat(cat: any) {
    this.editing = cat;
    this.form = { name: cat.name, description: cat.description || '', image: cat.image || '', displayOrder: cat.displayOrder, isActive: cat.isActive };
    this.showModal.set(true);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading.set(true);
    const fd = new FormData();
    fd.append('file', file);
    this.api.upload('/uploads/image', fd).subscribe({
      next: (res: any) => { this.form.image = res.url; this.uploading.set(false); },
      error: () => { alert('Upload failed'); this.uploading.set(false); },
    });
  }

  save() {
    if (!this.form.name) { alert('Category name is required'); return; }
    this.saving.set(true);
    const req = this.editing
      ? this.api.put(`/categories/${this.editing.id}`, this.form)
      : this.api.post('/categories', this.form);
    req.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => { this.saving.set(false); alert('Failed to save'); },
    });
  }

  deleteCat(id: string) {
    if (!confirm('Delete this category?')) return;
    this.api.delete(`/categories/${id}`).subscribe({ next: () => this.load() });
  }

  resolveUrl(url: string) {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl.replace('/api', '')}${url}`;
  }
}
