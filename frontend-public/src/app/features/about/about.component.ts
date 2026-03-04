import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-page page-enter">
      <!-- Hero -->
      <section class="about-hero">
        <div class="about-hero-bg"></div>
        <div class="container about-hero-content">
          <span class="section-label">Our Identity</span>
          <h1><em>Crafting Stories,</em><br>One Stitch at a Time</h1>
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
                <a [href]="'mailto:' + about()?.contactEmail">{{ about()?.contactEmail }}</a>
              </div>
              <div class="contact-card card">
                <div class="contact-icon">📞</div>
                <h4>Phone</h4>
                <a [href]="'tel:' + about()?.contactPhone">{{ about()?.contactPhone }}</a>
              </div>
              <div class="contact-card card">
                <div class="contact-icon">📍</div>
                <h4>Address</h4>
                <p>{{ about()?.contactAddress }}</p>
              </div>
            </div>

            <!-- Social Links -->
            @if (about()?.instagramUrl || about()?.facebookUrl || about()?.twitterUrl) {
              <div class="social-links">
                @if (about()?.instagramUrl) {
                  <a [href]="about()?.instagramUrl" target="_blank" class="social-btn">
                    <span>Instagram</span>
                  </a>
                }
                @if (about()?.facebookUrl) {
                  <a [href]="about()?.facebookUrl" target="_blank" class="social-btn">
                    <span>Facebook</span>
                  </a>
                }
                @if (about()?.tiktokUrl) {
                  <a [href]="about()?.tiktokUrl" target="_blank" class="social-btn">
                    <span>TikTok</span>
                  </a>
                }
                @if (about()?.whatsappNumber) {
                  <a [href]="'https://wa.me/' + about()?.whatsappNumber" target="_blank" class="social-btn whatsapp">
                    <span>WhatsApp</span>
                  </a>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .about-hero { min-height: 60vh; position: relative; display: flex; align-items: center; padding-top: 80px; }
    .about-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%); }
    .about-hero-bg::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 60% 40%, rgba(201,112,58,0.1) 0%, transparent 60%); }
    .about-hero-content { position: relative; z-index: 1; }
    .about-hero-content h1 { font-size: clamp(3rem, 6vw, 5rem); font-weight: 300; margin-top: 12px; }
    .about-text { font-size: 1.125rem; line-height: 1.9; color: var(--color-text-secondary); text-align: center; }
    .mission-section { background: var(--color-surface); }
    .mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .mv-card { padding: 40px; text-align: center; }
    .mv-icon { font-size: 2.5rem; margin-bottom: 20px; }
    .mv-card h3 { margin-bottom: 16px; font-style: italic; }
    .contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .contact-card { padding: 32px; text-align: center; }
    .contact-icon { font-size: 2rem; margin-bottom: 12px; }
    .contact-card h4 { margin-bottom: 8px; font-size: 1rem; letter-spacing: 0.05em; text-transform: uppercase; font-family: var(--font-body); }
    .contact-card a, .contact-card p { color: var(--color-text-secondary); font-size: 0.9375rem; }
    .social-links { display: flex; gap: 12px; justify-content: center; margin-top: 48px; flex-wrap: wrap; }
    .social-btn { padding: 10px 28px; border-radius: 24px; background: var(--color-surface); border: 1.5px solid var(--color-border); color: var(--color-text); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
    .social-btn:hover { background: var(--color-accent); color: white; border-color: var(--color-accent); }
    .social-btn.whatsapp:hover { background: #25D366; border-color: #25D366; }
    @media (max-width: 768px) { .mv-grid { grid-template-columns: 1fr; } .contact-grid { grid-template-columns: 1fr; } }
  `]
})
export class AboutComponent implements OnInit {
  about = signal<any>(null);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get('/about').subscribe({ next: (data) => this.about.set(data) });
  }
}
