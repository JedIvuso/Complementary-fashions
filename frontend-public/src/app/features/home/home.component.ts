import { Component, OnInit, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ApiService } from '../../core/services/api.service';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <div class="home page-enter">
      <!-- Hero Slideshow -->
      <section class="hero" *ngIf="banners().length">
        <div class="hero-track" [style.transform]="'translateX(-' + (currentSlide() * 100) + '%)'">
          @for (banner of banners(); track banner.id) {
            <div class="hero-slide" [style.backgroundImage]="'url(' + getImageUrl(banner.imageUrl) + ')'">
              <div class="hero-overlay"></div>
              <div class="hero-content container">
                <span class="hero-label">{{ banner.subtitle || 'New Collection' }}</span>
                <h1 class="hero-title">{{ banner.title }}</h1>
                <a [routerLink]="banner.ctaLink || '/products'" class="btn btn-primary btn-lg">
                  {{ banner.ctaText || 'Shop Now' }} →
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Hero without banners fallback -->
        <div class="hero-controls">
          @for (b of banners(); track $index) {
            <button class="dot" [class.active]="currentSlide() === $index" (click)="goToSlide($index)"></button>
          }
        </div>
        <button class="hero-arrow prev" (click)="prevSlide()">‹</button>
        <button class="hero-arrow next" (click)="nextSlide()">›</button>
      </section>

      <!-- Hero Fallback (no banners) -->
      <section class="hero-fallback" *ngIf="!banners().length">
        <div class="hero-fallback-bg">
          <div class="hero-pattern"></div>
        </div>
        <div class="hero-fallback-content container">
          <span class="hero-label">New Collection 2024</span>
          <h1 class="hero-fallback-title">
            <em>Woven with Love,</em><br>
            Worn with Pride
          </h1>
          <p class="hero-fallback-sub">Handcrafted crochet clothing for the modern woman.</p>
          <div class="hero-cta-group">
            <a routerLink="/products" class="btn btn-primary btn-lg">Explore Collection →</a>
            <a routerLink="/about" class="btn btn-secondary btn-lg">Our Story</a>
          </div>
        </div>
      </section>

      <!-- Stats Strip -->
      <div class="stats-strip">
        <div class="container">
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-num">500+</span>
              <span class="stat-label">Happy Customers</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">100%</span>
              <span class="stat-label">Handcrafted</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">Free</span>
              <span class="stat-label">Delivery over KSh 5,000</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">30 Days</span>
              <span class="stat-label">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <span class="section-label">Explore</span>
            <h2 class="section-title">Shop by Category</h2>
            <div class="section-divider"></div>
          </div>

          @if (categoriesLoading()) {
            <div class="categories-grid">
              @for (i of [1,2,3,4]; track i) {
                <div class="category-card skeleton" style="height: 280px;"></div>
              }
            </div>
          } @else {
            <div class="categories-grid">
              @for (cat of categories(); track cat.id) {
                <a [routerLink]="['/products']" [queryParams]="{categoryId: cat.id}" class="category-card">
                  <div class="category-image">
                    <img [src]="getImageUrl(cat.image)" [alt]="cat.name" loading="lazy">
                    <div class="category-overlay"></div>
                  </div>
                  <div class="category-info">
                    <h3>{{ cat.name }}</h3>
                    <span>{{ cat.products?.length || 0 }} pieces →</span>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section featured-section">
        <div class="container">
          <div class="section-header">
            <span class="section-label">Handpicked</span>
            <h2 class="section-title">Featured Pieces</h2>
            <div class="section-divider"></div>
          </div>

          @if (featuredLoading()) {
            <div class="product-grid">
              @for (i of [1,2,3,4]; track i) {
                <div class="skeleton" style="height: 420px; border-radius: 16px;"></div>
              }
            </div>
          } @else if (featured().length) {
            <div class="product-grid">
              @for (p of featured(); track p.id) {
                <app-product-card [product]="p"></app-product-card>
              }
            </div>
          }

          <div class="text-center mt-3" style="margin-top: 48px;">
            <a routerLink="/products" class="btn btn-outline-accent btn-lg">View All Products →</a>
          </div>
        </div>
      </section>

      <!-- Brand Story Teaser -->
      <section class="story-section">
        <div class="story-bg"></div>
        <div class="container story-content">
          <div class="story-text">
            <span class="section-label">Our Story</span>
            <h2>Crafted with Care,<br><em>Thread by Thread</em></h2>
            <p>Every stitch in our collection carries the warmth of handcraft and the story of our artisans. We believe fashion should be personal, sustainable, and deeply human.</p>
            <a routerLink="/about" class="btn btn-outline-accent mt-3">Discover Our Story →</a>
          </div>
          <div class="story-visual">
            <div class="story-card">
              <div class="story-pattern">✦</div>
              <p class="story-quote">"Fashion is the armor to survive the reality of everyday life."</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Hero */
    .hero { position: relative; height: 100vh; min-height: 600px; overflow: hidden; }
    .hero-track {
      display: flex; height: 100%;
      transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
    }
    .hero-slide {
      flex: 0 0 100%; height: 100%;
      background-size: cover; background-position: center;
      position: relative;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(26,16,8,0.7) 0%, rgba(26,16,8,0.2) 100%);
    }
    .hero-content {
      position: relative; z-index: 2;
      height: 100%; display: flex; flex-direction: column;
      justify-content: center; padding-top: 80px;
    }
    .hero-label {
      font-family: var(--font-accent); font-size: 1.5rem;
      color: var(--color-gold-light); display: block; margin-bottom: 16px;
      animation: fade-up 0.8s ease 0.2s both;
    }
    .hero-title {
      font-family: var(--font-display); font-size: clamp(3rem, 7vw, 6rem);
      color: white; font-weight: 300; line-height: 1.1;
      max-width: 700px; font-style: italic; margin-bottom: 32px;
      animation: fade-up 0.8s ease 0.4s both;
    }
    .hero-content .btn { animation: fade-up 0.8s ease 0.6s both; align-self: flex-start; }
    .hero-controls {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px; z-index: 5;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.3s;
    }
    .dot.active { background: white; transform: scale(1.3); }
    .hero-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 52px; height: 52px; border-radius: 50%;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.3); color: white;
      font-size: 1.5rem; cursor: pointer; z-index: 5;
      transition: all 0.3s; display: flex; align-items: center; justify-content: center;
    }
    .hero-arrow:hover { background: rgba(255,255,255,0.3); }
    .hero-arrow.prev { left: 24px; }
    .hero-arrow.next { right: 24px; }
    @keyframes fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    /* Hero Fallback */
    .hero-fallback {
      min-height: 90vh; display: flex; align-items: center;
      position: relative; overflow: hidden; padding-top: 80px;
    }
    .hero-fallback-bg {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%);
    }
    .hero-pattern {
      position: absolute; inset: 0;
      background-image: radial-gradient(circle at 70% 50%, rgba(201,112,58,0.08) 0%, transparent 60%),
                        radial-gradient(circle at 20% 80%, rgba(201,169,110,0.06) 0%, transparent 50%);
    }
    .hero-fallback-content { position: relative; z-index: 1; }
    .hero-fallback-title {
      font-size: clamp(3.5rem, 8vw, 7rem); font-weight: 300;
      line-height: 1.05; margin: 16px 0 24px; max-width: 800px;
    }
    .hero-fallback-sub { font-size: 1.25rem; color: var(--color-text-secondary); margin-bottom: 40px; }
    .hero-cta-group { display: flex; gap: 16px; flex-wrap: wrap; }

    /* Stats */
    .stats-strip { background: var(--color-surface); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: 28px 0; }
    .stats-grid { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
    .stat { text-align: center; padding: 12px 48px; }
    .stat-num { display: block; font-family: var(--font-display); font-size: 1.75rem; font-weight: 500; color: var(--color-accent); }
    .stat-label { font-size: 0.8125rem; color: var(--color-text-secondary); letter-spacing: 0.05em; }
    .stat-divider { width: 1px; height: 48px; background: var(--color-border); flex-shrink: 0; }

    /* Categories */
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
    .category-card { position: relative; border-radius: var(--radius-md); overflow: hidden; text-decoration: none; display: block; }
    .category-card:hover { transform: translateY(-4px); }
    .category-image { aspect-ratio: 4/5; overflow: hidden; background: var(--color-surface-2); }
    .category-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .category-card:hover .category-image img { transform: scale(1.06); }
    .category-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,16,8,0.8) 0%, transparent 60%); }
    .category-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; }
    .category-info h3 { font-family: var(--font-display); color: white; font-size: 1.5rem; margin-bottom: 4px; }
    .category-info span { font-size: 0.8125rem; color: rgba(255,255,255,0.7); letter-spacing: 0.05em; }

    /* Story Section */
    .story-section {
      position: relative; padding: 100px 0;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }
    .story-content { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .story-text h2 { font-size: clamp(2rem, 4vw, 3rem); margin: 12px 0 20px; }
    .story-text p { font-size: 1.0625rem; line-height: 1.8; }
    .story-visual { display: flex; align-items: center; justify-content: center; }
    .story-card {
      background: var(--color-bg); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); padding: 48px 40px; text-align: center;
      max-width: 380px; box-shadow: var(--shadow-md);
    }
    .story-pattern { font-size: 3rem; color: var(--color-accent); margin-bottom: 20px; }
    .story-quote { font-family: var(--font-display); font-size: 1.25rem; font-style: italic; color: var(--color-text); line-height: 1.6; }

    @media (max-width: 768px) {
      .story-content { grid-template-columns: 1fr; gap: 40px; }
      .hero-arrow { display: none; }
      .stat { padding: 12px 24px; }
      .stat-divider { height: 32px; }
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  banners = signal<any[]>([]);
  categories = signal<any[]>([]);
  featured = signal<any[]>([]);
  currentSlide = signal(0);
  categoriesLoading = signal(true);
  featuredLoading = signal(true);
  private slideInterval: any;

  constructor(
    private api: ApiService,
    private products: ProductsService,
    private cats: CategoriesService,
  ) {}

  ngOnInit() {
    this.api.get<any[]>('/banners').subscribe(b => this.banners.set(b || []));
    this.cats.getAll().subscribe({ next: c => { this.categories.set(c); this.categoriesLoading.set(false); }, error: () => this.categoriesLoading.set(false) });
    this.products.getFeatured().subscribe({ next: p => { this.featured.set(p); this.featuredLoading.set(false); }, error: () => this.featuredLoading.set(false) });
  }

  ngAfterViewInit() {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy() { clearInterval(this.slideInterval); }

  nextSlide() { this.currentSlide.update(s => (s + 1) % Math.max(this.banners().length, 1)); }
  prevSlide() { this.currentSlide.update(s => (s - 1 + Math.max(this.banners().length, 1)) % Math.max(this.banners().length, 1)); }
  goToSlide(i: number) { this.currentSlide.set(i); }
  getImageUrl(url: string) { return url?.startsWith('http') ? url : `http://localhost:3000${url}`; }
}
