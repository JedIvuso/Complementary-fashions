import { Routes } from "@angular/router";
import { adminAuthGuard } from "./core/guards/admin-auth.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/admin-login.component").then(
        (m) => m.AdminLoginComponent,
      ),
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./features/auth/admin-forgot-password.component").then(
        (m) => m.AdminForgotPasswordComponent,
      ),
  },
  {
    path: "",
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import("./layout/admin-layout.component").then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: "products",
        loadComponent: () =>
          import("./features/products/products.component").then(
            (m) => m.AdminProductsComponent,
          ),
      },
      {
        path: "categories",
        loadComponent: () =>
          import("./features/categories/categories.component").then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: "orders",
        loadComponent: () =>
          import("./features/orders/orders.component").then(
            (m) => m.AdminOrdersComponent,
          ),
      },
      {
        path: "users",
        loadComponent: () =>
          import("./features/users/users.component").then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: "banners",
        loadComponent: () =>
          import("./features/banners/banners.component").then(
            (m) => m.AdminBannersComponent,
          ),
      },
      {
        path: "about",
        loadComponent: () =>
          import("./features/about/admin-about.component").then(
            (m) => m.AdminAboutComponent,
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./features/settings/admin-settings.component").then(
            (m) => m.AdminSettingsComponent,
          ),
      },
      {
        path: "payment-settings",
        loadComponent: () =>
          import("./features/settings/admin-payment-settings.component").then(
            (m) => m.AdminPaymentSettingsComponent,
          ),
      },
      {
        path: "pos",
        loadComponent: () =>
          import("./features/pos/pos.component").then((m) => m.PosComponent),
      },
      {
        path: "analytics",
        loadComponent: () =>
          import("./features/analytics/analytics.component").then(
            (m) => m.AnalyticsComponent,
          ),
      },
    ],
  },
  { path: "**", redirectTo: "" },
];
