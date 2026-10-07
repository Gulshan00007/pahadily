import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getPlaces } from "../lib/api";
import NearbySlideshow from "../components/booking/NearbySlideshow";

const VALLEY_INFO = {
  all: {
    name: "All Himachal Valleys",
    tagline: "Handcrafted wooden chalets, high-pass monastery homestays, and alpine riverside camps",
    altitude: "1,500m - 3,800m",
    bestSeason: "March - November",
    image: "/images/hero/himachal-hero.jpg",
    vibe: "Diverse Himalayan terrain from cedar pine canopies to Tibetan trans-Himalaya",
  },
  tirthan: {
    name: "Tirthan Valley",
    tagline: "Crystal trout streams, ancient stone hamlets, and Great Himalayan National Park trails",
    altitude: "1,600m",
    bestSeason: "March - June & Sept - Nov",
    image: "/images/destinations/tirthan-valley.jpg",
    vibe: "Pristine riverside living, cedar pine canopies, and quiet stone trails",
  },
  jibhi: {
    name: "Jibhi Pine Woods",
    tagline: "Kath-Kuni cedar wood chalets, hidden waterfalls, and misty pine ridge walks",
    altitude: "1,600m",
    bestSeason: "Year-Round Haven",
    image: "/images/destinations/jibhi.jpg",
    vibe: "Artisan wooden architecture, Siddu feasts, and waterfall cascades",
  },
  spiti: {
    name: "Spiti High Altitude Desert",
    tagline: "Centuries-old Tibetan mud monastery villages, fossil valleys, and dark starry skies",
    altitude: "3,800m",
    bestSeason: "May - October",
    image: "/images/destinations/spiti-valley.jpg",
    vibe: "Bortle-1 Milky Way astronomy, warm Bukhari stoves, and butter tea",
  },
  kasol: {
    name: "Kasol & Chalal Riverside",
    tagline: "Bohemian riverside bell-tents, deodar pine trails, and acoustic gatherings",
    altitude: "1,580m",
    bestSeason: "March - July & Sept - Nov",
    image: "/images/destinations/kasol.jpg",
    vibe: "Glacial river breeze, hammocks, fresh bakery trails, and mountain cafés",
  },
  pangi: {
    name: "Pangi Remote Valley",
    tagline: "Untouched Chenab gorge canyon, Sach Pass wilderness, and pure Himalayan raw solace",
    altitude: "2,800m",
    bestSeason: "June - September",
    image: "/images/destinations/pangi-valley.jpg",
    vibe: "High-altitude expedition camps, raw nature, and authentic Pangwali culture",
  },
  parvati: {
    name: "Parvati Valley",
    tagline: "Sunlit apple orchards, thermal springs, and panoramic glacier ridgelines",
    altitude: "2,200m",
    bestSeason: "April - November",
    image: "/images/destinations/parvati-valley.jpg",
    vibe: "Orchard farmstays, chamomile foraging, and glacier viewpoint treks",
  },
};

const VALLEYS_LIST = [
  { id: "all", label: "✨ All Valleys" },
  { id: "tirthan", label: "🌊 Tirthan Valley" },
  { id: "jibhi", label: "🌲 Jibhi Woods" },
  { id: "spiti", label: "❄️ Spiti High Pass" },
  { id: "kasol", label: "🍃 Kasol & Chalal" },
  { id: "pangi", label: "⛰️ Pangi Remote" },
  { id: "parvati", label: "🍎 Parvati Valley" },
];

const REGISTERED_FALLBACKS = [
  {
    id: 1,
    name: "Tirthan Riverside Campsite & Bonfire Haven",
    tagline: "Pristine riverside alpine tents surrounded by cedar pines and trout streams",
    region: "tirthan",
    category: "campsite",
    price: "₹1,800",
    unit: "/night",
    rating: 4.9,
    reviews: 214,
    altitude: "1,600m",
    tags: ["Riverside Tents", "Bonfire Nights", "Trout Stream", "Stargazing"],
    image: "/images/destinations/tirthan-valley.jpg",
    description: "Pitch under towering pine canopies beside the bubbling Tirthan River. Features luxury canvas tents, private firepits, freshly caught trout barbecue, and night sky astronomy.",
    host_name: "Sonia & Meena Negi",
    verified: true,
  },
  {
    id: 2,
    name: "Jibhi Pine Woods Heritage Homestay",
    tagline: "Handcrafted Kath-Kuni cedar wood homestay nestled beside cascading waterfalls",
    region: "jibhi",
    category: "homestay",
    price: "₹2,200",
    unit: "/night",
    rating: 4.9,
    reviews: 341,
    altitude: "1,600m",
    tags: ["Cedar Wood Cottage", "Home Cooked Food", "Waterfall Trail", "Balcony View"],
    image: "/images/destinations/jibhi.jpg",
    description: "Live with a native Himachali family in a centuries-old slate and cedar mansion. Savor traditional Siddu, organic apple chutneys, and fall asleep to the gentle mountain breeze.",
    host_name: "Rahul & Hemraj Thakur",
    verified: true,
  },
  {
    id: 3,
    name: "Kasol Chalal Riverside Glamping Camp",
    tagline: "Quiet bohemian riverside bell-tents tucked under deodar canopies",
    region: "kasol",
    category: "campsite",
    price: "₹1,600",
    unit: "/night",
    rating: 4.7,
    reviews: 528,
    altitude: "1,580m",
    tags: ["Riverside Glamping", "Hammocks", "Live Acoustic Music", "Pine Trail"],
    image: "/images/destinations/kasol.jpg",
    description: "Escape the main strip to the tranquil banks of Chalal. Enjoy riverside geodesic dome tents, wood-fired bread making, hammocks over clear glacial water, and starlit gatherings.",
    host_name: "Devendra & Rohan",
    verified: true,
  },
  {
    id: 4,
    name: "Spiti Valley Mud & Stone Monastery Homestay",
    tagline: "High-altitude Tibetan mud-brick home with panoramic monastery and Milky Way views",
    region: "spiti",
    category: "homestay",
    price: "₹2,800",
    unit: "/night",
    rating: 4.9,
    reviews: 173,
    altitude: "3,800m",
    tags: ["Monastery View", "Solar Heated", "Traditional Hearth", "Bortle-1 Dark Sky"],
    image: "/images/destinations/spiti-valley.jpg",
    description: "Experience authentic Spitian hospitality at 3,800m. Stay in a traditional solar-heated mud-brick home with butter tea by the Bukhari stove and breathtaking view of Key Monastery.",
    host_name: "Tsering Dorje",
    verified: true,
  },
  {
    id: 5,
    name: "Pangi Valley Remote Alpine Campsite",
    tagline: "Raw wilderness expedition campsite beneath dramatic mountain cliffs",
    region: "pangi",
    category: "campsite",
    price: "₹1,900",
    unit: "/night",
    rating: 4.8,
    reviews: 89,
    altitude: "2,800m",
    tags: ["High Pass Camp", "Raw Wilderness", "Camp Cook", "Glacier Water"],
    image: "/images/destinations/pangi-valley.jpg",
    description: "For genuine adventure seekers: all-weather dome tents surrounded by soaring jagged Himalayan spires, Pangwali village campfires, and untouched trails along the Chenab canyon.",
    host_name: "Chuni Lal Sharma",
    verified: true,
  },
  {
    id: 6,
    name: "Parvati Valley Apple Orchard Homestay",
    tagline: "Rustic orchard retreat with glacier views, sourdough bakes and organic herbs",
    region: "parvati",
    category: "homestay",
    price: "₹2,100",
    unit: "/night",
    rating: 4.8,
    reviews: 296,
    altitude: "2,200m",
    tags: ["Apple Orchard", "Glacier View", "Herbal Tea", "Trek Guide"],
    image: "/images/destinations/parvati-valley.jpg",
    description: "Wake up amidst blushing apple orchards overlooking snow-capped peaks. Relish wood-fired pizzas, herbal chamomile infusions, and private mountain trails.",
    host_name: "Karan & Ananya",
    verified: true,
  },
];

function BookStayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openBooking, openHostModal } = useAuth();

  const [places, setPlaces] = useState(REGISTERED_FALLBACKS);
  const [loading, setLoading] = useState(true);

  // Read location / valley from URL params
  const initialValley =
    searchParams.get("valley") ||
    searchParams.get("region") ||
    searchParams.get("location") ||
    "all";

  const initialCat = searchParams.get("type") || searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [selectedValley, setSelectedValley] = useState(initialValley.toLowerCase());
  const [categoryFilter, setCategoryFilter] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("rating");

  // Nearby slideshow state
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowTarget, setSlideshowTarget] = useState(null);

  const handleBookStayClick = (stay) => {
    setSlideshowTarget(stay);
    setSlideshowOpen(true);
  };

  const handleProceedToBook = (stay) => {
    openBooking(stay, "place");
  };

  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        const data = await getPlaces();
        if (data && data.length > 0) {
          setPlaces(data);
        } else {
          setPlaces(REGISTERED_FALLBACKS);
        }
      } catch (err) {
        console.warn("Using fallback registered stays data:", err);
        setPlaces(REGISTERED_FALLBACKS);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  // Update URL search parameters
  const updateUrl = (valley, cat, query) => {
    const params = new URLSearchParams();
    if (valley && valley !== "all") params.set("valley", valley);
    if (cat && cat !== "all") params.set("type", cat);
    if (query && query.trim()) params.set("q", query.trim());
    setSearchParams(params, { replace: true });
  };

  const handleValleyChange = (valleyId) => {
    setSelectedValley(valleyId);
    updateUrl(valleyId, categoryFilter, searchQuery);
  };

  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    updateUrl(selectedValley, cat, searchQuery);
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    updateUrl(selectedValley, categoryFilter, q);
  };

  // Get active valley information
  const currentValleyInfo = VALLEY_INFO[selectedValley] || VALLEY_INFO.all;

  // Filter listings based on selected valley, category, and search query
  const filteredPlaces = places.filter((place) => {
    const isCampsite =
      place.category?.toLowerCase().includes("camp") ||
      place.category?.toLowerCase().includes("glamp");
    const isHomestay =
      place.category?.toLowerCase().includes("homestay") ||
      place.category?.toLowerCase().includes("chalet") ||
      place.category?.toLowerCase().includes("cottage") ||
      place.category?.toLowerCase().includes("farmstay") ||
      !isCampsite;

    // Filter by selected valley
    if (selectedValley !== "all") {
      if (place.region?.toLowerCase() !== selectedValley) return false;
    }

    // Filter by type
    if (categoryFilter === "homestay" && !isHomestay) return false;
    if (categoryFilter === "campsite" && !isCampsite) return false;

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = place.name?.toLowerCase().includes(q);
      const matchTagline = place.tagline?.toLowerCase().includes(q);
      const matchDesc = place.description?.toLowerCase().includes(q);
      const matchRegion = place.region?.toLowerCase().includes(q);
      const matchTags = Array.isArray(place.tags)
        ? place.tags.some((t) => t.toLowerCase().includes(q))
        : typeof place.tags === "string"
        ? place.tags.toLowerCase().includes(q)
        : false;
      if (!matchName && !matchTagline && !matchDesc && !matchRegion && !matchTags) {
        return false;
      }
    }

    return true;
  });

  // Price extractor for sorting
  const parsePrice = (p) => {
    if (typeof p === "number") return p;
    if (!p) return 0;
    const num = p.toString().replace(/[^0-9]/g, "");
    return parseInt(num, 10) || 0;
  };

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "price_low") return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === "price_high") return parsePrice(b.price) - parsePrice(a.price);
    if (sortBy === "reviews") return (b.reviews || 0) - (a.reviews || 0);
    return 0;
  });

  // Count stays for current selected valley
  const valleyPool = selectedValley === "all" ? places : places.filter((p) => p.region?.toLowerCase() === selectedValley);
  const countValleyHomestays = valleyPool.filter(
    (p) =>
      p.category?.toLowerCase().includes("homestay") ||
      p.category?.toLowerCase().includes("chalet") ||
      p.category?.toLowerCase().includes("cottage") ||
      p.category?.toLowerCase().includes("farmstay") ||
      (!p.category?.toLowerCase().includes("camp") && !p.category?.toLowerCase().includes("glamp"))
  ).length;

  const countValleyCampsites = valleyPool.filter(
    (p) =>
      p.category?.toLowerCase().includes("camp") ||
      p.category?.toLowerCase().includes("glamp")
  ).length;

  return (
    <div className="pahadily-app">
      <Navbar activePage="explore" />

      <main className="book-stay-page">
        {/* Dynamic Location-Subjective Hero Header */}
        <section
          className="book-stay-hero location-hero"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(8, 22, 15, 0.72) 0%, rgba(10, 28, 19, 0.88) 100%), url('${currentValleyInfo.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="section-container book-stay-hero-inner">
            <nav className="book-stay-breadcrumb" aria-label="Breadcrumb">
              <a href="/" className="bcrumb-link">Home</a>
              <span className="bcrumb-sep">&#8250;</span>
              <a href="/explore" className="bcrumb-link">Explore</a>
              <span className="bcrumb-sep">&#8250;</span>
              <span className="bcrumb-active">{currentValleyInfo.name}</span>
            </nav>

            <span className="book-stay-badge">
              📍 SELECTED DESTINATION: {currentValleyInfo.name.toUpperCase()}
            </span>

            <h1 className="book-stay-title">
              {selectedValley === "all"
                ? "Registered Stays & Campsites"
                : `Stays & Camps in ${currentValleyInfo.name}`}
            </h1>

            <p className="book-stay-desc">{currentValleyInfo.tagline}</p>

            {/* Location Vibe Pills */}
            <div className="location-meta-pills">
              <span className="meta-pill">⛰️ {currentValleyInfo.altitude}</span>
              <span className="meta-pill">☀️ Best Season: {currentValleyInfo.bestSeason}</span>
              <span className="meta-pill">🌲 {currentValleyInfo.vibe}</span>
            </div>

            {/* Type Selector (Homestays vs Campsites) */}
            <div className="book-type-tabs" role="tablist">
              <button
                type="button"
                className={`book-type-tab${categoryFilter === "all" ? " active" : ""}`}
                onClick={() => handleCategoryChange("all")}
              >
                <span className="tab-icon">✨</span>
                <span className="tab-text">All in {selectedValley === "all" ? "Himachal" : currentValleyInfo.name}</span>
                <span className="tab-counter">{valleyPool.length}</span>
              </button>

              <button
                type="button"
                className={`book-type-tab${categoryFilter === "homestay" ? " active" : ""}`}
                onClick={() => handleCategoryChange("homestay")}
              >
                <span className="tab-icon">🏡</span>
                <span className="tab-text">Heritage Homestays</span>
                <span className="tab-counter">{countValleyHomestays}</span>
              </button>

              <button
                type="button"
                className={`book-type-tab${categoryFilter === "campsite" ? " active" : ""}`}
                onClick={() => handleCategoryChange("campsite")}
              >
                <span className="tab-icon">⛺</span>
                <span className="tab-text">Campsites & Glamping</span>
                <span className="tab-counter">{countValleyCampsites}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Location Switcher & Filter Bar */}
        <section className="section-container book-stay-body">
          {/* Valleys Switcher Bar */}
          <div className="location-switcher-bar">
            <span className="switcher-label">Select Valley / Location:</span>
            <div className="valleys-chip-group">
              {VALLEYS_LIST.map((val) => (
                <button
                  key={val.id}
                  type="button"
                  className={`valley-pill-btn${selectedValley === val.id ? " active" : ""}`}
                  onClick={() => handleValleyChange(val.id)}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="book-controls-bar">
            <div className="book-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2a4536" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={`Search stays in ${currentValleyInfo.name} (e.g., Riverside, Bonfire, Siddu)...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="book-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="book-clear-btn"
                  onClick={() => handleSearchChange("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="book-filter-group">
              <label htmlFor="sort-select" className="book-control-label">Sort By:</label>
              <select
                id="sort-select"
                className="book-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Highest Rated ★</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>

          {/* Section Heading & Counter */}
          <div className="book-results-header">
            <div>
              <h2 className="results-heading">
                {sortedPlaces.length}{" "}
                {categoryFilter === "homestay"
                  ? "Heritage Homestays"
                  : categoryFilter === "campsite"
                  ? "Campsites & Glamping Havens"
                  : "Verified Stays"}{" "}
                in {currentValleyInfo.name}
              </h2>
              <p className="results-subheading">
                Direct booking with verified native hosts • Zero middleman fees
              </p>
            </div>
            <span className="direct-badge">⚡ Instant Confirmation</span>
          </div>

          {/* Listings Grid */}
          {sortedPlaces.length === 0 ? (
            <div className="book-empty-state">
              <div className="empty-icon">🏔️</div>
              <h3>No stays found in {currentValleyInfo.name} with selected filters</h3>
              <p>Try switching categories or viewing all valleys to discover more sanctuaries.</p>
              <button
                type="button"
                className="btn-reset-filters"
                onClick={() => {
                  handleValleyChange("all");
                  handleCategoryChange("all");
                  handleSearchChange("");
                }}
              >
                View All Valleys & Stays
              </button>
            </div>
          ) : (
            <div className="book-listings-grid">
              {sortedPlaces.map((stay) => {
                const isCamp =
                  stay.category?.toLowerCase().includes("camp") ||
                  stay.category?.toLowerCase().includes("glamp");

                const tags = Array.isArray(stay.tags)
                  ? stay.tags
                  : typeof stay.tags === "string"
                  ? stay.tags.split(",").map((t) => t.trim())
                  : [];

                return (
                  <article key={stay.id} className="book-stay-card">
                    {/* Media Thumbnail */}
                    <div className="card-media-box">
                      <img
                        src={stay.image || "/images/destinations/tirthan-valley.jpg"}
                        alt={stay.name}
                        className="card-media-img"
                        loading="lazy"
                      />
                      <div className="card-media-overlay" />

                      <div className="card-top-badges">
                        {stay.altitude && (
                          <span className="badge-altitude">
                            ⛰️ {stay.altitude}
                          </span>
                        )}
                        <span className={`badge-type ${isCamp ? "campsite" : "homestay"}`}>
                          {isCamp ? "⛺ Campsite & Glamping" : "🏡 Heritage Homestay"}
                        </span>
                      </div>

                      <div className="card-host-pill">
                        <span>👤 Host: {stay.host_name || "Verified Native Host"}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="card-body-box">
                      {/* Valley and Rating */}
                      <div className="card-valley-rating">
                        <span className="card-valley-name">
                          📍 {stay.region ? `${stay.region.toUpperCase()} VALLEY` : "HIMACHAL"}
                        </span>
                        <div className="card-rating-pill">
                          <span className="star">★</span>
                          <span className="score">{stay.rating || 4.9}</span>
                          <span className="count">({stay.reviews || 150})</span>
                        </div>
                      </div>

                      {/* Name & Tagline */}
                      <h3 className="card-title">{stay.name}</h3>
                      <p className="card-desc">{stay.tagline || stay.description}</p>

                      {/* Amenities Tag Pills */}
                      <div className="card-amenities-wrap">
                        {tags.slice(0, 4).map((tag, idx) => (
                          <span key={idx} className="amenity-tag">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>

                      {/* Price and Book Action */}
                      <div className="card-footer-box">
                        <div className="price-stack">
                          <div className="price-main-row">
                            <span className="price-amount">{stay.price || "₹1,800"}</span>
                            <span className="price-unit">{stay.unit || "/night"}</span>
                          </div>
                          <span className="price-sub">Taxes included</span>
                        </div>

                        <button
                          type="button"
                          className="btn-book-now"
                          onClick={() => handleBookStayClick(stay)}
                        >
                          <span>Book Stay</span>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Host Registration Banner */}
          <div className="book-host-banner">
            <div className="host-banner-text">
              <span className="banner-tag">COMMUNITY HOST NETWORK</span>
              <h3>Do you operate a Homestay or Campsite in {currentValleyInfo.name}?</h3>
              <p>Join Pahadíly’s curated collection of authentic mountain stays. Zero listing fees, direct traveler connections, and fair revenue.</p>
            </div>
            <button
              type="button"
              className="btn-apply-host"
              onClick={openHostModal}
            >
              Register Your Stay 🏔️
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Nearby Slideshow Modal */}
      <NearbySlideshow
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        place={slideshowTarget}
        onProceedToBook={handleProceedToBook}
      />
    </div>
  );
}

export default BookStayPage;
