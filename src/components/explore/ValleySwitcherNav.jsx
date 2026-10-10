import { useRef } from "react";

function ValleySwitcherNav({
  valleys = [],
  selectedValleyId,
  onSelectValley,
}) {
  const scrollRef = useRef(null);

  const isAll = selectedValleyId === "all";

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="valley-switcher-container" aria-label="Mountain Valleys Navigation">
      <div className="valley-switcher-inner">
        <div className="valley-switcher-header">
          <span className="switcher-eyebrow">🌲 SANCTUARY DIRECTORY</span>
          <h3 className="switcher-title">Select a Mountain Valley to Explore</h3>
        </div>

        <div className="valley-scroll-wrapper">
          <button
            type="button"
            className="valley-scroll-btn left"
            onClick={() => scroll("left")}
            aria-label="Scroll valleys left"
          >
            ‹
          </button>

          <div className="valley-chips-track" ref={scrollRef}>
            {/* "All Places" Master Chip */}
            <button
              type="button"
              className={`valley-chip-card all-chip${isAll ? " active" : ""}`}
              onClick={() => onSelectValley("all")}
            >
              <div className="chip-avatar-all">
                <span>🏔️</span>
              </div>
              <div className="chip-meta">
                <span className="chip-name">All Sanctuaries</span>
                <span className="chip-sub">8 Untouched Havens</span>
              </div>
              <span className="chip-badge-tag count">8 Places</span>
            </button>

            {/* Individual Valleys */}
            {valleys.map((v) => {
              const active = selectedValleyId?.toLowerCase() === v.id.toLowerCase();
              const thumb = v.images?.[0] || v.image || "/images/destinations/tirthan-valley.jpg";

              return (
                <button
                  key={v.id}
                  type="button"
                  className={`valley-chip-card${active ? " active" : ""}`}
                  onClick={() => onSelectValley(v.id)}
                  aria-pressed={active}
                >
                  <img
                    src={thumb}
                    alt={v.name}
                    className="chip-avatar-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
                    }}
                  />
                  <div className="chip-meta">
                    <span className="chip-name">{v.name}</span>
                    <span className="chip-sub">{v.elevation || "Alpine"} • {v.badge || "Sanctuary"}</span>
                  </div>
                  {v.badge && (
                    <span className="chip-badge-tag">
                      {v.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="valley-scroll-btn right"
            onClick={() => scroll("right")}
            aria-label="Scroll valleys right"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default ValleySwitcherNav;
