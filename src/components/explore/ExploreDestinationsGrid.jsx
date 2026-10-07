import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPlaces } from "../../lib/api";

const FALLBACK_DESTINATIONS = [
  {
    id: "spiti-monastery",
    name: "Spiti High Altitude Mud-Brick Monastery Homestay",
    tagline: "1,000-year-old Key Monastery views, solar-heated rooms & Bortle-1 Milky Way skies",
    region: "spiti",
    category: "homestay",
    price: "₹2,600",
    unit: "/night",
    altitude: "3,800m",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Monastery View", "Solar Heated", "Traditional Hearth", "Bortle-1 Dark Sky"],
    rating: 4.95,
    reviews: 184,
  },
  {
    id: "tirthan-riverside",
    name: "Tirthan Riverside Cedar Cabin & Trout Glamping",
    tagline: "Crystal glacial rivers, pine woods & private access to UNESCO Great Himalayan National Park",
    region: "tirthan",
    category: "campsite",
    price: "₹1,950",
    unit: "/night",
    altitude: "1,600m",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    tags: ["Riverside Cabins", "Trout Stream", "GHNP Trails", "Bonfire Nights"],
    rating: 4.92,
    reviews: 248,
  },
  {
    id: "chopta-meadows",
    name: "Chopta Alpine Bugyal Swiss Camp & Tungnath Trail",
    tagline: "Velvet alpine Bugyals with 180° panoramic vistas of Nanda Devi, Trishul & Chandrashila",
    region: "chopta",
    category: "campsite",
    price: "₹2,100",
    unit: "/night",
    altitude: "2,680m",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    tags: ["Alpine Bugyal", "Tungnath Trek", "Mountain View", "Acoustic Evenings"],
    rating: 4.88,
    reviews: 162,
  },
  {
    id: "kinnaur-sangla",
    name: "Kinnaur Sangla Valley Organic Apple Orchard Chalet",
    tagline: "Apple orchard valley homestay where Tibetan Buddhist woodcraft meets Kinnauri hospitality",
    region: "kinnaur",
    category: "homestay",
    price: "₹2,450",
    unit: "/night",
    altitude: "2,700m",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80",
    tags: ["Apple Orchard", "Baspa River View", "Organic Dining", "Kinnauri Art"],
    rating: 4.91,
    reviews: 139,
  },
  {
    id: "jibhi-kathkuni",
    name: "Jibhi Pine Woods Heritage Kath-Kuni Homestay",
    tagline: "Handcrafted Kath-Kuni cedar wood homestay nestled beside cascading waterfalls & Serolsar trail",
    region: "jibhi",
    category: "homestay",
    price: "₹2,200",
    unit: "/night",
    altitude: "1,600m",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    tags: ["Cedar Wood Cottage", "Waterfall Trail", "Serolsar Lake", "Balcony View"],
    rating: 4.93,
    reviews: 367,
  },
  {
    id: "parvati-hamlet",
    name: "Parvati Valley Kalga Apple Orchard Retreat",
    tagline: "Quiet car-free alpine hamlet, deodar canopies, glacier views & artisan sourdough hearth",
    region: "parvati",
    category: "homestay",
    price: "₹1,850",
    unit: "/night",
    altitude: "2,200m",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    tags: ["Car-Free Village", "Glacier Panorama", "Herbal Teas", "Forest Trails"],
    rating: 4.87,
    reviews: 312,
  },
  {
    id: "zanskar-frontier",
    name: "Zanskar Valley High-Pass Gompa & Basecamp",
    tagline: "Dramatic high-altitude gorges, ancient cliffside Gompas and raw trans-Himalayan wilderness",
    region: "zanskar",
    category: "campsite",
    price: "₹2,750",
    unit: "/night",
    altitude: "3,500m",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80",
    tags: ["Cliffside Gompa", "High Pass Expedition", "Glacier Streams", "Stargazing Dome"],
    rating: 4.94,
    reviews: 95,
  },
  {
    id: "pangi-sachpass",
    name: "Pangi Valley & Sach Pass Remote Alpine Sanctuary",
    tagline: "Raw frontier valley shielded by the towering cliffs of Sach Pass with authentic tribal stays",
    region: "pangi",
    category: "homestay",
    price: "₹2,000",
    unit: "/night",
    altitude: "2,800m",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    tags: ["Sach Pass Gateway", "Remote Frontier", "Local Campfire", "Pristine Valleys"],
    rating: 4.89,
    reviews: 78,
  },
  {
    id: "kasol-chalal",
    name: "Kasol Chalal Riverside Glamping & Pine Woods",
    tagline: "Quiet bohemian riverside bell-tents tucked under deodar canopies beside the roaring river",
    region: "kasol",
    category: "campsite",
    price: "₹1,600",
    unit: "/night",
    altitude: "1,580m",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tags: ["Riverside Glamping", "Hammocks", "Live Acoustic Music", "Pine Trail"],
    rating: 4.78,
    reviews: 540,
  },
];

function DestinationCard({ dest }) {
  const [liked, setLiked] = useState(false);
  const { openBooking } = useAuth();

  const isCampsite = dest.category?.toLowerCase().includes("camp") || dest.category?.toLowerCase().includes("glamp");
  const isHomestay = dest.category?.toLowerCase().includes("homestay") || dest.category?.toLowerCase().includes("chalet") || dest.category?.toLowerCase().includes("cottage") || dest.category?.toLowerCase().includes("farmstay") || !isCampsite;

  const categoryLabel = isCampsite
    ? "⛺ Campsite & Glamping"
    : "🏡 Heritage Homestay";

  const tagsList = Array.isArray(dest.tags)
    ? dest.tags
    : typeof dest.tags === "string"
    ? dest.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <article className="ep-stay-card" tabIndex={0} aria-label={dest.name}>
      {/* Top Image Box */}
      <div className="ep-stay-media">
        <img
          src={dest.image || "/images/destinations/tirthan-valley.jpg"}
          alt={dest.name}
          className="ep-stay-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
          }}
        />
        <div className="ep-stay-media-overlay" />

        {/* Badges on Image */}
        <div className="ep-stay-badge-group">
          {dest.altitude && (
            <span className="ep-badge-pill altitude">
              ⛰️ {dest.altitude}
            </span>
          )}
          <span className={`ep-badge-pill ${isCampsite ? "category-campsite" : "category"}`}>
            {categoryLabel}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          className={`ep-stay-wishlist-btn${liked ? " active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={liked ? "#e74c3c" : "rgba(0,0,0,0.4)"}
            stroke={liked ? "#e74c3c" : "#ffffff"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Card Info Body */}
      <div className="ep-stay-body">
        {/* Region & Rating Header */}
        <div className="ep-stay-meta-row">
          <span className="ep-stay-region-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {dest.region ? `${dest.region.charAt(0).toUpperCase() + dest.region.slice(1)} Valley` : "Himachal Pradesh"}
          </span>

          <div className="ep-stay-rating-badge">
            <span className="ep-star">★</span>
            <span className="ep-rating-score">{dest.rating || 4.8}</span>
            <span className="ep-review-count">({dest.reviews || dest.reviewCount || 120})</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="ep-stay-title">{dest.name}</h3>
        <p className="ep-stay-desc">{dest.tagline}</p>

        {/* Amenities / Feature Tags */}
        <div className="ep-stay-tags-wrap">
          {tagsList.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="ep-stay-tag">
              ✓ {tag}
            </span>
          ))}
        </div>

        {/* Price & Booking Action Row */}
        <div className="ep-stay-footer">
          <div className="ep-stay-price-box">
            <span className="ep-price-main">{dest.price || "₹2,200"}</span>
            <span className="ep-price-unit">{dest.unit || "/ night"}</span>
            <span className="ep-price-subtext">Verified Host</span>
          </div>

          <a
            href={`/book-stay?valley=${dest.region || "all"}`}
            className="ep-stay-reserve-btn"
            title={`View homestays & camps in ${dest.name}`}
          >
            <span>Book Stay</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function ExploreDestinationsGrid({
  activeFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  searchQuery,
  onResetFilters,
}) {
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setLoading(true);
        const isCategoryFilter = activeFilter === "homestay" || activeFilter === "campsite";
        const params = {
          q: searchQuery || undefined,
        };
        if (isCategoryFilter) {
          params.category = activeFilter;
        } else if (activeFilter !== "all") {
          params.region = activeFilter;
        }

        const data = await getPlaces(params);
        if (data && data.length > 0) {
          setDestinations(data);
        } else if (!searchQuery && activeFilter === "all") {
          setDestinations(FALLBACK_DESTINATIONS);
        } else {
          // If backend returns empty, filter fallback data locally
          let filtered = FALLBACK_DESTINATIONS;
          if (isCategoryFilter) {
            filtered = filtered.filter((d) => d.category === activeFilter);
          } else if (activeFilter !== "all") {
            filtered = filtered.filter((d) => d.region === activeFilter);
          }
          if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(
              (d) =>
                d.name?.toLowerCase().includes(q) ||
                d.tagline?.toLowerCase().includes(q) ||
                d.region?.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                (Array.isArray(d.tags) && d.tags.some((t) => t.toLowerCase().includes(q)))
            );
          }
          setDestinations(filtered);
        }
      } catch (err) {
        console.warn("Using fallback places data:", err);
        let filtered = FALLBACK_DESTINATIONS;
        if (activeFilter === "homestay" || activeFilter === "campsite") {
          filtered = filtered.filter((d) => d.category === activeFilter);
        } else if (activeFilter !== "all") {
          filtered = filtered.filter((d) => d.region === activeFilter);
        }
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          filtered = filtered.filter(
            (d) =>
              d.name?.toLowerCase().includes(q) ||
              d.tagline?.toLowerCase().includes(q) ||
              d.region?.toLowerCase().includes(q) ||
              d.description?.toLowerCase().includes(q) ||
              (Array.isArray(d.tags) && d.tags.some((t) => t.toLowerCase().includes(q)))
          );
        }
        setDestinations(filtered);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, [activeFilter, searchQuery]);

  // Clean numeric extraction for price sorting
  const extractPrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const num = priceStr.toString().replace(/[^0-9]/g, "");
    return parseInt(num, 10) || 0;
  };

  // Sort destinations
  const sorted = [...destinations].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "price_low") return extractPrice(a.price) - extractPrice(b.price);
    if (sortBy === "price_high") return extractPrice(b.price) - extractPrice(a.price);
    if (sortBy === "new") return (b.id || 0) - (a.id || 0);
    return (b.reviews || 0) - (a.reviews || 0);
  });

  const getHeaderTitle = () => {
    if (activeFilter === "homestay") return "Explore Heritage Homestays 🏡";
    if (activeFilter === "campsite") return "Explore Campsites & Glamping ⛺";
    if (activeFilter !== "all") {
      return `Explore Stays in ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Valley`;
    }
    return "Explore Stays & Campsites";
  };

  return (
    <div className="ep-grid-section">
      {/* Header bar */}
      <div className="ep-grid-header">
        <div className="ep-grid-title-box">
          <div className="ep-grid-badge">
            <span className="ep-grid-dot"></span>
            <span>
              {sorted.length}{" "}
              {activeFilter === "homestay"
                ? "homestays"
                : activeFilter === "campsite"
                ? "campsites"
                : "sanctuaries"}{" "}
              available
            </span>
          </div>
          <h2 className="ep-grid-title">{getHeaderTitle()}</h2>
        </div>

        <div className="ep-grid-controls">
          {/* Sort Selector */}
          <div className="ep-sort-select-wrap">
            <label htmlFor="ep-sort" className="ep-sort-label">Sort by:</label>
            <select
              id="ep-sort"
              className="ep-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort destinations"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="new">Newest First</option>
            </select>
            <span className="ep-sort-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="ep-view-toggle" role="group" aria-label="View layout">
            <button
              type="button"
              className={`ep-view-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              title="Grid view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button
              type="button"
              className={`ep-view-btn${viewMode === "list" ? " active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              title="List view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" strokeWidth="2.5" />
                <line x1="8" y1="12" x2="21" y2="12" strokeWidth="2.5" />
                <line x1="8" y1="18" x2="21" y2="18" strokeWidth="2.5" />
                <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="4" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content Cards */}
      {loading ? (
        <div className="ep-loading-state">
          <div className="ep-loading-spinner" />
          <p>Loading handpicked mountain stays...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="ep-empty-state">
          <div className="ep-empty-icon">🏔️</div>
          <h3>No mountain stays found</h3>
          <p>Try clearing your search query or selecting &ldquo;All Stays&rdquo; to view all sanctuaries.</p>
          {onResetFilters && (
            <button
              type="button"
              className="hero-search-btn"
              style={{ marginTop: "1rem" }}
              onClick={onResetFilters}
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className={`ep-stays-grid${viewMode === "list" ? " list-layout" : ""}`}>
          {sorted.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExploreDestinationsGrid;
