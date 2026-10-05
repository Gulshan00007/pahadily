const EXP_FILTERS = [
  { id: "all", label: "All", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/></svg>" },
  { id: "nature", label: "Nature", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M12 22V12m0 0C12 6 6 4 3 8c3 0 6 1 9 4zm0 0c0-6 6-8 9-4-3 0-6 1-9 4\"/></svg>" },
  { id: "culture", label: "Culture", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4\"/></svg>" },
  { id: "food", label: "Food", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"/><path d=\"M7 2v20\"/><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7\"/></svg>" },
  { id: "adventure", label: "Adventure", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><polygon points=\"3 17 9 11 13 15 21 7\"/><polyline points=\"14 7 21 7 21 14\"/></svg>" },
  { id: "local-life", label: "Local Life", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>" },
  { id: "photography", label: "Photography", icon: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/></svg>" },
];

function ExperiencesHero({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }) {
  return (
    <div className="exp-hero">
      <div className="exp-hero-bg" style={{ backgroundImage: "url('/images/experiences/hero-bg.jpg')" }}>
        <div className="exp-hero-overlay" />
      </div>
      <div className="exp-hero-content section-container">
        <nav className="explore-breadcrumb" aria-label="Breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span className="breadcrumb-sep">&#8250;</span>
          <span className="breadcrumb-current">Experiences</span>
        </nav>
        <span className="exp-hero-eyebrow">EXPERIENCES</span>
        <h1 className="exp-hero-title">
          Experience<br />
          <span className="exp-hero-title-accent">Himachal Differently</span>
        </h1>
        <p className="exp-hero-subtitle">
          Go beyond sightseeing. Eat with locals, walk through villages,<br />
          discover hidden trails and experience the Himalayas through<br />
          people who live here.
        </p>
        <div className="exp-search-wrap">
          <form
            className="explore-search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.querySelector(".featured-exp-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="explore-search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a7060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search experiences, locations, guides or activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search experiences"
            />
            {searchQuery && (
              <button
                type="button"
                className="explore-search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button type="submit" className="explore-search-btn">Search</button>
          </form>
        </div>

        <div className="explore-filter-tabs" role="tablist">
          {EXP_FILTERS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeFilter === tab.id}
              className={"explore-filter-tab" + (activeFilter === tab.id ? " active" : "")}
              onClick={() => setActiveFilter(tab.id)}
            >
              <span className="filter-tab-icon" dangerouslySetInnerHTML={{ __html: tab.icon }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExperiencesHero;