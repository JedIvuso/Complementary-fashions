import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <div class="favorites-page page-enter">
      <div class="page-header">
        <div class="container">
          <span class="section-label">Loved</span>
          <h1>My Favorites</h1>
        </div>
      </div>

      <div class="container section">
        @if (loading()) {
          <div class="product-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton" style="height: 420px; border-radius: 16px;"></div>
            }
          </div>
        } @else if (!favorites().length) {
          <div class="empty-state text-center">
            <div style="font-size: 3rem; margin-bottom: 16px;">🤍</div>
            <h2>No favorites yet</h2>
            <p>Tap the heart icon on any product to save your favorites.</p>
            <a routerLink="/products" class="btn btn-primary" style="margin-top: 24px;">Browse Collection →</a>
          </div>
        } @else {
          <div class="product-grid">
            @for (fav of favorites(); track fav.id) {
              <app-product-card [product]="fav.product"></app-product-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 60px 0 40px; }
    .page-header h1 { font-style: italic; }
    .empty-state { padding: 80px 0; }
  `]
})
export class FavoritesComponent implements OnInit {
  favorites = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private favoritesService: FavoritesService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.favoritesService.getFavorites().subscribe({
      next: (f) => { this.favorites.set(f); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
