const FILTER_TABS = [
  { id: "all", label: "All Valleys & Stays", icon: "🏔️" },
  { id: "spiti", label: "Spiti Cold Desert", icon: "❄️" },
  { id: "tirthan", label: "Tirthan & GHNP", icon: "🌊" },
  { id: "chopta", label: "Chopta Meadows", icon: "🌿" },
  { id: "kinnaur", label: "Kinnaur & Sangla", icon: "🍎" },
  { id: "jibhi", label: "Jibhi & Banjar", icon: "🌲" },
  { id: "parvati", label: "Parvati Hamlets", icon: "🍃" },
  { id: "zanskar", label: "Zanskar Frontier", icon: "🏔️" },
  { id: "pangi", label: "Pangi & Sach Pass", icon: "⛰️" },
  { id: "homestay", label: "Heritage Homestays", icon: "🏡" },
  { id: "campsite", label: "Campsites & Glamping", icon: "⛺" },
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
          <span className="breadcrumb-current">Explore Valleys & Stays</span>
        </nav>

        {/* Heading */}
        <h1 className="explore-hero-title">Rare Mountain Valleys & Sanctuaries</h1>
        <p className="explore-hero-subtitle">
          Handcrafted Kath-Kuni chalets, high-altitude desert homestays, and riverside camps across the Himalayas.
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
