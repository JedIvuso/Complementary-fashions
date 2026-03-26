import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-inner container">
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="brand-icon">✦</span>
            <div>
              <div class="brand-name">Complementary</div>
              <div class="brand-tagline">Fashions</div>
            </div>
          </div>
          <p class="brand-desc">
            Handcrafted crochet clothing woven with love and worn with pride.
            Each piece tells a unique story.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" title="Instagram">📸</a>
            <a href="#" class="social-link" title="Facebook">👥</a>
            <a href="#" class="social-link" title="TikTok">🎵</a>
            <a href="#" class="social-link" title="WhatsApp">💬</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a routerLink="/products">All Products</a></li>
            <li><a routerLink="/products?featured=true">Featured</a></li>
            <li><a routerLink="/products">New Arrivals</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Account</h4>
          <ul>
            <li><a routerLink="/auth/login">Sign In</a></li>
            <li><a routerLink="/auth/register">Register</a></li>
            <li><a routerLink="/orders">My Orders</a></li>
            <li><a routerLink="/favorites">Favorites</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Info</h4>
          <ul>
            <li><a routerLink="/about">About Us</a></li>
            <li>
              <a href="mailto:hello@complementaryfashions.com">Contact</a>
            </li>
            <li><a href="#">Shipping Policy</a></li>
            <li><a href="#">Returns</a></li>
            <a routerLink="/privacy-policy">Privacy Policy</a>
            <a routerLink="/terms">Terms & Conditions</a>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <p>&copy; {{ year }} Complementary Fashions. All rights reserved.</p>
          <p>Made with ♡ for crochet lovers</p>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        margin-top: 80px;
      }
      .footer-inner {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 48px;
        padding-top: 64px;
        padding-bottom: 48px;
      }
      .brand-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
      }
      .brand-icon {
        font-size: 1.75rem;
        color: var(--color-accent);
      }
      .brand-name {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-text);
      }
      .brand-tagline {
        font-family: var(--font-accent);
        color: var(--color-accent);
        font-size: 0.875rem;
      }
      .brand-desc {
        font-size: 0.875rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
        margin-bottom: 20px;
      }
      .social-links {
        display: flex;
        gap: 12px;
      }
      .social-link {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.3s;
      }
      .social-link:hover {
        background: var(--color-accent);
        border-color: var(--color-accent);
        transform: translateY(-2px);
      }
      .footer-col h4 {
        font-family: var(--font-body);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-text);
        margin-bottom: 20px;
      }
      .footer-col ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .footer-col a {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        text-decoration: none;
        transition: color 0.3s;
      }
      .footer-col a:hover {
        color: var(--color-accent);
      }
      .footer-bottom {
        border-top: 1px solid var(--color-border);
        padding: 20px 0;
      }
      .footer-bottom .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .footer-bottom p {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
      }
      @media (max-width: 1024px) {
        .footer-inner {
          grid-template-columns: 1fr 1fr;
        }
        .footer-brand {
          grid-column: 1 / -1;
        }
      }
      @media (max-width: 640px) {
        .footer-inner {
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          padding-top: 40px;
        }
        .footer-bottom .container {
          flex-direction: column;
          gap: 8px;
          text-align: center;
        }
      }
    `,
  ],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
