import { environment } from "../../../environments/environment";
import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page page-enter">
      <!-- Hero -->
      <section class="about-hero">
        <div class="about-hero-bg"></div>
        <div class="container about-hero-content">
          <span class="section-label">{{
            about()?.heroSubtitle || "Our Identity"
          }}</span>
          <h1>
            <em>{{ getHeroLine1() }}</em
            ><br />{{ getHeroLine2() }}
          </h1>
        </div>
      </section>

      @if (about()) {
        <!-- Brand Story -->
        <section class="section">
          <div class="container-sm">
            <div class="section-header">
              <span class="section-label">Who We Are</span>
              <h2 class="section-title">Our Story</h2>
              <div class="section-divider"></div>
            </div>
            <p class="about-text">{{ about()?.brandStory }}</p>
          </div>
        </section>

        <!-- Mission & Vision -->
        <section class="section mission-section">
          <div class="container">
            <div class="mv-grid">
              <div class="mv-card card">
                <div class="mv-icon">🌿</div>
                <h3>Our Mission</h3>
                <p>{{ about()?.mission }}</p>
              </div>
              <div class="mv-card card">
                <div class="mv-icon">✦</div>
                <h3>Our Vision</h3>
                <p>{{ about()?.vision }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Owner Section -->
        @if (about()?.ownerName || about()?.ownerBio) {
          <section class="section owner-section">
            <div class="container">
              <div class="section-header">
                <span class="section-label">The Maker</span>
                <h2 class="section-title">Meet the Designer</h2>
                <div class="section-divider"></div>
              </div>
              <div class="owner-grid">
                <div class="owner-image-wrap">
                  @if (about()?.ownerImageUrl) {
                    <img
                      [src]="resolveUrl(about()?.ownerImageUrl)"
                      [alt]="about()?.ownerName"
                      class="owner-img"
                    />
                  } @else {
                    <div class="owner-placeholder">
                      <span>✦</span>
                    </div>
                  }
                </div>
                <div class="owner-content">
                  <h3 class="owner-name">{{ about()?.ownerName }}</h3>
                  <p class="owner-bio">{{ about()?.ownerBio }}</p>
                </div>
              </div>
            </div>
          </section>
        }

        <!-- Crafting Process -->
        <section class="section process-section">
          <div class="container-sm">
            <div class="section-header">
              <span class="section-label">The Art</span>
              <h2 class="section-title">Our Crafting Process</h2>
              <div class="section-divider"></div>
            </div>
            <p class="about-text">{{ about()?.craftingProcess }}</p>
          </div>
        </section>

        <!-- Contact -->
        <section class="section contact-section">
          <div class="container">
            <div class="section-header">
              <span class="section-label">Connect</span>
              <h2 class="section-title">Get in Touch</h2>
              <div class="section-divider"></div>
            </div>
            <div class="contact-grid">
              <div class="contact-card card">
                <div class="contact-icon">✉️</div>
                <h4>Email</h4>
                <a [href]="'mailto:' + about()?.contactEmail">{{
                  about()?.contactEmail
                }}</a>
              </div>
              <div class="contact-card card">
                <div class="contact-icon">📞</div>
                <h4>Phone</h4>
                <a [href]="'tel:' + about()?.contactPhone">{{
                  about()?.contactPhone
                }}</a>
              </div>
              <div class="contact-card card">
                <div class="contact-icon">📍</div>
                <h4>Address</h4>
                <p>{{ about()?.contactAddress }}</p>
              </div>
            </div>

            @if (
              about()?.instagramUrl ||
              about()?.facebookUrl ||
              about()?.tiktokUrl ||
              about()?.whatsappNumber
            ) {
              <div class="social-links">
                @if (about()?.instagramUrl) {
                  <a
                    [href]="about()?.instagramUrl"
                    target="_blank"
                    class="social-btn instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      style="margin-right:8px;vertical-align:middle"
                    >
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                      />
                    </svg>
                    Instagram
                  </a>
                }
                @if (about()?.facebookUrl) {
                  <a
                    [href]="about()?.facebookUrl"
                    target="_blank"
                    class="social-btn facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      style="margin-right:8px;vertical-align:middle"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </a>
                }
                @if (about()?.tiktokUrl) {
                  <a
                    [href]="about()?.tiktokUrl"
                    target="_blank"
                    class="social-btn tiktok"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      style="margin-right:8px;vertical-align:middle"
                    >
                      <path
                        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                      />
                    </svg>
                    TikTok
                  </a>
                }
                @if (about()?.whatsappNumber) {
                  <a
                    [href]="'https://wa.me/' + about()?.whatsappNumber"
                    target="_blank"
                    class="social-btn whatsapp"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      style="margin-right:8px;vertical-align:middle"
                    >
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                      />
                    </svg>
                    WhatsApp
                  </a>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .about-hero {
        min-height: 60vh;
        position: relative;
        display: flex;
        align-items: center;
        padding-top: 80px;
      }
      .about-hero-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          var(--color-bg) 0%,
          var(--color-bg-secondary) 100%
        );
      }
      .about-hero-bg::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
          circle at 60% 40%,
          rgba(201, 112, 58, 0.1) 0%,
          transparent 60%
        );
      }
      .about-hero-content {
        position: relative;
        z-index: 1;
      }
      .about-hero-content h1 {
        font-size: clamp(3rem, 6vw, 5rem);
        font-weight: 300;
        margin-top: 12px;
      }
      .about-text {
        font-size: 1.125rem;
        line-height: 1.9;
        color: var(--color-text-secondary);
        text-align: center;
      }
      .mission-section {
        background: var(--color-surface);
      }
      .mv-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      .mv-card {
        padding: 40px;
        text-align: center;
      }
      .mv-icon {
        font-size: 2.5rem;
        margin-bottom: 20px;
      }
      .mv-card h3 {
        margin-bottom: 16px;
        font-style: italic;
      }
      /* Owner section */
      .owner-section {
        background: var(--color-bg);
      }
      .owner-grid {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 56px;
        align-items: center;
        margin-top: 48px;
      }
      .owner-image-wrap {
        border-radius: 16px;
        overflow: hidden;
        aspect-ratio: 3/4;
      }
      .owner-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .owner-placeholder {
        width: 100%;
        height: 100%;
        min-height: 400px;
        background: var(--color-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 4rem;
        color: var(--color-accent);
        border-radius: 16px;
      }
      .owner-name {
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 400;
        margin-bottom: 20px;
        font-style: italic;
      }
      .owner-bio {
        font-size: 1.125rem;
        line-height: 1.9;
        color: var(--color-text-secondary);
      }
      /* Contact */
      .contact-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      .contact-card {
        padding: 32px;
        text-align: center;
      }
      .contact-icon {
        font-size: 2rem;
        margin-bottom: 12px;
      }
      .contact-card h4 {
        margin-bottom: 8px;
        font-size: 1rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-family: var(--font-body);
      }
      .contact-card a,
      .contact-card p {
        color: var(--color-text-secondary);
        font-size: 0.9375rem;
      }
      .social-links {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 48px;
        flex-wrap: wrap;
      }
      .social-btn {
        padding: 10px 24px;
        border-radius: 24px;
        background: var(--color-surface);
        border: 1.5px solid var(--color-border);
        color: var(--color-text);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
      }
      .social-btn:hover {
        color: white;
      }
      .social-btn.instagram:hover {
        background: #e1306c;
        border-color: #e1306c;
      }
      .social-btn.facebook:hover {
        background: #1877f2;
        border-color: #1877f2;
      }
      .social-btn.tiktok:hover {
        background: #000000;
        border-color: #000000;
      }
      .social-btn.whatsapp:hover {
        background: #25d366;
        border-color: #25d366;
      }
      @media (max-width: 900px) {
        .owner-grid {
          grid-template-columns: 1fr;
        }
        .owner-image-wrap {
          max-width: 320px;
          margin: 0 auto;
        }
      }
      @media (max-width: 768px) {
        .mv-grid {
          grid-template-columns: 1fr;
        }
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  about = signal<any>(null);
  private apiBase = environment.apiUrl.replace("/api", "");

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get("/about").subscribe({ next: (data) => this.about.set(data) });
  }

  getHeroLine1() {
    const title =
      this.about()?.heroTitle || "Crafting Stories, One Stitch at a Time";
    const parts = title.split(",");
    return parts[0] + (parts.length > 1 ? "," : "");
  }

  getHeroLine2() {
    const title =
      this.about()?.heroTitle || "Crafting Stories, One Stitch at a Time";
    const commaIdx = title.indexOf(",");
    return commaIdx !== -1 ? title.substring(commaIdx + 1).trim() : "";
  }

  resolveUrl(url: string) {
    if (!url) return "";
    return url.startsWith("https") ? url : `${this.apiBase}${url}`;
  }
}
