import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-admin-orders",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-admin">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-sub">{{ total() }} total orders</p>
        </div>
        <div style="display:flex;gap:10px">
          <a [href]="exportUrl()" class="btn btn-ghost btn-sm">⬇️ Export CSV</a>
        </div>
      </div>

      <!-- Status filter tabs -->
      <div class="status-tabs">
        @for (tab of statusTabs; track tab.value) {
          <button
            class="status-tab"
            [class.active]="statusFilter === tab.value"
            (click)="setStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
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
                        style="height:18px;margin:6px 0"
                      ></div>
                    </td>
                  </tr>
                }
              }
              @for (order of orders(); track order.id) {
                <tr>
                  <td>
                    <span class="order-num">{{ order.orderNumber }}</span>
                  </td>
                  <td>
                    <div>
                      <div style="font-weight:500">
                        {{ order.deliveryFullName }}
                      </div>
                      <div
                        style="font-size:0.75rem;color:var(--color-text-muted)"
                      >
                        {{ order.deliveryEmail }}
                      </div>
                    </div>
                  </td>
                  <td>{{ order.items?.length || 0 }} item(s)</td>
                  <td
                    style="font-family:var(--font-display);color:var(--color-accent);font-weight:600"
                  >
                    KSh {{ order.totalAmount | number: "1.0-0" }}
                  </td>
                  <td>
                    <span
                      class="pay-method-badge"
                      [ngClass]="
                        getPaymentMethodClass(order.selectedPaymentMethod)
                      "
                    >
                      {{ getPaymentMethodLabel(order.selectedPaymentMethod) }}
                    </span>
                  </td>
                  <td>
                    <select
                      class="status-select"
                      [value]="order.status"
                      (change)="updateStatus(order.id, $event)"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style="color:var(--color-text-muted);font-size:0.8125rem">
                    {{ order.createdAt | date: "dd MMM yyyy" }}
                  </td>
                  <td>
                    <div style="display:flex;justify-content:flex-end">
                      <button
                        class="btn-icon btn-sm"
                        (click)="viewOrder(order)"
                        title="View Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (!loading() && !orders().length) {
                <tr>
                  <td
                    colspan="7"
                    style="text-align:center;padding:48px;color:var(--color-text-muted)"
                  >
                    No orders found
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

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

      <!-- Order Detail Modal -->
      @if (selectedOrder()) {
        <div class="modal-backdrop" (click)="selectedOrder.set(null)">
          <div
            class="modal"
            style="max-width:680px"
            (click)="$event.stopPropagation()"
          >
            <div class="modal-header">
              <div>
                <h2 class="modal-title">
                  Order {{ selectedOrder()?.orderNumber }}
                </h2>
                <p style="font-size:0.875rem;color:var(--color-text-muted)">
                  {{ selectedOrder()?.createdAt | date: "full" }}
                </p>
              </div>
              <button class="modal-close" (click)="selectedOrder.set(null)">
                ✕
              </button>
            </div>

            <div class="order-detail">
              <!-- Delivery Info -->
              <div class="detail-section">
                <h4>Delivery Details</h4>
                <div class="detail-grid">
                  <div>
                    <span class="detail-label">Name</span
                    ><span>{{ selectedOrder()?.deliveryFullName }}</span>
                  </div>
                  <div>
                    <span class="detail-label">Phone</span
                    ><span>{{ selectedOrder()?.deliveryPhone }}</span>
                  </div>
                  <div>
                    <span class="detail-label">Email</span
                    ><span>{{ selectedOrder()?.deliveryEmail }}</span>
                  </div>
                  <div>
                    <span class="detail-label">Address</span
                    ><span>{{ selectedOrder()?.deliveryAddress }}</span>
                  </div>
                  @if (selectedOrder()?.deliveryCity) {
                    <div>
                      <span class="detail-label">City</span
                      ><span>{{ selectedOrder()?.deliveryCity }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Payment Method -->
              <div class="detail-section">
                <h4>Payment Method</h4>
                <div
                  class="payment-method-detail"
                  [ngClass]="
                    getPaymentMethodClass(
                      selectedOrder()?.selectedPaymentMethod
                    )
                  "
                >
                  <span class="pm-label">{{
                    getPaymentMethodLabel(
                      selectedOrder()?.selectedPaymentMethod
                    )
                  }}</span>
                  @if (selectedOrder()?.selectedPaymentMethod === "cod") {
                    <p class="pm-note">
                      💡 Collect cash from the customer when you deliver this
                      order, then mark it as <strong>Paid</strong>.
                    </p>
                  }
                  @if (selectedOrder()?.selectedPaymentMethod === "later") {
                    <p class="pm-note">
                      💡 This customer has not paid yet. Follow up before
                      shipping and mark as <strong>Paid</strong> once received.
                    </p>
                  }
                </div>
              </div>

              <!-- Items -->
              <div class="detail-section">
                <h4>Items</h4>
                @for (item of selectedOrder()?.items; track item.id) {
                  <div class="order-item-row">
                    <div class="order-item-img">
                      <img
                        [src]="getPrimaryImage(item.product)"
                        [alt]="item.productName"
                      />
                    </div>
                    <div style="flex:1">
                      <div style="font-weight:500">{{ item.productName }}</div>
                      @if (item.selectedSize) {
                        <small class="badge badge-muted">{{
                          item.selectedSize
                        }}</small>
                      }
                    </div>
                    <div style="text-align:right">
                      <div>x{{ item.quantity }}</div>
                      <div
                        style="color:var(--color-accent);font-family:var(--font-display)"
                      >
                        KSh {{ item.totalPrice | number: "1.0-0" }}
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Totals -->
              <div class="detail-totals">
                <div class="total-row">
                  <span>Subtotal</span
                  ><span
                    >KSh {{ selectedOrder()?.subtotal | number: "1.0-0" }}</span
                  >
                </div>
                <div class="total-row">
                  <span>Delivery Fee</span
                  ><span
                    >KSh
                    {{ selectedOrder()?.deliveryFee | number: "1.0-0" }}</span
                  >
                </div>
                <div class="total-row grand">
                  <span>Total</span
                  ><span
                    >KSh
                    {{ selectedOrder()?.totalAmount | number: "1.0-0" }}</span
                  >
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="selectedOrder.set(null)">
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .status-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 20px;
        background: var(--color-surface);
        padding: 6px;
        border-radius: 10px;
        border: 1px solid var(--color-border);
        width: fit-content;
        flex-wrap: wrap;
      }
      .status-tab {
        padding: 6px 14px;
        border-radius: 7px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.8125rem;
        font-family: var(--font-body);
        color: var(--color-text-secondary);
        transition: all 0.2s;
      }
      .status-tab.active {
        background: var(--color-accent);
        color: white;
        font-weight: 500;
      }
      .status-tab:hover:not(.active) {
        background: var(--color-surface-2);
      }
      .order-num {
        font-weight: 600;
        color: var(--color-accent);
      }
      .pay-method-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .pay-method-cod {
        background: #fef3c7;
        color: #92400e;
      }
      .pay-method-later {
        background: #ede9fe;
        color: #5b21b6;
      }
      .pay-method-stk {
        background: #d1fae5;
        color: #065f46;
      }
      .pay-method-paybill {
        background: #dbeafe;
        color: #1e40af;
      }
      .pay-method-till {
        background: #dbeafe;
        color: #1e40af;
      }
      .pay-method-send {
        background: #dbeafe;
        color: #1e40af;
      }
      .pay-method-unknown {
        background: var(--color-surface-2);
        color: var(--color-text-muted);
      }
      .status-select {
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        font-family: var(--font-body);
        font-size: 0.8125rem;
        cursor: pointer;
      }
      .detail-section {
        margin-bottom: 24px;
      }
      .detail-section h4 {
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        margin-bottom: 12px;
      }
      .payment-method-detail {
        padding: 14px 16px;
        border-radius: 10px;
        margin-top: 8px;
      }
      .payment-method-detail.pay-method-cod {
        background: #fef3c7;
        border: 1px solid #fde68a;
      }
      .payment-method-detail.pay-method-later {
        background: #ede9fe;
        border: 1px solid #ddd6fe;
      }
      .payment-method-detail.pay-method-stk {
        background: #d1fae5;
        border: 1px solid #a7f3d0;
      }
      .payment-method-detail.pay-method-paybill,
      .payment-method-detail.pay-method-till,
      .payment-method-detail.pay-method-send {
        background: #dbeafe;
        border: 1px solid #bfdbfe;
      }
      .payment-method-detail.pay-method-unknown {
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
      }
      .pm-label {
        font-weight: 600;
        font-size: 0.9375rem;
        display: block;
        margin-bottom: 6px;
      }
      .pm-note {
        font-size: 0.8125rem;
        line-height: 1.5;
        margin: 0;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .detail-label {
        display: block;
        font-size: 0.75rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 2px;
      }
      .order-item-row {
        display: flex;
        gap: 14px;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border);
      }
      .order-item-row:last-child {
        border-bottom: none;
      }
      .order-item-img {
        width: 52px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        background: var(--color-surface-2);
        flex-shrink: 0;
      }
      .order-item-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .detail-totals {
        background: var(--color-surface-2);
        border-radius: 8px;
        padding: 16px;
        margin-top: 8px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9375rem;
        margin-bottom: 8px;
      }
      .total-row.grand {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-accent);
        margin-bottom: 0;
        border-top: 1px solid var(--color-border);
        padding-top: 10px;
        margin-top: 4px;
      }
    `,
  ],
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);
  selectedOrder = signal<any>(null);
  statusFilter = "";
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = 20;

  statusTabs = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params: any = { page: this.page(), limit: this.limit };
    if (this.statusFilter) params.status = this.statusFilter;

    this.api.get<any>("/orders", params).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.total.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getPaymentMethodLabel(method: string): string {
    const labels: any = {
      stk: "📱 STK Push",
      paybill: "🏦 Paybill",
      till: "🏪 Till",
      send: "📞 Send Money",
      cod: "🚚 Pay on Delivery",
      later: "⏳ Pay Later",
    };
    return labels[method] || "—";
  }

  getPaymentMethodClass(method: string): string {
    const classes: any = {
      stk: "pay-method-stk",
      paybill: "pay-method-paybill",
      till: "pay-method-till",
      send: "pay-method-send",
      cod: "pay-method-cod",
      later: "pay-method-later",
    };
    return classes[method] || "pay-method-unknown";
  }

  setStatus(status: string) {
    this.statusFilter = status;
    this.page.set(1);
    this.load();
  }

  updateStatus(orderId: string, event: any) {
    const status = event.target.value;
    this.api.put(`/orders/${orderId}/status`, { status }).subscribe({
      next: () => this.load(),
      error: () => alert("Failed to update status"),
    });
  }

  viewOrder(order: any) {
    this.selectedOrder.set(order);
  }

  getPrimaryImage(product: any) {
    const img =
      product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = img?.imageUrl || "";
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
  }

  exportUrl() {
    return `${environment.apiUrl}/orders/export`;
  }

  goPage(p: number) {
    this.page.set(p);
    this.load();
  }
  getPages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages.slice(Math.max(0, this.page() - 3), this.page() + 2);
  }
}
