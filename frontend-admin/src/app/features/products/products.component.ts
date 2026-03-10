import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-sub">{{ total() }} products in catalogue</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          + Add Product
        </button>
      </div>

      <!-- Filters -->
      <div
        class="filters-bar card"
        style="padding:16px 20px;margin-bottom:20px;display:flex;gap:12px;flex-wrap:wrap;align-items:center"
      >
        <input
          class="form-input"
          style="max-width:260px"
          placeholder="Search products…"
          [(ngModel)]="search"
          (input)="loadProducts()"
        />
        <select
          class="form-select"
          style="max-width:200px"
          [(ngModel)]="categoryFilter"
          (change)="loadProducts()"
        >
          <option value="">All Categories</option>
          @for (cat of categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
        <select
          class="form-select"
          style="max-width:160px"
          [(ngModel)]="availabilityFilter"
          (change)="loadProducts()"
        >
          <option value="">All Status</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Status</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr>
                    <td colspan="7">
                      <div
                        class="skeleton"
                        style="height:20px;margin:8px 0"
                      ></div>
                    </td>
                  </tr>
                }
              }
              @for (product of products(); track product.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:12px">
                      <div class="product-thumb">
                        <img
                          [src]="getPrimaryImage(product)"
                          [alt]="product.name"
                        />
                      </div>
                      <div>
                        <div style="font-weight:500">{{ product.name }}</div>
                        <div
                          style="font-size:0.75rem;color:var(--color-text-muted)"
                        >
                          {{ product.id.slice(0, 8) }}…
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{{ product.category?.name || "—" }}</td>
                  <td
                    style="font-family:var(--font-display);color:var(--color-accent)"
                  >
                    KSh {{ product.price | number: "1.0-0" }}
                  </td>
                  <td>
                    <span [class]="getStockClass(product)">
                      {{ getStockDisplay(product) }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="star-btn"
                      (click)="toggleFeatured(product)"
                      [title]="product.isFeatured ? 'Unfeature' : 'Feature'"
                    >
                      {{ product.isFeatured ? "⭐" : "☆" }}
                    </button>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="
                        product.isAvailable ? 'badge-success' : 'badge-muted'
                      "
                    >
                      {{ product.isAvailable ? "Active" : "Hidden" }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;gap:6px;justify-content:flex-end">
                      <button
                        class="btn-icon btn-sm"
                        (click)="editProduct(product)"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        class="btn-icon btn-sm"
                        style="color:var(--color-error)"
                        (click)="deleteProduct(product.id)"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (!loading() && !products().length) {
                <tr>
                  <td
                    colspan="7"
                    style="text-align:center;padding:48px;color:var(--color-text-muted)"
                  >
                    No products found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div
            style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--color-border)"
          >
            <span style="font-size:0.875rem;color:var(--color-text-muted)"
              >Page {{ page() }} of {{ totalPages() }}</span
            >
            <div class="pagination">
              <button
                class="page-btn"
                [disabled]="page() === 1"
                (click)="goPage(page() - 1)"
              >
                ‹
              </button>
              @for (p of getPages(); track p) {
                <button
                  class="page-btn"
                  [class.active]="p === page()"
                  (click)="goPage(p)"
                >
                  {{ p }}
                </button>
              }
              <button
                class="page-btn"
                [disabled]="page() === totalPages()"
                (click)="goPage(page() + 1)"
              >
                ›
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Product Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">
                {{ editing ? "Edit Product" : "Add New Product" }}
              </h2>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Product Name *</label>
                  <input
                    class="form-input"
                    [(ngModel)]="form.name"
                    placeholder="e.g. Sunset Crochet Top"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select class="form-select" [(ngModel)]="form.categoryId">
                    <option value="">Select category</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea
                  class="form-textarea"
                  [(ngModel)]="form.description"
                  placeholder="Describe this piece…"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Price (KSh) *</label>
                  <input
                    class="form-input"
                    type="number"
                    [(ngModel)]="form.price"
                    placeholder="0.00"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Stock Quantity</label>
                  <input
                    class="form-input"
                    type="number"
                    [(ngModel)]="form.stockQuantity"
                    placeholder="0"
                  />
                </div>
              </div>

              <!-- Images -->
              <div class="form-group">
                <label class="form-label">Images</label>
                <div
                  class="upload-area"
                  (click)="imageInput.click()"
                  [class.dragging]="dragging"
                >
                  <div class="upload-icon">📷</div>
                  <p
                    style="font-size:0.875rem;color:var(--color-text-secondary)"
                  >
                    Click to upload images
                  </p>
                  <p style="font-size:0.75rem;color:var(--color-text-muted)">
                    JPG, PNG, WebP — max 10MB each
                  </p>
                </div>
                <input
                  #imageInput
                  type="file"
                  multiple
                  accept="image/*"
                  style="display:none"
                  (change)="onImagesSelected($event)"
                />

                @if (uploadingImages()) {
                  <div
                    style="margin-top:8px;color:var(--color-text-muted);font-size:0.875rem"
                  >
                    Uploading…
                  </div>
                }

                @if (form.images.length) {
                  <div class="image-previews">
                    @for (img of form.images; track i; let i = $index) {
                      <div class="image-preview">
                        <img [src]="resolveUrl(img)" alt="" />
                        <button class="remove-image" (click)="removeImage(i)">
                          ✕
                        </button>
                        @if (i === 0) {
                          <span class="primary-badge">Primary</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Variants / Sizes -->
              <div class="form-group">
                <label class="form-label">Sizes / Variants</label>
                @for (variant of form.variants; track i; let i = $index) {
                  <div class="variant-row">
                    <input
                      class="form-input"
                      [(ngModel)]="variant.size"
                      placeholder="Size (e.g. S, M, L, XL)"
                    />
                    <input
                      class="form-input"
                      [(ngModel)]="variant.color"
                      placeholder="Color (optional)"
                    />
                    <input
                      class="form-input"
                      type="number"
                      [(ngModel)]="variant.stockQuantity"
                      placeholder="Stock"
                    />
                    <button class="btn-icon" (click)="removeVariant(i)">
                      ✕
                    </button>
                  </div>
                }
                <button
                  class="btn btn-ghost btn-sm"
                  style="margin-top:8px"
                  (click)="addVariant()"
                >
                  + Add Size/Variant
                </button>
              </div>

              <!-- Toggles -->
              <div class="form-row">
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="form.isFeatured" />
                  Featured product
                </label>
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="form.isAvailable" />
                  Available for sale
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="closeModal()">
                Cancel
              </button>
              <button
                class="btn btn-primary"
                [disabled]="saving()"
                (click)="saveProduct()"
              >
                {{
                  saving()
                    ? "Saving…"
                    : editing
                      ? "Update Product"
                      : "Create Product"
                }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .product-thumb {
        width: 48px;
        height: 56px;
        border-radius: 8px;
        overflow: hidden;
        background: var(--color-surface-2);
        flex-shrink: 0;
      }
      .product-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .star-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.125rem;
        padding: 4px;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .modal-form {
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 4px;
      }
      .image-previews {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 10px;
      }
      .image-preview {
        position: relative;
        width: 80px;
        height: 90px;
        border-radius: 8px;
        overflow: hidden;
        border: 1.5px solid var(--color-border);
      }
      .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .remove-image {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.625rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .primary-badge {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(192, 98, 46, 0.85);
        color: white;
        font-size: 0.6rem;
        text-align: center;
        padding: 2px;
      }
      .variant-row {
        display: grid;
        grid-template-columns: 2fr 2fr 1fr auto;
        gap: 8px;
        margin-bottom: 8px;
        align-items: center;
      }
      .toggle-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        cursor: pointer;
      }
      .toggle-label input {
        accent-color: var(--color-accent);
        width: 16px;
        height: 16px;
      }
      @media (max-width: 640px) {
        .form-row {
          grid-template-columns: 1fr;
        }
        .variant-row {
          grid-template-columns: 1fr auto;
        }
      }
    `,
  ],
})
export class AdminProductsComponent implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  uploadingImages = signal(false);
  dragging = false;
  editing: any = null;
  search = "";
  categoryFilter = "";
  availabilityFilter = "";
  page = signal(1);
  total = signal(0);
  limit = 15;
  totalPages = signal(1);

  form: any = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  emptyForm() {
    return {
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryId: "",
      images: [],
      variants: [],
      isFeatured: false,
      isAvailable: true,
    };
  }

  loadProducts() {
    this.loading.set(true);
    const params: any = { page: this.page(), limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.categoryFilter) params.categoryId = this.categoryFilter;
    if (this.availabilityFilter !== "")
      params.isAvailable = this.availabilityFilter;

    this.api.get<any>("/products", params).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCategories() {
    this.api
      .get<any[]>("/categories")
      .subscribe({ next: (c) => this.categories.set(c) });
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

  editProduct(product: any) {
    this.editing = product;
    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      images: product.images?.map((i: any) => i.imageUrl) || [],
      variants:
        product.variants?.map((v: any) => ({
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity,
        })) || [],
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
    };
    this.showModal.set(true);
  }

  async onImagesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files.length) return;
    this.uploadingImages.set(true);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    this.api.upload("/uploads/images", formData).subscribe({
      next: (res: any[]) => {
        this.form.images.push(...res.map((r: any) => r.url));
        this.uploadingImages.set(false);
      },
      error: () => {
        alert("Image upload failed");
        this.uploadingImages.set(false);
      },
    });
  }

  removeImage(index: number) {
    this.form.images.splice(index, 1);
  }
  addVariant() {
    this.form.variants.push({ size: "", color: "", stockQuantity: 0 });
  }

  getStockDisplay(product: any): string {
    const qty = Math.max(0, product.stockQuantity || 0);
    return qty.toString();
  }

  getStockClass(product: any): string {
    const qty = Math.max(0, product.stockQuantity || 0);
    if (qty === 0) return "badge badge-error";
    if (qty <= 3) return "badge badge-warning";
    return "badge badge-success";
  }
  removeVariant(index: number) {
    this.form.variants.splice(index, 1);
  }

  saveProduct() {
    if (!this.form.name || !this.form.categoryId || !this.form.price) {
      alert("Please fill in Name, Category and Price");
      return;
    }
    this.saving.set(true);
    const req = this.editing
      ? this.api.put(`/products/${this.editing.id}`, this.form)
      : this.api.post("/products", this.form);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadProducts();
      },
      error: () => {
        this.saving.set(false);
        alert("Failed to save product");
      },
    });
  }

  toggleFeatured(product: any) {
    this.api
      .put(`/products/${product.id}`, { isFeatured: !product.isFeatured })
      .subscribe({
        next: () => this.loadProducts(),
      });
  }

  deleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    this.api
      .delete(`/products/${id}`)
      .subscribe({ next: () => this.loadProducts() });
  }

  getPrimaryImage(product: any) {
    const img =
      product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
    return this.resolveUrl(img?.imageUrl || "");
  }

  resolveUrl(url: string) {
    if (!url)
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="56"%3E%3Crect width="48" height="56" fill="%23f0ede8"/%3E%3C/svg%3E';
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
  }

  goPage(p: number) {
    this.page.set(p);
    this.loadProducts();
  }
  getPages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages.slice(Math.max(0, this.page() - 3), this.page() + 2);
  }
}
