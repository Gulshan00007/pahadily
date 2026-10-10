const FILTER_TABS = [
  { id: "all", label: "All Travel Locations", icon: "🏔️" },
  { id: "tirthan", label: "Tirthan Valley", icon: "🌊" },
  { id: "jibhi", label: "Jibhi Pine Woods", icon: "🌲" },
  { id: "spiti", label: "Spiti Cold Desert", icon: "❄️" },
  { id: "parvati", label: "Parvati Valley", icon: "🍃" },
  { id: "kasol", label: "Kasol & Chalal", icon: "🏕️" },
  { id: "pangi", label: "Pangi & Sach Pass", icon: "⛰️" },
  { id: "kinnaur", label: "Kinnaur & Sangla", icon: "🍎" },
  { id: "chopta", label: "Chopta Meadows", icon: "🌿" },
];

const SEARCH_SUGGESTIONS = [
  "Riverside Glacial",
  "Kath-Kuni Village",
  "High Altitude Desert",
  "Apple Orchards",
  "Sach Pass Wilderness",
  "UNESCO GHNP",
];

function ExploreHero({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }) {
  return (
    <div className="explore-hero">
      <div
        className="explore-hero-bg"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85')",
        }}
      >
        <div className="explore-hero-overlay" />
      </div>

      <div className="explore-hero-content section-container">
        {/* Breadcrumb */}
        <nav className="explore-breadcrumb" aria-label="Breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span className="breadcrumb-sep">&#8250;</span>
          <span className="breadcrumb-current">Explore Travel Locations</span>
        </nav>

        {/* Heading */}
        <h1 className="explore-hero-title">Rare Himalayan Travel Locations</h1>
        <p className="explore-hero-subtitle">
          Explore untouched mountain valleys and destinations across Himachal Pradesh. Select any travel location to view its authentic homestays, guided trails, and local hosts below.
        </p>

        {/* Search Bar */}
        <div className="explore-search-wrap">
          <form
            className="explore-search-bar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.querySelector(".explore-content-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="explore-search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a4536" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search travel locations by valley, landscape, altitude, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search travel locations"
            />
            {searchQuery && (
              <button
                type="button"
                className="explore-search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
            <button type="submit" className="explore-search-btn" aria-label="Submit search">
              Search Locations
            </button>
          </form>

          {/* Quick Search Suggestions */}
          <div className="explore-search-suggestions" aria-label="Popular search topics">
            <span className="explore-suggestions-label">Explore by landscape:</span>
            {SEARCH_SUGGESTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`explore-suggestion-chip${searchQuery.toLowerCase() === tag.toLowerCase() ? " active" : ""}`}
                onClick={() => {
                  setSearchQuery(tag);
                  const el = document.querySelector(".explore-content-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="explore-filter-tabs" role="tablist" aria-label="Filter by travel location">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeFilter === tab.id}
              className={"explore-filter-tab" + (activeFilter === tab.id ? " active" : "")}
              onClick={() => setActiveFilter(tab.id)}
            >
              <span className="filter-tab-emoji" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExploreHero;
