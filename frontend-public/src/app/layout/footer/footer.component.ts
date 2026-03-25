import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <span>🧶</span>
              <span class="brand-name">Complementary Fashions</span>
            </div>
            <p>
              Handcrafted crochet clothing for the modern soul. Every stitch
              tells a story.
            </p>
            <div class="social-links">
              <a href="#" class="social-btn" title="Instagram">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" class="social-btn" title="Facebook">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                  />
                </svg>
              </a>
              <a href="#" class="social-btn" title="WhatsApp">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Shop</h4>
            <a routerLink="/products">All Products</a>
            <a routerLink="/products?featured=true">Featured</a>
            <a routerLink="/categories">Categories</a>
            <a routerLink="/products?sortBy=popular">Best Sellers</a>
          </div>

          <div class="footer-col">
            <h4>Account</h4>
            <a routerLink="/auth/login">Login</a>
            <a routerLink="/auth/register">Register</a>
            <a routerLink="/orders">My Orders</a>
            <a routerLink="/favorites">Favorites</a>
          </div>

          <div class="footer-col">
            <h4>Info</h4>
            <a routerLink="/about">About Us</a>
            <a href="mailto:hello@complementaryfashions.com">Contact</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Returns</a>
            <a routerLink="/privacy-policy">Privacy Policy</a>
            <a routerLink="/terms">Terms & Conditions</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© {{ year }} Complementary Fashions. Handcrafted with 🧡</p>
          <p>Made in Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--bg-footer);
        border-top: 1px solid var(--border-color);
        padding: 60px 0 30px;
      }
      .footer-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 24px;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 40px;
        margin-bottom: 48px;
      }
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 20px;
      }
      .brand-name {
        font-family: "Playfair Display", Georgia, serif;
        font-weight: 700;
        color: var(--accent);
      }
      .footer-brand p {
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .social-links {
        display: flex;
        gap: 8px;
      }
      .social-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        text-decoration: none;
        transition: all 0.2s;
      }
      .social-btn:hover {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
      }
      .footer-col h4 {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-primary);
        margin-bottom: 16px;
      }
      .footer-col a {
        display: block;
        text-decoration: none;
        color: var(--text-secondary);
        font-size: 14px;
        margin-bottom: 10px;
        transition: color 0.2s;
      }
      .footer-col a:hover {
        color: var(--accent);
      }
      .footer-bottom {
        border-top: 1px solid var(--border-color);
        padding-top: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-secondary);
        font-size: 13px;
      }
      @media (max-width: 768px) {
        .footer-grid {
          grid-template-columns: 1fr 1fr;
        }
        .footer-brand {
          grid-column: 1 / -1;
        }
        .footer-bottom {
          flex-direction: column;
          gap: 8px;
          text-align: center;
        }
      }
      @media (max-width: 480px) {
        .footer-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
