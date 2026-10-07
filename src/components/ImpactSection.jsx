import React, { useState } from "react";

function ImpactSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="impact-section" id="early-access">
      <div className="section-container">
        {/* Main Impact Card Banner */}
        <div className="impact-card">
          {/* Left Column: Mission & Early Access Form */}
          <div className="impact-left-content">
            <div className="impact-leaf-badge" aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
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
                <path
                  d="M12 36 C8 28 11 20 18 16 C20 23 18 31 12 36 Z"
                  fill="#5da77a"
                  opacity="0.9"
                />
              </svg>
            </div>

            <div className="impact-text-content">
              <span className="impact-eyebrow">PIONEER TRAVELER PROGRAM</span>
              <h2 className="impact-heading">Join the Early Access Beta</h2>
              <p className="impact-description">
                Be among the first to experience our handpicked, off-the-grid mountain sanctuaries and slow itineraries across Himachal and Uttarakhand.
              </p>

              {subscribed ? (
                <div className="early-access-success">
                  <span>✨</span>
                  <strong>You're on the early access list! We'll invite you as soon as our next valley cohort opens.</strong>
                </div>
              ) : (
                <form className="early-access-form" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for early access..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="early-access-input"
                  />
                  <button type="submit" className="impact-btn">
                    Join Waitlist <span className="btn-arrow">→</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Startup Transparency Metrics */}
          <div className="impact-stats-row">
            {/* Stat 1: Valleys */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <div className="stat-number">8</div>
              <div className="stat-label">Himalayan Valleys</div>
            </div>

            <div className="stat-divider" aria-hidden="true"></div>

            {/* Stat 2: Revenue to Hosts */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Direct to Locals</div>
            </div>

            <div className="stat-divider" aria-hidden="true"></div>

            {/* Stat 3: Commercial Middlemen */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </div>
              <div className="stat-number">0%</div>
              <div className="stat-label">OTA Middlemen</div>
            </div>

            <div className="stat-divider" aria-hidden="true"></div>

            {/* Stat 4: Vision */}
            <div className="stat-col">
              <div className="stat-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#254a3a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22v-9" />
                  <path d="M12 13c0-4.5 4-8 9-8 0 5-3.5 9-8 9" />
                  <path d="M12 13c0-3.5-3-6-7-6 0 4 2.5 7 7 7" />
                </svg>
              </div>
              <div className="stat-number">2026</div>
              <div className="stat-label">Pioneer Cohort</div>
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
