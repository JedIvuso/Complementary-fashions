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
              style="height: 140px; border-radius: 16px; margin-bottom: 16px;"
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
                  @if (
                    order.status === "pending" &&
                    shouldShowCompletePayment(order)
                  ) {
                    <div class="resume-section">
                      <span class="resume-label">⚠ Payment pending</span>
                      <button
                        class="btn btn-resume"
                        (click)="openResumeModal(order)"
                      >
                        Complete Payment →
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

    <!-- Resume Payment Modal -->
    @if (resumeOrder()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Complete Payment</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <!-- Order info -->
            <div class="order-box">
              <div class="order-row">
                <span>Order</span
                ><strong>{{ resumeOrder().orderNumber }}</strong>
              </div>
              <div class="order-row total-row">
                <span>Amount Due</span
                ><strong
                  >KSh {{ resumeOrder().totalAmount | number: "1.0-0" }}</strong
                >
              </div>
            </div>

            @if (!modalStep()) {
              <!-- Choose payment method -->
              <p class="modal-label">How would you like to pay?</p>
              @if (loadingSettings()) {
                <div
                  class="skeleton"
                  style="height:160px;border-radius:10px"
                ></div>
              } @else {
                <div class="modal-methods">
                  @if (ps()?.mpesaStkEnabled) {
                    <div
                      class="modal-method"
                      (click)="selectModalMethod('stk')"
                    >
                      <span>📱</span>
                      <div>
                        <strong>M-Pesa STK Push</strong>
                        <p>Get a prompt on your phone</p>
                      </div>
                    </div>
                  }
                  @if (ps()?.paybillEnabled) {
                    <div
                      class="modal-method"
                      (click)="selectModalMethod('paybill')"
                    >
                      <span>🏦</span>
                      <div>
                        <strong>Paybill {{ ps()?.paybillNumber }}</strong>
                        <p>Manual M-Pesa paybill</p>
                      </div>
                    </div>
                  }
                  @if (ps()?.tillEnabled) {
                    <div
                      class="modal-method"
                      (click)="selectModalMethod('till')"
                    >
                      <span>🏪</span>
                      <div>
                        <strong>Till {{ ps()?.tillNumber }}</strong>
                        <p>Buy Goods</p>
                      </div>
                    </div>
                  }
                  @if (ps()?.sendMoneyEnabled) {
                    <div
                      class="modal-method"
                      (click)="selectModalMethod('send')"
                    >
                      <span>📞</span>
                      <div>
                        <strong>Send Money</strong>
                        <p>To {{ ps()?.sendMoneyPhone }}</p>
                      </div>
                    </div>
                  }
                  @if (ps()?.payOnDeliveryEnabled) {
                    <div
                      class="modal-method"
                      (click)="selectModalMethod('cod')"
                    >
                      <span>🚚</span>
                      <div>
                        <strong>Pay on Delivery</strong>
                        <p>Cash when delivered</p>
                      </div>
                    </div>
                  }
                  @if (ps()?.payLaterEnabled) {
                    <div
                      class="modal-method"
                      (click)="selectModalMethod('later')"
                    >
                      <span>⏳</span>
                      <div>
                        <strong>Pay Later</strong>
                        <p>Before shipping</p>
                      </div>
                    </div>
                  }
                </div>
              }
            }

            @if (modalStep() === "stk-phone") {
              <p class="modal-label">Enter your M-Pesa number</p>
              <input
                class="form-input"
                [(ngModel)]="stkPhone"
                placeholder="e.g. 0712345678"
              />
              <button
                class="btn btn-primary btn-full"
                [disabled]="payingStk()"
                (click)="sendStkPush()"
              >
                {{ payingStk() ? "Sending..." : "Send M-Pesa Prompt" }}
              </button>
            }

            @if (modalStep() === "stk-waiting") {
              <div class="stk-waiting">
                <div class="spinner-lg"></div>
                <p>
                  Check your phone — <strong>{{ stkPhone }}</strong>
                </p>
                <p class="hint-text">Enter your PIN to confirm payment</p>
              </div>
            }

            @if (modalStep() === "manual-steps") {
              <div class="manual-pay-steps">
                <p class="steps-title">How to pay:</p>
                <div class="steps">
                  <div class="step">
                    <span class="step-n">1</span> Open M-Pesa on your phone
                  </div>
                  @if (modalMethod() === "paybill") {
                    <div class="step">
                      <span class="step-n">2</span> Lipa na M-Pesa →
                      <strong>Paybill</strong>
                    </div>
                    <div class="step">
                      <span class="step-n">3</span> Business No:
                      <strong class="hi">{{ ps()?.paybillNumber }}</strong>
                    </div>
                    <div class="step">
                      <span class="step-n">4</span> Account No:
                      <strong class="hi">{{
                        resumeOrder().orderNumber
                      }}</strong>
                    </div>
                    <div class="step">
                      <span class="step-n">5</span> Amount:
                      <strong class="hi"
                        >KSh
                        {{
                          resumeOrder().totalAmount | number: "1.0-0"
                        }}</strong
                      >
                    </div>
                  }
                  @if (modalMethod() === "till") {
                    <div class="step">
                      <span class="step-n">2</span> Lipa na M-Pesa →
                      <strong>Buy Goods</strong>
                    </div>
                    <div class="step">
                      <span class="step-n">3</span> Till No:
                      <strong class="hi">{{ ps()?.tillNumber }}</strong>
                    </div>
                    <div class="step">
                      <span class="step-n">4</span> Amount:
                      <strong class="hi"
                        >KSh
                        {{
                          resumeOrder().totalAmount | number: "1.0-0"
                        }}</strong
                      >
                    </div>
                  }
                  @if (modalMethod() === "send") {
                    <div class="step">
                      <span class="step-n">2</span> <strong>Send Money</strong>
                    </div>
                    <div class="step">
                      <span class="step-n">3</span> Number:
                      <strong class="hi">{{ ps()?.sendMoneyPhone }}</strong> ({{
                        ps()?.sendMoneyName
                      }})
                    </div>
                    <div class="step">
                      <span class="step-n">4</span> Amount:
                      <strong class="hi"
                        >KSh
                        {{
                          resumeOrder().totalAmount | number: "1.0-0"
                        }}</strong
                      >
                    </div>
                  }
                </div>
                <label class="form-label" style="margin-top:14px"
                  >M-Pesa Confirmation Code</label
                >
                <input
                  class="form-input"
                  [(ngModel)]="confirmCode"
                  placeholder="e.g. QKG7XXXXXXX"
                  style="text-transform:uppercase"
                />
                @if (confirmError()) {
                  <div class="pay-error">{{ confirmError() }}</div>
                }
                <button
                  class="btn btn-primary btn-full"
                  [disabled]="confirmingPay()"
                  (click)="submitConfirmCode()"
                >
                  {{ confirmingPay() ? "Confirming..." : "Confirm Payment" }}
                </button>
              </div>
            }

            @if (modalStep() === "done") {
              <div class="done-state">
                <div class="done-icon">{{ doneIcon() }}</div>
                <h3>{{ doneTitle() }}</h3>
                <p>{{ serverMessage() }}</p>
                <button
                  class="btn btn-primary"
                  style="margin-top:16px;width:100%"
                  (click)="closeModal()"
                >
                  Close
                </button>
              </div>
            }
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
        justify-content: space-between;
        align-items: center;
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
        gap: 8px;
      }
      .order-total {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-accent);
      }
      .order-summary-text {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        align-self: center;
      }
      .resume-section {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
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
        text-decoration: none;
      }
      .btn-primary {
        background: var(--color-accent);
        color: white;
      }
      .btn-resume {
        background: var(--color-accent);
        color: white;
        font-size: 0.875rem;
      }
      .btn-full {
        width: 100%;
        margin-top: 12px;
        text-align: center;
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
        max-width: 460px;
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
      .order-box {
        background: var(--color-bg);
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 18px;
      }
      .order-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9375rem;
        color: var(--color-text-secondary);
        padding: 3px 0;
      }
      .total-row {
        color: var(--color-text);
        font-size: 1.1rem;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid var(--color-border);
      }
      .modal-label {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .modal-methods {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .modal-method {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border: 1.5px solid var(--color-border);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .modal-method:hover {
        border-color: var(--color-accent);
        background: rgba(201, 112, 58, 0.04);
      }
      .modal-method span {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      .modal-method strong {
        font-size: 0.9375rem;
        font-weight: 600;
        display: block;
      }
      .modal-method p {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin: 0;
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
      /* STK waiting */
      .stk-waiting {
        text-align: center;
        padding: 16px 0;
      }
      .spinner-lg {
        width: 40px;
        height: 40px;
        border: 4px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 14px;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .hint-text {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 6px;
      }
      /* Manual steps */
      .steps-title {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .steps {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .step {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9375rem;
      }
      .step-n {
        width: 24px;
        height: 24px;
        background: var(--color-accent);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .hi {
        color: var(--color-accent);
      }
      .pay-error {
        color: #dc2626;
        font-size: 0.875rem;
        margin: 8px 0 0;
      }
      .form-label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 6px;
      }
      /* Done */
      .done-state {
        text-align: center;
        padding: 16px 0;
      }
      .done-icon {
        font-size: 3rem;
        margin-bottom: 12px;
      }
      .done-state h3 {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(true);
  resumeOrder = signal<any>(null);
  modalStep = signal("");
  modalMethod = signal("");
  ps = signal<any>(null);
  loadingSettings = signal(true);
  stkPhone = "";
  confirmCode = "";
  payingStk = signal(false);
  confirmingPay = signal(false);
  confirmError = signal("");
  serverMessage = signal("");

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
    this.api.get<any>("/payments/settings/public").subscribe({
      next: (s) => {
        this.ps.set(s);
        this.loadingSettings.set(false);
      },
      error: () => this.loadingSettings.set(false),
    });
  }

  openResumeModal(order: any) {
    this.resumeOrder.set(order);
    this.modalStep.set("");
    this.modalMethod.set("");
    this.confirmCode = "";
    this.stkPhone = "";
    this.confirmError.set("");
  }

  closeModal() {
    this.resumeOrder.set(null);
  }

  selectModalMethod(method: string) {
    this.modalMethod.set(method);
    if (method === "stk") {
      this.modalStep.set("stk-phone");
    } else if (method === "cod" || method === "later") {
      this.api
        .post("/payments/confirm", {
          orderId: this.resumeOrder().id,
          mpesaCode: "N/A",
          method,
        })
        .subscribe({
          next: (res: any) => {
            this.serverMessage.set(
              res.message ||
                (method === "cod"
                  ? "Your order is confirmed. Have your payment ready when it arrives."
                  : "Your order is confirmed. Please complete payment before it is shipped."),
            );
            this.modalStep.set("done");
            this.refreshOrders();
          },
          error: () => {
            this.serverMessage.set("Your order has been noted.");
            this.modalStep.set("done");
          },
        });
    } else {
      this.modalStep.set("manual-steps");
    }
  }

  sendStkPush() {
    if (!this.stkPhone) return;
    this.payingStk.set(true);
    this.api
      .post("/payments/mpesa/stk-push", {
        orderId: this.resumeOrder().id,
        phone: this.stkPhone,
      })
      .subscribe({
        next: () => {
          this.payingStk.set(false);
          this.modalStep.set("stk-waiting");
        },
        error: () => {
          this.payingStk.set(false);
          alert("Failed to send STK push. Please try another method.");
        },
      });
  }

  submitConfirmCode() {
    if (!this.confirmCode.trim()) {
      this.confirmError.set("Please enter your confirmation code");
      return;
    }
    this.confirmingPay.set(true);
    this.confirmError.set("");
    this.api
      .post("/payments/confirm", {
        orderId: this.resumeOrder().id,
        mpesaCode: this.confirmCode.trim().toUpperCase(),
        method: this.modalMethod(),
      })
      .subscribe({
        next: (res: any) => {
          this.confirmingPay.set(false);
          this.serverMessage.set(
            res.message || "Payment confirmed successfully.",
          );
          this.modalStep.set("done");
          this.refreshOrders();
        },
        error: (err) => {
          this.confirmingPay.set(false);
          this.confirmError.set(err.error?.message || "Confirmation failed");
        },
      });
  }

  shouldShowCompletePayment(order: any): boolean {
    // Pay on Delivery: no digital payment needed, hide the button permanently
    if (order.selectedPaymentMethod === "cod") return false;
    // Pay Later, no method yet, or any other method: keep button visible
    return true;
  }

  doneIcon() {
    const m = this.modalMethod();
    if (m === "cod") return "🚚";
    if (m === "later") return "⏳";
    return "✅";
  }

  doneTitle() {
    const m = this.modalMethod();
    if (m === "cod") return "Order Confirmed!";
    if (m === "later") return "Order Confirmed!";
    return "Payment Confirmed!";
  }

  refreshOrders() {
    this.ordersService.getMyOrders().subscribe((o) => this.orders.set(o));
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
