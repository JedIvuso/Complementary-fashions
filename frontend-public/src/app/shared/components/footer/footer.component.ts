import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { environment } from "../../../../environments/environment";
import { ApiService } from "src/app/core/services/api.service";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-inner container">
        <div class="footer-brand">
          <div class="brand-logo">
            @if (logoUrl()) {
              <img
                [src]="logoUrl()"
                alt="Logo"
                style="height:40px;width:auto;object-fit:contain;"
              />
            } @else {
              <span class="brand-icon">✦</span>
            }
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
            <a
              [href]="socialLinks.instagram"
              target="_blank"
              class="social-link"
              title="Instagram"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.358.062-2.577.335-3.674 1.432-1.097 1.097-1.37 2.316-1.432 3.674-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.062 1.358.335 2.577 1.432 3.674 1.097 1.097 2.316 1.37 3.674 1.432 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.358-.062 2.577-.335 3.674-1.432 1.097-1.097 1.37-2.316 1.432-3.674.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.062-1.358-.335-2.577-1.432-3.674-1.097-1.097-2.316-1.37-3.674-1.432-1.28-.058-1.688-.072-4.947-.072z"
                />
                <path
                  d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
                />
                <circle cx="18.406" cy="5.594" r="1.44" />
              </svg>
            </a>
            <a
              [href]="socialLinks.facebook"
              target="_blank"
              class="social-link"
              title="Facebook"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
                />
              </svg>
            </a>
            <a
              [href]="socialLinks.tiktok"
              target="_blank"
              class="social-link"
              title="TikTok"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.743 2.886 2.895 2.895 0 0 1-2.898-2.896 2.894 2.894 0 0 1 2.898-2.896c.326 0 .637.059.93.16V8.305a6.317 6.317 0 0 0-4.788-.03 6.352 6.352 0 0 0-3.946 5.924 6.353 6.353 0 0 0 3.946 5.924 6.354 6.354 0 0 0 4.788.03 6.356 6.356 0 0 0 3.946-5.924V9.094c.848.609 1.87.963 2.977.963V6.686c-1.107 0-2.129-.354-2.977-.963z"
                />
              </svg>
            </a>
            <a
              [href]="socialLinks.whatsapp"
              target="_blank"
              class="social-link"
              title="WhatsApp"
              rel="noopener noreferrer"
            >
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.768.457 3.426 1.257 4.876l-1.215 4.437 4.57-1.2c1.377.743 2.957 1.165 4.638 1.165 5.523 0 10-4.477 10-10s-4.477-10-10-10zm3.106 14.242c-.24.396-.777.758-1.294.876-.373.084-.86.15-1.354-.084-.54-.256-1.05-.632-1.557-1.052-.92-.763-1.93-1.838-2.355-2.662-.312-.603-.326-1.053-.125-1.473.165-.345.464-.615.76-.845.142-.11.304-.227.429-.379.107-.13.16-.28.186-.436.03-.162-.02-.326-.083-.465-.107-.232-.203-.467-.319-.692-.178-.345-.388-.677-.585-1.016-.09-.154-.169-.313-.214-.482-.027-.101-.027-.206-.005-.306.04-.181.13-.346.254-.48.228-.249.494-.433.788-.574.298-.143.62-.198.943-.18.145.008.288.023.429.054.168.037.327.098.48.177.143.074.28.161.409.263.226.177.437.372.633.582.277.296.507.63.686.994.12.245.21.504.267.77.039.178.056.359.048.54-.008.159-.034.317-.084.47-.054.161-.123.315-.207.463-.08.141-.169.277-.27.404-.167.212-.357.405-.544.598-.111.115-.224.228-.334.344-.11.116-.194.249-.236.396-.04.135-.026.276.023.407.092.244.208.477.347.697.125.198.264.386.416.563.217.255.457.488.712.705.187.159.382.309.584.45.133.093.272.178.415.254.121.064.246.119.375.165.097.035.197.062.299.08.116.02.235.027.353.021.13-.007.259-.029.385-.064.149-.041.296-.098.436-.172.175-.093.339-.203.486-.333.139-.123.262-.263.368-.416.13-.187.223-.399.277-.62.051-.207.067-.421.047-.633-.014-.145-.051-.287-.105-.424-.066-.166-.154-.322-.256-.469-.088-.127-.189-.245-.299-.354-.211-.208-.437-.399-.674-.574-.177-.13-.363-.247-.556-.351-.123-.066-.25-.125-.38-.175-.085-.033-.172-.06-.26-.08-.067-.015-.136-.022-.204-.022-.12 0-.24.022-.354.066-.098.038-.191.086-.279.142-.058.037-.112.08-.162.128-.03.03-.059.062-.085.096-.023.03-.042.063-.057.098-.026.063-.044.128-.053.195-.006.03-.008.061-.006.092.003.027.009.054.018.08.014.04.031.079.05.117.038.074.081.144.128.211.042.06.088.117.136.172.076.085.157.165.242.24.067.06.137.117.209.171.068.051.139.098.212.141.073.043.149.08.226.113.077.033.156.06.236.082.066.018.133.03.2.037.042.005.085.006.127.003.043-.003.086-.01.128-.02.062-.015.123-.036.182-.062.058-.026.113-.058.165-.094.05-.035.097-.075.14-.119.059-.06.112-.126.159-.197.048-.072.089-.149.122-.229.029-.071.051-.145.065-.221.012-.058.019-.117.021-.176.003-.039.004-.078.003-.118-.001-.027-.004-.054-.008-.08-.011-.048-.027-.094-.047-.138-.027-.06-.06-.117-.097-.171-.032-.047-.068-.09-.106-.132-.089-.098-.184-.19-.283-.277-.099-.087-.202-.169-.307-.247-.105-.078-.214-.151-.325-.219-.11-.068-.223-.131-.337-.188-.114-.057-.231-.109-.349-.155-.118-.046-.238-.086-.359-.12-.121-.034-.244-.061-.367-.081-.123-.02-.247-.033-.371-.039-.124-.006-.248-.004-.371.004-.123.008-.246.023-.368.046-.122.023-.243.053-.363.09-.12.037-.238.081-.354.131-.116.05-.23.107-.341.17-.111.063-.219.133-.324.208-.105.075-.207.156-.305.242-.098.086-.192.177-.282.272-.09.095-.176.194-.257.297-.081.103-.158.21-.23.32-.072.11-.139.223-.201.338-.062.115-.119.233-.17.352-.051.119-.097.24-.137.362-.04.122-.074.245-.102.369-.028.124-.05.249-.065.374-.015.125-.023.251-.024.377-.001.126.005.252.017.377.012.125.03.25.054.374.024.124.054.247.09.369.036.122.078.242.126.36.048.118.102.234.162.347.06.113.126.223.198.33.072.107.15.21.233.309.083.099.172.194.265.285.093.091.191.177.293.259.102.082.209.159.319.231.11.072.224.139.34.2.116.061.235.117.356.167.121.05.244.095.369.134.125.039.252.073.38.101.128.028.257.05.387.066.13.016.261.026.392.03.131.004.262.002.393-.006.131-.008.262-.022.392-.042.13-.02.26-.046.389-.078.129-.032.257-.07.383-.114.126-.044.25-.094.372-.15.122-.056.242-.118.359-.186.117-.068.232-.142.343-.221.111-.079.219-.164.323-.254.104-.09.205-.185.302-.285.097-.1.19-.204.278-.312.088-.108.171-.22.25-.335.079-.115.153-.233.222-.353.069-.12.133-.242.192-.366.059-.124.113-.25.161-.377.048-.127.091-.255.128-.384.037-.129.068-.259.093-.39.025-.131.044-.262.057-.394.013-.132.02-.264.02-.396 0-.132-.007-.264-.02-.396-.013-.132-.032-.263-.057-.394-.025-.131-.056-.261-.093-.39-.037-.129-.08-.257-.128-.384-.048-.127-.102-.253-.161-.377-.059-.124-.123-.246-.192-.366-.069-.12-.143-.238-.222-.353-.079-.115-.162-.227-.25-.335-.088-.108-.181-.212-.278-.312-.097-.1-.198-.195-.302-.285-.104-.09-.212-.175-.323-.254-.111-.079-.227-.153-.343-.221-.116-.068-.237-.13-.359-.186-.122-.056-.246-.106-.372-.15-.126-.044-.254-.082-.383-.114-.129-.032-.259-.058-.389-.078-.13-.02-.261-.034-.392-.042-.131-.008-.262-.01-.393-.006z"
                />
              </svg>
            </a>
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
            <li><a routerLink="/privacy-policy">Privacy Policy</a></li>
            <li><a routerLink="/terms">Terms & Conditions</a></li>
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
        transition: all 0.3s;
        color: var(--color-text);
      }
      .social-link:hover {
        background: var(--color-accent);
        border-color: var(--color-accent);
        transform: translateY(-2px);
        color: white;
      }
      .social-icon {
        width: 18px;
        height: 18px;
        fill: currentColor;
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
export class FooterComponent implements OnInit {
  year = new Date().getFullYear();
  logoUrl = signal<string>("");

  socialLinks = {
    instagram: "https://instagram.com/complementaryfashions",
    facebook: "https://facebook.com/complementaryfashions",
    tiktok: "https://tiktok.com/@complementaryfashions",
    whatsapp: "https://wa.me/1234567890", // Replace with your actual WhatsApp number
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>("/about").subscribe({
      next: (data) => {
        if (data.logoUrl) {
          const base = environment.apiUrl.replace("/api", "");
          this.logoUrl.set(
            data.logoUrl.startsWith("https")
              ? data.logoUrl
              : `${base}${data.logoUrl}`,
          );
        }
        // Update social links if provided from API
        if (data.instagramUrl) this.socialLinks.instagram = data.instagramUrl;
        if (data.facebookUrl) this.socialLinks.facebook = data.facebookUrl;
        if (data.tiktokUrl) this.socialLinks.tiktok = data.tiktokUrl;
        if (data.whatsappNumber) {
          this.socialLinks.whatsapp = `https://wa.me/${data.whatsappNumber}`;
        }
      },
    });
  }
}
