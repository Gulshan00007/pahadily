import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const HIMALAYAN_VALLEYS = [
  {
    id: "spiti",
    name: "Spiti Valley",
    state: "Himachal Pradesh",
    altitude: "3,800m",
    tagline: "Cold mountain desert, 1000-year-old Key Monastery, and Bortle-1 dark skies",
    image: "/images/destinations/spiti-valley.jpg",
    tags: ["High Altitude Desert", "Milky Way Sky", "Ancient Gompas", "Fossil Villages"],
    status: "Mapped & Curating Hosts",
    season: "May — Oct",
  },
  {
    id: "tirthan",
    name: "Tirthan Valley & GHNP",
    state: "Himachal Pradesh",
    altitude: "1,600m",
    tagline: "Gateway to Great Himalayan National Park, crystal trout rivers, and deodar woods",
    image: "/images/destinations/tirthan-valley.jpg",
    tags: ["UNESCO Park Trail", "River Trout", "Cedar Canopies", "Village Hamlets"],
    status: "Onboarding Local Hosts",
    season: "Year-round",
  },
  {
    id: "chopta",
    name: "Chopta & Tungnath",
    state: "Uttarakhand",
    altitude: "2,680m",
    tagline: "Alpine Bugyal meadows with 180° panoramic vistas of Nanda Devi & Trishul",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    tags: ["Alpine Bugyal", "Highest Shiva Temple", "Snow Peaks", "Bird Watching"],
    status: "Mapped & Exploring Routes",
    season: "Mar — Nov",
  },
  {
    id: "kinnaur",
    name: "Kinnaur & Sangla Valley",
    state: "Himachal Pradesh",
    altitude: "2,700m",
    tagline: "Borderland where Tibetan Buddhism meets Vedic culture beneath Kinner Kailash",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80",
    tags: ["Apple Orchards", "Kinner Kailash View", "Baspa River", "Wood Carvings"],
    status: "Onboarding Local Hosts",
    season: "Apr — Oct",
  },
  {
    id: "jibhi",
    name: "Jibhi & Banjar Valley",
    state: "Himachal Pradesh",
    altitude: "1,600m",
    tagline: "Pine-scented mountain haven leading to ancient Kath-Kuni towers and Serolsar Lake",
    image: "/images/destinations/jibhi.jpg",
    tags: ["Pine Forests", "Serolsar Lake", "Chehni Kothi", "Slow Living"],
    status: "Onboarding Local Hosts",
    season: "Year-round",
  },
  {
    id: "zanskar",
    name: "Zanskar Valley",
    state: "Ladakh",
    altitude: "3,500m",
    tagline: "Untamed high-altitude wonderland of towering canyons and cliff-hanging hermitages",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    tags: ["Cliff Monasteries", "Glacier Streams", "High Passes", "Raw Frontier"],
    status: "Route Mapping",
    season: "Jun — Sep",
  },
  {
    id: "pangi",
    name: "Pangi Valley & Sach Pass",
    state: "Himachal Pradesh",
    altitude: "2,800m",
    tagline: "Uncharted frontier valley shielded by the dramatic Sach Pass and Chenab gorge",
    image: "/images/destinations/pangi-valley.jpg",
    tags: ["Sach Pass", "Chenab Gorge", "Untouched Wilderness", "Tribal Lore"],
    status: "Pioneer Expeditions",
    season: "Jul — Oct",
  },
  {
    id: "dharamkot",
    name: "Dharamkot & Upper Kangra",
    state: "Himachal Pradesh",
    altitude: "2,100m",
    tagline: "Perched above the clouds overlooking the massive Dhauladhar mountain wall",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80",
    tags: ["Dhauladhar Ridge", "Triund Trail", "Conscious Community", "Cedar Woods"],
    status: "Onboarding Local Guides",
    season: "Year-round",
  }
];

function FeaturedDestinations() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { openAuthModal } = useAuth();

  const filteredValleys = HIMALAYAN_VALLEYS.filter((v) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "himachal") return v.state.includes("Himachal");
    if (activeFilter === "uttarakhand") return v.state.includes("Uttarakhand");
    if (activeFilter === "ladakh") return v.state.includes("Ladakh");
    return true;
  });

  const handleHostClick = () => {
    const el = document.getElementById("host-onboarding");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      openAuthModal("signup");
    }
  };

  return (
    <section className="featured-section" id="valleys">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div className="section-header-text">
            <span className="section-eyebrow">THE UNTOUCHED NETWORK</span>
            <h2 className="section-title">Explore Himalayan Valleys</h2>
            <p className="section-subtitle">
              Real mountain locations mapped for slow, conscious travel. We are onboarding native homestay families, organic apple orchards, and certified local guides.
            </p>
          </div>

          {/* Region Filters */}
          <div className="valley-filter-tabs">
            <button
              type="button"
              className={`valley-tab-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Valleys ({HIMALAYAN_VALLEYS.length})
            </button>
            <button
              type="button"
              className={`valley-tab-btn ${activeFilter === "himachal" ? "active" : ""}`}
              onClick={() => setActiveFilter("himachal")}
            >
              Himachal
            </button>
            <button
              type="button"
              className={`valley-tab-btn ${activeFilter === "uttarakhand" ? "active" : ""}`}
              onClick={() => setActiveFilter("uttarakhand")}
            >
              Uttarakhand
            </button>
            <button
              type="button"
              className={`valley-tab-btn ${activeFilter === "ladakh" ? "active" : ""}`}
              onClick={() => setActiveFilter("ladakh")}
            >
              Ladakh
            </button>
          </div>
        </div>

        {/* Real Mountain Valleys Grid */}
        <div className="destination-cards-grid">
          {filteredValleys.map((valley) => (
            <div key={valley.id} className="destination-card startup-valley-card">
              <div className="destination-img-wrap">
                <img
                  src={valley.image}
                  alt={`${valley.name}, ${valley.state}`}
                  className="destination-img"
                  loading="lazy"
                />
                <div className="destination-gradient-overlay"></div>
                
                {/* Elevation & State Badges */}
                <div className="valley-card-top-badges">
                  <span className="valley-altitude-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                    </svg>
                    {valley.altitude}
                  </span>
                  <span className="valley-state-badge">{valley.state}</span>
                </div>

                <div className="valley-status-pill">
                  <span className="pulse-dot"></span>
                  <span>{valley.status}</span>
                </div>
              </div>

              <div className="destination-card-content">
                <div className="destination-text">
                  <div className="valley-title-row">
                    <h3 className="destination-name">{valley.name}</h3>
                    <span className="valley-season-tag">🗓️ {valley.season}</span>
                  </div>
                  <p className="destination-desc">{valley.tagline}</p>
                </div>

                {/* Highlights tags */}
                <div className="valley-tags-list">
                  {valley.tags.map((tag, idx) => (
                    <span key={idx} className="valley-tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="valley-card-actions">
                  <a
                    href={`/explore?valley=${valley.id}`}
                    className="valley-explore-btn"
                  >
                    <span>Valley Guide</span>
                    <span className="btn-arrow">→</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleHostClick}
                    className="valley-host-link-btn"
                    title="Register your home or trail in this valley"
                  >
                    + Host Here
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDestinations;

