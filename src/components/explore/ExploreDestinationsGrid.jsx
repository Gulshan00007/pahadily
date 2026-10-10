import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPlaces, getExperiences, getLocals } from "../../lib/api";

const FALLBACK_DESTINATIONS = [
  {
    id: 1,
    name: "Tirthan Valley & GHNP",
    tagline: "Pristine riverside alpine valley surrounded by cedar pines and trout streams",
    region: "tirthan",
    category: "river-valley",
    price: "₹1,800",
    unit: "/night",
    rating: 4.9,
    reviews: 214,
    altitude: "1,600m",
    latitude: 31.639,
    longitude: 77.3845,
    tags: ["Riverside Tents", "Bonfire Nights", "Trout Stream", "Stargazing"],
    image: "/images/destinations/tirthan-valley.jpg",
    description: "Pitch under towering pine canopies beside the bubbling Tirthan River. Features luxury canvas tents, private firepits, freshly caught trout barbecue, and direct trails to UNESCO Great Himalayan National Park.",
    host_name: "Sonia & Meena Negi",
    nearby_locations: [
      {
        id: "t1",
        name: "Tirthan River Trout Angling Pool",
        distance: "150m (2 min walk)",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        description: "Crystal clear glacial waters where river trout spawn under pine branches."
      },
      {
        id: "t2",
        name: "Chhoie Waterfall Sacred Trail",
        distance: "2.1 km (30 min hike)",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
        description: "Mystic mountain falls cascading into an icy blue plunge basin nestled in deodars."
      },
      {
        id: "t3",
        name: "Great Himalayan National Park Gate",
        distance: "5.5 km (15 min drive)",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        description: "UNESCO World Heritage biodiversity boundary with rare Western Tragopan trails."
      },
      {
        id: "t4",
        name: "Sharchi Traditional Ridge Hamlet",
        distance: "9.2 km (25 min drive)",
        image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1000&q=80",
        description: "Ancient Kath-Kuni village perched on the rim overlooking the entire Tirthan canyon."
      }
    ],
    stay_options: [
      {
        id: "opt-t1",
        name: "Riverside Canvas Bell Tent",
        price: "₹1,800",
        unit: "/night",
        capacity: "2 Guests",
        available_count: 4,
        features: ["River View", "Private Bonfire", "Sleeping Bags & Quilts", "Stargazing Deck"]
      },
      {
        id: "opt-t2",
        name: "Handcrafted Cedar Pine Cabin",
        price: "₹2,400",
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["Ensuite Bathroom", "Balcony to River", "Hot Water", "Local Breakfast"]
      },
      {
        id: "opt-t3",
        name: "Deluxe Trout Glamping Chalet",
        price: "₹3,200",
        unit: "/night",
        capacity: "4 Guests",
        available_count: 1,
        features: ["King Bed + Loft", "Riverside Firepit", "Barbecue Setup", "Heater"]
      }
    ]
  },
  {
    id: 2,
    name: "Jibhi Pine Woods & Banjar",
    tagline: "Handcrafted Kath-Kuni cedar wood homestays nestled beside cascading waterfalls",
    region: "jibhi",
    category: "pine-forest",
    price: "₹2,200",
    unit: "/night",
    rating: 4.9,
    reviews: 341,
    altitude: "1,600m",
    latitude: 31.5798,
    longitude: 77.3581,
    tags: ["Cedar Wood Cottage", "Home Cooked Food", "Waterfall Trail", "Balcony View"],
    image: "/images/destinations/jibhi.jpg",
    description: "Live with native Himachali families in centuries-old slate and cedar mansions. Savor traditional Siddu, organic apple chutneys, and hike to hidden wooden bridges and Jalori Pass.",
    host_name: "Rahul & Hemraj Thakur",
    nearby_locations: [
      {
        id: "j1",
        name: "Jibhi Hidden Waterfall & Wood Bridges",
        distance: "650m (8 min walk)",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
        description: "Charming moss-covered stone trail across wooden bridges to a singing waterfall."
      },
      {
        id: "j2",
        name: "Chehni Kothi 1500-Year Fort Tower",
        distance: "4.8 km (20 min drive)",
        image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1000&q=80",
        description: "Towering earthquake-proof timber-and-stone architectural marvel built without cement."
      },
      {
        id: "j3",
        name: "Jalori Pass & Serolsar Lake Trail (3,120m)",
        distance: "12.4 km (35 min drive)",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80",
        description: "Wind-swept ridge pass connecting Kullu and Shimla with sacred emerald forest lake."
      }
    ],
    stay_options: [
      {
        id: "opt-j1",
        name: "Kath-Kuni Heritage Cedar Room",
        price: "₹2,200",
        unit: "/night",
        capacity: "2 Guests",
        available_count: 3,
        features: ["Cedar Wood Walls", "Balcony View", "Home-Cooked Siddu", "Hot Shower"]
      },
      {
        id: "opt-j2",
        name: "Attic Stream-View Loft",
        price: "₹2,700",
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["Panoramic Skylight", "Wooden Balcony", "Tea Corner", "Bukhari Heater"]
      },
      {
        id: "opt-j3",
        name: "Entire Forest Chalet Floor",
        price: "₹4,500",
        unit: "/night",
        capacity: "5 Guests",
        available_count: 1,
        features: ["2 Bedrooms", "Private Hearth", "Kitchen Access", "Family Mountain View"]
      }
    ]
  },
  {
    id: 3,
    name: "Kasol & Chalal Valley",
    tagline: "Quiet bohemian riverside bell-tents tucked under deodar canopies beside roaring rapids",
    region: "kasol",
    category: "river-valley",
    price: "₹1,600",
    unit: "/night",
    rating: 4.7,
    reviews: 528,
    altitude: "1,580m",
    latitude: 32.01,
    longitude: 77.315,
    tags: ["Riverside Glamping", "Hammocks", "Live Acoustic Music", "Pine Trail"],
    image: "/images/destinations/kasol.jpg",
    description: "Escape the main strip to the tranquil banks of Chalal. Enjoy riverside geodesic dome tents, wood-fired bread making, hammocks over clear glacial water, and starlit gatherings.",
    host_name: "Devendra & Rohan",
    nearby_locations: [
      {
        id: "k1",
        name: "Chalal Riverside Suspension Footbridge",
        distance: "850m (10 min trail walk)",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        description: "Wooden suspension bridge crossing turquoise glacial rapids into bohemian pine groves."
      },
      {
        id: "k2",
        name: "Manikaran Natural Hot Sulphur Springs",
        distance: "4.2 km (12 min drive)",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        description: "Sacred natural mineral geothermal waters and historic Gurudwara alongside river."
      }
    ],
    stay_options: [
      {
        id: "opt-k1",
        name: "Bohemian Riverside Bell Tent",
        price: "₹1,600",
        unit: "/night",
        capacity: "2 Guests",
        available_count: 4,
        features: ["River Sounds", "Private Hammock", "Acoustic Firepit", "Fresh Linen"]
      },
      {
        id: "opt-k2",
        name: "Geodesic Glamping Dome",
        price: "₹2,300",
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["Panoramic Clear Window", "Heater", "Plush Mattress", "Charging Points"]
      }
    ]
  },
  {
    id: 4,
    name: "Spiti Valley Cold Desert",
    tagline: "High-altitude Tibetan mud-brick villages with panoramic monastery and Milky Way views",
    region: "spiti",
    category: "cold-desert",
    price: "₹2,800",
    unit: "/night",
    rating: 4.9,
    reviews: 173,
    altitude: "3,800m",
    latitude: 32.246,
    longitude: 78.034,
    tags: ["Monastery View", "Solar Heated", "Traditional Hearth", "Bortle-1 Dark Sky"],
    image: "/images/destinations/spiti-valley.jpg",
    description: "Experience authentic Spitian hospitality at 3,800m. Stay in traditional solar-heated mud-brick homes with butter tea by the Bukhari stove and breathtaking views of Key Monastery.",
    host_name: "Tsering Dorje",
    nearby_locations: [
      {
        id: "s1",
        name: "Key 1,000-Year Gompa Monastery",
        distance: "1.2 km (15 min walk)",
        image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1000&q=80",
        description: "Ancient Tibetan Buddhist fortress monastery at 4,166m with centuries of sacred murals."
      },
      {
        id: "s2",
        name: "Kibber Snow Leopard Wildlife Sanctuary",
        distance: "6.5 km (15 min drive)",
        image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1000&q=80",
        description: "High-altitude stone village at 4,270m, habitat for ibex, Tibetan wolves and snow leopards."
      }
    ],
    stay_options: [
      {
        id: "opt-s1",
        name: "Traditional Solar-Heated Mud Room",
        price: "₹2,800",
        unit: "/night",
        capacity: "2 Guests",
        available_count: 3,
        features: ["Bukhari Stove", "Yak Wool Blankets", "Butter Tea Included", "Dark Sky View"]
      },
      {
        id: "opt-s2",
        name: "Monastery Panorama High-Pass Room",
        price: "₹3,400",
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["Direct Key Gompa View", "Heated Beds", "Tibetan Dinner", "Stargazing Guide"]
      }
    ]
  },
  {
    id: 5,
    name: "Pangi Valley & Sach Pass",
    tagline: "Raw wilderness expedition canyon beneath the dramatic Sach Pass cliffs",
    region: "pangi",
    category: "frontier",
    price: "₹1,900",
    unit: "/night",
    rating: 4.8,
    reviews: 89,
    altitude: "2,800m",
    latitude: 32.9,
    longitude: 76.4,
    tags: ["High Pass Camp", "Raw Wilderness", "Camp Cook", "Glacier Water"],
    image: "/images/destinations/pangi-valley.jpg",
    description: "For genuine adventure seekers: all-weather dome tents surrounded by soaring jagged Himalayan spires, Pangwali village campfires, and untouched trails along the Chenab canyon.",
    host_name: "Chuni Lal Sharma",
    nearby_locations: [
      {
        id: "p1",
        name: "Sach Pass Snow-Cut High Ridge (4,420m)",
        distance: "17.5 km (45 min 4x4 drive)",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
        description: "Legendary Himalayan mountain pass carved through towering walls of ancient snow."
      },
      {
        id: "p2",
        name: "Chenab River Deep Granite Canyon",
        distance: "1.8 km (25 min hike)",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        description: "Roaring grey glacial river thundering between 1,000-meter sheer rock spires."
      }
    ],
    stay_options: [
      {
        id: "opt-p1",
        name: "Expedition High-Altitude Dome Tent",
        price: "₹1,900",
        unit: "/night",
        capacity: "2 Guests",
        available_count: 4,
        features: ["Weatherproof Shell", "Thermal Matting", "Camp Chef Meals", "Starlight Fire"]
      },
      {
        id: "opt-p2",
        name: "Tribal Slate-Stone Heated Homestay",
        price: "₹2,400",
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["Fireplace Hearth", "Pangwali Thali Dinner", "Glacier Stream Water", "Local Guide"]
      }
    ]
  },
  {
    id: 6,
    name: "Parvati Valley & Kalga",
    tagline: "Rustic orchard retreat with glacier views, sourdough bakes and organic herbs",
    region: "parvati",
    category: "apple-orchard",
    price: "₹2,100",
    unit: "/night",
    rating: 4.8,
    reviews: 296,
    altitude: "2,200m",
    latitude: 31.98,
    longitude: 77.45,
    tags: ["Apple Orchard", "Organic Meals", "Glacier View", "Fireplace"],
    image: "/images/destinations/parvati-valley.jpg",
    description: "Perched above the valley floor in peaceful Kalga, surrounded by blooming apple trees and mountain mist. Cozy wooden rooms, herbal tea foraging, and serene writing spaces.",
    host_name: "Deepak Negi",
    nearby_locations: [
      {
        id: "v1",
        name: "Kalga Golden Apple Orchard Trails",
        distance: "200m (3 min stroll)",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        description: "Car-free village pathways flanked by fragrant apple trees, chamomile and mossy fences."
      },
      {
        id: "v2",
        name: "Kheerganga Thermal Hot Bath Peak Trail",
        distance: "8.5 km (3.5 hr scenic trek)",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80",
        description: "Natural hot spring bath atop meadow plateau surrounded by snow-clad peaks."
      }
    ],
    stay_options: [
      {
        id: "opt-v1",
        name: "Apple Orchard Wooden Room",
        price: "₹2,100",
        unit: "/night",
        capacity: "2 Guests",
        available_count: 3,
        features: ["Orchard Facing Balcony", "Fresh Baked Sourdough", "Herbal Teas", "Fireplace"]
      },
      {
        id: "opt-v2",
        name: "Glacier Panorama Attic Studio",
        price: "₹2,700",
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["180° Mountain View", "Warm Wooden Hearth", "Writing Desk", "Organic Breakfast"]
      }
    ]
  }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function extractPriceNumber(priceVal) {
  if (typeof priceVal === "number") return priceVal;
  if (!priceVal) return 0;
  const clean = priceVal.toString().replace(/[^0-9]/g, "");
  return parseInt(clean, 10) || 0;
}

function extractAltitudeMeters(altStr) {
  if (!altStr) return 0;
  const clean = altStr.toString().replace(/[^0-9]/g, "");
  return parseInt(clean, 10) || 0;
}

// ==========================================
// 1. TRAVEL LOCATION CARD (Main Grid Item)
// ==========================================
function LocationCard({
  location,
  isSelected,
  onSelect,
  userLocation,
  isHovered,
  onHover,
  onLeave,
}) {
  const { openBooking } = useAuth();
  const stayCount = Array.isArray(location.stay_options) && location.stay_options.length > 0
    ? location.stay_options.length
    : 3;

  const startingPrice = Array.isArray(location.stay_options) && location.stay_options[0]?.price
    ? location.stay_options[0].price
    : location.price || "₹1,800";

  const tagsList = Array.isArray(location.tags)
    ? location.tags
    : typeof location.tags === "string"
    ? location.tags.split(",").map((t) => t.trim())
    : [];

  const distanceKm =
    userLocation && location.latitude && location.longitude
      ? calculateDistanceKm(userLocation.lat, userLocation.lon, location.latitude, location.longitude)
      : null;

  return (
    <article
      id={`dest-card-${location.id}`}
      className={`ep-stay-card ep-location-card${isSelected ? " location-card-selected" : ""}${isHovered ? " card-highlighted" : ""}`}
      tabIndex={0}
      aria-label={`Travel location: ${location.name}`}
      onClick={() => onSelect(location)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(location);
        }
      }}
      onMouseEnter={() => onHover && onHover(location.id)}
      onMouseLeave={() => onLeave && onLeave()}
      onFocus={() => onHover && onHover(location.id)}
      onBlur={() => onLeave && onLeave()}
    >
      {/* Top Image Box */}
      <div className="ep-stay-media">
        <img
          src={location.image || "/images/destinations/tirthan-valley.jpg"}
          alt={location.name}
          className="ep-stay-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
          }}
        />
        <div className="ep-stay-media-overlay" />

        {/* Badges on Image */}
        <div className="ep-stay-badge-group">
          {location.altitude && (
            <span className="ep-badge-pill altitude">
              ⛰️ {location.altitude}
            </span>
          )}
          <span className="ep-badge-pill location-badge">
            📍 Destination
          </span>
          {distanceKm != null && (
            <span className="ep-badge-pill distance" title="Verified distance from your GPS position">
              📍 ~{distanceKm} km
            </span>
          )}
        </div>

        {isSelected && (
          <div className="ep-selected-banner">
            <span>✓ Location Active</span>
          </div>
        )}
      </div>

      {/* Card Info Body */}
      <div className="ep-stay-body">
        <div className="ep-stay-meta-row">
          <span className="ep-stay-region-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {location.region ? `${location.region.toUpperCase()} VALLEY` : "HIMACHAL"}
          </span>

          <div className="ep-stay-rating-badge">
            <span className="ep-star" aria-hidden="true">★</span>
            <span className="ep-rating-score">{location.rating || 4.8}</span>
            <span className="ep-review-count">({location.reviews || 180} reviews)</span>
          </div>
        </div>

        <h3 className="ep-stay-title">{location.name}</h3>
        <p className="ep-stay-desc">{location.tagline || location.description}</p>

        {/* Key Highlights / Attractions preview */}
        <div className="ep-stay-tags-wrap" aria-label="Key landscape highlights">
          {tagsList.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="ep-stay-tag">
              ✓ {tag}
            </span>
          ))}
        </div>

        {/* Tourism Services Summary Strip */}
        <div className="ep-location-stats-strip" aria-label="Available services in this travel location">
          <button
            type="button"
            className="ep-loc-stat-pill ep-loc-stat-clickable"
            onClick={(e) => {
              e.stopPropagation();
              openBooking(location, "place");
            }}
            title="Open stay slideshow & booking system"
          >
            🏡 {stayCount} Homestays (from {startingPrice}) ⚡
          </button>
          <span className="ep-loc-stat-pill">
            🎒 Guided Treks
          </span>
          <span className="ep-loc-stat-pill">
            🌲 Sights & Trails
          </span>
        </div>

        {/* Footer: Destination Info & Actions */}
        <div className="ep-stay-footer">
          <button
            type="button"
            className="ep-location-quick-book-btn"
            onClick={(e) => {
              e.stopPropagation();
              openBooking(location, "place");
            }}
            title={`Reserve stay in ${location.name}`}
          >
            <span>Book Stay</span>
          </button>

          <button
            type="button"
            className={`ep-location-view-btn${isSelected ? " active-btn" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(location);
            }}
            aria-expanded={isSelected}
            aria-label={`View homestays and tourism services in ${location.name}`}
          >
            <span>{isSelected ? "✓ Stays Shown Below ↓" : "View Stays & More ↓"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// =========================================================================
// 2. SELECTED LOCATION EXPANSION PANEL (Rendered Below the Travel Locations)
// =========================================================================
function LocationDetailsSection({ location, onClose }) {
  const { openBooking } = useAuth();
  const [activeTab, setActiveTab] = useState("homestays"); // "homestays" | "experiences" | "nearby" | "guides"
  const [experiences, setExperiences] = useState([]);
  const [localsList, setLocalsList] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Load experiences and local guides matching this location's region
  useEffect(() => {
    let isMounted = true;
    async function loadLocationExtras() {
      if (!location?.region) return;
      try {
        setLoadingExtras(true);
        const [expData, localsData] = await Promise.all([
          getExperiences({ region: location.region }).catch(() => []),
          getLocals({ region: location.region }).catch(() => []),
        ]);
        if (isMounted) {
          setExperiences(Array.isArray(expData) ? expData : []);
          setLocalsList(Array.isArray(localsData) ? localsData : []);
        }
      } catch (err) {
        console.debug("Location extras load warning:", err);
      } finally {
        if (isMounted) setLoadingExtras(false);
      }
    }
    loadLocationExtras();
    return () => {
      isMounted = false;
    };
  }, [location?.region]);

  const stayOptions = useMemo(() => {
    if (Array.isArray(location.stay_options) && location.stay_options.length > 0) {
      return location.stay_options;
    }
    const basePriceNum = extractPriceNumber(location.price) || 2000;
    return [
      {
        id: `opt-std-${location.id}`,
        name: `Heritage Wood Chalet Room (${location.name})`,
        price: `₹${basePriceNum}`,
        unit: "/night",
        capacity: "2 Guests",
        available_count: 3,
        features: ["Mountain View Balcony", "Organic Himachali Breakfast", "Hot Water Shower", "Cedar Wood Interior"],
      },
      {
        id: `opt-del-${location.id}`,
        name: `Panorama Valley Ridge Suite (${location.name})`,
        price: `₹${Math.round(basePriceNum * 1.35)}`,
        unit: "/night",
        capacity: "3 Guests",
        available_count: 2,
        features: ["Panoramic Skylight & Balcony", "Fireplace Hearth", "Home-Cooked Dinner Included", "Stargazing Deck"],
      },
      {
        id: `opt-fam-${location.id}`,
        name: `Entire Traditional Floor Stay (${location.name})`,
        price: `₹${Math.round(basePriceNum * 2)}`,
        unit: "/night",
        capacity: "5 Guests",
        available_count: 1,
        features: ["2 Connected Bedrooms", "Private Hearth & Kitchen Access", "Guided Village Walk", "Family Mountain View"],
      },
    ];
  }, [location]);

  const nearbyPlaces = Array.isArray(location.nearby_locations) ? location.nearby_locations : [];

  return (
    <section className="ep-location-expansion-section" aria-label={`Stays and services in ${location.name}`}>
      {/* Expansion Section Header */}
      <div className="ep-expansion-header">
        <div className="ep-expansion-headline">
          <span className="ep-expansion-eyebrow">
            📍 DISCOVER {location.region?.toUpperCase() || "HIMACHAL"}
          </span>
          <h2 className="ep-expansion-title">
            Homestays & Stays in {location.name}
          </h2>
          <p className="ep-expansion-desc">
            {location.description || location.tagline}
          </p>
        </div>

        <button
          type="button"
          className="ep-expansion-close-btn"
          onClick={onClose}
          aria-label="Close location stays view"
        >
          ✕ Close Stays & Services
        </button>
      </div>

      {/* Expansion Sub-tabs Navigation */}
      <div className="ep-expansion-tabs" role="tablist" aria-label="Location travel services">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "homestays"}
          className={`ep-exp-tab-btn${activeTab === "homestays" ? " active" : ""}`}
          onClick={() => setActiveTab("homestays")}
        >
          🏡 Homestays & Stays ({stayOptions.length || 1})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "experiences"}
          className={`ep-exp-tab-btn${activeTab === "experiences" ? " active" : ""}`}
          onClick={() => setActiveTab("experiences")}
        >
          🎒 Local Experiences ({experiences.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "nearby"}
          className={`ep-exp-tab-btn${activeTab === "nearby" ? " active" : ""}`}
          onClick={() => setActiveTab("nearby")}
        >
          🌲 Nearby Sights & Trails ({nearbyPlaces.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "guides"}
          className={`ep-exp-tab-btn${activeTab === "guides" ? " active" : ""}`}
          onClick={() => setActiveTab("guides")}
        >
          👤 Local Hosts & Guides ({localsList.length})
        </button>
      </div>

      {/* Sub-tab 1: Homestays & Stays */}
      {activeTab === "homestays" && (
        <div className="ep-homestays-grid" role="tabpanel">
          {stayOptions.length > 0 ? (
            stayOptions.map((opt, idx) => (
              <div
                key={opt.id || idx}
                className="ep-homestay-card"
                onClick={() =>
                  openBooking(
                    {
                      ...location,
                      selectedOption: opt,
                      name: `${opt.name} (${location.name})`,
                      price: opt.price || location.price,
                      unit: opt.unit || location.unit || "/night",
                    },
                    "place"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openBooking(
                      {
                        ...location,
                        selectedOption: opt,
                        name: `${opt.name} (${location.name})`,
                        price: opt.price || location.price,
                        unit: opt.unit || location.unit || "/night",
                      },
                      "place"
                    );
                  }
                }}
              >
                <div className="ep-homestay-header">
                  <div className="ep-homestay-tag-pill">
                    {opt.capacity ? `👥 ${opt.capacity}` : "Heritage Stay"}
                  </div>
                  <h4 className="ep-homestay-name">{opt.name}</h4>
                  <div className="ep-homestay-price-wrap">
                    <span className="ep-homestay-price">{opt.price || location.price}</span>
                    <span className="ep-homestay-unit">{opt.unit || location.unit || "/night"}</span>
                  </div>
                </div>

                {Array.isArray(opt.features) && opt.features.length > 0 && (
                  <ul className="ep-homestay-features">
                    {opt.features.map((feat, fIdx) => (
                      <li key={fIdx}>✓ {feat}</li>
                    ))}
                  </ul>
                )}

                <div className="ep-homestay-actions">
                  <button
                    type="button"
                    className="ep-homestay-book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking(
                        {
                          ...location,
                          selectedOption: opt,
                          name: `${opt.name} (${location.name})`,
                          price: opt.price || location.price,
                          unit: opt.unit || location.unit || "/night",
                        },
                        "place"
                      );
                    }}
                  >
                    <span>Book Stay</span>
                  </button>
                  <button
                    type="button"
                    className="ep-homestay-full-link ep-homestay-btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking(
                        {
                          ...location,
                          selectedOption: opt,
                          name: `${opt.name} (${location.name})`,
                          price: opt.price || location.price,
                          unit: opt.unit || location.unit || "/night",
                        },
                        "place"
                      );
                    }}
                  >
                    <span>Slideshow & Details →</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Fallback single homestay representation if stay_options is empty */
            <div
              className="ep-homestay-card"
              onClick={() => openBooking(location, "place")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openBooking(location, "place");
                }
              }}
            >
              <div className="ep-homestay-header">
                <div className="ep-homestay-tag-pill">👥 2 Guests</div>
                <h4 className="ep-homestay-name">{location.name}</h4>
                <div className="ep-homestay-price-wrap">
                  <span className="ep-homestay-price">{location.price || "₹2,200"}</span>
                  <span className="ep-homestay-unit">{location.unit || "/night"}</span>
                </div>
              </div>
              <ul className="ep-homestay-features">
                <li>✓ Mountain View Balcony</li>
                <li>✓ Organic Himalayan Breakfast</li>
                <li>✓ Hot Water & Fireplace</li>
              </ul>
              <div className="ep-homestay-actions">
                <button
                  type="button"
                  className="ep-homestay-book-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBooking(location, "place");
                  }}
                >
                  Book Stay
                </button>
                <button
                  type="button"
                  className="ep-homestay-full-link ep-homestay-btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBooking(location, "place");
                  }}
                >
                  Slideshow & Details →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Local Experiences */}
      {activeTab === "experiences" && (
        <div className="ep-experiences-subgrid" role="tabpanel">
          {loadingExtras ? (
            <p className="ep-sub-loading">Loading local experiences in {location.name}...</p>
          ) : experiences.length > 0 ? (
            experiences.map((exp) => (
              <div key={exp.id} className="ep-sub-exp-card">
                <img
                  src={exp.image || "/images/experiences/forest-walk.jpg"}
                  alt={exp.title}
                  className="ep-sub-exp-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/images/experiences/forest-walk.jpg";
                  }}
                />
                <div className="ep-sub-exp-body">
                  <div className="ep-sub-exp-meta">
                    <span>⏱️ {exp.duration}</span>
                    <span>⛰️ {exp.difficulty}</span>
                    <span>★ {exp.rating}</span>
                  </div>
                  <h4 className="ep-sub-exp-title">{exp.title}</h4>
                  <p className="ep-sub-exp-desc">{exp.description}</p>
                  <div className="ep-sub-exp-footer">
                    <span className="ep-sub-exp-price">
                      {exp.price} <small>{exp.unit || "per person"}</small>
                    </span>
                    <button
                      type="button"
                      className="ep-sub-exp-btn"
                      onClick={() => openBooking(exp, "experience")}
                    >
                      Book Experience
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ep-sub-empty">
              <p>No guided experiences currently scheduled in {location.name}. Check nearby valleys or contact a local host below.</p>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: Nearby Sights & Trails */}
      {activeTab === "nearby" && (
        <div className="ep-nearby-subgrid" role="tabpanel">
          {nearbyPlaces.length > 0 ? (
            nearbyPlaces.map((near, idx) => (
              <div key={near.id || idx} className="ep-sub-nearby-card">
                <img
                  src={near.image}
                  alt={near.name}
                  className="ep-sub-nearby-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
                  }}
                />
                <div className="ep-sub-nearby-body">
                  <span className="ep-sub-nearby-dist">📍 {near.distance}</span>
                  <h4 className="ep-sub-nearby-name">{near.name}</h4>
                  <p className="ep-sub-nearby-desc">{near.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="ep-sub-empty">
              <p>Explore hidden trails and water pools around {location.name} with a local mountain guide.</p>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 4: Local Guides & Hosts */}
      {activeTab === "guides" && (
        <div className="ep-guides-subgrid" role="tabpanel">
          {loadingExtras ? (
            <p className="ep-sub-loading">Loading local hosts in {location.name}...</p>
          ) : localsList.length > 0 ? (
            localsList.map((loc) => (
              <div key={loc.id} className="ep-sub-guide-card">
                <div className="ep-sub-guide-top">
                  <img
                    src={loc.image || "/images/locals/rahul.jpg"}
                    alt={loc.name}
                    className="ep-sub-guide-avatar"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/locals/rahul.jpg";
                    }}
                  />
                  <div>
                    <h4 className="ep-sub-guide-name">{loc.name}</h4>
                    <span className="ep-sub-guide-role">{loc.role}</span>
                    <span className="ep-sub-guide-lang">🗣️ {loc.lang}</span>
                  </div>
                </div>
                <p className="ep-sub-guide-bio">{loc.bio}</p>
                <div className="ep-sub-guide-footer">
                  <span className="ep-sub-guide-price">{loc.price} {loc.unit || "/day"}</span>
                  <button
                    type="button"
                    className="ep-sub-guide-btn"
                    onClick={() => openBooking(loc, "local")}
                  >
                    Contact Guide
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="ep-sub-empty">
              <p>Host for {location.name}: {location.host_name || "Community Host"}. You can inquire directly when booking your stay.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ==========================================
// 3. MAIN EXPLORE GRID CONTROLLER
// ==========================================
function ExploreDestinationsGrid({
  activeFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  searchQuery,
  onResetFilters,
  hoveredPlaceId,
  onHoverPlace,
  userLocation,
  onRequestLocation,
  onClearLocation,
  locationStatus,
  onDestinationsLoaded,
  selectedLocationId,
  onSelectLocationId,
}) {
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const expansionRef = useRef(null);

  // Sub-filters
  const [altitudeFilter, setAltitudeFilter] = useState("all");
  const [internalSelectedId, setInternalSelectedId] = useState(null);

  const effectiveSelectedId = selectedLocationId !== undefined ? selectedLocationId : internalSelectedId;

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setErrorState(false);
      const params = {};
      if (searchQuery && searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      if (activeFilter && activeFilter !== "all" && activeFilter !== "homestay" && activeFilter !== "campsite") {
        params.region = activeFilter;
      }

      const data = await getPlaces(params);
      if (Array.isArray(data) && data.length > 0) {
        setDestinations(data);
        if (onDestinationsLoaded) onDestinationsLoaded(data);
      } else if (!searchQuery && activeFilter === "all") {
        setDestinations(FALLBACK_DESTINATIONS);
        if (onDestinationsLoaded) onDestinationsLoaded(FALLBACK_DESTINATIONS);
      } else {
        let filtered = FALLBACK_DESTINATIONS;
        if (activeFilter !== "all") {
          filtered = filtered.filter((d) => d.region?.toLowerCase() === activeFilter.toLowerCase());
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
        if (onDestinationsLoaded) onDestinationsLoaded(filtered);
      }
    } catch (err) {
      console.warn("[Pahadily Explore] Backend places query notice:", err);
      setErrorState(true);
      setDestinations(FALLBACK_DESTINATIONS);
      if (onDestinationsLoaded) onDestinationsLoaded(FALLBACK_DESTINATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [activeFilter, searchQuery]);

  // Apply Altitude filter
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      if (altitudeFilter !== "all") {
        const altMeters = extractAltitudeMeters(dest.altitude);
        if (altitudeFilter === "low" && altMeters > 1800) return false;
        if (altitudeFilter === "mid" && (altMeters < 1800 || altMeters > 2500)) return false;
        if (altitudeFilter === "high" && altMeters <= 2500) return false;
      }
      return true;
    });
  }, [destinations, altitudeFilter]);

  // Sort locations
  const sorted = useMemo(() => {
    return [...filteredDestinations].sort((a, b) => {
      if (sortBy === "distance" && userLocation) {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lon, a.latitude, a.longitude) ?? 999999;
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lon, b.latitude, b.longitude) ?? 999999;
        return distA - distB;
      }
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price_low") return extractPriceNumber(a.price) - extractPriceNumber(b.price);
      if (sortBy === "price_high") return extractPriceNumber(b.price) - extractPriceNumber(a.price);
      if (sortBy === "altitude") return extractAltitudeMeters(b.altitude) - extractAltitudeMeters(a.altitude);
      return (b.reviews || 0) - (a.reviews || 0);
    });
  }, [filteredDestinations, sortBy, userLocation]);

  // Current selected location to display homestays below
  const selectedLocation = useMemo(() => {
    if (!effectiveSelectedId) return null;
    return destinations.find((d) => d.id === effectiveSelectedId) || null;
  }, [destinations, effectiveSelectedId]);

  const handleSelectLocation = (loc) => {
    const nextId = effectiveSelectedId === loc.id ? null : loc.id;
    if (onSelectLocationId) {
      onSelectLocationId(nextId);
    } else {
      setInternalSelectedId(nextId);
    }
    if (nextId) {
      setTimeout(() => {
        if (expansionRef.current) {
          expansionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  };

  const hasActiveFilters =
    activeFilter !== "all" ||
    searchQuery ||
    altitudeFilter !== "all" ||
    userLocation !== null;

  return (
    <div className="ep-grid-section">
      {/* Network Alert (if offline/fallback) */}
      {errorState && (
        <div className="ep-network-banner" role="alert">
          <span>⚠️ Showing cached Himalayan travel destinations.</span>
          <button type="button" className="ep-retry-btn" onClick={fetchPlaces}>
            Retry Live Connection
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="ep-grid-header">
        <div className="ep-grid-title-box">
          <div className="ep-grid-badge">
            <span className="ep-grid-dot"></span>
            <span>
              {sorted.length} Travel Locations Available
            </span>
          </div>
          <h2 className="ep-grid-title">
            {activeFilter !== "all"
              ? `Travel Locations in ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Valley`
              : "Himalayan Travel Locations"}
          </h2>
          <p className="ep-grid-instruction-note">
            💡 Click on any travel location to see its verified homestays, guided treks, and local hosts below.
          </p>
        </div>

        <div className="ep-grid-controls">
          {/* GPS Distance Button */}
          <button
            type="button"
            className={`ep-geoloc-btn${userLocation ? " active" : ""}`}
            onClick={userLocation ? onClearLocation : onRequestLocation}
            title={
              userLocation
                ? "Location enabled. Click to clear."
                : "Enable GPS location to calculate real distance"
            }
            aria-label="Calculate distance from your location"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>{userLocation ? "📍 Near Me (Active)" : "📍 Distance From Me"}</span>
            {userLocation && (
              <span
                className="ep-geoloc-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearLocation();
                }}
              >
                ✕
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="ep-sort-select-wrap">
            <label htmlFor="ep-sort" className="ep-sort-label">Sort:</label>
            <select
              id="ep-sort"
              className="ep-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort travel locations"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              {userLocation && <option value="distance">Nearest to You 📍</option>}
              <option value="price_low">Budget: Low to High</option>
              <option value="price_high">Budget: High to Low</option>
              <option value="altitude">Highest Altitude ⛰️</option>
            </select>
            <span className="ep-sort-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="ep-view-toggle" role="group" aria-label="View layout mode">
            <button
              type="button"
              className={`ep-view-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view layout"
              title="Grid view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
              aria-label="List view layout"
              title="List view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

      {/* Altitude Sub-Filter Bar */}
      <div className="ep-secondary-filter-bar">
        <div className="ep-filter-pill-group">
          <span className="ep-filter-group-label">Altitude Terrain:</span>
          {[
            { id: "all", label: "All Altitudes" },
            { id: "low", label: "Pine Valleys (<1,800m)" },
            { id: "mid", label: "Alpine (1,800–2,500m)" },
            { id: "high", label: "High Pass (2,500m+)" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={`ep-subfilter-pill${altitudeFilter === pill.id ? " active" : ""}`}
              onClick={() => setAltitudeFilter(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="ep-active-chips-row" aria-label="Active filters">
          <span className="ep-active-chips-title">Active:</span>

          {searchQuery && (
            <span className="ep-active-chip">
              Search: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                className="ep-chip-remove"
                onClick={() => (onResetFilters ? onResetFilters({ clearQueryOnly: true }) : null)}
                aria-label="Remove search filter"
              >
                ✕
              </button>
            </span>
          )}

          {activeFilter !== "all" && (
            <span className="ep-active-chip">
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Valley
              <button
                type="button"
                className="ep-chip-remove"
                onClick={() => (onResetFilters ? onResetFilters({ clearRegionOnly: true }) : null)}
                aria-label="Remove region filter"
              >
                ✕
              </button>
            </span>
          )}

          {altitudeFilter !== "all" && (
            <span className="ep-active-chip">
              Terrain: {altitudeFilter}
              <button
                type="button"
                className="ep-chip-remove"
                onClick={() => setAltitudeFilter("all")}
                aria-label="Remove altitude filter"
              >
                ✕
              </button>
            </span>
          )}

          {userLocation && (
            <span className="ep-active-chip">
              📍 GPS Distance
              <button
                type="button"
                className="ep-chip-remove"
                onClick={onClearLocation}
                aria-label="Clear GPS location"
              >
                ✕
              </button>
            </span>
          )}

          <button
            type="button"
            className="ep-clear-all-btn"
            onClick={() => {
              setAltitudeFilter("all");
              if (onClearLocation) onClearLocation();
              if (onResetFilters) onResetFilters();
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Geolocation Status Notice */}
      {locationStatus && (
        <div className="ep-geoloc-notice">
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Travel Locations Grid */}
      {loading ? (
        <div className="ep-skeleton-grid" aria-busy="true" aria-label="Loading travel locations">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="ep-skeleton-card">
              <div className="ep-skeleton-img" />
              <div className="ep-skeleton-body">
                <div className="ep-skeleton-line short" />
                <div className="ep-skeleton-line title" />
                <div className="ep-skeleton-line" />
                <div className="ep-skeleton-line footer" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="ep-empty-state" role="status">
          <div className="ep-empty-icon" aria-hidden="true">🏔️</div>
          <h3>No travel locations match your criteria</h3>
          <p>
            {searchQuery
              ? `No travel locations found matching "${searchQuery}". Try broadening your search or resetting filters.`
              : "Try adjusting your valley or altitude filters to discover available travel destinations."}
          </p>

          <button
            type="button"
            className="ep-reset-btn"
            onClick={() => {
              setAltitudeFilter("all");
              if (onResetFilters) onResetFilters();
            }}
          >
            Reset All Filters & Show All Locations
          </button>
        </div>
      ) : (
        <div className={`ep-stays-grid${viewMode === "list" ? " list-layout" : ""}`}>
          {sorted.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              isSelected={effectiveSelectedId === loc.id}
              onSelect={handleSelectLocation}
              userLocation={userLocation}
              isHovered={hoveredPlaceId === loc.id}
              onHover={onHoverPlace}
              onLeave={() => onHoverPlace && onHoverPlace(null)}
            />
          ))}
        </div>
      )}

      {/* =========================================================================
          HOMESTAYS AND OTHER SERVICES (Rendered Directly Below Travel Locations)
          ========================================================================= */}
      {selectedLocation && (
        <div ref={expansionRef} className="ep-location-expansion-anchor">
          <LocationDetailsSection
            location={selectedLocation}
            onClose={() => {
              if (onSelectLocationId) {
                onSelectLocationId(null);
              } else {
                setInternalSelectedId(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ExploreDestinationsGrid;
