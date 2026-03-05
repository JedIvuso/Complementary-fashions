import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { ProductsService } from "../../../core/services/products.service";
import { CategoriesService } from "../../../core/services/categories.service";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="products-page page-enter">
      <div class="page-header">
        <div class="container">
          <span class="section-label">Collection</span>
          <h1>All Products</h1>
        </div>
      </div>

      <div class="container products-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar" [class.open]="filtersOpen()">
          <div class="filters-header">
            <h3>Filters</h3>
            <button class="close-filters" (click)="filtersOpen.set(false)">
              ✕
            </button>
          </div>

          <div class="filter-group">
            <label class="filter-label">Search</label>
            <input
              class="form-input"
              placeholder="Search products..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select
              class="form-select"
              [(ngModel)]="selectedCategory"
              (change)="applyFilters()"
            >
              <option value="">All Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Price Range</label>
            <div class="price-range">
              <input
                class="form-input"
                type="number"
                placeholder="Min"
                [(ngModel)]="minPrice"
                (change)="applyFilters()"
              />
              <span>—</span>
              <input
                class="form-input"
                type="number"
                placeholder="Max"
                [(ngModel)]="maxPrice"
                (change)="applyFilters()"
              />
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <select
              class="form-select"
              [(ngModel)]="sortBy"
              (change)="applyFilters()"
            >
              <option value="createdAt">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>

          <button
            class="btn btn-secondary"
            style="width:100%;margin-top:16px"
            (click)="resetFilters()"
          >
            Clear Filters
          </button>
        </aside>

        <!-- Products Content -->
        <main class="products-content">
          <div class="products-toolbar">
            <button
              class="btn btn-secondary btn-sm"
              (click)="filtersOpen.set(true)"
            >
              ☰ Filters
            </button>
            <span class="results-count">{{ total() }} products found</span>
          </div>

          @if (loading()) {
            <div class="product-grid">
              @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                <div
                  class="skeleton"
                  style="height:420px;border-radius:16px;"
                ></div>
              }
            </div>
          } @else if (products().length) {
            <div class="product-grid">
              @for (p of products(); track p.id) {
                <app-product-card [product]="p"></app-product-card>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="pagination">
                <button
                  class="btn btn-secondary btn-sm"
                  [disabled]="currentPage() <= 1"
                  (click)="goToPage(currentPage() - 1)"
                >
                  ‹ Prev
                </button>
                @for (p of getPages(); track p) {
                  <button
                    class="btn btn-sm"
                    [class.btn-primary]="p === currentPage()"
                    [class.btn-secondary]="p !== currentPage()"
                    (click)="goToPage(p)"
                  >
                    {{ p }}
                  </button>
                }
                <button
                  class="btn btn-secondary btn-sm"
                  [disabled]="currentPage() >= totalPages()"
                  (click)="goToPage(currentPage() + 1)"
                >
                  Next ›
                </button>
              </div>
            }
          } @else {
            <div class="empty-state">
              <div class="empty-icon">🧶</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query</p>
              <button class="btn btn-outline-accent" (click)="resetFilters()">
                Reset Filters
              </button>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        padding: 120px 0 48px;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
      }
      .page-header h1 {
        font-style: italic;
      }
      .products-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 40px;
        padding-top: 40px;
        padding-bottom: 80px;
        align-items: start;
      }
      .filters-sidebar {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 28px;
        position: sticky;
        top: 100px;
      }
      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .filters-header h3 {
        font-family: var(--font-display);
        font-size: 1.25rem;
      }
      .close-filters {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.25rem;
        color: var(--color-text-muted);
      }
      .filter-group {
        margin-bottom: 24px;
      }
      .filter-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-secondary);
        margin-bottom: 10px;
      }
      .price-range {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .price-range .form-input {
        width: 100%;
      }
      .products-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .results-count {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 48px;
        flex-wrap: wrap;
      }
      .empty-state {
        text-align: center;
        padding: 80px 0;
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 16px;
      }
      .empty-state h3 {
        font-family: var(--font-display);
        font-size: 1.75rem;
        margin-bottom: 8px;
      }
      @media (max-width: 900px) {
        .products-layout {
          grid-template-columns: 1fr;
        }
        .filters-sidebar {
          position: fixed;
          inset-y: 0;
          left: -100%;
          width: 80%;
          max-width: 300px;
          z-index: 200;
          transition: left 0.3s;
          border-radius: 0;
          overflow-y: auto;
        }
        .filters-sidebar.open {
          left: 0;
        }
        .close-filters {
          display: block;
        }
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  filtersOpen = signal(false);
  searchQuery = "";
  selectedCategory = "";
  minPrice: any = null;
  maxPrice: any = null;
  sortBy = "createdAt";
  private searchTimeout: any;

  constructor(
    private productsSvc: ProductsService,
    private catsSvc: CategoriesService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.catsSvc.getAll().subscribe((c) => this.categories.set(c));
    this.route.queryParams.subscribe((params) => {
      if (params["categoryId"]) this.selectedCategory = params["categoryId"];
      if (params["search"]) this.searchQuery = params["search"];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    const [sortField, sortDir] =
      this.sortBy === "price-asc"
        ? ["price", "ASC"]
        : this.sortBy === "price-desc"
          ? ["price", "DESC"]
          : this.sortBy === "popularity"
            ? ["popularity", "DESC"]
            : ["createdAt", "DESC"];
    const params: any = {
      page: this.currentPage(),
      limit: 12,
      sortBy: sortField,
      sortDir,
    };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedCategory) params.categoryId = this.selectedCategory;
    if (this.minPrice) params.minPrice = this.minPrice;
    if (this.maxPrice) params.maxPrice = this.maxPrice;
    this.productsSvc.getAll(params).subscribe({
      next: (res: any) => {
        this.products.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadProducts();
  }
  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 500);
  }
  resetFilters() {
    this.searchQuery = "";
    this.selectedCategory = "";
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = "createdAt";
    this.applyFilters();
  }
  goToPage(p: number) {
    this.currentPage.set(p);
    this.loadProducts();
  }
  getPages() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1).filter(
      (p) => Math.abs(p - this.currentPage()) <= 2,
    );
  }
}
