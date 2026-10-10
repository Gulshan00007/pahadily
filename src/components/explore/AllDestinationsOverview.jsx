import { useState } from "react";
import ExploreInteractiveMap from "./ExploreInteractiveMap";

function AllDestinationsOverview({
  destinations = [],
  onSelectValley,
  onBookFlagshipStay,
  onOpenMap,
  searchQuery = "",
}) {
  const [filterValley, setFilterValley] = useState("all");
  const [viewMode, setViewMode] = useState("split"); // "split" | "grid" | "map"
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  const valleyClusters = [
    { id: "all", label: "All Sanctuaries (8)" },
    { id: "tirthan-banjar", label: "Tirthan & Banjar" },
    { id: "sainj", label: "Sainj & Shangarh" },
    { id: "parvati", label: "Parvati Backcountry" },
    { id: "naggar", label: "Naggar & Hallan" },
    { id: "lug-valley", label: "Lug Valley" },
  ];

  const filteredDestinations = destinations.filter((d) => {
    if (filterValley !== "all") {
      if (filterValley === "tirthan-banjar" && !["tirthan", "jibhi"].includes(d.id)) return false;
      if (filterValley === "sainj" && d.id !== "shangarh") return false;
      if (filterValley === "parvati" && !["kalga", "chalal", "waichin"].includes(d.id)) return false;
      if (filterValley === "naggar" && d.id !== "naggar") return false;
      if (filterValley === "lug-valley" && d.id !== "lug-valley") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchLoc = (d.location || "").toLowerCase().includes(q);
      const matchDesc = (d.description || "").toLowerCase().includes(q);
      const matchStays = d.stays?.some((s) => s.name.toLowerCase().includes(q));
      return matchName || matchLoc || matchDesc || matchStays;
    }
    return true;
  });

  const handleSelectPin = (destId) => {
    setSelectedPinId(destId);
    if (destId) {
      const cardEl = document.getElementById(`dest-card-${destId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <section className="all-destinations-section" aria-label="Mountain Valleys & Sanctuaries Catalog">
      {/* Top Banner Strip */}
      <div className="all-dest-header-strip">
        <div className="all-dest-header-left">
          <div className="all-dest-badge-glow">
            <span className="dot-pulse" />
            <span>8 Curated Hidden Sanctuaries • Verified Homestays</span>
          </div>
          <h2 className="all-dest-main-title">
            Untouched Valleys &amp; Mountain Hamlets
          </h2>
          <p className="all-dest-sub-title">
            From the crystal trout pools of Tirthan to the mythic sacred meadows of Shangarh and secluded Parvati backcountry hamlets. Explore real-time spatial topography across Himachal Pradesh with verified Kath-Kuni wooden stays.
          </p>
        </div>

        <div className="all-dest-header-right">
          {/* View Mode Switcher Pills */}
          <div className="dest-view-mode-selector" role="group" aria-label="Catalog View Mode">
            <button
              type="button"
              className={`dest-view-btn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => {
                setViewMode("split");
                setIsMapExpanded(true);
              }}
              title="Split View: Topographic Map & Sanctuaries Directory"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="8" height="18" rx="2" />
                <rect x="13" y="3" width="8" height="18" rx="2" />
              </svg>
              <span>Map &amp; Cards</span>
            </button>
            <button
              type="button"
              className={`dest-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Cards Grid View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Grid Only</span>
            </button>
            <button
              type="button"
              className={`dest-view-btn ${viewMode === "map" ? "active" : ""}`}
              onClick={() => {
                setViewMode("map");
                setIsMapExpanded(true);
              }}
              title="Interactive Topographic Map Fullscreen Mode"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>Map Explorer</span>
            </button>
          </div>

          <button
            type="button"
            className="all-dest-map-trigger-btn"
            onClick={onOpenMap}
            title="Open topographic interactive map modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>Full Modal</span>
          </button>
        </div>
      </div>

      {/* Valley Cluster Filter Chips Bar */}
      <div className="all-dest-filter-bar">
        <div className="filter-chips-wrap">
          <span className="filter-label">Filter Valleys:</span>
          <div className="filter-chips-list">
            {valleyClusters.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                className={`filter-chip-btn ${filterValley === cluster.id ? " active" : ""}`}
                onClick={() => {
                  setFilterValley(cluster.id);
                  setSelectedPinId(null);
                }}
              >
                {cluster.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-stats-wrap">
          <span className="dest-count-tag">
            Showing <strong>{filteredDestinations.length}</strong> of {destinations.length} Sanctuaries
          </span>

          {viewMode !== "grid" && (
            <button
              type="button"
              className="toggle-map-collapse-btn"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              title={isMapExpanded ? "Hide Map Section" : "Show Map Section"}
            >
              <span>{isMapExpanded ? "▲ Hide Map" : "▼ Show Map"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Map Component Integrated on the Explore Page */}
      {viewMode !== "grid" && isMapExpanded && (
        <div className="explore-embedded-map-container" aria-label="Interactive Topographic Map of Filtered Destinations">
          <div className="embedded-map-context-banner">
            <div className="context-banner-info">
              <span className="context-banner-icon">🗺️</span>
              <span className="context-banner-text">
                Spatial overview displaying <strong>{filteredDestinations.length} destinations</strong> filtered by {filterValley === "all" ? "all regions" : valleyClusters.find((c) => c.id === filterValley)?.label || filterValley}
                {searchQuery ? ` matching "${searchQuery}"` : ""}. Click any marker to view altitude, stays, and trails.
              </span>
            </div>
            {filterValley !== "all" && (
              <button
                type="button"
                className="reset-map-filter-btn"
                onClick={() => {
                  setFilterValley("all");
                  setSelectedPinId(null);
                }}
              >
                Reset to All 8
              </button>
            )}
          </div>

          <ExploreInteractiveMap
            destinations={filteredDestinations}
            allDestinationsCount={destinations.length}
            activeValleyId={filterValley}
            onSelectValley={onSelectValley}
            onBookFlagshipStay={onBookFlagshipStay}
            selectedLocationId={selectedPinId}
            onSelectLocationId={handleSelectPin}
            hoveredPlaceId={hoveredPlaceId}
            onHoverPlace={setHoveredPlaceId}
            isSplitView={viewMode === "split"}
          />
        </div>
      )}

      {/* Grid of All Destinations (Hidden when viewMode is "map") */}
      {viewMode !== "map" && (
        <div className="all-dest-grid">
          {filteredDestinations.map((dest) => {
            const flagshipStay = dest.stays?.[0];
            const staysCount = dest.stays?.length || 0;
            const attractionsCount = dest.nearbyAttractions?.length || 0;
            const coverImg = dest.images?.[0] || dest.image || "/images/destinations/tirthan-valley.jpg";
            const isHighlighted = selectedPinId === dest.id || hoveredPlaceId === dest.id;

            // Calculate lowest price
            const prices = (dest.stays || []).map((s) => s.priceNum || 2000);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 1800;

            return (
              <article
                key={dest.id}
                id={`dest-card-${dest.id}`}
                className={`all-dest-card ${isHighlighted ? "is-map-active-card" : ""}`}
                tabIndex={0}
                onMouseEnter={() => setHoveredPlaceId(dest.id)}
                onMouseLeave={() => setHoveredPlaceId(null)}
              >
                {/* Card Image Banner with Stable 16:10 Aspect Ratio */}
                <div className="all-dest-card-media">
                  <img
                    src={coverImg}
                    alt={dest.name}
                    className="all-dest-card-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
                    }}
                  />
                  <div className="all-dest-media-gradient" />

                  {/* Top Badges */}
                  <span className="all-dest-badge-tag">
                    {dest.badge || "Mountain Sanctuary"}
                  </span>

                  <span className="all-dest-elev-pill">
                    <span className="elev-icon">⛰️</span>
                    <span>{dest.elevation}</span>
                  </span>

                  {/* Bottom Media Badges */}
                  <span className="all-dest-subvalley-tag">
                    {dest.subValley || "Kullu District"}
                  </span>

                  <div className="all-dest-price-overlay">
                    <span className="price-lead">From</span>
                    <span className="price-num">₹{minPrice.toLocaleString("en-IN")}</span>
                    <span className="price-per">/ night</span>
                  </div>
                </div>

                {/* Card Body with Balanced Spacing & Hierarchy */}
                <div className="all-dest-card-body">
                  {/* Location Eyebrow */}
                  <div className="all-dest-location-row">
                    <svg className="location-pin-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="location-name">{dest.location}</span>
                  </div>

                  {/* Destination Title */}
                  <h3 className="all-dest-card-title">{dest.name}</h3>

                  {/* Evocative Description with Stable Vertical Height */}
                  <p className="all-dest-card-desc" title={dest.description}>
                    {dest.description}
                  </p>

                  {/* Curated Meta Strip */}
                  <div className="all-dest-meta-strip">
                    <div className="meta-item">
                      <span className="meta-icon">🗓️</span>
                      <div className="meta-text-wrap">
                        <span className="meta-label">Best Season</span>
                        <span className="meta-val">{dest.bestTime}</span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🏡</span>
                      <div className="meta-text-wrap">
                        <span className="meta-label">Curated Stays</span>
                        <span className="meta-val">{staysCount} Mountain Stays</span>
                      </div>
                    </div>
                    <div className="meta-item meta-item-wide">
                      <span className="meta-icon">🌲</span>
                      <div className="meta-text-wrap">
                        <span className="meta-label">Highlights</span>
                        <span className="meta-val">{dest.idealFor || `${attractionsCount} Scenic Trails & Hamlets`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Curated Stays Preview */}
                  <div className="all-dest-stays-preview">
                    <div className="preview-label-row">
                      <span className="preview-label">Curated Homestays &amp; Chalets</span>
                      <span className="preview-count">{staysCount} Available</span>
                    </div>
                    <div className="preview-stays-row">
                      {dest.stays?.slice(0, 2).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          className="preview-stay-chip"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBookFlagshipStay) onBookFlagshipStay(st, dest);
                          }}
                          title={`Quick View & Book ${st.name}`}
                        >
                          <span className="chip-stay-icon">🪵</span>
                          <span className="chip-name">{st.name}</span>
                          <span className="chip-sep">•</span>
                          <span className="chip-price">{st.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="all-dest-card-actions">
                    <button
                      type="button"
                      className="all-dest-btn-explore"
                      onClick={() => onSelectValley(dest.id)}
                    >
                      <span>Explore Valley</span>
                      <span className="btn-spots-badge">({attractionsCount} spots)</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>

                    {flagshipStay && (
                      <button
                        type="button"
                        className="all-dest-btn-book"
                        onClick={() => {
                          if (onBookFlagshipStay) onBookFlagshipStay(flagshipStay, dest);
                        }}
                        title="Preview stay photos &amp; instant booking form"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Book Stays</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AllDestinationsOverview;
