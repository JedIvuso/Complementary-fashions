import { Component, Input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { CartService } from "../../../core/services/cart.service";
import { FavoritesService } from "../../../core/services/favorites.service";
import { ToastService } from "../../../core/services/toast.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="product-card">
      <div class="product-image" [routerLink]="['/products', product.id]">
        <img [src]="getImage()" [alt]="product.name" loading="lazy" />
        @if (!product.isAvailable || product.stockQuantity === 0) {
          <div class="out-of-stock-badge">Out of Stock</div>
        }
        @if (product.isFeatured) {
          <div class="featured-badge">Featured</div>
        }
        <div class="product-overlay">
          <button class="quick-view-btn" (click)="quickView($event)">
            Quick View
          </button>
        </div>
      </div>

      <div class="product-info">
        <div class="product-category">{{ product.category?.name }}</div>
        <a [routerLink]="['/products', product.id]" class="product-name">{{
          product.name
        }}</a>
        <div class="product-footer">
          <span class="price">KSh {{ product.price | number: "1.0-0" }}</span>
          <div class="product-actions">
            <button
              class="action-btn fav-btn"
              [class.favorited]="isFavorited()"
              (click)="toggleFavorite($event)"
              title="Add to favorites"
            >
              {{ isFavorited() ? "♥" : "♡" }}
            </button>
            <button
              class="action-btn cart-btn-icon"
              [disabled]="!product.isAvailable || product.stockQuantity === 0"
              (click)="addToCart($event)"
              [class.loading]="adding()"
            >
              {{ adding() ? "..." : "🛒" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 1px solid var(--color-border);
        transition: all 0.35s ease;
        cursor: pointer;
      }
      .product-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-6px);
      }
      .product-image {
        position: relative;
        aspect-ratio: 3/4;
        overflow: hidden;
        background: var(--color-surface-2);
      }
      .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      .product-card:hover .product-image img {
        transform: scale(1.06);
      }
      .out-of-stock-badge,
      .featured-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .out-of-stock-badge {
        background: rgba(201, 74, 58, 0.9);
        color: white;
      }
      .featured-badge {
        background: rgba(201, 169, 110, 0.9);
        color: white;
        top: auto;
        bottom: 12px;
        left: 12px;
      }
      .product-overlay {
        position: absolute;
        inset: 0;
        background: rgba(44, 24, 16, 0.3);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 20px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .product-card:hover .product-overlay {
        opacity: 1;
      }
      .quick-view-btn {
        padding: 10px 24px;
        background: var(--color-surface);
        color: var(--color-text);
        border: none;
        border-radius: var(--radius-xl);
        font-family: var(--font-body);
        font-size: 0.8125rem;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        transform: translateY(10px);
        transition: transform 0.3s;
      }
      .product-card:hover .quick-view-btn {
        transform: translateY(0);
      }
      .product-info {
        padding: 16px;
      }
      .product-category {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 6px;
      }
      .product-name {
        display: block;
        font-family: var(--font-display);
        font-size: 1.125rem;
        color: var(--color-text);
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 12px;
        transition: color 0.3s;
      }
      .product-name:hover {
        color: var(--color-accent);
      }
      .product-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .price {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-accent);
      }
      .product-actions {
        display: flex;
        gap: 6px;
      }
      .action-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s;
      }
      .action-btn:hover {
        background: var(--color-accent);
        border-color: var(--color-accent);
      }
      .fav-btn.favorited {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() product: any;
  adding = signal(false);
  apiBase = environment.apiUrl.replace("/api", "");

  constructor(
    private auth: AuthService,
    private cart: CartService,
    private favorites: FavoritesService,
    private toast: ToastService,
    private router: Router,
  ) {}

  getImage() {
    const img =
      this.product?.images?.find((i: any) => i.isPrimary) ||
      this.product?.images?.[0];
    if (!img?.imageUrl)
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0YyRURFNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjQzlBOTZFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+✦PC90ZXh0Pjwvc3ZnPg==";
    return img.imageUrl.startsWith("http")
      ? img.imageUrl
      : `${this.apiBase}${img.imageUrl}`;
  }

  isFavorited() {
    return this.favorites.isFavorited(this.product?.id);
  }

  toggleFavorite(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/auth/login"]);
      return;
    }
    this.favorites.toggle(this.product.id).subscribe();
  }

  addToCart(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(["/auth/login"]);
      return;
    }
    this.adding.set(true);
    this.cart.addItem(this.product.id).subscribe({
      next: () => {
        this.toast.success("Added to cart!");
        this.adding.set(false);
      },
      error: (err) => {
        // Add error parameter
        console.error("Cart error:", err);
        // Display the error message from the backend
        const errorMessage =
          err.error?.message || err.message || "Failed to add to cart";
        this.toast.error(errorMessage);
        this.adding.set(false);
      },
    });
  }

  quickView(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.router.navigate(["/products", this.product.id]);
  }
}
