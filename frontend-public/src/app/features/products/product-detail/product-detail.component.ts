import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProductsService } from "../../../core/services/products.service";
import { CartService } from "../../../core/services/cart.service";
import { FavoritesService } from "../../../core/services/favorites.service";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <div class="product-detail-page page-enter">
      @if (loading()) {
        <div class="container" style="padding-top:120px; padding-bottom:80px;">
          <div class="detail-layout">
            <div
              class="skeleton"
              style="aspect-ratio:3/4;border-radius:16px;"
            ></div>
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div class="skeleton" style="height:48px;width:60%;"></div>
              <div class="skeleton" style="height:24px;width:40%;"></div>
              <div class="skeleton" style="height:120px;"></div>
            </div>
          </div>
        </div>
      } @else if (product()) {
        <div class="container detail-container">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <a routerLink="/">Home</a> / <a routerLink="/products">Shop</a> /
            <span>{{ product().name }}</span>
          </nav>

          <div class="detail-layout">
            <!-- Images -->
            <div class="images-panel">
              <div class="main-image">
                <img
                  [src]="getImageUrl(selectedImage())"
                  [alt]="product().name"
                />
              </div>
              @if (product().images?.length > 1) {
                <div class="thumbnail-strip">
                  @for (img of product().images; track img.id) {
                    <button
                      class="thumb"
                      [class.active]="selectedImage() === img.imageUrl"
                      (click)="selectedImage.set(img.imageUrl)"
                    >
                      <img
                        [src]="getImageUrl(img.imageUrl)"
                        [alt]="product().name"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="info-panel">
              <div class="product-meta">
                <span class="product-category">{{
                  product().category?.name
                }}</span>
                @if (product().isFeatured) {
                  <span class="badge badge-gold">Featured</span>
                }
              </div>

              <h1 class="product-title">{{ product().name }}</h1>

              <div class="price-section">
                <span class="price"
                  >KSh {{ product().price | number: "1.0-0" }}</span
                >
                <span
                  class="stock-status"
                  [class.in-stock]="product().stockQuantity > 0"
                  [class.out-stock]="product().stockQuantity === 0"
                >
                  {{
                    product().stockQuantity > 0
                      ? "✓ In Stock (" + product().stockQuantity + ")"
                      : "✕ Out of Stock"
                  }}
                </span>
              </div>

              <div class="product-desc">
                <p>{{ product().description }}</p>
              </div>

              @if (product().variants?.length) {
                <div class="variants-section">
                  <div class="variant-label">Select Size</div>
                  <div class="size-options">
                    @for (v of product().variants; track v.id) {
                      <button
                        class="size-btn"
                        [class.selected]="selectedVariant()?.id === v.id"
                        [class.unavailable]="v.stockQuantity === 0"
                        [disabled]="v.stockQuantity === 0"
                        (click)="selectedVariant.set(v)"
                      >
                        {{ v.size }}
                        @if (v.color) {
                          <span class="size-color">{{ v.color }}</span>
                        }
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="qty-section">
                <div class="variant-label">Quantity</div>
                <div class="qty-control">
                  <button class="qty-btn" (click)="decrementQty()">−</button>
                  <span class="qty-val">{{ qty() }}</span>
                  <button class="qty-btn" (click)="incrementQty()">+</button>
                </div>
              </div>

              <div class="action-buttons">
                <button
                  class="btn btn-primary btn-lg"
                  [disabled]="
                    !product().isAvailable ||
                    product().stockQuantity === 0 ||
                    adding()
                  "
                  (click)="addToCart()"
                >
                  {{ adding() ? "Adding..." : "🛒 Add to Cart" }}
                </button>
                <button
                  class="btn fav-action-btn"
                  [class.favorited]="isFavorited()"
                  (click)="toggleFavorite()"
                >
                  {{ isFavorited() ? "♥" : "♡" }}
                </button>
              </div>

              <div class="product-meta-info">
                <div class="meta-row">
                  <span>Category:</span>
                  <strong>{{ product().category?.name }}</strong>
                </div>
                <div class="meta-row">
                  <span>Availability:</span>
                  <strong>{{
                    product().isAvailable ? "Available" : "Unavailable"
                  }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        @if (related().length) {
          <section class="section related-section">
            <div class="container">
              <div class="section-header">
                <span class="section-label">You May Also Like</span>
                <h2 class="section-title">Related Pieces</h2>
                <div class="section-divider"></div>
              </div>
              <div class="product-grid">
                @for (p of related(); track p.id) {
                  <app-product-card [product]="p"></app-product-card>
                }
              </div>
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [
    `
      .product-detail-page {
        padding-top: 100px;
      }
      .detail-container {
        padding-top: 24px;
        padding-bottom: 80px;
      }
      .breadcrumb {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-bottom: 40px;
      }
      .breadcrumb a {
        color: var(--color-text-muted);
        text-decoration: none;
      }
      .breadcrumb a:hover {
        color: var(--color-accent);
      }
      .breadcrumb span {
        color: var(--color-text);
      }
      .detail-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        align-items: start;
      }
      .main-image {
        border-radius: var(--radius-md);
        overflow: hidden;
        aspect-ratio: 3/4;
        background: var(--color-surface-2);
      }
      .main-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumbnail-strip {
        display: flex;
        gap: 10px;
        margin-top: 16px;
        overflow-x: auto;
      }
      .thumb {
        width: 72px;
        height: 90px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid var(--color-border);
        cursor: pointer;
        flex-shrink: 0;
        transition: border-color 0.3s;
        background: none;
        padding: 0;
      }
      .thumb.active {
        border-color: var(--color-accent);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .product-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .product-category {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-accent);
      }
      .product-title {
        font-style: italic;
        margin-bottom: 20px;
        line-height: 1.15;
      }
      .price-section {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .price {
        font-size: 2rem;
      }
      .stock-status {
        font-size: 0.875rem;
        font-weight: 500;
        padding: 4px 12px;
        border-radius: 20px;
      }
      .in-stock {
        background: rgba(93, 138, 110, 0.1);
        color: var(--color-success);
      }
      .out-stock {
        background: rgba(201, 74, 58, 0.1);
        color: var(--color-error);
      }
      .product-desc {
        margin-bottom: 28px;
      }
      .product-desc p {
        line-height: 1.8;
        font-size: 1rem;
      }
      .variants-section,
      .qty-section {
        margin-bottom: 24px;
      }
      .variant-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-secondary);
        margin-bottom: 12px;
      }
      .size-options {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .size-btn {
        padding: 8px 18px;
        border-radius: 8px;
        border: 1.5px solid var(--color-border);
        font-family: var(--font-body);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        background: var(--color-surface);
        color: var(--color-text);
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .size-btn.selected {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
      .size-btn.unavailable {
        opacity: 0.4;
        cursor: not-allowed;
        text-decoration: line-through;
      }
      .size-color {
        font-size: 0.7rem;
        color: inherit;
        opacity: 0.7;
      }
      .qty-control {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .qty-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1.5px solid var(--color-border);
        background: var(--color-surface);
        font-size: 1.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        color: var(--color-text);
      }
      .qty-btn:hover {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
      .qty-val {
        font-family: var(--font-display);
        font-size: 1.25rem;
        min-width: 32px;
        text-align: center;
      }
      .action-buttons {
        display: flex;
        gap: 12px;
        margin-bottom: 28px;
      }
      .action-buttons .btn-primary {
        flex: 1;
      }
      .fav-action-btn {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        padding: 0;
        border: 1.5px solid var(--color-border);
        background: var(--color-surface);
        font-size: 1.25rem;
        cursor: pointer;
        transition: all 0.3s;
        color: var(--color-text-muted);
      }
      .fav-action-btn.favorited {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
      .fav-action-btn:hover:not(.favorited) {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }
      .product-meta-info {
        border-top: 1px solid var(--color-border);
        padding-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .meta-row {
        display: flex;
        gap: 8px;
        font-size: 0.875rem;
      }
      .meta-row span {
        color: var(--color-text-secondary);
      }
      .related-section {
        background: var(--color-surface);
      }
      @media (max-width: 900px) {
        .detail-layout {
          grid-template-columns: 1fr;
          gap: 32px;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  related = signal<any[]>([]);
  selectedImage = signal<string>("");
  selectedVariant = signal<any>(null);
  qty = signal(1);

  incrementQty() {
    this.qty.update((q) => q + 1);
  }
  decrementQty() {
    this.qty.set(Math.max(1, this.qty() - 1));
  }
  loading = signal(true);
  adding = signal(false);
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private productsSvc: ProductsService,
    private cart: CartService,
    private favorites: FavoritesService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(({ id }) => {
      this.loading.set(true);
      this.productsSvc.getOne(id).subscribe({
        next: (p) => {
          this.product.set(p);
          const primary =
            p.images?.find((i: any) => i.isPrimary) || p.images?.[0];
          this.selectedImage.set(primary?.imageUrl || "");
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.productsSvc
        .getRelated(id)
        .subscribe((r) => this.related.set(r || []));
    });
  }

  getImageUrl(url: string) {
    return url?.startsWith("http") ? url : `http://localhost:3000${url}`;
  }
  isFavorited() {
    return this.favorites.isFavorited(this.product()?.id);
  }

  toggleFavorite() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/auth/login"]);
      return;
    }
    this.favorites.toggle(this.product().id).subscribe();
  }

  addToCart() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/auth/login"]);
      return;
    }
    this.adding.set(true);
    this.cart
      .addItem(this.product().id, this.selectedVariant()?.id, this.qty())
      .subscribe({
        next: () => {
          this.toast.success("Added to cart!");
          this.adding.set(false);
        },
        error: () => {
          this.toast.error("Failed to add to cart");
          this.adding.set(false);
        },
      });
  }
}
