import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-order-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="order-detail-page page-enter">
      <div class="page-header">
        <div class="container">
          <a routerLink="/orders" class="back-link">← My Orders</a>
          <span class="section-label">Order Details</span>
          <h1>{{ order()?.orderNumber }}</h1>
        </div>
      </div>

      <div class="container section">
        @if (loading()) {
          <div class="skeleton" style="height:400px;border-radius:16px"></div>
        } @else if (!order()) {
          <div class="empty-state text-center">
            <p>Order not found.</p>
            <a
              routerLink="/orders"
              class="btn btn-primary"
              style="margin-top:16px"
              >Back to Orders</a
            >
          </div>
        } @else {
          <div class="detail-layout">
            <!-- Left: order info -->
            <div class="detail-main">
              <!-- Status banner -->
              <div
                class="status-banner"
                [ngClass]="'status-' + order()?.status"
              >
                <div class="status-icon">
                  {{ getStatusIcon(order()?.status) }}
                </div>
                <div>
                  <div class="status-title">
                    {{ getStatusLabel(order()?.status) }}
                  </div>
                  <div class="status-sub">
                    {{ order()?.updatedAt | date: "mediumDate" }}
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="card detail-card">
                <h3>
                  {{ order()?.items?.length }}
                  {{ order()?.items?.length === 1 ? "Item" : "Items" }} Ordered
                </h3>
                @for (item of order()?.items; track item.id) {
                  <div class="item-row">
                    <div class="item-img">
                      <img
                        [src]="getPrimaryImage(item.product)"
                        [alt]="item.productName"
                      />
                    </div>
                    <div class="item-info">
                      <div class="item-name">{{ item.productName }}</div>
                      <div class="item-meta">
                        @if (item.selectedSize) {
                          <span class="tag">{{ item.selectedSize }}</span>
                        }
                        @if (item.selectedColor) {
                          <span class="tag">{{ item.selectedColor }}</span>
                        }
                      </div>
                      <div class="item-price">
                        KSh {{ item.unitPrice | number: "1.0-0" }} each
                      </div>
                    </div>
                    <div class="item-right">
                      <div class="item-qty">× {{ item.quantity }}</div>
                      <div class="item-total">
                        KSh {{ item.totalPrice | number: "1.0-0" }}
                      </div>
                    </div>
                  </div>
                }

                <!-- Totals -->
                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal</span
                    ><span>KSh {{ order()?.subtotal | number: "1.0-0" }}</span>
                  </div>
                  <div class="total-row">
                    <span>Delivery</span
                    ><span
                      >KSh {{ order()?.deliveryFee | number: "1.0-0" }}</span
                    >
                  </div>
                  <div class="total-row grand">
                    <span>Total</span
                    ><span
                      >KSh {{ order()?.totalAmount | number: "1.0-0" }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Payment method -->
              <div class="card detail-card">
                <h3>Payment</h3>
                <div class="info-row">
                  <span class="info-label">Method</span
                  ><span
                    class="pay-badge"
                    [ngClass]="
                      'pay-' + (order()?.selectedPaymentMethod || 'none')
                    "
                    >{{ getPaymentLabel(order()?.selectedPaymentMethod) }}</span
                  >
                </div>
                <div class="info-row">
                  <span class="info-label">Status</span>
                  <span
                    class="badge"
                    [ngClass]="
                      order()?.status === 'paid' ||
                      order()?.status === 'shipped' ||
                      order()?.status === 'delivered'
                        ? 'badge-success'
                        : 'badge-accent'
                    "
                  >
                    {{
                      order()?.status === "paid" ||
                      order()?.status === "shipped" ||
                      order()?.status === "delivered"
                        ? "Paid"
                        : "Pending"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: delivery info -->
            <div class="detail-side">
              <div class="card detail-card">
                <h3>Delivery Address</h3>
                <div class="address-block">
                  <div class="addr-name">{{ order()?.deliveryFullName }}</div>
                  <div>{{ order()?.deliveryAddress }}</div>
                  @if (order()?.deliveryCity) {
                    <div>{{ order()?.deliveryCity }}</div>
                  }
                  <div class="addr-contact">
                    📞 {{ order()?.deliveryPhone }}
                  </div>
                  <div class="addr-contact">
                    ✉️ {{ order()?.deliveryEmail }}
                  </div>
                  @if (order()?.notes) {
                    <div class="addr-notes">📝 {{ order()?.notes }}</div>
                  }
                </div>
              </div>

              <div class="card detail-card">
                <h3>Order Info</h3>
                <div class="info-row">
                  <span class="info-label">Order #</span
                  ><span class="info-val mono">{{ order()?.orderNumber }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Placed</span
                  ><span class="info-val">{{
                    order()?.createdAt | date: "mediumDate"
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status</span>
                  <span
                    class="badge"
                    [ngClass]="getStatusBadgeClass(order()?.status)"
                    >{{ order()?.status | titlecase }}</span
                  >
                </div>
              </div>

              @if (
                order()?.status === "pending" &&
                order()?.selectedPaymentMethod !== "cod"
              ) {
                <button
                  class="btn btn-primary btn-full"
                  (click)="resumePayment()"
                >
                  Complete Payment →
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        padding: 40px 0 32px;
      }
      .page-header h1 {
        font-style: italic;
        font-size: 1.5rem;
        margin-top: 4px;
        font-family: var(--font-display);
      }
      .back-link {
        display: inline-block;
        font-size: 0.875rem;
        color: var(--color-text-muted);
        text-decoration: none;
        margin-bottom: 8px;
      }
      .back-link:hover {
        color: var(--color-accent);
      }
      .detail-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 24px;
        align-items: start;
      }
      .detail-card {
        padding: 24px;
        margin-bottom: 20px;
      }
      .detail-card h3 {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border);
      }
      /* Status banner */
      .status-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px 24px;
        border-radius: 12px;
        margin-bottom: 20px;
      }
      .status-pending {
        background: #fff7ed;
        border: 1px solid #fed7aa;
      }
      .status-paid {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
      }
      .status-processing {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
      }
      .status-shipped {
        background: #fdf4ff;
        border: 1px solid #e9d5ff;
      }
      .status-delivered {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
      }
      .status-cancelled {
        background: #fef2f2;
        border: 1px solid #fecaca;
      }
      .status-icon {
        font-size: 2rem;
      }
      .status-title {
        font-weight: 600;
        font-size: 1.0625rem;
      }
      .status-sub {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 2px;
      }
      /* Items */
      .item-row {
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid var(--color-border);
      }
      .item-row:last-of-type {
        border-bottom: none;
      }
      .item-img {
        width: 64px;
        height: 72px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--color-surface-2);
      }
      .item-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .item-info {
        flex: 1;
      }
      .item-name {
        font-weight: 500;
        font-size: 0.9375rem;
        margin-bottom: 4px;
      }
      .item-meta {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .tag {
        padding: 2px 8px;
        background: var(--color-surface-2);
        border-radius: 4px;
        font-size: 0.75rem;
        color: var(--color-text-secondary);
      }
      .item-price {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
      }
      .item-right {
        text-align: right;
        flex-shrink: 0;
      }
      .item-qty {
        color: var(--color-text-muted);
        font-size: 0.875rem;
      }
      .item-total {
        font-family: var(--font-display);
        color: var(--color-accent);
        font-weight: 600;
        font-size: 1rem;
      }
      /* Totals */
      .totals {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--color-border);
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
      }
      .total-row.grand {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-accent);
        font-weight: 600;
        border-top: 1px solid var(--color-border);
        padding-top: 10px;
        margin-top: 4px;
      }
      /* Info rows */
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--color-border);
        font-size: 0.9375rem;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-label {
        color: var(--color-text-muted);
        font-size: 0.875rem;
      }
      .info-val {
        font-weight: 500;
      }
      .mono {
        font-size: 0.8125rem;
      }
      /* Address */
      .address-block {
        line-height: 1.8;
        color: var(--color-text-secondary);
        font-size: 0.9375rem;
      }
      .addr-name {
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: 4px;
      }
      .addr-contact {
        margin-top: 4px;
      }
      .addr-notes {
        margin-top: 8px;
        font-style: italic;
        font-size: 0.875rem;
        color: var(--color-text-muted);
      }
      /* Payment badge */
      .pay-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8125rem;
        font-weight: 500;
      }
      .pay-cod {
        background: #fef3c7;
        color: #92400e;
      }
      .pay-later {
        background: #ede9fe;
        color: #5b21b6;
      }
      .pay-stk {
        background: #d1fae5;
        color: #065f46;
      }
      .pay-paybill,
      .pay-till,
      .pay-send {
        background: #dbeafe;
        color: #1e40af;
      }
      .pay-none {
        background: var(--color-surface-2);
        color: var(--color-text-muted);
      }
      .btn-full {
        width: 100%;
        text-align: center;
        display: block;
        margin-top: 16px;
        padding: 12px;
        border-radius: 10px;
      }
      @media (max-width: 768px) {
        .detail-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class OrderDetailComponent implements OnInit {
  order = signal<any>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.api.get<any>(`/orders/my-orders/${id}`).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getPrimaryImage(product: any) {
    const img =
      product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = img?.imageUrl || "";
    return url.startsWith("http") ? url : `http://localhost:3000${url}`;
  }

  getStatusIcon(status: string) {
    const icons: any = {
      pending: "⏳",
      paid: "✅",
      processing: "🔧",
      shipped: "🚚",
      delivered: "📦",
      cancelled: "❌",
    };
    return icons[status] || "📋";
  }

  getStatusLabel(status: string) {
    const labels: any = {
      pending: "Payment Pending",
      paid: "Payment Confirmed",
      processing: "Being Prepared",
      shipped: "On Its Way",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string) {
    const classes: any = {
      pending: "badge-accent",
      paid: "badge-success",
      shipped: "badge-gold",
      delivered: "badge-success",
      cancelled: "badge-error",
    };
    return classes[status] || "badge-accent";
  }

  getPaymentLabel(method: string) {
    const labels: any = {
      stk: "📱 M-Pesa STK Push",
      paybill: "🏦 Paybill",
      till: "🏪 Till Number",
      send: "📞 Send Money",
      cod: "🚚 Pay on Delivery",
      later: "⏳ Pay Later",
    };
    return labels[method] || "—";
  }
  resumePayment() {
    const o = this.order();
    if (!o) return;
    this.router.navigate(["/checkout"], {
      state: {
        resumeOrder: {
          id: o.id,
          orderNumber: o.orderNumber,
          total: o.totalAmount,
          subtotal: o.subtotal,
          deliveryFee: o.deliveryFee,
          deliveryFullName: o.deliveryFullName,
          deliveryPhone: o.deliveryPhone,
          deliveryEmail: o.deliveryEmail,
          deliveryAddress: o.deliveryAddress,
          deliveryCity: o.deliveryCity,
          selectedPaymentMethod: o.selectedPaymentMethod,
        },
      },
    });
  }
}
