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
          <p class="page-sub">
            {{ filteredOrders().length }} of {{ total() }} orders
          </p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="exportCsv()">
          ⬇️ Export CSV
        </button>
      </div>

      <!-- Filters row -->
      <div class="filters-row">
        <!-- Search -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            class="search-input"
            [(ngModel)]="search"
            placeholder="Search order # or customer…"
          />
          @if (search) {
            <button class="clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>

        <!-- Status filter -->
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select
            class="filter-select"
            [(ngModel)]="statusFilter"
            (ngModelChange)="onFiltersChange()"
          >
            <option value="">All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="paid">✅ Paid</option>
            <option value="processing">🔧 Processing</option>
            <option value="shipped">🚚 Shipped</option>
            <option value="delivered">📦 Delivered</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>

        <!-- Payment method filter -->
        <div class="filter-group">
          <label class="filter-label">Payment Method</label>
          <select
            class="filter-select"
            [(ngModel)]="paymentFilter"
            (ngModelChange)="onFiltersChange()"
          >
            <option value="">All Methods</option>
            <option value="stk">📱 STK Push</option>
            <option value="paybill">🏦 Paybill</option>
            <option value="till">🏪 Till Number</option>
            <option value="send">📞 Send Money</option>
            <option value="cod">🚚 Pay on Delivery</option>
            <option value="later">⏳ Pay Later</option>
          </select>
        </div>

        <!-- Clear all -->
        @if (statusFilter || paymentFilter || search) {
          <button
            class="btn btn-ghost btn-sm clear-all-btn"
            (click)="clearAllFilters()"
          >
            ✕ Clear filters
          </button>
        }
      </div>

      <!-- Active filter chips -->
      @if (statusFilter || paymentFilter) {
        <div class="active-chips">
          @if (statusFilter) {
            <span class="chip">
              Status: {{ getStatusLabel(statusFilter) }}
              <button (click)="statusFilter = ''; onFiltersChange()">✕</button>
            </span>
          }
          @if (paymentFilter) {
            <span class="chip">
              Payment: {{ getPaymentMethodLabel(paymentFilter) }}
              <button (click)="paymentFilter = ''; onFiltersChange()">✕</button>
            </span>
          }
        </div>
      }

      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
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
                    <td colspan="8">
                      <div
                        class="skeleton"
                        style="height:18px;margin:6px 0"
                      ></div>
                    </td>
                  </tr>
                }
              }
              @for (order of filteredOrders(); track order.id) {
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
                  <td
                    style="font-family:var(--font-display);color:var(--color-accent);font-weight:600"
                  >
                    KSh {{ order.totalAmount | number: "1.0-0" }}
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
              @if (!loading() && !filteredOrders().length) {
                <tr>
                  <td colspan="8" style="text-align:center;padding:48px">
                    <div style="color:var(--color-text-muted)">
                      <div style="font-size:2rem;margin-bottom:8px">🔍</div>
                      <div>No orders match your filters</div>
                      <button
                        class="btn btn-ghost btn-sm"
                        style="margin-top:12px"
                        (click)="clearAllFilters()"
                      >
                        Clear filters
                      </button>
                    </div>
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
                      💡 Collect cash on delivery, then mark as Paid.
                    </p>
                  }
                  @if (selectedOrder()?.selectedPaymentMethod === "later") {
                    <p class="pm-note">
                      💡 Follow up before shipping and mark as Paid once
                      received.
                    </p>
                  }
                </div>
              </div>

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
                  @if (selectedOrder()?.notes) {
                    <div style="grid-column:1/-1">
                      <span class="detail-label">Notes</span
                      ><span>{{ selectedOrder()?.notes }}</span>
                    </div>
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
                      <div
                        style="font-size:0.8125rem;color:var(--color-text-muted);margin-top:2px"
                      >
                        @if (item.selectedSize) {
                          <span class="badge badge-muted">{{
                            item.selectedSize
                          }}</span>
                        }
                        @if (item.selectedColor) {
                          <span class="badge badge-muted">{{
                            item.selectedColor
                          }}</span>
                        }
                      </div>
                      <div
                        style="font-size:0.8125rem;color:var(--color-text-muted)"
                      >
                        KSh {{ item.unitPrice | number: "1.0-0" }} each
                      </div>
                    </div>
                    <div style="text-align:right">
                      <div style="color:var(--color-text-muted)">
                        × {{ item.quantity }}
                      </div>
                      <div
                        style="color:var(--color-accent);font-family:var(--font-display);font-weight:600"
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
      .filters-row {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .search-box {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 260px;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.9rem;
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 9px 36px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 0.875rem;
        font-family: var(--font-body);
        height: 38px;
      }
      .clear-btn {
        position: absolute;
        right: 10px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        font-size: 0.875rem;
      }
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .filter-label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-muted);
      }
      .filter-select {
        padding: 0 12px;
        height: 38px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 0.875rem;
        font-family: var(--font-body);
        cursor: pointer;
        min-width: 170px;
      }
      .filter-select:focus {
        outline: none;
        border-color: var(--color-accent);
      }
      .clear-all-btn {
        align-self: flex-end;
      }
      .active-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px 4px 12px;
        background: var(--color-accent-light, #f3ece7);
        color: var(--color-accent);
        border-radius: 20px;
        font-size: 0.8125rem;
        font-weight: 500;
      }
      .chip button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-accent);
        font-size: 0.8rem;
        padding: 0;
        line-height: 1;
        opacity: 0.7;
      }
      .chip button:hover {
        opacity: 1;
      }
      .order-num {
        font-weight: 600;
        color: var(--color-accent);
        font-size: 0.8125rem;
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
      .pay-method-paybill,
      .pay-method-till,
      .pay-method-send {
        background: #dbeafe;
        color: #1e40af;
      }
      .pay-method-unknown {
        background: var(--color-surface-2);
        color: var(--color-text-muted);
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
        margin-bottom: 4px;
      }
      .pm-note {
        font-size: 0.8125rem;
        line-height: 1.5;
        margin: 0;
      }
    `,
  ],
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);
  selectedOrder = signal<any>(null);
  statusFilter = "";
  paymentFilter = "";
  search = "";
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  limit = 20;

  constructor(private api: ApiService) {}
  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params: any = { page: this.page(), limit: this.limit };
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

  filteredOrders() {
    let list = this.orders();
    if (this.statusFilter) {
      list = list.filter((o) => o.status === this.statusFilter);
    }
    if (this.paymentFilter) {
      list = list.filter((o) => o.selectedPaymentMethod === this.paymentFilter);
    }
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.deliveryFullName?.toLowerCase().includes(q) ||
          o.deliveryEmail?.toLowerCase().includes(q),
      );
    }
    return list;
  }

  onFiltersChange() {
    /* filteredOrders() is computed on every change detection */
  }
  clearSearch() {
    this.search = "";
  }
  clearAllFilters() {
    this.search = "";
    this.statusFilter = "";
    this.paymentFilter = "";
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

  exportCsv() {
    this.api.get<any>("/orders/export-data").subscribe({
      next: (orders: any[]) => {
        const headers =
          "Order Number,Date,Customer,Email,Phone,Payment Method,Status,Subtotal,Delivery,Total,Items\n";
        const rows = orders
          .map(
            (o) =>
              `${o.orderNumber},${new Date(o.createdAt).toLocaleDateString()},${o.deliveryFullName},${o.deliveryEmail},${o.deliveryPhone},${o.selectedPaymentMethod || ""},${o.status},${o.subtotal},${o.deliveryFee},${o.totalAmount},${o.items?.length || 0}`,
          )
          .join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "orders.csv";
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert("Export failed"),
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

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: "Pending",
      paid: "Paid",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  }

  getPrimaryImage(product: any) {
    const img =
      product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = img?.imageUrl || "";
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
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
