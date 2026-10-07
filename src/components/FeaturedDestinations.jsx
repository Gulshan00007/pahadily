import { useState } from "react";

const REAL_DESTINATIONS = [
  {
    id: "spiti",
    region: "spiti",
    name: "Spiti Valley Cold Desert",
    tagline: "1,000-year-old Key Monastery, mud-brick hamlets & Bortle-1 Milky Way skies",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    badge: "3,800m Altitude",
  },
  {
    id: "tirthan",
    region: "tirthan",
    name: "Tirthan Valley & GHNP",
    tagline: "Crystal glacial rivers, cedar woods & UNESCO Great Himalayan National Park",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    badge: "1,600m Altitude",
  },
  {
    id: "chopta",
    region: "chopta",
    name: "Chopta & Tungnath Meadows",
    tagline: "Velvet alpine Bugyals with 180° panoramic vistas of Nanda Devi & Trishul",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    badge: "2,680m Altitude",
  },
  {
    id: "kinnaur",
    region: "kinnaur",
    name: "Kinnaur & Sangla Valley",
    tagline: "Apple orchard valleys where Tibetan Buddhism meets Vedic culture",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80",
    badge: "2,700m Altitude",
  },
  {
    id: "jibhi",
    region: "jibhi",
    name: "Jibhi & Banjar Valley",
    tagline: "Kath-Kuni wooden architecture, pine canopy paths and Serolsar Lake",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    badge: "1,600m Altitude",
  },
  {
    id: "parvati",
    region: "parvati",
    name: "Parvati Valley Hamlets",
    tagline: "Quiet alpine hamlets, deodar woods and pristine mountain streams",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    badge: "2,200m Altitude",
  },
  {
    id: "zanskar",
    region: "zanskar",
    name: "Zanskar Valley Frontier",
    tagline: "Dramatic high-altitude gorges, ancient Gompas and raw wilderness",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80",
    badge: "3,500m Altitude",
  },
  {
    id: "pangi",
    region: "pangi",
    name: "Pangi Valley & Sach Pass",
    tagline: "Raw frontier valley shielded by the towering cliffs of Sach Pass",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    badge: "2,800m Altitude",
  },
];

function FeaturedDestinations() {
  const [destinations] = useState(REAL_DESTINATIONS);

  return (
    <section className="featured-section" id="explore">

      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div className="section-header-text">
            <span className="section-eyebrow">FEATURED VALLEYS</span>
            <h2 className="section-title">Handpicked for a Deeper Journey</h2>
          </div>

          <a href="/explore" className="view-all-btn">
            Explore All Valleys <span className="btn-arrow">→</span>
          </a>
        </div>

        {/* Destination Cards Grid */}
        <div className="destination-cards-grid">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <a
                href={dest.region ? `/explore?valley=${dest.region}` : "/explore"}
                className="destination-img-wrap"
                style={{ display: "block", textDecoration: "none" }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="destination-img"
                  loading="lazy"
                />
                <div className="destination-gradient-overlay"></div>
                {dest.badge && (
                  <span className="home-dest-price-pill">
                    🏔️ {dest.badge}
                  </span>
                )}
              </a>

              <div className="destination-card-content">
                <a
                  href={dest.region ? `/explore?valley=${dest.region}` : "/explore"}
                  className="destination-text"
                >
                  <h3 className="destination-name">{dest.name}</h3>
                  <p className="destination-desc">{dest.tagline}</p>
                </a>

                <a
                  href={dest.region ? `/explore?valley=${dest.region}` : "/explore"}
                  className="home-book-stay-btn"
                  aria-label={`Explore ${dest.name}`}
                  title={`View details and trails in ${dest.name}`}
                >
                  <span>Explore Valley</span>
                  <svg
                    width="14"
                    height="14"
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
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDestinations;

