import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">Welcome back, {{ admin?.firstName }}</p>
        </div>
        <div class="header-actions" style="display:flex;gap:10px">
          <a href="http://localhost:4200" target="_blank" class="btn btn-ghost btn-sm">
            🌐 View Store
          </a>
          <a routerLink="/orders" class="btn btn-primary btn-sm">New Orders</a>
        </div>
      </div>

      <!-- Stats Grid -->
      @if (loading()) {
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card" style="height:120px">
              <div class="skeleton" style="height:100%;border-radius:12px"></div>
            </div>
          }
        </div>
      } @else {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👗</div>
            <div class="stat-value">{{ stats?.totalProducts | number }}</div>
            <div class="stat-label">Total Products</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ stats?.totalUsers | number }}</div>
            <div class="stat-label">Customers</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-value">{{ stats?.totalOrders | number }}</div>
            <div class="stat-label">Total Orders</div>
            @if (stats?.pendingOrders) {
              <div class="stat-change">{{ stats?.pendingOrders }} pending</div>
            }
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value">KSh {{ stats?.totalRevenue | number:'1.0-0' }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>
      }

      <!-- Two Column Layout -->
      <div class="dash-grid">
        <!-- Recent Orders -->
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:1.1rem">Recent Orders</h3>
            <a routerLink="/orders" class="btn btn-ghost btn-sm">View all</a>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (order of recentOrders(); track order.id) {
                  <tr>
                    <td><span style="font-weight:500;color:var(--color-accent)">{{ order.orderNumber }}</span></td>
                    <td>{{ order.user?.firstName }} {{ order.user?.lastName }}</td>
                    <td>KSh {{ order.totalAmount | number:'1.0-0' }}</td>
                    <td><span class="badge" [ngClass]="getStatusClass(order.status)">{{ order.status }}</span></td>
                    <td style="color:var(--color-text-muted);font-size:0.8rem">{{ order.createdAt | date:'dd MMM' }}</td>
                  </tr>
                }
                @if (!recentOrders().length && !loading()) {
                  <tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);padding:32px">No orders yet</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Monthly Sales Summary -->
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:1.1rem">Monthly Revenue</h3>
          </div>
          <div class="card-body">
            @for (month of monthlySales(); track month.month) {
              <div class="month-row">
                <span class="month-label">{{ month.month | date:'MMM yyyy' }}</span>
                <div class="month-bar-wrap">
                  <div class="month-bar" [style.width]="getBarWidth(month.revenue)"></div>
                </div>
                <span class="month-val">KSh {{ month.revenue | number:'1.0-0' }}</span>
              </div>
            }
            @if (!monthlySales().length && !loading()) {
              <p style="text-align:center;color:var(--color-text-muted);padding:32px 0">No sales data yet</p>
            }
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions card" style="margin-top:24px">
        <div class="card-header">
          <h3 style="font-size:1.1rem">Quick Actions</h3>
        </div>
        <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap">
          <a routerLink="/products" class="quick-btn">
            <span>➕</span> Add Product
          </a>
          <a routerLink="/categories" class="quick-btn">
            <span>🏷️</span> Add Category
          </a>
          <a routerLink="/banners" class="quick-btn">
            <span>🖼️</span> Edit Banners
          </a>
          <a routerLink="/orders" class="quick-btn">
            <span>📦</span> Manage Orders
          </a>
          <a routerLink="/about" class="quick-btn">
            <span>✍️</span> Edit About
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; margin-top: 24px; }
    .month-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .month-label { font-size: 0.8125rem; color: var(--color-text-secondary); width: 80px; flex-shrink: 0; }
    .month-bar-wrap { flex: 1; height: 8px; background: var(--color-surface-2); border-radius: 4px; overflow: hidden; }
    .month-bar { height: 100%; background: linear-gradient(90deg, var(--color-accent), var(--color-gold)); border-radius: 4px; transition: width 0.6s ease; }
    .month-val { font-size: 0.8125rem; font-weight: 500; color: var(--color-text); width: 110px; text-align: right; flex-shrink: 0; }
    .quick-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 10px; background: var(--color-surface-2);
      border: 1px solid var(--color-border); color: var(--color-text);
      font-size: 0.875rem; text-decoration: none; transition: all 0.2s;
    }
    .quick-btn:hover { background: var(--color-accent); color: white; border-color: var(--color-accent); }
    @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .header-actions { display: none !important; } }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats: any = null;
  recentOrders = signal<any[]>([]);
  monthlySales = signal<any[]>([]);
  maxRevenue = 0;
  admin: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    const stored = localStorage.getItem('cf_admin');
    this.admin = stored ? JSON.parse(stored) : null;

    this.api.get<any>('/admin/dashboard').subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.recentOrders.set(data.recentOrders || []);
        this.monthlySales.set(data.monthlySales || []);
        this.maxRevenue = Math.max(...(data.monthlySales || []).map((m: any) => Number(m.revenue)), 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getBarWidth(revenue: number) {
    return `${Math.round((Number(revenue) / this.maxRevenue) * 100)}%`;
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      pending: 'badge-warning', paid: 'badge-success',
      shipped: 'badge-info', delivered: 'badge-success',
      cancelled: 'badge-error', processing: 'badge-info',
    };
    return map[status] || 'badge-muted';
  }
}
