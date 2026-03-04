import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card" (mouseenter)="hovered.set(true)" (mouseleave)="hovered.set(false)">
      <!-- Image -->
      <div class="card-image-wrap">
        <a [routerLink]="['/products', product.id]">
          <img
            [src]="getPrimaryImage()"
            [alt]="product.name"
            class="card-img"
            (error)="onImgError($event)"
          />
          <img
            *ngIf="product.images?.length > 1 && hovered()"
            [src]="product.images[1].url"
            [alt]="product.name"
            class="card-img hover-img"
          />
        </a>

        <!-- Badges -->
        <div class="card-badges">
          <span class="badge featured" *ngIf="product.isFeatured">Featured</span>
          <span class="badge oos" *ngIf="!product.isAvailable">Sold Out</span>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" [class.visible]="hovered()">
          <button
            class="action-btn fav-btn"
            [class.active]="favoritesService.isFavorite(product.id)"
            (click)="toggleFavorite($event)"
            title="Add to Favorites"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="favoritesService.isFavorite(product.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="card-info">
        <p class="card-category" *ngIf="product.category">{{ product.category.name }}</p>
        <a [routerLink]="['/products', product.id]" class="card-name">{{ product.name }}</a>
        <div class="card-footer">
          <span class="card-price">KES {{ product.price | number:'1.0-0' }}</span>
          <button
            class="add-cart-btn"
            [disabled]="!product.isAvailable || addingToCart()"
            (click)="addToCart()"
          >
            <svg *ngIf="!added()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <svg *ngIf="added()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: var(--bg-card);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 36px var(--shadow);
    }
    .card-image-wrap {
      position: relative;
      aspect-ratio: 3/4;
      overflow: hidden;
      background: var(--bg-alt);
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .hover-img {
      position: absolute;
      inset: 0;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .product-card:hover .card-img { transform: scale(1.03); }
    .card-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge.featured { background: var(--accent); color: white; }
    .badge.oos { background: #374151; color: white; }
    .quick-actions {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      opacity: 0;
      transform: translateX(8px);
      transition: all 0.25s ease;
    }
    .quick-actions.visible { opacity: 1; transform: translateX(0); }
    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
      color: #666;
    }
    .action-btn:hover, .action-btn.active { color: #ef4444; transform: scale(1.1); }
    .card-info { padding: 16px; }
    .card-category { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .card-name {
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 15px;
      display: block;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .card-name:hover { color: var(--accent); }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .card-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      font-family: 'Playfair Display', Georgia, serif;
    }
    .add-cart-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .add-cart-btn:hover:not(:disabled) { transform: scale(1.1); background: var(--accent-dark); }
    .add-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class ProductCardComponent {
  @Input() product!: Product;

  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);
  authService = inject(AuthService);
  router = inject(Router);

  hovered = signal(false);
  addingToCart = signal(false);
  added = signal(false);

  getPrimaryImage(): string {
    const primary = this.product.images?.find(i => i.isPrimary);
    return primary?.url || this.product.images?.[0]?.url || 'assets/placeholder.jpg';
  }

  onImgError(event: any) {
    event.target.src = 'assets/placeholder.jpg';
  }

  addToCart() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.addingToCart.set(true);
    this.cartService.addItem(this.product.id).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.added.set(true);
        setTimeout(() => this.added.set(false), 2000);
      },
      error: () => this.addingToCart.set(false),
    });
  }

  toggleFavorite(event: MouseEvent) {
    event.preventDefault();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.favoritesService.toggle(this.product.id).subscribe();
  }
}
