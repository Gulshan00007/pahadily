const FILTER_TABS = [
  { id: "all", label: "All Stays & Camps", icon: "🏔️" },
  { id: "homestay", label: "Heritage Homestays", icon: "🏡" },
  { id: "campsite", label: "Campsites & Glamping", icon: "⛺" },
  { id: "tirthan", label: "Tirthan Valley", icon: "🌊" },
  { id: "jibhi", label: "Jibhi Pine Woods", icon: "🌲" },
  { id: "spiti", label: "Spiti High Pass", icon: "❄️" },
  { id: "kasol", label: "Kasol & Chalal", icon: "🍃" },
  { id: "pangi", label: "Pangi Remote", icon: "⛰️" },
];

function ExploreHero({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }) {
  return (
    <div className="explore-hero">
      <div
        className="explore-hero-bg"
        style={{ backgroundImage: "url('/images/destinations/spiti-valley.jpg')" }}
      >
        <div className="explore-hero-overlay" />
      </div>

      <div className="explore-hero-content section-container">
        {/* Breadcrumb */}
        <nav className="explore-breadcrumb" aria-label="Breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span className="breadcrumb-sep">&#8250;</span>
          <span className="breadcrumb-current">Explore Mountain Stays</span>
        </nav>

        {/* Heading */}
        <h1 className="explore-hero-title">Mountain Stays & Sanctuaries</h1>
        <p className="explore-hero-subtitle">
          Handcrafted wooden chalets, remote valley homestays, and slow retreats across Himachal Pradesh.
        </p>

        {/* Search Bar */}
        <div className="explore-search-wrap">
          <form
            className="explore-search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.querySelector(".explore-content-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="explore-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a4536" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search by valley, homestay name, altitude, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search mountain stays"
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
            <button type="submit" className="explore-search-btn" aria-label="Search">
              Search Stays
            </button>
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="explore-filter-tabs" role="tablist" aria-label="Filter by region">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeFilter === tab.id}
              className={"explore-filter-tab" + (activeFilter === tab.id ? " active" : "")}
              onClick={() => setActiveFilter(tab.id)}
            >
              <span className="filter-tab-emoji">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExploreHero;
