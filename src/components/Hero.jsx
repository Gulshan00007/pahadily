import { useState } from 'react';

function Hero() {
  const [selectedValley, setSelectedValley] = useState('all');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-media-wrapper">
        <img
          src="/images/hero/himachal-hero.jpg"
          alt="Breathtaking Himalayan mountain peaks and green valley"
          className="hero-backdrop-img"
        />
        <div className="hero-gradient-overlay"></div>
      </div>

      {/* Floating handwritten note on the right */}
      <div className="hero-script-note" aria-hidden="true">
        <span className="script-line-1">Raw</span>
        <span className="script-line-2">Mountains</span>
        <span className="script-line-3">Real Stories</span>
      </div>

      <div className="hero-container">
        <div className="hero-content-col">
          <div className="startup-badge">
            <span className="startup-badge-dot"></span>
            <span>EARLY ACCESS PLATFORM · HIMALAYAN NETWORK 2026</span>
          </div>

          <h1 className="hero-heading">
            Connecting Conscious Travelers With
            <span className="hero-heading-rare"> Untouched Valleys</span>
          </h1>

          <p className="hero-lead">
            We are building a community-owned mountain network across Himachal & Uttarakhand. Direct support for native families, slow travel, and zero corporate intermediaries.
          </p>

          {/* Startup Hero Actions */}
          <div className="hero-startup-actions">
            <button
              type="button"
              className="hero-primary-cta"
              onClick={() => scrollToSection('valleys')}
            >
              <span>Explore Mountain Valleys</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>

            <button
              type="button"
              className="hero-secondary-cta"
              onClick={() => scrollToSection('host-onboarding')}
            >
              <span>List Your Mountain Sanctuary</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          {/* Live Startup Metrics Bar */}
          <div className="hero-metrics-strip">
            <div className="metric-pill">
              <span className="metric-val">8</span>
              <span className="metric-txt">Pristine Valleys</span>
            </div>
            <div className="metric-pill-divider"></div>
            <div className="metric-pill">
              <span className="metric-val">100%</span>
              <span className="metric-txt">Native Led</span>
            </div>
            <div className="metric-pill-divider"></div>
            <div className="metric-pill">
              <span className="metric-val">0%</span>
              <span className="metric-txt">Middleman Fee</span>
            </div>
            <div className="metric-pill-divider"></div>
            <div className="metric-pill">
              <span className="metric-val">Phase 1</span>
              <span className="metric-txt">Early Launch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;