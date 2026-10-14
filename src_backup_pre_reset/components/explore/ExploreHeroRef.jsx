import { useState } from "react";

const CATEGORY_PILLS = [
  { id: "all", label: "All Sanctuaries", icon: "🏔️" },
  { id: "destinations", label: "Valleys & Hamlets", icon: "🌲" },
  { id: "stays", label: "Wood Chalets & Stays", icon: "🏡" },
  { id: "experiences", label: "Local Trails & Experiences", icon: "🧭" },
  { id: "guides", label: "Mountain Guides", icon: "👤" },
];

function ExploreHeroRef({
  searchQuery,
  setSearchQuery,
  selectedValley,
  onSelectValley,
  valleysList = [],
  activeCategory,
  onSelectCategory,
  onPerformSearch,
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    if (onPerformSearch) onPerformSearch(localQuery);
    const showcaseEl = document.querySelector(".dest-showcase-section, .all-destinations-section");
    if (showcaseEl) showcaseEl.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="explore-ref-hero">
      <div className="explore-ref-hero-bg">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
          alt="Himalayan Mountain Sanctuary"
          className="explore-ref-hero-img"
        />
        <div className="explore-ref-hero-overlay" />
      </div>

      <div className="explore-ref-hero-content">
        <div className="explore-hero-eyebrow-pill">
          <span>🌲 AUTHENTIC MOUNTAIN SANCTUARIES</span>
        </div>

        <h1 className="explore-ref-hero-title">Where Silence Meets the Cedar Ridges</h1>
        <p className="explore-ref-hero-subtitle">
          Discover tucked-away riverside hamlets, Kath-Kuni wooden cottages, and community-rooted stays far from crowded tourist trails.
        </p>

        {/* Search Bar Container */}
        <form className="explore-ref-search-bar" onSubmit={handleSubmit} role="search">
          <div className="search-input-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search hamlets, wood chalets, trout streams, meadows..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              aria-label="Search destinations and stays"
            />
            {localQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setLocalQuery("");
                  setSearchQuery("");
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Valley Selector Dropdown */}
          <div className="search-region-dropdown-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <select
              value={selectedValley}
              onChange={(e) => onSelectValley(e.target.value)}
              aria-label="Select mountain sanctuary"
            >
              <option value="all">Explore All Sanctuaries ({valleysList.length || 8})</option>
              {valleysList.map((val) => (
                <option key={val.id} value={val.id}>
                  {val.name} ({val.elevation || "Alpine"})
                </option>
              ))}
            </select>
            <span className="dropdown-caret">▾</span>
          </div>

          {/* Submit Search Button */}
          <button type="submit" className="search-submit-btn">
            Explore
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="explore-ref-cat-pills" role="tablist" aria-label="Explore categories">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === pill.id}
              className={`ref-cat-pill${activeCategory === pill.id ? " active" : ""}`}
              onClick={() => onSelectCategory(pill.id)}
            >
              {pill.icon && <span className="cat-icon">{pill.icon}</span>}
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExploreHeroRef;
