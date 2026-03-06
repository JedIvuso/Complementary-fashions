import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { OrdersService } from "../../core/services/orders.service";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
          @for (i of [1, 2, 3]; track i) {
            <div
              class="skeleton"
              style="height: 120px; border-radius: 16px; margin-bottom: 16px;"
            ></div>
          }
        } @else if (!orders().length) {
          <div class="empty-state text-center">
            <div style="font-size: 3rem; margin-bottom: 16px;">📦</div>
            <h2>No orders yet</h2>
            <p>Your order history will appear here once you make a purchase.</p>
            <a
              routerLink="/products"
              class="btn btn-primary"
              style="margin-top: 24px;"
              >Start Shopping →</a
            >
          </div>
        } @else {
          @for (order of orders(); track order.id) {
            <div class="order-card card" [class]="'status-' + order.status">
              <div class="order-header">
                <div>
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <span class="order-date">{{
                    order.createdAt | date: "mediumDate"
                  }}</span>
                </div>
                <span class="badge" [ngClass]="getStatusClass(order.status)">
                  {{ order.status | titlecase }}
                </span>
              </div>

              <div class="order-items">
                @for (item of order.items?.slice(0, 3); track item.id) {
                  <div class="order-item-thumb">
                    <img
                      [src]="getPrimaryImage(item.product)"
                      [alt]="item.productName"
                    />
                  </div>
                }
                @if (order.items?.length > 3) {
                  <div class="more-items">+{{ order.items.length - 3 }}</div>
                }
              </div>

              <div class="order-footer">
                <div class="order-summary-text">
                  {{ order.items?.length }}
                  {{ order.items?.length === 1 ? "item" : "items" }}
                </div>
                <div class="order-right">
                  <div class="order-total">
                    KSh {{ order.totalAmount | number: "1.0-0" }}
                  </div>

                  <!-- Resume Checkout for pending unpaid orders -->
                  @if (order.status === "pending") {
                    <div class="resume-actions">
                      <span class="resume-label">⚠ Payment pending</span>
                      <button
                        class="btn btn-mpesa btn-sm"
                        [disabled]="payingOrderId() === order.id"
                        (click)="payWithMpesa(order)"
                      >
                        {{
                          payingOrderId() === order.id
                            ? "Sending..."
                            : "📱 Pay via M-Pesa"
                        }}
                      </button>
                      <button
                        class="btn btn-outline btn-sm"
                        (click)="openManualPay(order)"
                      >
                        🏦 Other Payment
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Manual Payment Modal -->
    @if (manualPayOrder()) {
      <div class="modal-overlay" (click)="closeManualPay()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Complete Your Payment</h2>
            <button class="close-btn" (click)="closeManualPay()">✕</button>
          </div>
          <div class="modal-body">
            <div class="order-summary-box">
              <div class="summary-row">
                <span>Order</span
                ><strong>{{ manualPayOrder().orderNumber }}</strong>
              </div>
              <div class="summary-row total-row">
                <span>Amount Due</span
                ><strong
                  >KSh
                  {{ manualPayOrder().totalAmount | number: "1.0-0" }}</strong
                >
              </div>
            </div>
            <h3>Pay via M-Pesa Paybill</h3>
            <div class="pay-steps">
              <div class="pay-step">
                <span class="step-num">1</span> Go to M-Pesa on your phone
              </div>
              <div class="pay-step">
                <span class="step-num">2</span> Select
                <strong>Lipa na M-Pesa → Paybill</strong>
              </div>
              <div class="pay-step">
                <span class="step-num">3</span> Business No:
                <strong class="highlight">522533</strong>
              </div>
              <div class="pay-step">
                <span class="step-num">4</span> Account No:
                <strong class="highlight">{{
                  manualPayOrder().orderNumber
                }}</strong>
              </div>
              <div class="pay-step">
                <span class="step-num">5</span> Amount:
                <strong class="highlight"
                  >KSh
                  {{ manualPayOrder().totalAmount | number: "1.0-0" }}</strong
                >
              </div>
            </div>
            <div class="confirm-section">
              <p>Once paid, enter your M-Pesa confirmation code:</p>
              <input
                class="form-input"
                [(ngModel)]="mpesaCode"
                placeholder="e.g. QKG7XXXXXXX"
                style="text-transform: uppercase"
              />
              @if (payError()) {
                <div class="pay-error">{{ payError() }}</div>
              }
              <button
                class="btn btn-primary btn-full"
                [disabled]="confirmingPayment()"
                (click)="confirmManualPayment()"
              >
                {{ confirmingPayment() ? "Confirming..." : "Confirm Payment" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .page-header {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        padding: 60px 0 40px;
      }
      .page-header h1 {
        font-style: italic;
      }
      .order-card {
        padding: 24px;
        margin-bottom: 16px;
        border-left: 4px solid var(--color-border);
      }
      .order-card.status-paid {
        border-left-color: #10b981;
      }
      .order-card.status-shipped {
        border-left-color: var(--color-accent);
      }
      .order-card.status-delivered {
        border-left-color: #f59e0b;
      }
      .order-card.status-pending {
        border-left-color: #f97316;
      }
      .order-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .order-number {
        font-family: var(--font-display);
        font-size: 1.125rem;
        font-weight: 600;
        display: block;
      }
      .order-date {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
      }
      .order-items {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        align-items: center;
      }
      .order-item-thumb {
        width: 56px;
        height: 64px;
        border-radius: 8px;
        overflow: hidden;
      }
      .order-item-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .more-items {
        width: 56px;
        height: 64px;
        border-radius: 8px;
        background: var(--color-surface-2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border);
      }
      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-top: 16px;
        border-top: 1px solid var(--color-border);
      }
      .order-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }
      .order-summary-text {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        align-self: center;
      }
      .order-total {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-accent);
      }
      .resume-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
      .resume-label {
        font-size: 0.8125rem;
        color: #f97316;
        font-weight: 500;
      }
      .btn {
        padding: 9px 18px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.875rem;
      }
      .btn-sm {
        padding: 8px 16px;
        font-size: 0.8125rem;
      }
      .btn-mpesa {
        background: #4caf50;
        color: white;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--color-border);
        color: var(--color-text);
      }
      .btn-primary {
        background: var(--color-accent);
        color: white;
      }
      .btn-full {
        width: 100%;
        margin-top: 12px;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .empty-state {
        padding: 80px 0;
      }
      /* Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .modal-card {
        background: var(--color-surface);
        border-radius: 16px;
        width: 100%;
        max-width: 480px;
        max-height: 90vh;
        overflow-y: auto;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 28px 0;
      }
      .modal-header h2 {
        font-family: var(--font-display);
        font-size: 1.375rem;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: var(--color-text-muted);
      }
      .modal-body {
        padding: 20px 28px 28px;
      }
      .order-summary-box {
        background: var(--color-bg);
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
      }
      .total-row {
        font-size: 1.125rem;
        color: var(--color-text);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--color-border);
      }
      h3 {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 14px;
      }
      .pay-steps {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
      }
      .pay-step {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.9375rem;
      }
      .step-num {
        width: 26px;
        height: 26px;
        background: var(--color-accent);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8125rem;
        font-weight: 600;
        flex-shrink: 0;
      }
      .highlight {
        color: var(--color-accent);
        font-size: 1.05em;
      }
      .confirm-section p {
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        margin-bottom: 10px;
      }
      .form-input {
        width: 100%;
        padding: 11px 14px;
        border: 1.5px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.9375rem;
        box-sizing: border-box;
      }
      .pay-error {
        color: #dc2626;
        font-size: 0.875rem;
        margin: 8px 0;
      }
    `,
  ],
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);
  payingOrderId = signal<string | null>(null);
  manualPayOrder = signal<any>(null);
  mpesaCode = "";
  confirmingPayment = signal(false);
  payError = signal("");

  constructor(
    private ordersService: OrdersService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  payWithMpesa(order: any) {
    const phone = prompt("Enter your M-Pesa phone number (e.g. 0712345678):");
    if (!phone) return;
    this.payingOrderId.set(order.id);
    this.api
      .post(`/payments/mpesa/stk-push`, { orderId: order.id, phone })
      .subscribe({
        next: () => {
          this.payingOrderId.set(null);
          alert(
            "M-Pesa prompt sent to your phone. Enter your PIN to complete payment.",
          );
        },
        error: () => {
          this.payingOrderId.set(null);
          alert("M-Pesa request failed. Please try the manual payment option.");
        },
      });
  }

  openManualPay(order: any) {
    this.manualPayOrder.set(order);
    this.mpesaCode = "";
    this.payError.set("");
  }

  closeManualPay() {
    this.manualPayOrder.set(null);
  }

  confirmManualPayment() {
    if (!this.mpesaCode.trim())
      return this.payError.set("Please enter your M-Pesa confirmation code");
    this.confirmingPayment.set(true);
    this.api
      .post("/payments/confirm", {
        orderId: this.manualPayOrder().id,
        mpesaCode: this.mpesaCode.trim().toUpperCase(),
      })
      .subscribe({
        next: () => {
          this.confirmingPayment.set(false);
          this.closeManualPay();
          // Refresh orders
          this.ordersService.getMyOrders().subscribe((o) => this.orders.set(o));
          alert("Payment confirmed! Your order is being processed.");
        },
        error: (err) => {
          this.confirmingPayment.set(false);
          this.payError.set(
            err.error?.message ||
              "Confirmation failed. Please contact support.",
          );
        },
      });
  }

  getPrimaryImage(product: any) {
    const img =
      product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = img?.imageUrl || "";
    return url.startsWith("http") ? url : `http://localhost:3000${url}`;
  }

  getStatusClass(status: string) {
    const map: any = {
      pending: "badge-accent",
      paid: "badge-success",
      shipped: "badge-gold",
      delivered: "badge-success",
      cancelled: "badge-error",
    };
    return map[status] || "badge-accent";
  }
}
