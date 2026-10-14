import { useState, useEffect } from "react";
import { getLocals } from "../../lib/api";
import { VERIFIED_LOCALS } from "../../data/localsData";

export const ALL_LOCALS = VERIFIED_LOCALS;

const CATEGORY_SECTIONS = [
  {
    id: "companions",
    label: "Local Companions",
    desc: "Friendly locals who show you hidden places, village life, and real Himalayan experiences.",
    color: "#8b34a3",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "trek-guides",
    label: "Trek Guides",
    desc: "Experienced local guides for safe treks, alpine hikes, and high altitude expeditions.",
    color: "#1a5c9f",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  {
    id: "food-hosts",
    label: "Food Hosts",
    desc: "Experience authentic Himachali meals, Siddu, and traditional Dham feasts with local families.",
    color: "#c07028",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
];

const BOTTOM_SECTIONS = [
  {
    id: "drivers",
    label: "Drivers & Transport",
    desc: "Reliable mountain drivers for airport pickup, sightseeing, and high passes.",
    color: "#2b5226",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 3v3h-7z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "storytellers",
    label: "Storytellers & Cultural Hosts",
    desc: "Learn about mountain mythology, heritage architecture, and folk music.",
    color: "#7c4a0a",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: "photographers",
    label: "Photographers & Filmmakers",
    desc: "Talented local photographers for your unforgettable Himalayan journey.",
    color: "#b03060",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
];

/* ──────────────────────────────────────────────────────────────────
   LOCAL CARD
────────────────────────────────────────────────────────────────── */
function LocalCard({ local, compact, onSelect }) {
  const [liked, setLiked] = useState(false);
  const initials = local.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <article
      className={"local-card" + (compact ? " local-card-compact" : "")}
      onClick={() => onSelect && onSelect(local)}
    >
      <div className="local-card-img-wrap">
        {local.image ? (
          <img src={local.image} alt={local.name} className="local-card-img" />
        ) : (
          <div
            className="local-card-avatar-fallback"
            style={{ background: local.gradient || "linear-gradient(135deg, #174231, #78caa0)" }}
          >
            <span className="local-avatar-initials">{initials}</span>
          </div>
        )}
        <div className="local-card-img-overlay" />

        {/* Verified badge */}
        {(local.verified || local.certified) && (
          <div className="local-verified-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {local.certified ? "Certified Guide" : "Verified Local"}
          </div>
        )}

        {/* Heart */}
        <button
          type="button"
          className={"local-card-heart" + (liked ? " liked" : "")}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          aria-label={liked ? "Remove from wishlist" : "Save"}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={liked ? "#e74c3c" : "none"}
            stroke={liked ? "#e74c3c" : "rgba(255,255,255,0.9)"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="local-card-body">
        <div className="local-card-name-row">
          <h3 className="local-card-name">{local.name}</h3>
          <div className="local-card-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="local-rating-num">{local.rating}</span>
            <span className="local-rating-count">({local.reviews})</span>
          </div>
        </div>

        <div className="local-card-location">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {local.location}
        </div>

        <div className="local-card-role-row">
          <span className="local-role-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {local.role}
          </span>
          <span className="local-lang-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {local.lang.split(",")[0]}
          </span>
        </div>

        <div className="local-card-tags">
          {local.tags.slice(0, compact ? 2 : 3).map((t) => (
            <span key={t} className="local-tag">
              {t}
            </span>
          ))}
        </div>

        <div className="local-card-footer">
          <span className="local-card-price">
            From <strong>{local.price}</strong>
            <span className="local-price-unit"> {local.unit}</span>
          </span>
          <button
            type="button"
            className="local-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(local);
            }}
          >
            {compact ? "Profile →" : "View Profile →"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SECTION BLOCK
────────────────────────────────────────────────────────────────── */
function LocalSection({ section, locals, compact, onSelect }) {
  const filtered = locals.filter((l) => l.category === section.id).slice(0, 4);
  if (filtered.length === 0) return null;

  return (
    <div className="local-section-block">
      <div className="local-section-header">
        <div className="local-section-title-group">
          <span className="local-section-icon" style={{ background: section.color + "18", color: section.color }}>
            {section.icon}
          </span>
          <div>
            <h2 className="local-section-title">{section.label}</h2>
            <p className="local-section-desc">{section.desc}</p>
          </div>
        </div>
      </div>
      <div className="local-cards-grid">
        {filtered.map((local) => (
          <LocalCard key={local.id} local={local} compact={compact} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   BOTTOM 3-COL SECTIONS
────────────────────────────────────────────────────────────────── */
function BottomSections({ locals, onSelect }) {
  return (
    <div className="local-bottom-sections">
      {BOTTOM_SECTIONS.map((sec) => {
        const items = locals.filter((l) => l.category === sec.id).slice(0, 2);
        if (items.length === 0) return null;
        return (
          <div key={sec.id} className="local-bottom-col">
            <div className="local-bottom-header">
              <span className="local-section-icon sm" style={{ background: sec.color + "18", color: sec.color }}>
                {sec.icon}
              </span>
              <div>
                <div className="local-bottom-title-row">
                  <span className="local-bottom-title">{sec.label}</span>
                </div>
                <p className="local-bottom-desc">{sec.desc}</p>
              </div>
            </div>
            <div className="local-bottom-grid">
              {items.map((local) => (
                <LocalCard key={local.id} local={local} compact onSelect={onSelect} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   MAIN EXPORT
────────────────────────────────────────────────────────────────── */
function LocalsGrid({
  activeFilter = "all",
  searchQuery = "",
  activeRegion = "all",
  onSelectLocal,
  onResetFilters,
}) {
  const [localsList, setLocalsList] = useState(ALL_LOCALS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDynamicLocals() {
      try {
        setLoading(true);
        const data = await getLocals({
          category: activeFilter === "all" ? undefined : activeFilter,
          region: activeRegion === "all" ? undefined : activeRegion,
          q: searchQuery || undefined,
        });
        if (data && data.length > 0) {
          setLocalsList(data);
        } else if (!searchQuery && activeFilter === "all" && activeRegion === "all") {
          setLocalsList(ALL_LOCALS);
        } else {
          setLocalsList([]);
        }
      } catch (err) {
        console.warn("Using fallback locals:", err);
        setLocalsList(ALL_LOCALS);
      } finally {
        setLoading(false);
      }
    }
    loadDynamicLocals();
  }, [activeFilter, activeRegion, searchQuery]);

  const filtered = localsList.filter((l) => {
    const matchCategory = activeFilter === "all" || l.category === activeFilter;
    const matchRegion = activeRegion === "all" || l.region === activeRegion;
    const query = searchQuery.trim().toLowerCase();
    const tagsArr = Array.isArray(l.tags) ? l.tags : [];
    const matchSearch =
      !query ||
      l.name.toLowerCase().includes(query) ||
      l.location.toLowerCase().includes(query) ||
      l.role.toLowerCase().includes(query) ||
      (l.bio && l.bio.toLowerCase().includes(query)) ||
      (l.lang && l.lang.toLowerCase().includes(query)) ||
      tagsArr.some((t) => t.toLowerCase().includes(query));
    return matchCategory && matchRegion && matchSearch;
  });

  const isFiltered = activeFilter !== "all" || activeRegion !== "all" || searchQuery.trim().length > 0;

  if (loading && localsList.length === 0) {
    return (
      <div className="locals-grid-wrapper">
        <div className="ep-loading-state">
          <span className="spinner-dot"></span>
          <span>Loading local mountain guides & hosts...</span>
        </div>
      </div>
    );
  }

  if (isFiltered) {
    return (
      <div className="locals-grid-wrapper">
        <div className="locals-filter-header">
          <span className="locals-filter-count">
            Found <strong>{filtered.length}</strong> local{filtered.length === 1 ? "" : "s"}
            {activeRegion !== "all" && ` in ${activeRegion.toUpperCase()}`}
            {activeFilter !== "all" && ` (${activeFilter})`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="locals-empty-state">
            <div className="empty-icon">🏔️</div>
            <h3>No locals found for this criteria</h3>
            <p>Try selecting &ldquo;All Regions&rdquo; or clearing your search keywords.</p>
            {onResetFilters && (
              <button
                type="button"
                className="hero-search-btn"
                style={{ marginTop: "1rem" }}
                onClick={onResetFilters}
              >
                Reset Search & Region
              </button>
            )}
          </div>
        ) : (
          <div className="local-cards-grid flat-grid">
            {filtered.map((local) => (
              <LocalCard key={local.id} local={local} onSelect={onSelectLocal} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="locals-grid-wrapper">
      {CATEGORY_SECTIONS.map((sec) => (
        <LocalSection key={sec.id} section={sec} locals={filtered} onSelect={onSelectLocal} />
      ))}
      <BottomSections locals={filtered} onSelect={onSelectLocal} />
    </div>
  );
}

export default LocalsGrid;
