import { Injectable, signal, computed } from "@angular/core";
import { ApiService } from "./api.service";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class CartService {
  private _cart = signal<any>({
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
  });
  cart = this._cart.asReadonly();
  itemCount = computed(() => this._cart().itemCount || 0);

  constructor(private api: ApiService) {}

  loadCart() {
    return this.getCart();
  }

  addItem(productId: string, variantId?: string, quantity = 1) {
    return this.addToCart(productId, variantId, quantity);
  }

  getCart() {
    return this.api.get<any>("/cart").pipe(tap((cart) => this._cart.set(cart)));
  }

  addToCart(productId: string, variantId?: string, quantity = 1) {
    return this.api
      .post<any>("/cart/add", { productId, variantId, quantity })
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  updateQuantity(itemId: string, quantity: number) {
    return this.api
      .put<any>(`/cart/${itemId}`, { quantity })
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  removeItem(itemId: string) {
    return this.api
      .delete<any>(`/cart/${itemId}`)
      .pipe(tap((cart) => this._cart.set(cart)));
  }

  clearCart() {
    return this.api
      .delete<any>("/cart/clear")
      .pipe(
        tap(() =>
          this._cart.set({
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            total: 0,
            itemCount: 0,
          }),
        ),
      );
  }
}
