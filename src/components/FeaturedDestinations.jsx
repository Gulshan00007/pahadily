import { useState, useMemo } from "react";

const REAL_DESTINATIONS = [
  {
    id: "tirthan",
    region: "tirthan",
    category: "riverside",
    name: "Tirthan Valley & Gushaini",
    tagline: "Crystal glacial trout streams, towering cedar woods & UNESCO Great Himalayan National Park gateway.",
    image: "/images/destinations/tirthan-valley.jpg",
    elevation: "1,600m",
    vibe: "Glacial River & UNESCO",
    staysCount: 4,
    highlights: ["GHNP Trailhead", "Kath-Kuni Cabins", "Trout Angling", "Chhoie Waterfall"],
    bestSeason: "March – June, Sept – Nov",
  },
  {
    id: "jibhi",
    region: "jibhi",
    category: "ridges",
    name: "Jibhi & Shoja Pine Ridge",
    tagline: "Ancient Kath-Kuni timber chalets, pine canopy walks, Jalori Pass and sacred Serolsar Lake.",
    image: "/images/destinations/jibhi.jpg",
    elevation: "1,600m – 3,120m",
    vibe: "Cedar Chalets & High Pass",
    staysCount: 4,
    highlights: ["Jalori Pass 3,120m", "Serolsar Lake Hike", "Raghupur Fort", "Timber Architecture"],
    bestSeason: "All Year (Snow in Winter)",
  },
  {
    id: "shangarh",
    region: "shangarh",
    category: "meadows",
    name: "Sainj Valley & Shangarh Meadows",
    tagline: "Fairytale mythological alpine meadows, ancient Shangchul Mahadev temple and deodar silence.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    elevation: "2,100m",
    vibe: "Sub-Alpine Fairytale Meadow",
    staysCount: 4,
    highlights: ["Shangchul Temple", "Sprawling Green Glade", "Twin Cascades", "Zero City Noise"],
    bestSeason: "April – November",
  },
  {
    id: "kalga",
    region: "kalga",
    category: "hamlets",
    name: "Kalga & Pulga (Parvati Backcountry)",
    tagline: "Car-free apple orchard sanctuaries, mystic fairy forest moss trails & centuries-old wood houses.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    elevation: "2,280m",
    vibe: "Fairy Forest & Apple Orchards",
    staysCount: 4,
    highlights: ["Car-Free Villages", "Mystic Fairy Forest", "Old Wooden Balconies", "Glacier Panorama"],
    bestSeason: "May – November",
  },
  {
    id: "chalal",
    region: "chalal",
    category: "riverside",
    name: "Chalal & Katagla Riverside",
    tagline: "Quiet riverside pine woods across the suspension footbridge with peaceful glacial rock pools.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    elevation: "1,620m",
    vibe: "Riverside Cedar Sanctuary",
    staysCount: 4,
    highlights: ["Suspension Bridge", "Natural River Pools", "Pine Canopy Solitude", "Slow Cafe Culture"],
    bestSeason: "March – June, Sept – Dec",
  },
  {
    id: "naggar",
    region: "naggar",
    category: "heritage",
    name: "Naggar & Hallan Valley",
    tagline: "1460 AD royal timber castle, Roerich mountain art estate and unexplored Hallan apple hamlets.",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80",
    elevation: "1,850m",
    vibe: "Historic Timber Castle & Art",
    staysCount: 4,
    highlights: ["Naggar Castle (1460 AD)", "Nicholas Roerich Estate", "Hallan Hamlets", "Kath-Kuni Craft"],
    bestSeason: "All Year Round",
  },
  {
    id: "waichin",
    region: "waichin",
    category: "meadows",
    name: "Waichin Valley (Magic Valley)",
    tagline: "Secluded high-altitude amphitheater, zero network noise, crystal glacier faces & Bortle-2 night skies.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    elevation: "2,700m",
    vibe: "High Glacial Amphitheater",
    staysCount: 4,
    highlights: ["Zero Mobile Signal", "Bortle-2 Stargazing", "Close Glacier Peaks", "Pure Alpine Air"],
    bestSeason: "May – October",
  },
  {
    id: "lug-valley",
    region: "lug-valley",
    category: "heritage",
    name: "Lug Valley & Mathasaur",
    tagline: "Untouched secret valley with ancient deodar canopies, sacred Mathasaur alpine lake and shepherd paths.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    elevation: "2,200m",
    vibe: "Secret Valley & Shepherd Ridges",
    staysCount: 4,
    highlights: ["Virgin Cedar Forest", "Mathasaur Lake Hike", "Ancient Shrines", "Untouched By Crowds"],
    bestSeason: "April – November",
  },
];

const FILTER_TABS = [
  { id: "all", label: "All Sanctuaries (8)", icon: "🏔️" },
  { id: "riverside", label: "Riverside & Streams", icon: "🌊" },
  { id: "meadows", label: "Alpine Meadows & Glaciers", icon: "🌿" },
  { id: "ridges", label: "Pine Ridges & Passes", icon: "🌲" },
  { id: "hamlets", label: "Car-Free Hamlets", icon: "🏡" },
  { id: "heritage", label: "Heritage & Secret Valleys", icon: "🏰" },
];

function FeaturedDestinations() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return REAL_DESTINATIONS;
    return REAL_DESTINATIONS.filter((d) => d.category === activeTab);
  }, [activeTab]);

  return (
    <section className="featured-section" id="explore">
      <div className="section-container">
        {/* Editorial Section Header */}
        <div className="section-header-row">
          <div className="section-header-text">
            <span className="section-eyebrow">CURATED MOUNTAIN SANCTUARIES</span>
            <h2 className="section-title">Untouched Valleys & Hidden Hamlets</h2>
            <p className="featured-sub-desc">
              Discover secluded pine ridges, sacred high-altitude meadows, and centuries-old Kath-Kuni chalets preserved by local families.
            </p>
          </div>

          <div className="section-header-actions">
            <a href="/explore" className="view-all-btn">
              Explore All Sanctuaries <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="dest-filter-tabs-row" role="tablist" aria-label="Sanctuary categories">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`dest-filter-tab-pill${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="destination-cards-grid featured-editorial-grid">
          {filtered.map((dest) => (
            <article key={dest.id} className="editorial-dest-card">
              <a
                href={`/explore?valley=${dest.region}`}
                className="editorial-dest-img-link"
                aria-label={`Explore ${dest.name}`}
              >
                <div className="editorial-dest-img-wrap">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="editorial-dest-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
                    }}
                  />
                  <div className="editorial-dest-gradient" />
                  
                  {/* Floating Badges */}
                  <div className="editorial-dest-badges-top">
                    <span className="dest-elevation-pill">
                      📍 {dest.elevation}
                    </span>
                    <span className="dest-vibe-pill">
                      {dest.vibe}
                    </span>
                  </div>

                  {/* Stays Count Tag */}
                  <div className="editorial-dest-stays-count">
                    <span>🏡 {dest.staysCount} Stays</span>
                  </div>
                </div>
              </a>

              {/* Card Body */}
              <div className="editorial-dest-body">
                <div className="dest-meta-eyebrow">
                  <span>{dest.bestSeason}</span>
                </div>

                <a href={`/explore?valley=${dest.region}`} className="dest-title-link">
                  <h3 className="editorial-dest-name">{dest.name}</h3>
                </a>

                <p className="editorial-dest-tagline">{dest.tagline}</p>

                {/* Highlights tags */}
                <div className="editorial-dest-highlights">
                  {dest.highlights.slice(0, 3).map((hl, i) => (
                    <span key={i} className="dest-hl-chip">
                      • {hl}
                    </span>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="editorial-dest-footer">
                  <a
                    href={`/explore?valley=${dest.region}`}
                    className="editorial-explore-link"
                  >
                    <span>Explore Valley & Stays</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mountain Explorer Banner */}
        <div className="mountain-explorer-banner">
          <div className="banner-content">
            <span className="banner-eyebrow">🏔️ TOPOGRAPHIC OVERVIEW</span>
            <h3 className="banner-title">Prefer an Interactive Topographic View?</h3>
            <p className="banner-text">
              View all 8 sanctuaries on our detailed elevation map with trail markers, trout streams, and Kath-Kuni heritage clusters.
            </p>
          </div>
          <div className="banner-cta">
            <a href="/explore?view=map" className="banner-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>Open Topographic Map</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedDestinations;
