import { environment } from "../../../environments/environment";
import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CartService } from "../../core/services/cart.service";
import { OrdersService } from "../../core/services/orders.service";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-page page-enter">
      <div class="page-header">
        <div class="container">
          <span class="section-label">Almost There</span>
          <h1>Checkout</h1>
        </div>
      </div>

      <div class="container checkout-layout">
        <!-- STEP 1: Delivery -->
        @if (step() === "delivery") {
          <div class="checkout-form card">
            <h3>Delivery Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input
                  class="form-input"
                  [(ngModel)]="delivery.fullName"
                  placeholder="Your full name"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input
                  class="form-input"
                  [(ngModel)]="delivery.phone"
                  placeholder="07XX XXX XXX"
                />
              </div>
              <div class="form-group span-2">
                <label class="form-label">Email Address *</label>
                <input
                  class="form-input"
                  type="email"
                  [(ngModel)]="delivery.email"
                  placeholder="your@email.com"
                />
              </div>
              <div class="form-group span-2">
                <label class="form-label">Delivery Address *</label>
                <textarea
                  class="form-textarea"
                  [(ngModel)]="delivery.address"
                  placeholder="Street, building, apartment..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">City / Town</label>
                <input
                  class="form-input"
                  [(ngModel)]="delivery.city"
                  placeholder="Nairobi"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Order Notes (Optional)</label>
                <input
                  class="form-input"
                  [(ngModel)]="delivery.notes"
                  placeholder="Any special instructions"
                />
              </div>
            </div>
            <button
              class="btn btn-primary"
              style="margin-top: 24px;"
              (click)="continueToPayment()"
            >
              Continue to Payment →
            </button>
          </div>
        }

        <!-- STEP 2: Choose Payment Method -->
        @if (step() === "payment") {
          <div class="checkout-form card">
            <h3>Choose Payment Method</h3>

            @if (loadingPaymentSettings()) {
              <div
                class="skeleton"
                style="height: 200px; border-radius: 10px;"
              ></div>
            } @else if (!hasAnyMethod()) {
              <div class="no-methods">
                ⚠️ No payment methods are currently available. Please contact
                the store.
              </div>
            } @else {
              <div class="methods-grid">
                @if (ps()?.mpesaStkEnabled) {
                  <div
                    class="method-option"
                    [class.selected]="selectedMethod() === 'stk'"
                    (click)="selectMethod('stk')"
                  >
                    <div class="method-radio">
                      <span [class.filled]="selectedMethod() === 'stk'"></span>
                    </div>
                    <span class="method-icon">📱</span>
                    <div>
                      <strong>M-Pesa STK Push</strong>
                      <p>Enter your phone number and get a payment prompt</p>
                    </div>
                  </div>
                }

                @if (ps()?.paybillEnabled) {
                  <div
                    class="method-option"
                    [class.selected]="selectedMethod() === 'paybill'"
                    (click)="selectMethod('paybill')"
                  >
                    <div class="method-radio">
                      <span
                        [class.filled]="selectedMethod() === 'paybill'"
                      ></span>
                    </div>
                    <span class="method-icon">🏦</span>
                    <div>
                      <strong>M-Pesa Paybill</strong>
                      <p>
                        Pay to Business No:
                        <strong>{{ ps()?.paybillNumber }}</strong>
                      </p>
                    </div>
                  </div>
                }

                @if (ps()?.tillEnabled) {
                  <div
                    class="method-option"
                    [class.selected]="selectedMethod() === 'till'"
                    (click)="selectMethod('till')"
                  >
                    <div class="method-radio">
                      <span [class.filled]="selectedMethod() === 'till'"></span>
                    </div>
                    <span class="method-icon">🏪</span>
                    <div>
                      <strong>M-Pesa Till (Buy Goods)</strong>
                      <p>
                        Till No: <strong>{{ ps()?.tillNumber }}</strong> —
                        {{ ps()?.tillName }}
                      </p>
                    </div>
                  </div>
                }

                @if (ps()?.sendMoneyEnabled) {
                  <div
                    class="method-option"
                    [class.selected]="selectedMethod() === 'send'"
                    (click)="selectMethod('send')"
                  >
                    <div class="method-radio">
                      <span [class.filled]="selectedMethod() === 'send'"></span>
                    </div>
                    <span class="method-icon">📞</span>
                    <div>
                      <strong>Send Money</strong>
                      <p>
                        Send to <strong>{{ ps()?.sendMoneyPhone }}</strong> —
                        {{ ps()?.sendMoneyName }}
                      </p>
                    </div>
                  </div>
                }

                @if (ps()?.payOnDeliveryEnabled) {
                  <div
                    class="method-option"
                    [class.selected]="selectedMethod() === 'cod'"
                    (click)="selectMethod('cod')"
                  >
                    <div class="method-radio">
                      <span [class.filled]="selectedMethod() === 'cod'"></span>
                    </div>
                    <span class="method-icon">🚚</span>
                    <div>
                      <strong>Pay on Delivery</strong>
                      <p>
                        {{
                          ps()?.payOnDeliveryInstructions ||
                            "Pay cash when your order arrives"
                        }}
                      </p>
                    </div>
                  </div>
                }

                @if (ps()?.payLaterEnabled) {
                  <div
                    class="method-option"
                    [class.selected]="selectedMethod() === 'later'"
                    (click)="selectMethod('later')"
                  >
                    <div class="method-radio">
                      <span
                        [class.filled]="selectedMethod() === 'later'"
                      ></span>
                    </div>
                    <span class="method-icon">⏳</span>
                    <div>
                      <strong>Pay Later</strong>
                      <p>
                        {{
                          ps()?.payLaterInstructions ||
                            "Pay before your order is shipped"
                        }}
                      </p>
                    </div>
                  </div>
                }
              </div>

              <!-- Extra fields per method -->
              @if (selectedMethod() === "stk") {
                <div class="method-detail">
                  <label class="form-label">Your M-Pesa Phone Number *</label>
                  <input
                    class="form-input"
                    [(ngModel)]="mpesaPhone"
                    placeholder="e.g. 0712345678"
                  />
                  <small class="hint"
                    >You will receive a prompt on this number to enter your
                    PIN.</small
                  >
                </div>
              }

              @if (
                selectedMethod() === "paybill" ||
                selectedMethod() === "till" ||
                selectedMethod() === "send"
              ) {
                <div class="method-detail manual-steps">
                  <p class="steps-title">How to pay:</p>
                  <div class="steps">
                    <div class="step">
                      <span class="step-n">1</span> Open M-Pesa on your phone
                    </div>
                    @if (selectedMethod() === "paybill") {
                      <div class="step">
                        <span class="step-n">2</span> Select
                        <strong>Lipa na M-Pesa → Paybill</strong>
                      </div>
                      <div class="step">
                        <span class="step-n">3</span> Business No:
                        <strong class="accent">{{
                          ps()?.paybillNumber
                        }}</strong>
                      </div>
                      <div class="step">
                        <span class="step-n">4</span> Account No:
                        @if (
                          ps()?.paybillAccountFormat === "STORE_NAME" &&
                          ps()?.paybillStoreName
                        ) {
                          <strong class="accent">{{
                            ps()?.paybillStoreName
                          }}</strong>
                        } @else if (currentOrderNumber()) {
                          <strong class="accent">{{
                            currentOrderNumber()
                          }}</strong>
                        } @else {
                          <strong class="accent"
                            >Your order number (shown after placing)</strong
                          >
                        }
                      </div>
                    }
                    @if (selectedMethod() === "till") {
                      <div class="step">
                        <span class="step-n">2</span> Select
                        <strong>Lipa na M-Pesa → Buy Goods</strong>
                      </div>
                      <div class="step">
                        <span class="step-n">3</span> Till No:
                        <strong class="accent">{{ ps()?.tillNumber }}</strong>
                      </div>
                    }
                    @if (selectedMethod() === "send") {
                      <div class="step">
                        <span class="step-n">2</span> Select
                        <strong>Send Money</strong>
                      </div>
                      <div class="step">
                        <span class="step-n">3</span> Number:
                        <strong class="accent">{{
                          ps()?.sendMoneyPhone
                        }}</strong>
                        ({{ ps()?.sendMoneyName }})
                      </div>
                    }
                    <div class="step">
                      <span class="step-n">{{
                        selectedMethod() === "paybill" ? "5" : "4"
                      }}</span>
                      Amount:
                      <strong class="accent"
                        >KSh {{ displayTotal() | number: "1.0-0" }}</strong
                      >
                    </div>
                  </div>
                  <p class="confirm-note">
                    After paying, you'll be asked to enter your M-Pesa
                    confirmation code to confirm your order.
                  </p>
                </div>
              }

              <div class="checkout-actions">
                <button
                  class="btn btn-secondary"
                  (click)="step.set('delivery')"
                >
                  ← Back
                </button>
                <button
                  class="btn btn-primary"
                  [disabled]="processingOrder() || !selectedMethod()"
                  (click)="placeOrder()"
                >
                  @if (processingOrder()) {
                    Placing Order...
                  } @else if (currentOrderId() && selectedMethod() === "stk") {
                    Retry STK Push →
                  } @else if (
                    currentOrderId() &&
                    (selectedMethod() === "cod" || selectedMethod() === "later")
                  ) {
                    Place Order →
                  } @else if (currentOrderId()) {
                    Proceed to Pay →
                  } @else if (selectedMethod() === "stk") {
                    Pay KSh {{ displayTotal() | number: "1.0-0" }} →
                  } @else if (
                    selectedMethod() === "cod" || selectedMethod() === "later"
                  ) {
                    Place Order →
                  } @else {
                    Place Order & Pay →
                  }
                </button>
              </div>
            }
          </div>
        }

        <!-- STEP 3a: STK Push waiting -->
        @if (step() === "pending-payment") {
          <div class="checkout-form card text-center">
            <div class="pending-icon">📲</div>
            <h3>Check Your Phone</h3>
            <p>
              An M-Pesa STK push has been sent to
              <strong>{{ mpesaPhone }}</strong
              >.
            </p>
            <p style="margin-top: 8px; color: var(--color-text-secondary);">
              Enter your M-Pesa PIN to complete the payment.
            </p>
            <div class="payment-timer">
              <div class="spinner"></div>
              Waiting for payment confirmation...
            </div>
            <p class="order-ref">Order {{ currentOrderNumber() }}</p>
          </div>
        }

        <!-- STEP 3b: Manual payment confirm code -->
        @if (step() === "confirm-code") {
          <div class="checkout-form card">
            <h3>Confirm Your Payment</h3>
            <div class="order-summary-box">
              <div class="sum-row">
                <span>Order</span><strong>{{ currentOrderNumber() }}</strong>
              </div>
              <div class="sum-row total-row">
                <span>Amount</span
                ><strong>KSh {{ displayTotal() | number: "1.0-0" }}</strong>
              </div>
            </div>
            <div class="method-detail">
              <label class="form-label">M-Pesa Confirmation Code *</label>
              <input
                class="form-input"
                [(ngModel)]="confirmCode"
                placeholder="e.g. QKG7XXXXXXX"
                style="text-transform: uppercase; letter-spacing: 0.05em;"
              />
              <small class="hint"
                >This is the code in the SMS you received from M-Pesa after
                payment.</small
              >
            </div>
            @if (confirmError()) {
              <div class="error-msg">{{ confirmError() }}</div>
            }
            <div class="checkout-actions">
              <button class="btn btn-secondary" (click)="step.set('payment')">
                ← Back
              </button>
              <button
                class="btn btn-primary"
                [disabled]="confirmingPayment()"
                (click)="confirmCode_submit()"
              >
                {{
                  confirmingPayment() ? "Confirming..." : "Confirm Payment →"
                }}
              </button>
            </div>
          </div>
        }

        <!-- STEP 4: Confirmed -->
        @if (step() === "confirmed") {
          <div class="checkout-form card text-center">
            <div class="success-icon">✅</div>
            <h3>Order Confirmed!</h3>
            @if (selectedMethod() === "cod") {
              <p>
                Your order is placed! Have your payment ready when it arrives.
              </p>
            } @else if (selectedMethod() === "later") {
              <p>
                Your order is placed! Please complete payment before it is
                shipped.
              </p>
            } @else {
              <p>
                Thank you! Your handcrafted pieces are being prepared with love.
              </p>
            }
            <p class="order-number">Order {{ currentOrderNumber() }}</p>
            <div class="checkout-actions" style="justify-content: center;">
              <a routerLink="/orders" class="btn btn-primary"
                >Track My Order →</a
              >
              <a routerLink="/products" class="btn btn-secondary"
                >Continue Shopping</a
              >
            </div>
          </div>
        }

        <!-- Order Summary sidebar -->
        @if (cart()?.items?.length || resumedTotal()) {
          <div class="order-summary card">
            <h3>Order Summary</h3>
            @for (item of cart()?.items; track item.id) {
              <div class="summary-item">
                <div class="summary-item-img">
                  <img
                    [src]="getPrimaryImage(item.product)"
                    [alt]="item.product?.name"
                  />
                  <span class="qty-badge">{{ item.quantity }}</span>
                </div>
                <div style="flex: 1;">
                  <p style="font-weight: 500; color: var(--color-text);">
                    {{ item.product?.name }}
                  </p>
                  @if (item.variant?.size) {
                    <small class="text-muted">{{ item.variant.size }}</small>
                  }
                </div>
                <span class="price"
                  >KSh {{ getItemTotal(item) | number: "1.0-0" }}</span
                >
              </div>
            }
            <div
              style="border-top: 1px solid var(--color-border); margin-top: 16px; padding-top: 16px;"
            >
              <div class="summary-line">
                <span>Subtotal</span>
                <span
                  >KSh
                  {{
                    resumedSubtotal() ?? cart()?.subtotal ?? 0 | number: "1.0-0"
                  }}</span
                >
              </div>
              <div class="summary-line">
                <span>Delivery</span>
                <span
                  >KSh
                  {{
                    resumedDelivery() ?? cart()?.deliveryFee ?? 0
                      | number: "1.0-0"
                  }}</span
                >
              </div>
              <div class="summary-line total">
                <span>Total</span>
                <span>KSh {{ displayTotal() | number: "1.0-0" }}</span>
              </div>
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
        padding: 60px 0 40px;
      }
      .page-header h1 {
        font-style: italic;
      }
      .checkout-layout {
        padding: 48px 24px;
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 32px;
        align-items: start;
      }
      .checkout-form {
        padding: 32px;
      }
      .checkout-form h3 {
        font-size: 1.375rem;
        margin-bottom: 24px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .span-2 {
        grid-column: 1 / -1;
      }
      /* Payment methods */
      .methods-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .method-option {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px;
        border: 1.5px solid var(--color-border);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .method-option:hover {
        border-color: var(--color-accent);
        background: rgba(201, 112, 58, 0.03);
      }
      .method-option.selected {
        border-color: var(--color-accent);
        background: rgba(201, 112, 58, 0.06);
      }
      .method-radio {
        width: 20px;
        height: 20px;
        border: 2px solid var(--color-border);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .method-option.selected .method-radio {
        border-color: var(--color-accent);
      }
      .method-radio span {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--color-accent);
        display: none;
      }
      .method-radio span.filled {
        display: block;
      }
      .method-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      .method-option strong {
        font-size: 0.9375rem;
        font-weight: 600;
      }
      .method-option p {
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        margin-top: 2px;
      }
      /* Method detail */
      .method-detail {
        margin-top: 20px;
        padding: 20px;
        background: var(--color-bg);
        border-radius: 10px;
        border: 1px solid var(--color-border);
      }
      .hint {
        display: block;
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 6px;
      }
      .manual-steps {
      }
      .steps-title {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .steps {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 14px;
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
      .accent {
        color: var(--color-accent);
      }
      .confirm-note {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        border-top: 1px solid var(--color-border);
        padding-top: 12px;
      }
      /* Actions */
      .checkout-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }
      .btn {
        padding: 11px 24px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9375rem;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
      }
      .btn-primary {
        background: var(--color-accent);
        color: white;
      }
      .btn-secondary {
        background: var(--color-surface);
        border: 1.5px solid var(--color-border);
        color: var(--color-text);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      /* Pending */
      .pending-icon {
        font-size: 3rem;
        margin-bottom: 16px;
      }
      .payment-timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin: 20px 0;
        color: var(--color-text-secondary);
        font-size: 0.9375rem;
      }
      .spinner {
        width: 28px;
        height: 28px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .order-ref {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        margin-top: 8px;
      }
      /* Summary box */
      .order-summary-box {
        background: var(--color-bg);
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .sum-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        color: var(--color-text-secondary);
      }
      .total-row {
        font-size: 1.1rem;
        color: var(--color-text);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--color-border);
      }
      /* Confirmed */
      .success-icon {
        font-size: 3.5rem;
        margin-bottom: 16px;
      }
      .order-number {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-accent);
        margin: 16px 0;
      }
      /* Error */
      .error-msg {
        padding: 10px 14px;
        border-radius: 8px;
        background: rgba(220, 38, 38, 0.08);
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 10px;
      }
      .no-methods {
        padding: 20px;
        background: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 8px;
        color: #92400e;
      }
      /* Order summary sidebar */
      .order-summary {
        padding: 28px;
        position: sticky;
        top: 100px;
      }
      .order-summary h3 {
        margin-bottom: 20px;
        font-size: 1.25rem;
      }
      .summary-item {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
      }
      .summary-item-img {
        position: relative;
        width: 56px;
        height: 64px;
        flex-shrink: 0;
      }
      .summary-item-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      }
      .qty-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--color-accent);
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .summary-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 0.9375rem;
      }
      .summary-line.total {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-accent);
        margin-top: 8px;
      }
      @media (max-width: 768px) {
        .checkout-layout {
          grid-template-columns: 1fr;
        }
        .order-summary {
          position: static;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .span-2 {
          grid-column: 1;
        }
      }
    `,
  ],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart = signal<any>(null);
  step = signal<
    "delivery" | "payment" | "pending-payment" | "confirm-code" | "confirmed"
  >("delivery");
  processingOrder = signal(false);
  confirmingPayment = signal(false);
  currentOrderId = signal<string | null>(null);
  currentOrderNumber = signal<string | null>(null);
  checkoutRequestId = signal<string | null>(null);
  resumedTotal = signal<number | null>(null);
  resumedSubtotal = signal<number | null>(null);
  resumedDelivery = signal<number | null>(null);
  selectedMethod = signal<string>("");
  loadingPaymentSettings = signal(true);
  ps = signal<any>(null);
  confirmError = signal("");
  private pollInterval: any;

  delivery = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  };
  mpesaPhone = "";
  confirmCode = "";

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private api: ApiService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe({ next: (c) => this.cart.set(c) });
    const user = this.auth.user();
    if (user) {
      this.delivery.email = user.email;
      this.delivery.fullName = `${user.firstName} ${user.lastName}`;
      // phone pre-fill skipped (not on User type)
    }
    this.api.get<any>("/payments/settings/public").subscribe({
      next: (s) => {
        this.ps.set(s);
        this.loadingPaymentSettings.set(false);
        // Auto-select first available method
        if (s.mpesaStkEnabled) this.selectedMethod.set("stk");
        else if (s.paybillEnabled) this.selectedMethod.set("paybill");
        else if (s.tillEnabled) this.selectedMethod.set("till");
        else if (s.sendMoneyEnabled) this.selectedMethod.set("send");
        else if (s.payOnDeliveryEnabled) this.selectedMethod.set("cod");
        else if (s.payLaterEnabled) this.selectedMethod.set("later");

        // Check if arriving via "Complete Payment" from order detail page
        const resume = history.state?.resumeOrder;
        if (resume) {
          this.currentOrderId.set(resume.id);
          this.currentOrderNumber.set(resume.orderNumber);
          this.delivery.fullName =
            resume.deliveryFullName || this.delivery.fullName;
          this.delivery.phone = resume.deliveryPhone || "";
          this.delivery.email = resume.deliveryEmail || this.delivery.email;
          this.delivery.address = resume.deliveryAddress || "";
          this.delivery.city = resume.deliveryCity || "";
          // Pre-select their previously chosen method if available
          const prev = resume.selectedPaymentMethod;
          if (prev && prev !== "cod" && prev !== "later") {
            this.selectedMethod.set(prev === "mpesa-stk" ? "stk" : prev);
          }
          this.resumedTotal.set(
            resume.total != null ? Number(resume.total) : null,
          );
          this.resumedSubtotal.set(
            resume.subtotal != null ? Number(resume.subtotal) : null,
          );
          this.resumedDelivery.set(
            resume.deliveryFee != null ? Number(resume.deliveryFee) : null,
          );
          // Skip delivery step — go straight to payment
          this.step.set("payment");
        }
      },
      error: () => this.loadingPaymentSettings.set(false),
    });
  }

  hasAnyMethod() {
    const s = this.ps();
    return (
      s &&
      (s.mpesaStkEnabled ||
        s.paybillEnabled ||
        s.tillEnabled ||
        s.sendMoneyEnabled ||
        s.payOnDeliveryEnabled ||
        s.payLaterEnabled)
    );
  }

  selectMethod(method: string) {
    this.selectedMethod.set(method);
  }

  continueToPayment() {
    if (
      !this.delivery.fullName ||
      !this.delivery.phone ||
      !this.delivery.email ||
      !this.delivery.address
    ) {
      this.toast.error("Please fill in all required fields");
      return;
    }
    this.step.set("payment");
  }

  displayTotal(): number {
    return this.resumedTotal() ?? this.cart()?.total ?? 0;
  }

  placeOrder() {
    if (!this.selectedMethod()) {
      this.toast.error("Please select a payment method");
      return;
    }
    if (this.selectedMethod() === "stk" && !this.mpesaPhone) {
      this.toast.error("Please enter your M-Pesa phone number");
      return;
    }

    // If order already exists (resumed from order detail or STK retry),
    // update the payment method if it changed, then proceed
    if (this.currentOrderId()) {
      const method = this.selectedMethod();
      this.processingOrder.set(true);
      this.api
        .patch(`/orders/my-orders/${this.currentOrderId()}/payment-method`, {
          paymentMethod: method,
        })
        .subscribe({
          next: () => {
            this.processingOrder.set(false);
            if (method === "stk") {
              this.initiateStkPush(this.currentOrderId()!);
            } else if (method === "cod" || method === "later") {
              this.step.set("confirmed");
            } else {
              this.step.set("confirm-code");
            }
          },
          error: () => {
            this.processingOrder.set(false);
            // Even if update fails, still proceed — non-critical
            if (method === "stk") {
              this.initiateStkPush(this.currentOrderId()!);
            } else if (method === "cod" || method === "later") {
              this.step.set("confirmed");
            } else {
              this.step.set("confirm-code");
            }
          },
        });
      return;
    }

    this.processingOrder.set(true);

    this.ordersService
      .create({ ...this.delivery, paymentMethod: this.selectedMethod() })
      .subscribe({
        next: (order) => {
          this.currentOrderId.set(order.id);
          this.currentOrderNumber.set(order.orderNumber);
          this.processingOrder.set(false);

          if (this.selectedMethod() === "stk") {
            this.initiateStkPush(order.id);
          } else if (
            this.selectedMethod() === "cod" ||
            this.selectedMethod() === "later"
          ) {
            this.step.set("confirmed");
          } else {
            // paybill / till / send money — show confirmation code form
            this.step.set("confirm-code");
          }
        },
        error: () => {
          this.processingOrder.set(false);
          this.toast.error("Failed to create order");
        },
      });
  }

  private initiateStkPush(orderId: string) {
    this.api
      .post("/payments/mpesa/initiate", {
        orderId,
        phoneNumber: this.mpesaPhone,
      })
      .subscribe({
        next: (res: any) => {
          this.checkoutRequestId.set(res.checkoutRequestId);
          this.step.set("pending-payment");
          this.startPolling();
        },
        error: (err) =>
          this.toast.error(
            err?.error?.message ||
              "Payment initiation failed. Please try again.",
          ),
      });
  }

  confirmCode_submit() {
    if (!this.confirmCode.trim()) {
      this.confirmError.set("Please enter your M-Pesa confirmation code");
      return;
    }
    this.confirmingPayment.set(true);
    this.confirmError.set("");
    this.api
      .post("/payments/confirm", {
        orderId: this.currentOrderId(),
        mpesaCode: this.confirmCode.trim().toUpperCase(),
        method: this.selectedMethod(),
      })
      .subscribe({
        next: () => {
          this.confirmingPayment.set(false);
          this.step.set("confirmed");
        },
        error: (err) => {
          this.confirmingPayment.set(false);
          this.confirmError.set(
            err.error?.message ||
              "Confirmation failed. Please try again or contact support.",
          );
        },
      });
  }

  startPolling() {
    let attempts = 0;
    this.pollInterval = setInterval(() => {
      attempts++;
      if (attempts > 24) {
        clearInterval(this.pollInterval);
        this.toast.error(
          "No response received. Please try again or choose a different method.",
        );
        this.step.set("payment");
        return;
      }
      this.api
        .get(`/payments/mpesa/status/${this.checkoutRequestId()}`)
        .subscribe({
          next: (res: any) => {
            if (res.status === "completed") {
              clearInterval(this.pollInterval);
              this.cartService.getCart().subscribe();
              this.step.set("confirmed");
            } else if (res.status === "failed") {
              clearInterval(this.pollInterval);
              this.toast.error(
                "Payment cancelled or failed. Try again or choose a different method.",
              );
              this.step.set("payment");
            }
          },
        });
    }, 5000);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  getPrimaryImage(product: any) {
    const primary =
      product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = primary?.imageUrl || "";
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
  }

  getItemTotal(item: any) {
    return (
      (Number(item.product?.price || 0) +
        Number(item.variant?.additionalPrice || 0)) *
      item.quantity
    );
  }
}
