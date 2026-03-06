import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-toast-container></app-toast-container>
  `,
  styles: [`main { min-height: calc(100vh - 80px); }`]
})
export class AppComponent implements OnInit {
  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private cart: CartService,
    private api: ApiService,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.cart.loadCart().subscribe();
    }
    this.loadBranding();
  }

  private loadBranding() {
    this.api.get<any>('/about').subscribe({
      next: (data) => {
        const apiBase = 'http://localhost:3000';

        // Apply accent color as CSS variable
        if (data.accentColor) {
          document.documentElement.style.setProperty('--color-accent', data.accentColor);
          document.documentElement.style.setProperty('--accent', data.accentColor);
        }

        // Apply logo in navbar (swap emoji for real logo image)
        if (data.logoUrl) {
          const logoUrl = data.logoUrl.startsWith('http') ? data.logoUrl : `${apiBase}${data.logoUrl}`;
          // Store in sessionStorage so navbar can pick it up reactively
          sessionStorage.setItem('cf_logo_url', logoUrl);
          // Directly patch any existing logo-icon elements
          const iconEl = document.querySelector('.logo-icon') as HTMLElement;
          if (iconEl) {
            iconEl.innerHTML = `<img src="${logoUrl}" style="height:40px;width:auto;object-fit:contain" alt="Logo">`;
          }
        }

        // Apply favicon
        if (data.faviconUrl) {
          const faviconUrl = data.faviconUrl.startsWith('http') ? data.faviconUrl : `${apiBase}${data.faviconUrl}`;
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }
      }
    });
  }
}