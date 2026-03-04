import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { ToastContainerComponent } from "./shared/components/toast-container/toast-container.component";
import { ThemeService } from "./core/services/theme.service";
import { AuthService } from "./core/services/auth.service";
import { CartService } from "./core/services/cart.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent,
  ],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-toast-container></app-toast-container>
  `,
  styles: [
    `
      main {
        min-height: calc(100vh - 80px);
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private cart: CartService,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.cart.getCart().subscribe();
    }
  }
}
