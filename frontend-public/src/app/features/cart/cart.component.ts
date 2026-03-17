import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartService } from "../../core/services/cart.service";
import { ToastService } from "../../core/services/toast.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page page-enter">
      <div class="page-header">
        <div class="container">
          <span class="section-label">Your Selection</span>
          <h1>Shopping Cart</h1>
        </div>
      </div>

      <div class="container cart-layout">
        @if (loading()) {
          <div class="cart-loading">
            @for (i of [1, 2, 3]; track i) {
              <div
                class="skeleton"
                style="height: 120px; border-radius: 16px; margin-bottom: 16px;"
              ></div>
            }
          </div>
        } @else if (!cart()?.items?.length) {
          <div class="cart-empty">
            <div class="cart-empty-icon">🛍️</div>
            <h2>Your cart is empty</h2>
            <p>
              Discover our handcrafted collection and find something you love.
            </p>
            <a routerLink="/products" class="btn btn-primary btn-lg"
              >Browse Collection →</a
            >
          </div>
        } @else {
          <div class="cart-items">
            <div class="cart-items-header">
              <h2>
                {{ cart()?.itemCount }}
                {{ cart()?.itemCount === 1 ? "item" : "items" }}
              </h2>
              <button class="btn btn-secondary btn-sm" (click)="clearCart()">
                Clear all
              </button>
            </div>

            @for (item of cart()?.items; track item.id) {
              <div class="cart-item card">
                <div class="cart-item-image">
                  <img
                    [src]="getPrimaryImage(item.product)"
                    [alt]="item.product?.name"
                    loading="lazy"
                  />
                </div>
                <div class="cart-item-info">
                  <a
                    [routerLink]="['/products', item.product?.id]"
                    class="cart-item-name"
                  >
                    {{ item.product?.name }}
                  </a>
                  @if (item.variant) {
                    <div class="cart-item-variant">
                      @if (item.variant.size) {
                        <span class="badge badge-accent">{{
                          item.variant.size
                        }}</span>
                      }
                      @if (item.variant.color) {
                        <span class="badge badge-gold">{{
                          item.variant.color
                        }}</span>
                      }
                    </div>
                  }
                  <div class="cart-item-price">
                    KSh {{ getItemPrice(item) | number: "1.0-0" }}
                  </div>
                </div>
                <div class="cart-item-actions">
                  <div class="qty-control">
                    <button
                      class="qty-btn"
                      (click)="updateQty(item, item.quantity - 1)"
                    >
                      −
                    </button>
                    <span class="qty-num">{{ item.quantity }}</span>
                    <button
                      class="qty-btn"
                      (click)="updateQty(item, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                  <div class="cart-item-total">
                    KSh {{ getItemTotal(item) | number: "1.0-0" }}
                  </div>
                  <button
                    class="remove-btn"
                    (click)="removeItem(item.id)"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary card">
            <h3>Order Summary</h3>
            <div class="summary-line">
              <span>Subtotal</span>
              <span>KSh {{ cart()?.subtotal | number: "1.0-0" }}</span>
            </div>
            <div class="summary-line">
              <span>Delivery Fee</span>
              <span>KSh {{ cart()?.deliveryFee | number: "1.0-0" }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-line total">
              <span>Total</span>
              <span>KSh {{ cart()?.total | number: "1.0-0" }}</span>
            </div>
            <a
              routerLink="/checkout"
              class="btn btn-primary"
              style="width: 100%; margin-top: 20px;"
            >
              Proceed to Checkout →
            </a>
            <a
              routerLink="/products"
              class="btn btn-secondary"
              style="width: 100%; margin-top: 10px;"
            >
              Continue Shopping
            </a>
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
        margin-bottom: 0;
      }
      .page-header h1 {
        font-style: italic;
      }
      .cart-layout {
        padding: 48px 24px;
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 32px;
        align-items: start;
      }
      .cart-empty {
        text-align: center;
        padding: 80px 24px;
        grid-column: 1 / -1;
      }
      .cart-empty-icon {
        font-size: 4rem;
        margin-bottom: 24px;
      }
      .cart-empty h2 {
        margin-bottom: 12px;
      }
      .cart-empty p {
        margin-bottom: 32px;
      }
      .cart-items-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .cart-items-header h2 {
        font-size: 1.25rem;
      }
      .cart-item {
        display: flex;
        gap: 20px;
        padding: 20px;
        margin-bottom: 16px;
      }
      .cart-item-image {
        width: 100px;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--color-surface-2);
      }
      .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cart-item-info {
        flex: 1;
      }
      .cart-item-name {
        font-family: var(--font-display);
        font-size: 1.125rem;
        color: var(--color-text);
        text-decoration: none;
      }
      .cart-item-name:hover {
        color: var(--color-accent);
      }
      .cart-item-variant {
        display: flex;
        gap: 8px;
        margin: 8px 0;
      }
      .cart-item-price {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        margin-top: 8px;
      }
      .cart-item-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
      }
      .qty-control {
        display: flex;
        align-items: center;
        gap: 0;
        border: 1.5px solid var(--color-border);
        border-radius: 24px;
        overflow: hidden;
      }
      .qty-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--color-text);
        transition: background 0.2s;
        font-size: 1rem;
      }
      .qty-btn:hover {
        background: var(--color-surface-2);
      }
      .qty-num {
        min-width: 32px;
        text-align: center;
        font-weight: 500;
      }
      .cart-item-total {
        font-family: var(--font-display);
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-accent);
      }
      .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted);
        font-size: 1rem;
        padding: 4px;
        transition: color 0.2s;
      }
      .remove-btn:hover {
        color: var(--color-error);
      }
      .cart-summary {
        padding: 28px;
        position: sticky;
        top: 100px;
      }
      .cart-summary h3 {
        font-size: 1.25rem;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--color-border);
        padding-bottom: 16px;
      }
      .summary-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 0.9375rem;
      }
      .summary-divider {
        height: 1px;
        background: var(--color-border);
        margin: 16px 0;
      }
      .summary-line.total {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-accent);
      }
      @media (max-width: 768px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }
        .cart-summary {
          position: static;
        }
        .cart-item {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class CartComponent implements OnInit {
  cart = signal<any>(null);
  loading = signal(true);

  constructor(
    private cartService: CartService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (c) => {
        this.cart.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getPrimaryImage(product: any) {
    const primary =
      product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = primary?.imageUrl || "";
    return url.startsWith("http")
      ? url
      : `${environment.apiUrl.replace("/api", "")}${url}`;
  }

  getItemPrice(item: any) {
    return (
      Number(item.product?.price || 0) +
      Number(item.variant?.additionalPrice || 0)
    );
  }

  getItemTotal(item: any) {
    return this.getItemPrice(item) * item.quantity;
  }

  updateQty(item: any, qty: number) {
    this.cartService.updateQuantity(item.id, qty).subscribe({
      next: (c) => this.cart.set(c),
      error: () => this.toast.error("Failed to update quantity"),
    });
  }

  removeItem(id: string) {
    this.cartService.removeItem(id).subscribe({
      next: (c) => {
        this.cart.set(c);
        this.toast.success("Item removed");
      },
      error: () => this.toast.error("Failed to remove item"),
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart.set(null);
        this.toast.success("Cart cleared");
      },
    });
  }
}
