import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AdminAuthService } from "../../core/services/admin-auth.service";

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  stockQuantity: number;
  image?: string;
}

@Component({
  selector: "app-pos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pos-wrapper">
      <!-- Receipt Modal -->
      @if (showReceipt()) {
        <div class="modal-overlay" (click)="closeReceipt()">
          <div
            class="receipt-modal"
            (click)="$event.stopPropagation()"
            id="receipt-content"
          >
            <div class="receipt-header">
              <div class="receipt-logo">🧶</div>
              <h2>Complementary Fashions</h2>
              <p class="receipt-addr">In-Store Sale</p>
              <p class="receipt-date">
                {{ receiptOrder()?.createdAt | date: "medium" }}
              </p>
              <p class="receipt-num">
                Receipt #{{ receiptOrder()?.orderNumber }}
              </p>
            </div>
            <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
            @if (
              receiptOrder()?.posCustomerName &&
              receiptOrder()?.posCustomerName !== "Walk-in Customer"
            ) {
              <div class="receipt-customer">
                <p>
                  <strong>Customer:</strong>
                  {{ receiptOrder()?.posCustomerName }}
                </p>
                @if (receiptOrder()?.posCustomerPhone) {
                  <p>📞 {{ receiptOrder()?.posCustomerPhone }}</p>
                }
              </div>
              <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
            }
            <div class="receipt-items">
              @for (item of receiptOrder()?.items; track item.id) {
                <div class="receipt-item">
                  <div class="receipt-item-name">
                    {{ item.productName }}
                    @if (item.selectedSize) {
                      <span>({{ item.selectedSize }})</span>
                    }
                    @if (item.selectedColor) {
                      <span>· {{ item.selectedColor }}</span>
                    }
                  </div>
                  <div class="receipt-item-calc">
                    <span
                      >{{ item.quantity }} × KSh
                      {{ item.unitPrice | number: "1.0-0" }}</span
                    >
                    <span>KSh {{ item.totalPrice | number: "1.0-0" }}</span>
                  </div>
                </div>
              }
            </div>
            <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
            <div class="receipt-totals">
              <div class="receipt-row">
                <span>Subtotal</span
                ><span
                  >KSh {{ receiptOrder()?.subtotal | number: "1.0-0" }}</span
                >
              </div>
              @if (receiptOrder()?.discountAmount > 0) {
                <div class="receipt-row discount">
                  <span
                    >Discount ({{
                      receiptOrder()?.discountType === "percentage"
                        ? receiptOrder()?.discountValue + "%"
                        : "KSh " + receiptOrder()?.discountValue
                    }})</span
                  ><span
                    >-KSh
                    {{ receiptOrder()?.discountAmount | number: "1.0-0" }}</span
                  >
                </div>
              }
              @if (receiptOrder()?.taxAmount > 0) {
                <div class="receipt-row">
                  <span>Tax</span
                  ><span
                    >KSh {{ receiptOrder()?.taxAmount | number: "1.0-0" }}</span
                  >
                </div>
              }
              <div class="receipt-row total">
                <span>TOTAL</span
                ><span
                  >KSh {{ receiptOrder()?.totalAmount | number: "1.0-0" }}</span
                >
              </div>
              @if (receiptOrder()?.cashTendered > 0) {
                <div class="receipt-row">
                  <span>Cash Tendered</span
                  ><span
                    >KSh
                    {{ receiptOrder()?.cashTendered | number: "1.0-0" }}</span
                  >
                </div>
                <div class="receipt-row change">
                  <span>Change</span
                  ><span
                    >KSh
                    {{ receiptOrder()?.changeGiven | number: "1.0-0" }}</span
                  >
                </div>
              }
            </div>
            <div class="receipt-divider">- - - - - - - - - - - - - - - -</div>
            <div class="receipt-payment">
              <p>
                Payment:
                <strong>{{
                  paymentLabel(receiptOrder()?.selectedPaymentMethod)
                }}</strong>
              </p>
              <p>
                Staff: <strong>{{ receiptOrder()?.processedByName }}</strong>
              </p>
            </div>
            <div class="receipt-footer">
              <p>Thank you for shopping with us!</p>
              <p>🌿 Handcrafted with love</p>
            </div>
            <div class="receipt-actions no-print">
              <button class="btn btn-outline" (click)="printReceipt()">
                🖨️ Print
              </button>
              <button class="btn btn-outline" (click)="downloadReceiptPdf()">
                ⬇️ PDF
              </button>
              <button class="btn btn-primary" (click)="closeReceipt()">
                ✓ Done
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Variant Modal -->
      @if (variantProduct()) {
        <div class="modal-overlay" (click)="variantProduct.set(null)">
          <div class="variant-modal" (click)="$event.stopPropagation()">
            <h3>Select Variant — {{ variantProduct()?.name }}</h3>
            <div class="variant-grid">
              @for (v of variantProduct()?.variants; track v.id) {
                <button
                  class="variant-btn"
                  [class.disabled]="v.stockQuantity <= 0"
                  [disabled]="v.stockQuantity <= 0"
                  (click)="addWithVariant(variantProduct(), v)"
                >
                  <span class="v-label"
                    >{{ v.size }}{{ v.color ? " · " + v.color : "" }}</span
                  >
                  <span class="v-stock" [class.low]="v.stockQuantity <= 3"
                    >{{ v.stockQuantity }} left</span
                  >
                </button>
              }
            </div>
            <button
              class="btn btn-ghost mt-2"
              (click)="variantProduct.set(null)"
            >
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Top Bar -->
      <div class="pos-topbar">
        <div class="pos-title">
          <span class="pos-badge">POS</span>
          <h1>Point of Sale</h1>
        </div>
        <div class="topbar-actions">
          <div class="barcode-wrapper">
            <input
              #barcodeInput
              class="barcode-input"
              placeholder="🔍 Scan barcode or search..."
              [(ngModel)]="barcodeQuery"
              (keydown.enter)="onBarcodeEnter()"
              (input)="onSearchInput()"
            />
          </div>
          <div class="cashier-info">
            <span class="cashier-name"
              >👤 {{ currentAdmin()?.firstName }}
              {{ currentAdmin()?.lastName }}</span
            >
          </div>
        </div>
      </div>

      <div class="pos-body">
        <!-- LEFT: Product Panel -->
        <div class="products-panel">
          <!-- Category Filter -->
          <div class="category-bar">
            <button
              class="cat-btn"
              [class.active]="!selectedCategory()"
              (click)="selectedCategory.set('')"
            >
              All
            </button>
            @for (cat of categories(); track cat.id) {
              <button
                class="cat-btn"
                [class.active]="selectedCategory() === cat.id"
                (click)="selectedCategory.set(cat.id)"
              >
                {{ cat.name }}
              </button>
            }
          </div>

          <!-- Quick Access -->
          @if (!barcodeQuery && !selectedCategory() && quickProducts().length) {
            <div class="quick-section">
              <div class="section-label">⚡ Quick Access</div>
              <div class="quick-grid">
                @for (p of quickProducts(); track p.id) {
                  <button
                    class="quick-btn"
                    [class.oos]="p.stockQuantity <= 0"
                    [disabled]="p.stockQuantity <= 0"
                    (click)="addToCart(p)"
                  >
                    <span>{{ p.name }}</span>
                    <span class="quick-price"
                      >KSh {{ p.price | number: "1.0-0" }}</span
                    >
                  </button>
                }
              </div>
            </div>
          }

          <!-- Product Grid -->
          @if (loadingProducts()) {
            <div class="products-loading">
              @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
                <div class="skeleton product-skeleton"></div>
              }
            </div>
          } @else {
            <div class="product-grid">
              @for (p of filteredProducts(); track p.id) {
                <button
                  class="product-card"
                  [class.oos]="p.stockQuantity <= 0"
                  [disabled]="p.stockQuantity <= 0"
                  (click)="onProductClick(p)"
                >
                  <div class="product-img">
                    @if (getImage(p)) {
                      <img [src]="getImage(p)" [alt]="p.name" loading="lazy" />
                    } @else {
                      <div class="product-img-placeholder">🧶</div>
                    }
                    @if (p.stockQuantity <= 0) {
                      <div class="oos-overlay">Out of Stock</div>
                    } @else if (p.stockQuantity <= 3) {
                      <div class="low-stock-badge">
                        Only {{ p.stockQuantity }} left
                      </div>
                    }
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ p.name }}</div>
                    <div class="product-price">
                      KSh {{ p.price | number: "1.0-0" }}
                    </div>
                  </div>
                </button>
              }
              @if (!filteredProducts().length) {
                <div class="no-products">
                  <p>No products found</p>
                  @if (barcodeQuery) {
                    <p class="muted">Try a different search</p>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- RIGHT: Cart + Checkout Panel -->
        <div class="checkout-panel">
          <!-- Customer Info (collapsible) -->
          <div class="customer-section">
            <div
              class="section-header"
              (click)="showCustomer.set(!showCustomer())"
            >
              <span
                >👤 Customer Info <span class="muted">(optional)</span></span
              >
              <span>{{ showCustomer() ? "▲" : "▼" }}</span>
            </div>
            @if (showCustomer()) {
              <div class="customer-fields">
                <input
                  class="pos-input"
                  placeholder="Customer Name"
                  [(ngModel)]="customerName"
                />
                <input
                  class="pos-input"
                  placeholder="Phone Number"
                  [(ngModel)]="customerPhone"
                />
                <input
                  class="pos-input"
                  placeholder="Email (for receipt)"
                  [(ngModel)]="customerEmail"
                />
              </div>
            }
          </div>

          <!-- Cart Items -->
          <div class="cart-section">
            <div class="cart-header">
              <span class="section-label"
                >🛒 Cart ({{ totalItems() }} items)</span
              >
              @if (cart().length) {
                <button class="btn-ghost-sm" (click)="clearCart()">
                  Clear all
                </button>
              }
            </div>

            @if (!cart().length) {
              <div class="cart-empty">
                <div style="font-size:3rem">🛒</div>
                <p>Cart is empty</p>
                <p class="muted">Click a product to add it</p>
              </div>
            } @else {
              <div class="cart-items">
                @for (
                  item of cart();
                  track item.productId +
                    (item.selectedSize || "") +
                    (item.selectedColor || "")
                ) {
                  <div class="cart-item">
                    <div class="cart-item-info">
                      <div class="cart-item-name">{{ item.productName }}</div>
                      @if (item.selectedSize || item.selectedColor) {
                        <div class="cart-item-variant">
                          @if (item.selectedSize) {
                            <span>{{ item.selectedSize }}</span>
                          }
                          @if (item.selectedColor) {
                            <span>{{ item.selectedColor }}</span>
                          }
                        </div>
                      }
                      <div class="cart-item-price">
                        KSh {{ item.unitPrice | number: "1.0-0" }}
                      </div>
                    </div>
                    <div class="cart-item-controls">
                      <button class="qty-btn" (click)="decreaseQty(item)">
                        −
                      </button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button
                        class="qty-btn"
                        (click)="increaseQty(item)"
                        [disabled]="item.quantity >= item.stockQuantity"
                      >
                        +
                      </button>
                      <button class="remove-btn" (click)="removeItem(item)">
                        🗑
                      </button>
                    </div>
                    <div class="cart-item-total">
                      KSh {{ item.totalPrice | number: "1.0-0" }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Discount & Tax -->
          <div class="discount-section">
            <div class="discount-row">
              <select
                class="pos-select"
                [ngModel]="discountType()"
                (ngModelChange)="discountType.set($event)"
              >
                <option value="">No Discount</option>
                <option value="percentage">% Discount</option>
                <option value="fixed">Fixed Discount</option>
              </select>
              @if (discountType()) {
                <input
                  class="pos-input discount-input"
                  type="number"
                  min="0"
                  [placeholder]="
                    discountType() === 'percentage' ? 'e.g. 10' : 'e.g. 500'
                  "
                  [ngModel]="discountValue()"
                  (ngModelChange)="discountValue.set(+$event)"
                />
                <span class="discount-preview">
                  @if (discountType() === "percentage") {
                    -{{ discountValue() }}%
                  } @else {
                    -KSh {{ discountValue() | number: "1.0-0" }}
                  }
                </span>
              }
            </div>
            <div class="tax-row">
              <label class="pos-label">Tax Rate (%)</label>
              <input
                class="pos-input tax-input"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                [ngModel]="taxRate()"
                (ngModelChange)="taxRate.set(+$event)"
              />
            </div>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal</span
              ><span>KSh {{ subtotal() | number: "1.0-0" }}</span>
            </div>
            @if (discountAmount() > 0) {
              <div class="total-row discount">
                <span>Discount</span
                ><span>−KSh {{ discountAmount() | number: "1.0-0" }}</span>
              </div>
            }
            @if (taxAmount() > 0) {
              <div class="total-row">
                <span>Tax ({{ taxRate() }}%)</span
                ><span>KSh {{ taxAmount() | number: "1.0-0" }}</span>
              </div>
            }
            <div class="total-row grand">
              <span>TOTAL</span
              ><span>KSh {{ grandTotal() | number: "1.0-0" }}</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="payment-section">
            <div class="section-label">💳 Payment Method</div>
            <div class="payment-methods">
              @for (pm of paymentMethods; track pm.value) {
                <button
                  class="pm-btn"
                  [class.active]="paymentMethod() === pm.value"
                  (click)="paymentMethod.set(pm.value)"
                >
                  <span>{{ pm.icon }}</span>
                  <span>{{ pm.label }}</span>
                </button>
              }
            </div>

            @if (paymentMethod() === "cash") {
              <div class="cash-section">
                <label class="pos-label">Cash Tendered (KSh)</label>
                <input
                  class="pos-input"
                  type="number"
                  placeholder="Enter amount received"
                  [ngModel]="cashTendered()"
                  (ngModelChange)="cashTendered.set(+$event)"
                />
                @if (changeAmount() >= 0 && cashTendered() > 0) {
                  <div
                    class="change-display"
                    [class.positive]="changeAmount() >= 0"
                  >
                    Change:
                    <strong>KSh {{ changeAmount() | number: "1.0-0" }}</strong>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Notes -->
          <div class="notes-section">
            <textarea
              class="pos-textarea"
              placeholder="Notes (optional)..."
              rows="2"
              [(ngModel)]="posNotes"
            ></textarea>
          </div>

          <!-- Charge Button -->
          <button
            class="charge-btn"
            [disabled]="!canCharge() || processing()"
            (click)="completeSale()"
          >
            @if (processing()) {
              <span>Processing...</span>
            } @else {
              <span>✓ Charge KSh {{ grandTotal() | number: "1.0-0" }}</span>
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .pos-wrapper {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 64px);
        background: #f5f0eb;
        overflow: hidden;
      }

      /* Top Bar */
      .pos-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: #3d2b1f;
        color: white;
        gap: 16px;
        flex-shrink: 0;
      }
      .pos-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pos-title h1 {
        margin: 0;
        font-size: 1.1rem;
        color: white;
        font-style: italic;
      }
      .pos-badge {
        background: #c8956c;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;
      }
      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        justify-content: flex-end;
      }
      .barcode-wrapper {
        flex: 1;
        max-width: 400px;
      }
      .barcode-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 8px 14px;
        color: white;
        font-size: 0.875rem;
        outline: none;
      }
      .barcode-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      .barcode-input:focus {
        background: rgba(255, 255, 255, 0.25);
        border-color: #c8956c;
      }
      .cashier-name {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.8);
        white-space: nowrap;
      }

      /* Body */
      .pos-body {
        display: flex;
        flex: 1;
        overflow: hidden;
        gap: 0;
      }

      /* Products Panel */
      .products-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: #faf8f5;
        border-right: 1px solid #e8ddd5;
      }

      .category-bar {
        display: flex;
        gap: 6px;
        padding: 12px 16px;
        overflow-x: auto;
        flex-shrink: 0;
        background: white;
        border-bottom: 1px solid #e8ddd5;
      }
      .category-bar::-webkit-scrollbar {
        height: 3px;
      }
      .cat-btn {
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid #e8ddd5;
        background: white;
        cursor: pointer;
        font-size: 0.8rem;
        white-space: nowrap;
        transition: all 0.15s;
        color: #7a5c44;
      }
      .cat-btn.active,
      .cat-btn:hover {
        background: #8b6f47;
        color: white;
        border-color: #8b6f47;
      }

      .quick-section {
        padding: 10px 16px 0;
        flex-shrink: 0;
      }
      .section-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #a08060;
        margin-bottom: 6px;
        display: block;
      }
      .quick-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
      }
      .quick-btn {
        padding: 6px 12px;
        background: #f0e8df;
        border: 1px solid #e0d0c0;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.8rem;
        color: #3d2b1f;
        display: flex;
        flex-direction: column;
        gap: 2px;
        transition: all 0.15s;
      }
      .quick-btn:hover:not(:disabled) {
        background: #c8956c;
        color: white;
        border-color: #c8956c;
      }
      .quick-btn.oos {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .quick-price {
        font-size: 0.7rem;
        color: #8b6f47;
      }

      .products-loading {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px;
        padding: 16px;
        overflow-y: auto;
      }
      .product-skeleton {
        height: 170px;
        border-radius: 12px;
        background: linear-gradient(
          90deg,
          #f0e8df 25%,
          #e8ddd5 50%,
          #f0e8df 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px;
        padding: 16px;
        overflow-y: auto;
        flex: 1;
        align-content: start;
      }
      .product-card {
        background: white;
        border: 2px solid transparent;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.15s;
        text-align: left;
        padding: 0;
      }
      .product-card:hover:not(:disabled) {
        border-color: #c8956c;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 111, 71, 0.2);
      }
      .product-card.oos {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .product-img {
        position: relative;
        aspect-ratio: 1;
        overflow: hidden;
        background: #f0e8df;
      }
      .product-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .product-img-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 2rem;
      }
      .oos-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
      }
      .low-stock-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #fbbf24;
        color: #3d2b1f;
        font-size: 0.6rem;
        font-weight: 700;
        padding: 2px 5px;
        border-radius: 4px;
      }
      .product-info {
        padding: 8px;
      }
      .product-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #3d2b1f;
        line-height: 1.2;
        margin-bottom: 2px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .product-price {
        font-size: 0.85rem;
        font-weight: 700;
        color: #8b6f47;
      }
      .no-products {
        grid-column: 1/-1;
        text-align: center;
        padding: 40px;
        color: #a08060;
      }

      /* Checkout Panel */
      .checkout-panel {
        width: 380px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        background: white;
        overflow-y: auto;
      }

      .customer-section {
        border-bottom: 1px solid #f0e8df;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        cursor: pointer;
        font-size: 0.8rem;
        color: #7a5c44;
        user-select: none;
      }
      .section-header:hover {
        background: #faf8f5;
      }
      .customer-fields {
        padding: 0 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .cart-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #f0e8df;
        min-height: 0;
      }
      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px 8px;
      }
      .btn-ghost-sm {
        background: none;
        border: none;
        cursor: pointer;
        color: #e05252;
        font-size: 0.75rem;
      }
      .cart-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px;
        color: #a08060;
        text-align: center;
        min-height: 120px;
      }
      .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 0 12px;
        max-height: 280px;
      }
      .cart-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid #f0e8df;
      }
      .cart-item-info {
        flex: 1;
        min-width: 0;
      }
      .cart-item-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #3d2b1f;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cart-item-variant {
        display: flex;
        gap: 4px;
      }
      .cart-item-variant span {
        font-size: 0.7rem;
        background: #f0e8df;
        color: #8b6f47;
        padding: 1px 5px;
        border-radius: 4px;
      }
      .cart-item-price {
        font-size: 0.75rem;
        color: #a08060;
      }
      .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .qty-btn {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        border: 1px solid #e8ddd5;
        background: #f5f0eb;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .qty-btn:hover:not(:disabled) {
        background: #c8956c;
        color: white;
        border-color: #c8956c;
      }
      .qty-val {
        width: 24px;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
      }
      .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        opacity: 0.6;
      }
      .remove-btn:hover {
        opacity: 1;
      }
      .cart-item-total {
        font-size: 0.8rem;
        font-weight: 700;
        color: #8b6f47;
        white-space: nowrap;
        min-width: 60px;
        text-align: right;
      }

      /* Discount */
      .discount-section {
        padding: 10px 16px;
        border-bottom: 1px solid #f0e8df;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .discount-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .tax-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pos-label {
        font-size: 0.75rem;
        color: #a08060;
        white-space: nowrap;
      }
      .discount-input {
        width: 80px !important;
      }
      .tax-input {
        width: 60px !important;
      }
      .discount-preview {
        font-size: 0.75rem;
        color: #e05252;
        font-weight: 600;
        white-space: nowrap;
      }

      /* Totals */
      .totals-section {
        padding: 10px 16px;
        border-bottom: 1px solid #f0e8df;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 0.875rem;
        color: #7a5c44;
      }
      .total-row.discount {
        color: #e05252;
      }
      .total-row.grand {
        font-size: 1.1rem;
        font-weight: 700;
        color: #3d2b1f;
        border-top: 2px solid #e8ddd5;
        padding-top: 8px;
        margin-top: 4px;
      }

      /* Payment */
      .payment-section {
        padding: 10px 16px;
        border-bottom: 1px solid #f0e8df;
      }
      .payment-methods {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: 6px;
      }
      .pm-btn {
        padding: 8px;
        border: 2px solid #e8ddd5;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        font-size: 0.75rem;
        transition: all 0.15s;
        color: #7a5c44;
      }
      .pm-btn.active {
        border-color: #8b6f47;
        background: #f0e8df;
        color: #3d2b1f;
        font-weight: 600;
      }
      .pm-btn:hover:not(.active) {
        border-color: #c8956c;
      }
      .cash-section {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .change-display {
        padding: 8px 12px;
        background: #d1fae5;
        border-radius: 8px;
        font-size: 0.875rem;
        color: #065f46;
        font-weight: 600;
      }

      /* Notes */
      .notes-section {
        padding: 8px 16px;
        border-bottom: 1px solid #f0e8df;
      }

      /* Inputs */
      .pos-input {
        width: 100%;
        padding: 7px 10px;
        border: 1px solid #e8ddd5;
        border-radius: 8px;
        font-size: 0.8rem;
        outline: none;
        background: #faf8f5;
      }
      .pos-input:focus {
        border-color: #c8956c;
        background: white;
      }
      .pos-select {
        padding: 7px 10px;
        border: 1px solid #e8ddd5;
        border-radius: 8px;
        font-size: 0.8rem;
        background: #faf8f5;
        cursor: pointer;
      }
      .pos-textarea {
        width: 100%;
        padding: 7px 10px;
        border: 1px solid #e8ddd5;
        border-radius: 8px;
        font-size: 0.8rem;
        resize: none;
        background: #faf8f5;
        font-family: inherit;
      }

      /* Charge Button */
      .charge-btn {
        margin: 12px 16px 16px;
        padding: 14px;
        background: linear-gradient(135deg, #8b6f47, #c8956c);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .charge-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(139, 111, 71, 0.4);
      }
      .charge-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      /* Variant Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .variant-modal {
        background: white;
        border-radius: 16px;
        padding: 24px;
        width: 360px;
        max-width: 90vw;
      }
      .variant-modal h3 {
        margin: 0 0 16px;
        font-size: 1.1rem;
        color: #3d2b1f;
      }
      .variant-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .variant-btn {
        padding: 12px;
        border: 2px solid #e8ddd5;
        border-radius: 10px;
        background: white;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: all 0.15s;
      }
      .variant-btn:hover:not(:disabled) {
        border-color: #c8956c;
        background: #faf8f5;
      }
      .variant-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .v-label {
        font-weight: 600;
        color: #3d2b1f;
        font-size: 0.875rem;
      }
      .v-stock {
        font-size: 0.75rem;
        color: #a08060;
      }
      .v-stock.low {
        color: #d97706;
        font-weight: 600;
      }
      .btn-ghost {
        background: none;
        border: none;
        cursor: pointer;
        color: #a08060;
        font-size: 0.875rem;
      }
      .mt-2 {
        margin-top: 8px;
      }

      /* Receipt Modal */
      .receipt-modal {
        background: white;
        border-radius: 12px;
        padding: 24px;
        width: 360px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        font-family: "Courier New", monospace;
      }
      .receipt-header {
        text-align: center;
        margin-bottom: 8px;
      }
      .receipt-logo {
        font-size: 2rem;
      }
      .receipt-header h2 {
        margin: 4px 0;
        font-size: 1rem;
        font-family: Georgia, serif;
      }
      .receipt-addr,
      .receipt-date,
      .receipt-num {
        margin: 2px 0;
        font-size: 0.75rem;
        color: #7a5c44;
      }
      .receipt-divider {
        text-align: center;
        color: #a08060;
        font-size: 0.75rem;
        margin: 8px 0;
        letter-spacing: 2px;
      }
      .receipt-customer {
        margin-bottom: 4px;
      }
      .receipt-customer p {
        margin: 2px 0;
        font-size: 0.8rem;
      }
      .receipt-items {
        margin-bottom: 4px;
      }
      .receipt-item {
        margin-bottom: 6px;
      }
      .receipt-item-name {
        font-size: 0.8rem;
        font-weight: 600;
      }
      .receipt-item-name span {
        font-weight: normal;
        color: #7a5c44;
      }
      .receipt-item-calc {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #7a5c44;
      }
      .receipt-totals {
        margin: 4px 0;
      }
      .receipt-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        padding: 2px 0;
      }
      .receipt-row.total {
        font-weight: 700;
        font-size: 1rem;
        border-top: 1px solid #e8ddd5;
        padding-top: 6px;
        margin-top: 4px;
      }
      .receipt-row.discount {
        color: #e05252;
      }
      .receipt-row.change {
        color: #065f46;
        font-weight: 600;
      }
      .receipt-payment {
        margin: 4px 0;
        font-size: 0.8rem;
      }
      .receipt-payment p {
        margin: 2px 0;
      }
      .receipt-footer {
        text-align: center;
        margin-top: 8px;
        font-size: 0.75rem;
        color: #7a5c44;
        font-style: italic;
      }
      .receipt-footer p {
        margin: 2px 0;
      }
      .receipt-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        justify-content: center;
      }

      /* Misc */
      .muted {
        color: #a08060;
        font-size: 0.8rem;
      }
      .btn {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 600;
      }
      .btn-primary {
        background: #8b6f47;
        color: white;
      }
      .btn-outline {
        background: white;
        border: 1px solid #e8ddd5;
        color: #7a5c44;
      }

      @media print {
        .no-print {
          display: none;
        }
        .receipt-modal {
          box-shadow: none;
          max-height: none;
        }
      }
    `,
  ],
})
export class PosComponent implements OnInit, OnDestroy {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  cart = signal<CartItem[]>([]);
  loadingProducts = signal(true);
  processing = signal(false);
  showReceipt = signal(false);
  receiptOrder = signal<any>(null);
  variantProduct = signal<any>(null);
  showCustomer = signal(false);

  selectedCategory = signal("");
  barcodeQuery = "";
  customerName = "";
  customerPhone = "";
  customerEmail = "";
  discountType = signal("");
  discountValue = signal<number>(0);
  taxRate = signal<number>(0);
  cashTendered = signal<number>(0);
  posNotes = "";

  private searchTimeout: any;

  paymentMethods = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "mpesa", label: "M-Pesa", icon: "📱" },
    { value: "card", label: "Card", icon: "💳" },
    { value: "mixed", label: "Mixed", icon: "🔀" },
  ];
  paymentMethod = signal("cash");

  currentAdmin = signal<any>(null);

  constructor(
    private api: ApiService,
    private auth: AdminAuthService,
  ) {}

  ngOnInit() {
    this.currentAdmin.set(this.auth.admin());
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy() {
    clearTimeout(this.searchTimeout);
  }

  loadProducts() {
    this.loadingProducts.set(true);
    this.api
      .get<any>("/products", { limit: 200, isAvailable: "true" })
      .subscribe({
        next: (res: any) => {
          const items = res?.data ?? res?.items ?? res ?? [];
          this.products.set(items);
          this.loadingProducts.set(false);
        },
        error: () => this.loadingProducts.set(false),
      });
  }

  loadCategories() {
    this.api
      .get<any[]>("/categories")
      .subscribe((cats) => this.categories.set(cats || []));
  }

  filteredProducts = computed(() => {
    let list = this.products();
    if (this.selectedCategory())
      list = list.filter((p) => p.categoryId === this.selectedCategory());
    if (this.barcodeQuery) {
      const q = this.barcodeQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.id === q);
    }
    return list;
  });

  quickProducts = computed(() =>
    this.products()
      .filter((p) => p.isFeatured && p.stockQuantity > 0)
      .slice(0, 8),
  );

  // Totals
  subtotal = computed(() => this.cart().reduce((s, i) => s + i.totalPrice, 0));
  discountAmount = computed(() => {
    const sub = this.subtotal();
    if (this.discountType() === "percentage")
      return Math.min((sub * (this.discountValue() || 0)) / 100, sub);
    if (this.discountType() === "fixed")
      return Math.min(this.discountValue() || 0, sub);
    return 0;
  });
  taxAmount = computed(() => {
    const after = this.subtotal() - this.discountAmount();
    return this.taxRate() > 0 ? (after * this.taxRate()) / 100 : 0;
  });
  grandTotal = computed(
    () => this.subtotal() - this.discountAmount() + this.taxAmount(),
  );
  totalItems = computed(() => this.cart().reduce((s, i) => s + i.quantity, 0));
  changeAmount = computed(() =>
    this.cashTendered() > 0 ? this.cashTendered() - this.grandTotal() : 0,
  );

  canCharge = computed(
    () =>
      this.cart().length > 0 &&
      this.paymentMethod() &&
      (this.paymentMethod() !== "cash" ||
        this.cashTendered() >= this.grandTotal()),
  );

  calcTotals() {} // Triggers computed re-eval via ngModel
  calcChange() {}

  getImage(product: any): string {
    const img =
      product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
    if (!img?.imageUrl) return "";
    return img.imageUrl.startsWith("http")
      ? img.imageUrl
      : `http://localhost:3000${img.imageUrl}`;
  }

  onProductClick(product: any) {
    if (product.variants?.length > 0) {
      this.variantProduct.set(product);
    } else {
      this.addToCart(product);
    }
  }

  addWithVariant(product: any, variant: any) {
    this.variantProduct.set(null);
    this.addToCart(product, variant);
  }

  addToCart(product: any, variant?: any) {
    const cart = [...this.cart()];
    const key = product.id + (variant?.size || "") + (variant?.color || "");
    const existing = cart.find(
      (i) =>
        i.productId + (i.selectedSize || "") + (i.selectedColor || "") === key,
    );
    const maxStock = variant?.stockQuantity ?? product.stockQuantity;
    const unitPrice =
      Number(product.price) + Number(variant?.additionalPrice || 0);

    if (existing) {
      if (existing.quantity >= maxStock) return;
      existing.quantity++;
      existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
      cart.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: 1,
        totalPrice: unitPrice,
        selectedSize: variant?.size || null,
        selectedColor: variant?.color || null,
        stockQuantity: maxStock,
        image: this.getImage(product),
      });
    }
    this.cart.set(cart);
    this.barcodeQuery = "";
  }

  increaseQty(item: CartItem) {
    if (item.quantity >= item.stockQuantity) return;
    const cart = this.cart().map((i) => {
      if (i === item) {
        return {
          ...i,
          quantity: i.quantity + 1,
          totalPrice: (i.quantity + 1) * i.unitPrice,
        };
      }
      return i;
    });
    this.cart.set(cart);
  }

  decreaseQty(item: CartItem) {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }
    const cart = this.cart().map((i) => {
      if (i === item) {
        return {
          ...i,
          quantity: i.quantity - 1,
          totalPrice: (i.quantity - 1) * i.unitPrice,
        };
      }
      return i;
    });
    this.cart.set(cart);
  }

  removeItem(item: CartItem) {
    this.cart.set(this.cart().filter((i) => i !== item));
  }

  clearCart() {
    if (confirm("Clear entire cart?")) this.cart.set([]);
  }

  onBarcodeEnter() {
    const q = this.barcodeQuery.trim().toLowerCase();
    if (!q) return;
    const match = this.products().find(
      (p) => p.id === q || p.name.toLowerCase() === q || p.barcode === q,
    );
    if (match) {
      this.addToCart(match);
      this.barcodeQuery = "";
    }
  }

  onSearchInput() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {}, 0);
  }

  paymentLabel(method: string): string {
    return (
      this.paymentMethods.find((p) => p.value === method)?.label ||
      method ||
      "N/A"
    );
  }

  completeSale() {
    if (!this.canCharge()) return;
    this.processing.set(true);

    const payload = {
      items: this.cart().map((i) => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      })),
      paymentMethod: this.paymentMethod(),
      customerName: this.customerName || "Walk-in Customer",
      customerPhone: this.customerPhone || "",
      customerEmail: this.customerEmail || "",
      discountType: this.discountType() || null,
      discountValue: this.discountValue() || 0,
      taxRate: this.taxRate() || 0,
      cashTendered:
        this.paymentMethod() === "cash" ? this.cashTendered() : null,
      notes: this.posNotes,
    };

    this.api.post<any>("/pos/orders", payload).subscribe({
      next: (order) => {
        this.processing.set(false);
        this.receiptOrder.set(order);
        this.showReceipt.set(true);
        this.cart.set([]);
        this.resetCheckout();
      },
      error: (err) => {
        this.processing.set(false);
        alert(
          err?.error?.message || "Failed to process sale. Please try again.",
        );
      },
    });
  }

  resetCheckout() {
    this.customerName = "";
    this.customerPhone = "";
    this.customerEmail = "";
    this.discountType.set("");
    this.discountValue.set(0);
    this.taxRate.set(0);
    this.cashTendered.set(0);
    this.posNotes = "";
    this.paymentMethod.set("cash");
  }

  printReceipt() {
    window.print();
  }

  downloadReceiptPdf() {
    const el = document.getElementById("receipt-content");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document
      .write(`<html><head><title>Receipt ${this.receiptOrder()?.orderNumber}</title>
      <style>body{font-family:'Courier New',monospace;margin:20px;max-width:300px}</style>
      </head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  }

  closeReceipt() {
    this.showReceipt.set(false);
    this.receiptOrder.set(null);
    this.loadProducts(); // Refresh stock
  }
}
