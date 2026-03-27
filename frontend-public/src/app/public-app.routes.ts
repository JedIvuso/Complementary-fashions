import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { guestGuard } from "./core/guards/guest.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "products",
    loadComponent: () =>
      import("./features/products/product-list/product-list.component").then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: "products/:id",
    loadComponent: () =>
      import("./features/products/product-detail/product-detail.component").then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: "cart",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/cart/cart.component").then((m) => m.CartComponent),
  },
  {
    path: "checkout",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/checkout/checkout.component").then(
        (m) => m.CheckoutComponent,
      ),
  },
  {
    path: "orders",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/orders/orders.component").then(
        (m) => m.OrdersComponent,
      ),
  },
  {
    path: "orders/:id",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/orders/order-detail.component").then(
        (m) => m.OrderDetailComponent,
      ),
  },
  {
    path: "favorites",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/favorites/favorites.component").then(
        (m) => m.FavoritesComponent,
      ),
  },
  {
    path: "account",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/account/account.component").then(
        (m) => m.AccountComponent,
      ),
  },
  {
    path: "about",
    loadComponent: () =>
      import("./features/about/public-about.component").then(
        (m) => m.AboutComponent,
      ),
  },
  {
    path: "privacy-policy",
    loadComponent: () =>
      import("./features/legal/privacy-policy.component").then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: "terms",
    loadComponent: () =>
      import("./features/legal/terms.component").then((m) => m.TermsComponent),
  },
  {
    path: "auth/login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "auth/register",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: "auth/forgot-password",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./features/auth/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  { path: "**", redirectTo: "" },
];
