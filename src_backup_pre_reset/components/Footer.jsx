import { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({
    submitted: false,
    message: ''
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setNewsletterStatus({
        submitted: false,
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setNewsletterStatus({
      submitted: true,
      message: '🙏 Shukriya! You are now subscribed to The Pahadíly Dispatch.'
    });
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="site-footer" id="about">
      {/* 1. Newsletter Card Section (The Mountain Dispatch) */}
      <div className="footer-newsletter-wrap">
        <div className="section-container">
          <div className="newsletter-card">
            {/* Ambient Mountain Line Art Background */}
            <div className="newsletter-contour-lines" aria-hidden="true">
              <svg viewBox="0 0 1200 240" preserveAspectRatio="none" className="contour-svg">
                <path
                  d="M0,160 C150,110 320,190 500,130 C680,70 850,150 1020,90 C1110,60 1170,80 1200,75 L1200,240 L0,240 Z"
                  fill="rgba(120, 202, 160, 0.04)"
                />
                <path
                  d="M0,190 C180,150 360,210 540,170 C720,130 900,180 1080,140 C1140,125 1180,135 1200,130 L1200,240 L0,240 Z"
                  fill="rgba(120, 202, 160, 0.03)"
                />
              </svg>
            </div>

            <div className="newsletter-inner-grid">
              <div className="newsletter-copy">
                <div className="newsletter-eyebrow-row">
                  <span className="newsletter-pine-icon" aria-hidden="true">🌲</span>
                  <span className="newsletter-script-note">Letters from the quiet valleys</span>
                </div>
                <h3 className="newsletter-title">Join The Pahadíly Dispatch</h3>
                <p className="newsletter-desc">
                  Every new moon, receive handpicked Himalayan homestays, seasonal trail advisories,
                  and stories of native mountain folk. No spam, only quiet wonder.
                </p>

                {/* Trust Badges */}
                <div className="newsletter-perks">
                  <div className="perk-tag">
                    <span className="perk-bullet">✓</span> Zero Single-Use Plastic
                  </div>
                  <div className="perk-tag">
                    <span className="perk-bullet">✓</span> 100% Local Guide Remuneration
                  </div>
                  <div className="perk-tag">
                    <span className="perk-bullet">✓</span> Offbeat Trails Only
                  </div>
                </div>
              </div>

              <div className="newsletter-form-box">
                {newsletterStatus.submitted ? (
                  <div className="newsletter-success-box">
                    <div className="success-icon-wrap">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#78caa0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="success-text">
                      <div className="success-title">Welcome to the tribe!</div>
                      <div className="success-detail">{newsletterStatus.message}</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="newsletter-form">
                    <div className="form-input-group">
                      <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
                      <div className="input-with-icon">
                        <svg className="mail-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <input
                          id="newsletter-email"
                          type="email"
                          placeholder="wanderer@quietvalleys.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="newsletter-input"
                        />
                      </div>
                      <button type="submit" className="newsletter-submit-btn">
                        <span>Subscribe</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    {newsletterStatus.message && (
                      <p className="newsletter-error-msg">{newsletterStatus.message}</p>
                    )}
                    <span className="newsletter-privacy-note">
                      🔒 We respect your peace. Unsubscribe anytime with a single click.
                    </span>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Directory */}
      <div className="footer-main-directory">
        <div className="section-container">
          <div className="footer-grid">
            {/* Column 1: Brand & Bio */}
            <div className="footer-col col-brand">
              <a href="/" className="footer-brand" aria-label="Pahadíly Home">
                <div className="footer-logo-card">
                  <img
                    src="/images/logo/pahadily-logo.png"
                    alt="Pahadíly — Rare Places. Real People. Lasting Stories."
                    className="footer-brand-logo"
                  />
                </div>
              </a>

              <p className="footer-mission-statement">
                Dedicated to the slow, reverent exploration of the Western & Eastern Himalayas.
                We connect conscious wanderers with indigenous mountain folk to celebrate heritage
                and protect fragile alpine ecosystems.
              </p>

              {/* Himalayan Stewardship Pill */}
              <div className="stewardship-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78caa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div className="stewardship-text">
                  <span>1% for Himalayan Conservation</span>
                  <small>Registered Sustainable Collective</small>
                </div>
              </div>

              {/* Social Channels */}
              <div className="footer-socials">
                <span className="socials-label">Follow the trails:</span>
                <div className="social-icons-row">
                  {/* Instagram */}
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  {/* YouTube */}
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  {/* X / Twitter */}
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X (Twitter)">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  {/* Spotify */}
                  <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Spotify Mountain Playlists">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zm4.586 14.424a.627.627 0 0 1-.86.208c-2.355-1.439-5.32-1.764-8.813-.966a.627.627 0 1 1-.28-1.223c3.824-.875 7.1-.506 9.745 1.12.296.182.39.57.208.861zm1.225-2.724a.784.784 0 0 1-1.08.258c-2.695-1.657-6.804-2.136-9.991-1.168a.784.784 0 0 1-.462-1.498c3.639-1.104 8.187-.573 11.275 1.328a.784.784 0 0 1 .258 1.08zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.94.94 0 1 1-.548-1.799c3.541-1.075 9.426-.87 13.14 1.336a.94.94 0 0 1-1.042 1.618z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Mountain Valleys */}
            <div className="footer-col">
              <h4 className="footer-col-title">
                <span className="col-title-accent"></span>
                Mountain Valleys
              </h4>
              <ul className="footer-nav-list">
                <li><a href="/explore" className="footer-link">Tirthan Valley River Stays</a></li>
                <li><a href="/explore" className="footer-link">Spiti High Altitude Villages</a></li>
                <li><a href="/explore" className="footer-link">Pangi Remote Hamlets</a></li>
                <li><a href="/explore" className="footer-link">Jibhi Pine Wood Cottages</a></li>
                <li><a href="/explore" className="footer-link">Parvati Valley Orchards</a></li>
                <li><a href="/explore" className="footer-link">Kasol & Chalal Trails</a></li>
              </ul>
            </div>

            {/* Column 3: Curated Journeys */}
            <div className="footer-col">
              <h4 className="footer-col-title">
                <span className="col-title-accent"></span>
                Experiences
              </h4>
              <ul className="footer-nav-list">
                <li><a href="/experiences" className="footer-link">Kath-Kuni Village Stays</a></li>
                <li><a href="/experiences" className="footer-link">Ancient Shepherd Trails</a></li>
                <li><a href="/experiences" className="footer-link">Dark Sky Stargazing</a></li>
                <li><a href="/experiences" className="footer-link">Pahadi Foraging & Wild Herbs</a></li>
                <li><a href="/experiences" className="footer-link">Folk Weaving & Craft</a></li>
                <li><a href="/experiences" className="footer-link">Solitude & Writing Retreats</a></li>
              </ul>
            </div>

            {/* Column 4: Community & Operations */}
            <div className="footer-col">
              <h4 className="footer-col-title">
                <span className="col-title-accent"></span>
                Community & Control
              </h4>
              <ul className="footer-nav-list">
                <li><a href="/locals" className="footer-link">Native Companions & Guides</a></li>
                <li><a href="/locals" className="footer-link">Artisans & Storytellers</a></li>
                <li><a href="/admin" className="footer-link">Operations Control</a></li>
                <li><a href="/explore" className="footer-link">Responsible Travel Code</a></li>
                <li><a href="/host" className="footer-link">Join as Village Host</a></li>
              </ul>
            </div>

            {/* Column 5: Assistance & Alpine Safety */}
            <div className="footer-col col-contact">
              <h4 className="footer-col-title">
                <span className="col-title-accent"></span>
                Alpine Safety & SOS
              </h4>
              <div className="safety-card">
                <div className="safety-row">
                  <div className="safety-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78caa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <span className="safety-label">24/7 High-Altitude Emergency</span>
                    <a href="tel:+919882254321" className="safety-value">+91 (0177) 289-PAHADI</a>
                  </div>
                </div>

                <div className="safety-row">
                  <div className="safety-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78caa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <span className="safety-label">Direct Curators Desk</span>
                    <a href="mailto:hello@pahadily.com" className="safety-value">hello@pahadily.com</a>
                  </div>
                </div>

                <div className="safety-row">
                  <div className="safety-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78caa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="safety-label">Base Field Stations</span>
                    <span className="safety-text">Old Manali (HP) &amp; Joshimath (UK)</span>
                  </div>
                </div>
              </div>

              <div className="safety-quick-links">
                <a href="#ams-guide" className="safety-sublink">
                  <span className="sublink-dot">●</span> High Altitude (AMS) Primer
                </a>
                <a href="#weather-bulletin" className="safety-sublink">
                  <span className="sublink-dot">●</span> Live Mountain Passes &amp; Weather
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mountain Motto / Divider Bar */}
      <div className="footer-motto-section">
        <div className="section-container">
          <div className="motto-content">
            <div className="prayer-flags-ribbon" aria-hidden="true">
              <span className="flag blue"></span>
              <span className="flag white"></span>
              <span className="flag red"></span>
              <span className="flag green"></span>
              <span className="flag yellow"></span>
            </div>
            <p className="motto-quote">
              &ldquo;Leave nothing but footprints, take nothing but stories, walk gently among the high peaks.&rdquo;
            </p>
            <div className="prayer-flags-ribbon" aria-hidden="true">
              <span className="flag yellow"></span>
              <span className="flag green"></span>
              <span className="flag red"></span>
              <span className="flag white"></span>
              <span className="flag blue"></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Legal, Live Status & Back-To-Top */}
      <div className="footer-bottom-bar">
        <div className="section-container">
          <div className="bottom-bar-flex">
            {/* Copyright & Entity */}
            <div className="bottom-copyright">
              <span>© {new Date().getFullYear()} Pahadíly Experiences Pvt. Ltd.</span>
              <span className="bullet-sep">•</span>
              <span className="legal-reg">Recognized under Himachal Eco-Development Charter</span>
            </div>

            {/* Legal Links */}
            <div className="bottom-legal-links">
              <a href="#privacy" className="legal-link">Privacy Policy</a>
              <a href="#terms" className="legal-link">Terms of Service</a>
              <a href="#sustainability" className="legal-link">Sustainability Charter</a>
              <a href="#cookies" className="legal-link">Cookie Preferences</a>
              <a href="#sitemap" className="legal-link">Sitemap</a>
            </div>

            {/* Live Indicator & Scroll To Top */}
            <div className="bottom-right-actions">
              <div className="mountain-pass-status" title="Real-time pass condition">
                <span className="status-pulse-dot" aria-hidden="true"></span>
                <span className="status-label">Kunzum &amp; Rohtang Status: Seasonal</span>
              </div>

              <button
                type="button"
                onClick={scrollToTop}
                className="back-to-top-btn"
                aria-label="Scroll back to top of the page"
              >
                <span>Ascend</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
