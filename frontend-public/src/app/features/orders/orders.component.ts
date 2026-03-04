import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-page page-enter">
      <div class="page-header">
        <div class="container">
          <span class="section-label">Your Journey</span>
          <h1>My Orders</h1>
        </div>
      </div>

      <div class="container section">
        @if (loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height: 120px; border-radius: 16px; margin-bottom: 16px;"></div>
          }
        } @else if (!orders().length) {
          <div class="empty-state text-center">
            <div style="font-size: 3rem; margin-bottom: 16px;">📦</div>
            <h2>No orders yet</h2>
            <p>Your order history will appear here once you make a purchase.</p>
            <a routerLink="/products" class="btn btn-primary" style="margin-top: 24px;">Start Shopping →</a>
          </div>
        } @else {
          @for (order of orders(); track order.id) {
            <div class="order-card card" [class]="'status-' + order.status">
              <div class="order-header">
                <div>
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <span class="badge" [ngClass]="getStatusClass(order.status)">
                  {{ order.status | titlecase }}
                </span>
              </div>

              <div class="order-items">
                @for (item of order.items?.slice(0, 3); track item.id) {
                  <div class="order-item-thumb">
                    <img [src]="getPrimaryImage(item.product)" [alt]="item.productName">
                  </div>
                }
                @if (order.items?.length > 3) {
                  <div class="more-items">+{{ order.items.length - 3 }}</div>
                }
              </div>

              <div class="order-footer">
                <div class="order-summary-text">
                  {{ order.items?.length }} {{ order.items?.length === 1 ? 'item' : 'items' }}
                </div>
                <div class="order-total">KSh {{ order.totalAmount | number:'1.0-0' }}</div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 60px 0 40px; }
    .page-header h1 { font-style: italic; }
    .order-card { padding: 24px; margin-bottom: 16px; border-left: 4px solid var(--color-border); }
    .order-card.status-paid { border-left-color: var(--color-success); }
    .order-card.status-shipped { border-left-color: var(--color-accent); }
    .order-card.status-delivered { border-left-color: var(--color-gold); }
    .order-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .order-number { font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; color: var(--color-text); display: block; }
    .order-date { font-size: 0.8125rem; color: var(--color-text-muted); }
    .order-items { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
    .order-item-thumb { width: 56px; height: 64px; border-radius: 8px; overflow: hidden; }
    .order-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .more-items { width: 56px; height: 64px; border-radius: 8px; background: var(--color-surface-2); display: flex; align-items: center; justify-content: center; font-size: 0.875rem; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
    .order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--color-border); }
    .order-summary-text { color: var(--color-text-secondary); font-size: 0.875rem; }
    .order-total { font-family: var(--font-display); font-size: 1.25rem; color: var(--color-accent); }
    .empty-state { padding: 80px 0; }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (o) => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getPrimaryImage(product: any) {
    const img = product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = img?.imageUrl || '';
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  }

  getStatusClass(status: string) {
    const map: any = {
      pending: 'badge-accent',
      paid: 'badge-success',
      shipped: 'badge-gold',
      delivered: 'badge-success',
      cancelled: 'badge-error',
    };
    return map[status] || 'badge-accent';
  }
}
