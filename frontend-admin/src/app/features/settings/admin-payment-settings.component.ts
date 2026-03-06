import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-admin-payment-settings",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-settings-page">
      <div class="page-title-bar">
        <div>
          <h1 class="page-title">Payment Settings</h1>
          <p class="page-sub">
            Configure which payment methods customers can use at checkout
          </p>
        </div>
        <button class="btn btn-primary" [disabled]="saving()" (click)="save()">
          {{ saving() ? "Saving…" : "Save Changes" }}
        </button>
      </div>

      @if (loading()) {
        <div class="skeleton" style="height:400px;border-radius:12px"></div>
      } @else {
        <div class="methods-list">
          <!-- M-Pesa STK Push -->
          <div class="method-card card" [class.enabled]="form.mpesaStkEnabled">
            <div class="method-header">
              <div class="method-info">
                <span class="method-icon">📱</span>
                <div>
                  <h3>M-Pesa STK Push</h3>
                  <p>
                    Customer enters their phone number and receives a payment
                    prompt
                  </p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="form.mpesaStkEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            @if (form.mpesaStkEnabled) {
              <div class="method-config">
                <div class="config-grid">
                  <div class="form-group">
                    <label class="form-label">Business Shortcode</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.mpesaShortcode"
                      placeholder="e.g. 174379"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Consumer Key</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.mpesaConsumerKey"
                      placeholder="From Safaricom Developer Portal"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Consumer Secret</label>
                    <input
                      class="form-input"
                      type="password"
                      [(ngModel)]="form.mpesaConsumerSecret"
                      placeholder="From Safaricom Developer Portal"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Passkey</label>
                    <input
                      class="form-input"
                      type="password"
                      [(ngModel)]="form.mpesaPasskey"
                      placeholder="From Safaricom Developer Portal"
                    />
                  </div>
                </div>
                <div class="config-note">
                  💡 Get your API credentials from
                  <a href="https://developer.safaricom.co.ke" target="_blank"
                    >developer.safaricom.co.ke</a
                  >
                </div>
              </div>
            }
          </div>

          <!-- Paybill -->
          <div class="method-card card" [class.enabled]="form.paybillEnabled">
            <div class="method-header">
              <div class="method-info">
                <span class="method-icon">🏦</span>
                <div>
                  <h3>M-Pesa Paybill</h3>
                  <p>
                    Customer pays to your business paybill number with their
                    order number as account
                  </p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="form.paybillEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            @if (form.paybillEnabled) {
              <div class="method-config">
                <div class="config-grid">
                  <div class="form-group">
                    <label class="form-label">Paybill Number</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.paybillNumber"
                      placeholder="e.g. 522533"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Account Format</label>
                    <select
                      class="form-input"
                      [(ngModel)]="form.paybillAccountFormat"
                    >
                      <option value="ORDER_NUMBER">
                        Use Order Number (recommended)
                      </option>
                      <option value="STORE_NAME">Use Store Name</option>
                    </select>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Till Number -->
          <div class="method-card card" [class.enabled]="form.tillEnabled">
            <div class="method-header">
              <div class="method-info">
                <span class="method-icon">🏪</span>
                <div>
                  <h3>M-Pesa Till Number (Buy Goods)</h3>
                  <p>Customer pays to your till/buy goods number</p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="form.tillEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            @if (form.tillEnabled) {
              <div class="method-config">
                <div class="config-grid">
                  <div class="form-group">
                    <label class="form-label">Till Number</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.tillNumber"
                      placeholder="e.g. 123456"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label"
                      >Business Name (shown to customer)</label
                    >
                    <input
                      class="form-input"
                      [(ngModel)]="form.tillName"
                      placeholder="e.g. Complementary Fashions"
                    />
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Send Money -->
          <div class="method-card card" [class.enabled]="form.sendMoneyEnabled">
            <div class="method-header">
              <div class="method-info">
                <span class="method-icon">📞</span>
                <div>
                  <h3>Send Money (Personal Number)</h3>
                  <p>
                    Customer sends money directly to your personal Safaricom
                    number
                  </p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="form.sendMoneyEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            @if (form.sendMoneyEnabled) {
              <div class="method-config">
                <div class="config-grid">
                  <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.sendMoneyPhone"
                      placeholder="e.g. 0712345678"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Name (shown to customer)</label>
                    <input
                      class="form-input"
                      [(ngModel)]="form.sendMoneyName"
                      placeholder="e.g. Jane Wanjiku"
                    />
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pay on Delivery -->
          <div
            class="method-card card"
            [class.enabled]="form.payOnDeliveryEnabled"
          >
            <div class="method-header">
              <div class="method-info">
                <span class="method-icon">🚚</span>
                <div>
                  <h3>Pay on Delivery</h3>
                  <p>Customer pays cash when the order is delivered</p>
                </div>
              </div>
              <label class="toggle">
                <input
                  type="checkbox"
                  [(ngModel)]="form.payOnDeliveryEnabled"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            @if (form.payOnDeliveryEnabled) {
              <div class="method-config">
                <div class="form-group">
                  <label class="form-label"
                    >Instructions for customer (optional)</label
                  >
                  <textarea
                    class="form-input"
                    rows="2"
                    [(ngModel)]="form.payOnDeliveryInstructions"
                    placeholder="e.g. Have exact cash ready. Delivery within Nairobi only."
                  ></textarea>
                </div>
              </div>
            }
          </div>

          <!-- Pay Later -->
          <div class="method-card card" [class.enabled]="form.payLaterEnabled">
            <div class="method-header">
              <div class="method-info">
                <span class="method-icon">⏳</span>
                <div>
                  <h3>Pay Later</h3>
                  <p>
                    Customer places order and pays before the product is shipped
                  </p>
                </div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="form.payLaterEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            @if (form.payLaterEnabled) {
              <div class="method-config">
                <div class="form-group">
                  <label class="form-label"
                    >Instructions for customer (optional)</label
                  >
                  <textarea
                    class="form-input"
                    rows="2"
                    [(ngModel)]="form.payLaterInstructions"
                    placeholder="e.g. You have 24 hours to complete payment before your order is cancelled."
                  ></textarea>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Delivery Fee - Moved outside methods-list but still inside @else -->
        <div class="method-card card enabled">
          <div class="method-header">
            <div class="method-info">
              <span class="method-icon">🚚</span>
              <div>
                <h3>Delivery Fee</h3>
                <p>Set the delivery charge customers pay at checkout</p>
              </div>
            </div>
          </div>
          <div class="method-config">
            <div class="config-grid">
              <div class="form-group">
                <label class="form-label">Delivery Fee (KSh)</label>
                <input
                  class="form-input"
                  type="number"
                  min="0"
                  [(ngModel)]="form.deliveryFee"
                  placeholder="e.g. 200"
                />
                <small
                  style="font-size:0.8rem;color:var(--color-text-muted);margin-top:4px;display:block"
                  >Set to 0 for free delivery on all orders</small
                >
              </div>
              <div class="form-group">
                <label class="form-label"
                  >Free Delivery Above (KSh) — Optional</label
                >
                <input
                  class="form-input"
                  type="number"
                  min="0"
                  [(ngModel)]="form.freeDeliveryThreshold"
                  placeholder="e.g. 5000 (leave blank to disable)"
                />
                <small
                  style="font-size:0.8rem;color:var(--color-text-muted);margin-top:4px;display:block"
                  >Orders above this amount get free delivery</small
                >
              </div>
            </div>
            <div class="config-note" style="margin-top:8px">
              💡 Currently: <strong>KSh {{ form.deliveryFee || 0 }}</strong> per
              order
              @if (form.freeDeliveryThreshold) {
                — Free above
                <strong>KSh {{ form.freeDeliveryThreshold }}</strong>
              }
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="card preview-card">
          <h3>Customer Preview</h3>
          <p class="preview-subtitle">
            This is what customers will see at checkout:
          </p>
          <div class="preview-methods">
            @if (!hasAnyEnabled()) {
              <div class="preview-empty">
                ⚠️ No payment methods enabled. Customers won't be able to
                checkout.
              </div>
            }
            @if (form.mpesaStkEnabled) {
              <div class="preview-method">📱 Pay via M-Pesa STK Push</div>
            }
            @if (form.paybillEnabled) {
              <div class="preview-method">
                🏦 Pay via Paybill {{ form.paybillNumber }}
              </div>
            }
            @if (form.tillEnabled) {
              <div class="preview-method">
                🏪 Pay via Till Number {{ form.tillNumber }}
              </div>
            }
            @if (form.sendMoneyEnabled) {
              <div class="preview-method">
                📞 Send Money to {{ form.sendMoneyPhone }}
              </div>
            }
            @if (form.payOnDeliveryEnabled) {
              <div class="preview-method">🚚 Pay on Delivery (Cash)</div>
            }
            @if (form.payLaterEnabled) {
              <div class="preview-method">⏳ Pay Later</div>
            }
          </div>
        </div>
      }

      @if (saved()) {
        <div class="save-toast">✅ Payment settings saved!</div>
      }
    </div>
  `,
  styles: [
    `
      .payment-settings-page {
        padding: 32px;
        max-width: 800px;
      }
      .methods-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }
      .method-card {
        padding: 0;
        overflow: hidden;
        transition: border-color 0.2s;
      }
      .method-card.enabled {
        border-color: var(--color-accent);
      }
      .method-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
      }
      .method-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .method-icon {
        font-size: 1.75rem;
        flex-shrink: 0;
      }
      .method-info h3 {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 2px;
      }
      .method-info p {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
      }
      .method-config {
        padding: 0 24px 20px;
        border-top: 1px solid var(--color-border);
        padding-top: 16px;
      }
      .config-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form-group {
        margin-bottom: 12px;
      }
      .form-group label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 6px;
        color: var(--color-text-secondary);
      }
      .form-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.9375rem;
        box-sizing: border-box;
        font-family: inherit;
      }
      .config-note {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-top: 8px;
      }
      .config-note a {
        color: var(--color-accent);
      }
      /* Toggle switch */
      .toggle {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
        flex-shrink: 0;
      }
      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background: var(--color-border);
        border-radius: 26px;
        transition: 0.3s;
      }
      .toggle-slider:before {
        content: "";
        position: absolute;
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background: white;
        border-radius: 50%;
        transition: 0.3s;
      }
      .toggle input:checked + .toggle-slider {
        background: var(--color-accent);
      }
      .toggle input:checked + .toggle-slider:before {
        transform: translateX(22px);
      }
      /* Preview */
      .preview-card {
        padding: 24px;
        margin-top: 8px;
      }
      .preview-card h3 {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .preview-subtitle {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
        margin-bottom: 16px;
      }
      .preview-methods {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .preview-method {
        padding: 12px 16px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-size: 0.9375rem;
      }
      .preview-empty {
        padding: 12px 16px;
        background: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 8px;
        color: #92400e;
        font-size: 0.875rem;
      }
      .btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
      }
      .btn-primary {
        background: var(--color-accent);
        color: white;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .save-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-left: 4px solid var(--color-success);
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        font-size: 0.9rem;
        z-index: 9999;
        animation: slide-in 0.3s ease;
      }
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @media (max-width: 600px) {
        .config-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminPaymentSettingsComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  form: any = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>("/payments/settings").subscribe({
      next: (data) => {
        this.form = { ...data };
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  hasAnyEnabled() {
    return (
      this.form.mpesaStkEnabled ||
      this.form.paybillEnabled ||
      this.form.tillEnabled ||
      this.form.sendMoneyEnabled ||
      this.form.payOnDeliveryEnabled ||
      this.form.payLaterEnabled
    );
  }

  save() {
    this.saving.set(true);
    this.api.put("/payments/settings", this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        alert("Failed to save");
      },
    });
  }
}
