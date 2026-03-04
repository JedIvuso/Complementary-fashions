import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
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
        @if (step() === 'delivery') {
          <div class="checkout-form card">
            <h3>Delivery Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input class="form-input" [(ngModel)]="delivery.fullName" placeholder="Your full name">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input class="form-input" [(ngModel)]="delivery.phone" placeholder="07XX XXX XXX">
              </div>
              <div class="form-group span-2">
                <label class="form-label">Email Address *</label>
                <input class="form-input" type="email" [(ngModel)]="delivery.email" placeholder="your@email.com">
              </div>
              <div class="form-group span-2">
                <label class="form-label">Delivery Address *</label>
                <textarea class="form-textarea" [(ngModel)]="delivery.address" placeholder="Street, building, apartment..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">City / Town</label>
                <input class="form-input" [(ngModel)]="delivery.city" placeholder="Nairobi">
              </div>
              <div class="form-group">
                <label class="form-label">Order Notes (Optional)</label>
                <input class="form-input" [(ngModel)]="delivery.notes" placeholder="Any special instructions">
              </div>
            </div>
            <button class="btn btn-primary" style="margin-top: 24px;" (click)="continueToPayment()">
              Continue to Payment →
            </button>
          </div>
        }

        @if (step() === 'payment') {
          <div class="checkout-form card">
            <h3>Payment</h3>
            <div class="payment-method">
              <div class="mpesa-logo">
                <span class="mpesa-icon">📱</span>
                <div>
                  <strong>M-Pesa</strong>
                  <p style="font-size:0.875rem; color: var(--color-text-secondary);">Pay via Safaricom Paybill</p>
                </div>
              </div>
            </div>
            <div class="form-group" style="margin-top: 24px;">
              <label class="form-label">M-Pesa Phone Number *</label>
              <input class="form-input" [(ngModel)]="mpesaPhone" placeholder="07XX XXX XXX (must be Safaricom)">
              <small style="color: var(--color-text-muted); margin-top: 4px; display: block;">
                You will receive an STK push on this number to enter your M-Pesa PIN.
              </small>
            </div>
            <div class="checkout-actions">
              <button class="btn btn-secondary" (click)="step.set('delivery')">← Back</button>
              <button class="btn btn-primary" [disabled]="processingOrder()" (click)="placeOrder()">
                @if (processingOrder()) { Processing... } @else { Pay KSh {{ cart()?.total | number:'1.0-0' }} }
              </button>
            </div>
          </div>
        }

        @if (step() === 'pending-payment') {
          <div class="checkout-form card text-center">
            <div class="payment-pending-icon">📲</div>
            <h3>Check Your Phone</h3>
            <p>An M-Pesa STK push has been sent to <strong>{{ mpesaPhone }}</strong>.</p>
            <p style="margin-top: 8px;">Enter your M-Pesa PIN to complete the payment.</p>
            <div class="payment-timer">
              Checking payment status...
              <div class="spinner" style="margin: 12px auto;"></div>
            </div>
            <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-top: 12px;">
              Order #{{ currentOrderNumber() }}
            </p>
          </div>
        }

        @if (step() === 'confirmed') {
          <div class="checkout-form card text-center">
            <div class="success-icon">✅</div>
            <h3>Order Confirmed!</h3>
            <p>Thank you for your order. Your handcrafted pieces are being prepared with love.</p>
            <p class="order-number">Order #{{ currentOrderNumber() }}</p>
            <div class="checkout-actions" style="justify-content: center;">
              <a routerLink="/orders" class="btn btn-primary">Track My Order →</a>
              <a routerLink="/products" class="btn btn-secondary">Continue Shopping</a>
            </div>
          </div>
        }

        <!-- Order Summary -->
        @if (cart()) {
          <div class="order-summary card">
            <h3>Order Summary</h3>
            @for (item of cart()?.items; track item.id) {
              <div class="summary-item">
                <div class="summary-item-img">
                  <img [src]="getPrimaryImage(item.product)" [alt]="item.product?.name">
                  <span class="qty-badge">{{ item.quantity }}</span>
                </div>
                <div style="flex: 1;">
                  <p style="font-weight: 500; color: var(--color-text);">{{ item.product?.name }}</p>
                  @if (item.variant?.size) { <small class="text-muted">{{ item.variant.size }}</small> }
                </div>
                <span class="price">KSh {{ getItemTotal(item) | number:'1.0-0' }}</span>
              </div>
            }
            <div style="border-top: 1px solid var(--color-border); margin-top: 16px; padding-top: 16px;">
              <div class="summary-line"><span>Subtotal</span><span>KSh {{ cart()?.subtotal | number:'1.0-0' }}</span></div>
              <div class="summary-line"><span>Delivery</span><span>KSh {{ cart()?.deliveryFee | number:'1.0-0' }}</span></div>
              <div class="summary-line total"><span>Total</span><span>KSh {{ cart()?.total | number:'1.0-0' }}</span></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: 60px 0 40px; }
    .page-header h1 { font-style: italic; }
    .checkout-layout { padding: 48px 24px; display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
    .checkout-form { padding: 32px; }
    .checkout-form h3 { font-size: 1.375rem; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .span-2 { grid-column: 1 / -1; }
    .mpesa-logo { display: flex; align-items: center; gap: 16px; padding: 16px; border: 1.5px solid var(--color-accent); border-radius: var(--radius-sm); background: rgba(201,112,58,0.05); }
    .mpesa-icon { font-size: 2rem; }
    .checkout-actions { display: flex; gap: 12px; margin-top: 24px; }
    .payment-pending-icon { font-size: 3rem; margin-bottom: 16px; }
    .payment-timer { margin-top: 16px; color: var(--color-text-secondary); }
    .success-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .order-number { font-family: var(--font-display); font-size: 1.25rem; color: var(--color-accent); margin: 16px 0; }
    .order-summary { padding: 28px; position: sticky; top: 100px; }
    .order-summary h3 { margin-bottom: 20px; font-size: 1.25rem; }
    .summary-item { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .summary-item-img { position: relative; width: 56px; height: 64px; flex-shrink: 0; }
    .summary-item-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
    .qty-badge { position: absolute; top: -8px; right: -8px; background: var(--color-accent); color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; }
    .summary-line { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9375rem; }
    .summary-line.total { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--color-accent); margin-top: 8px; }
    .spinner { width: 28px; height: 28px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } .order-summary { position: static; } .form-grid { grid-template-columns: 1fr; } .span-2 { grid-column: 1; } }
  `]
})
export class CheckoutComponent implements OnInit {
  cart = signal<any>(null);
  step = signal<'delivery' | 'payment' | 'pending-payment' | 'confirmed'>('delivery');
  processingOrder = signal(false);
  currentOrderId = signal<string | null>(null);
  currentOrderNumber = signal<string | null>(null);
  checkoutRequestId = signal<string | null>(null);
  private pollInterval: any;

  delivery = { fullName: '', phone: '', email: '', address: '', city: '', notes: '' };
  mpesaPhone = '';

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
      this.mpesaPhone = '';
    }
  }

  continueToPayment() {
    if (!this.delivery.fullName || !this.delivery.phone || !this.delivery.email || !this.delivery.address) {
      this.toast.error('Please fill in all required fields');
      return;
    }
    this.step.set('payment');
  }

  placeOrder() {
    if (!this.mpesaPhone) { this.toast.error('Enter M-Pesa phone number'); return; }
    this.processingOrder.set(true);

    this.ordersService.create(this.delivery).subscribe({
      next: (order) => {
        this.currentOrderId.set(order.id);
        this.currentOrderNumber.set(order.orderNumber);
        this.api.post('/payments/mpesa/initiate', { orderId: order.id, phoneNumber: this.mpesaPhone }).subscribe({
          next: (res: any) => {
            this.checkoutRequestId.set(res.checkoutRequestId);
            this.step.set('pending-payment');
            this.processingOrder.set(false);
            this.startPolling();
          },
          error: () => {
            this.processingOrder.set(false);
            this.toast.error('Payment initiation failed. Please try again.');
          }
        });
      },
      error: () => {
        this.processingOrder.set(false);
        this.toast.error('Failed to create order');
      }
    });
  }

  startPolling() {
    let attempts = 0;
    this.pollInterval = setInterval(() => {
      attempts++;
      if (attempts > 20) { clearInterval(this.pollInterval); return; }

      this.api.get(`/payments/mpesa/status/${this.checkoutRequestId()}`).subscribe({
        next: (res: any) => {
          if (res.status === 'completed') {
            clearInterval(this.pollInterval);
            this.step.set('confirmed');
          } else if (res.status === 'failed') {
            clearInterval(this.pollInterval);
            this.toast.error('Payment failed. Please try again.');
            this.step.set('payment');
          }
        }
      });
    }, 5000);
  }

  ngOnDestroy() { clearInterval(this.pollInterval); }

  getPrimaryImage(product: any) {
    const primary = product?.images?.find((i: any) => i.isPrimary) || product?.images?.[0];
    const url = primary?.imageUrl || '';
    return url.startsWith('http') ? url : `http://localhost:3000${url}`;
  }

  getItemTotal(item: any) {
    return (Number(item.product?.price || 0) + Number(item.variant?.additionalPrice || 0)) * item.quantity;
  }
}
