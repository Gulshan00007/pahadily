import React from "react";

function StartupPillars() {
  const pillars = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      badge: "Zero Middlemen",
      title: "100% Direct-to-Native Model",
      desc: "Traditional OTAs take massive cuts from mountain hosts. On Pahadíly, revenue flows directly to local families, village collectives, and indigenous guides."
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22v-9" />
          <path d="M12 13c0-4.5 4-8 9-8 0 5-3.5 9-8 9" />
          <path d="M12 13c0-3.5-3-6-7-6 0 4 2.5 7 7 7" />
        </svg>
      ),
      badge: "Anti-Overtourism",
      title: "Capped Footprint & Slow Travel",
      desc: "We prioritize ecological sustainability. By strictly capping visitor volumes and championing remote, quiet hamlets, we prevent ecological degradation."
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      badge: "True Authenticity",
      title: "Verified Native Cultural Keepers",
      desc: "No commercial concrete resorts. Every sanctuary is a real Kath-Kuni wooden home, mud-brick Tibetan hearth, or high-altitude shepherd trail with living stories."
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      badge: "Community Owned",
      title: "Decentralized Mountain Registry",
      desc: "A cooperative network uniting hosts across Spiti, Kinnaur, Tirthan, Zanskar, and Chopta to share resources, weather safety, and eco-guidelines."
    }
  ];

  return (
    <section className="startup-pillars-section" id="how-it-works">
      <div className="section-container">
        <div className="pillars-header">
          <span className="section-eyebrow">THE REVOLUTION IN HIMALAYAN TRAVEL</span>
          <h2 className="section-title">Built Different. Rooted in the Soil.</h2>
          <p className="section-subtitle">
            We are replacing extractive tourism with a regenerative, community-first ecosystem.
          </p>
        </div>

        <div className="pillars-grid">
          {pillars.map((p, idx) => (
            <div key={idx} className="pillar-card">
              <div className="pillar-top-row">
                <div className="pillar-icon-box">{p.icon}</div>
                <span className="pillar-badge">{p.badge}</span>
              </div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table / Box */}
        <div className="startup-vs-box">
          <div className="vs-col vs-traditional">
            <h4>Traditional OTAs & Mass Travel</h4>
            <ul>
              <li>❌ 20–30% platform commissions taken from remote hosts</li>
              <li>❌ Overcrowded destinations and plastic waste crisis</li>
              <li>❌ Commercial concrete hotel chains posing as local</li>
              <li>❌ Zero cultural connection or regional storytelling</li>
            </ul>
          </div>

          <div className="vs-divider-pill">VS</div>

          <div className="vs-col vs-pahadily">
            <h4>The Pahadíly Network</h4>
            <ul>
              <li>✅ 100% direct host payouts with fair local compensation</li>
              <li>✅ Strictly capped footfalls & untouched valley stewardship</li>
              <li>✅ Handcrafted Kath-Kuni & mud-brick ancestral homes</li>
              <li>✅ Deep cultural immersion with native elders and guides</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StartupPillars;
