const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Discover",
    desc: "Find an experience you actually want.",
  },
  {
    number: "02",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Meet a Local",
    desc: "Connect with someone who knows the place.",
  },
  {
    number: "03",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
    title: "Experience",
    desc: "Explore, eat, walk and learn together.",
  },
  {
    number: "04",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Share the Story",
    desc: "Save your memories and inspire others.",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works-section section-container">
      <div className="how-it-works-inner">
        <div className="how-it-works-left">
          <h2 className="how-it-works-title">How Pahadily Experience Work</h2>
          <p className="how-it-works-subtitle">A simple way to travel more meaningfully</p>
        </div>

        <div className="how-it-works-steps">
          {STEPS.map((step, i) => (
            <div key={step.number} className="hiw-step">
              <span className="hiw-step-number">{step.number}</span>
              <div className="hiw-step-icon">{step.icon}</div>
              <div className="hiw-step-content">
                <span className="hiw-step-title">{step.title}</span>
                <span className="hiw-step-desc">{step.desc}</span>
              </div>
              {i < STEPS.length - 1 && <div className="hiw-step-divider" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
