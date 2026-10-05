function LocalsStatsBar() {
  const stats = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      value: "150+",
      label: "Verified Locals",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      ),
      value: "25+",
      label: "Destinations",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
        </svg>
      ),
      value: "6",
      label: "Types of Hosts",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      value: "4.8★",
      label: "Average Rating",
    },
  ];

  return (
    <div className="locals-stats-bar">
      <div className="section-container">
        <div className="locals-stats-inner">
          <div className="locals-stats-items">
            {stats.map((s, i) => (
              <div key={i} className="locals-stat-item">
                <span className="locals-stat-icon">{s.icon}</span>
                <div className="locals-stat-text">
                  <span className="locals-stat-value">{s.value}</span>
                  <span className="locals-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="locals-stat-cta">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"var(--color-forest-medium)", flexShrink:0}}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p className="locals-stat-cta-text">Support local communities<br />and travel more meaningfully.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalsStatsBar;
