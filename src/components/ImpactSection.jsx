
function ImpactSection() {
  return (
    <section className="impact-section" id="stories">
      <div className="section-container">
        {/* Main Impact Card Banner */}
        <div className="impact-card">
          {/* Left Column: Mission & CTA */}
          <div className="impact-left-content">
            <div className="impact-leaf-badge" aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
                {/* Main large leaf */}
                <path
                  d="M12 36 C12 21 22 10 38 7 C38 23 27 34 12 36 Z"
                  fill="#43865e"
                />
                <path
                  d="M12 36 C20 30 28 20 38 7"
                  stroke="#235438"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Small side leaf */}
                <path
                  d="M12 36 C8 28 11 20 18 16 C20 23 18 31 12 36 Z"
                  fill="#5da77a"
                  opacity="0.9"
                />
              </svg>
            </div>

            <div className="impact-text-content">
              <span className="impact-eyebrow">TRAVEL WITH PURPOSE</span>
              <h2 className="impact-heading">Real Travel. Real Impact.</h2>
              <p className="impact-description">
                Support local communities, preserve hidden places, and be a part of a kinder travel culture.
              </p>

              <a href="#learn-more" className="impact-btn">
                Learn More <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>

          {/* Right Column: Key Stats with Vertical Dividers */}
          <div className="impact-stats-row">
            {/* Stat 1: Travellers */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Happy Travellers</div>
            </div>

            <div className="stat-divider" aria-hidden="true"></div>

            {/* Stat 2: Hosts */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="stat-number">150+</div>
              <div className="stat-label">Local Hosts</div>
            </div>

            <div className="stat-divider" aria-hidden="true"></div>

            {/* Stat 3: Destinations */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <div className="stat-number">50+</div>
              <div className="stat-label">Hidden Destinations</div>
            </div>

            <div className="stat-divider" aria-hidden="true"></div>

            {/* Stat 4: Purpose */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22v-9" />
                  <path d="M12 13c0-4.5 4-8 9-8 0 5-3.5 9-8 9" />
                  <path d="M12 13c0-3.5-3-6-7-6 0 4 2.5 7 7 7" />
                </svg>
              </div>
              <div className="stat-number">1 Purpose</div>
              <div className="stat-label">Stronger Himalayas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Pine Forest & Misty Mountain Skyline at Bottom */}
      <div className="footer-forest-backdrop" aria-hidden="true">
        <img
          src="/images/hero/forest-footer-bg.jpg"
          alt=""
          className="forest-bg-img"
        />
        <div className="forest-bg-fade"></div>
      </div>
    </section>
  );
}

export default ImpactSection;
