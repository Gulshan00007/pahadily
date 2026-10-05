import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getExperiences } from "../../lib/api";

const FALLBACK_EXPERIENCES = [
  {
    id: 1,
    title: "Hidden Cedar Forest Walk",
    location: "Jibhi, Himachal Pradesh",
    duration: "2–3 hours",
    difficulty: "Easy",
    price: "₹500",
    unit: "per person",
    guide: "With Rahul (Local Guide)",
    rating: 4.8,
    reviews: 120,
    image: "/images/experiences/forest-walk.jpg",
    category: "nature",
  },
  {
    id: 2,
    title: "Authentic Himachali Home Meal",
    location: "Kullu, Himachal Pradesh",
    duration: "2 hours",
    difficulty: "Food Experience",
    price: "₹350",
    unit: "per person",
    guide: "With Sushma (Local Host)",
    rating: 4.9,
    reviews: 86,
    image: "/images/experiences/home-meal.jpg",
    category: "food",
  },
  {
    id: 3,
    title: "Sunrise Viewpoint Ridge Trek",
    location: "Jibhi, Himachal Pradesh",
    duration: "3–4 hours",
    difficulty: "Moderate",
    price: "₹700",
    unit: "per person",
    guide: "With Aman (Local Guide)",
    rating: 4.7,
    reviews: 64,
    image: "/images/experiences/sunrise-trek.jpg",
    category: "adventure",
  },
  {
    id: 4,
    title: "Village Life & Handloom Walk",
    location: "Tirthan Valley, Himachal Pradesh",
    duration: "2–3 hours",
    difficulty: "Cultural",
    price: "₹450",
    unit: "per person",
    guide: "With Meena (Local Host)",
    rating: 4.8,
    reviews: 92,
    image: "/images/experiences/village-walk.jpg",
    category: "culture",
  },
  {
    id: 5,
    title: "Riverside Camping & Stargazing",
    location: "Tirthan Valley, Himachal Pradesh",
    duration: "1 Night",
    difficulty: "Camping",
    price: "₹1,200",
    unit: "per person",
    guide: "With Karan (Local Guide)",
    rating: 4.8,
    reviews: 48,
    image: "/images/experiences/riverside-camp.jpg",
    category: "adventure",
  },
];

function LocationIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12m0 0C12 6 6 4 3 8c3 0 6 1 9 4zm0 0c0-6 6-8 9-4-3 0-6 1-9 4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon({ liked }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "#e74c3c" : "none"} stroke={liked ? "#e74c3c" : "rgba(255,255,255,0.9)"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ExperienceCard({ exp }) {
  const [liked, setLiked] = useState(false);
  const { openBooking } = useAuth();

  const guideInitial = (exp.guide || "Host").replace("With ", "").charAt(0).toUpperCase();

  return (
    <article className="exp-card">
      <div className="exp-card-img-wrap">
        <img src={exp.image || "/images/experiences/forest-walk.jpg"} alt={exp.title} className="exp-card-img" />
        <div className="exp-card-img-gradient" />
      </div>

      <button
        className={"exp-card-heart" + (liked ? " liked" : "")}
        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon liked={liked} />
      </button>

      <div className="exp-card-body">
        <h3 className="exp-card-title">{exp.title}</h3>

        <div className="exp-card-meta">
          <span className="exp-card-meta-item">
            <LocationIcon /> {exp.location}
          </span>
        </div>

        <div className="exp-card-tags-row">
          <span className="exp-card-tag-chip">
            <ClockIcon /> {exp.duration}
          </span>
          <span className="exp-card-tag-chip">
            <LeafIcon /> {exp.difficulty}
          </span>
        </div>

        <div className="exp-card-footer">
          <div className="exp-card-guide-row">
            <div className="exp-guide-avatar">
              {guideInitial}
            </div>
            <div className="exp-card-guide-info">
              <span className="exp-card-guide-name">{exp.guide}</span>
              <div className="exp-card-rating">
                <StarIcon />
                <span className="exp-rating-num">{exp.rating || 4.8}</span>
                <span className="exp-rating-count">({exp.reviews || 20})</span>
              </div>
            </div>
          </div>

          <div className="exp-card-action-col">
            <div className="exp-card-price-wrap">
              <span className="exp-card-price">{exp.price}</span>
              <span className="exp-card-price-unit">/{exp.unit?.replace("per ", "") || "person"}</span>
            </div>

            <button
              type="button"
              className="btn-book-exp-card"
              onClick={() => openBooking(exp, "experience")}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturedExperiences() {
  const [experiences, setExperiences] = useState(FALLBACK_EXPERIENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperiences() {
      try {
        setLoading(true);
        const data = await getExperiences();
        if (data && data.length > 0) {
          setExperiences(data);
        }
      } catch (err) {
        console.warn("Using fallback experiences:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExperiences();
  }, []);

  return (
    <section className="featured-exp-section section-container">
      <div className="featured-exp-header">
        <div>
          <h2 className="featured-exp-title">Featured Mountain Experiences</h2>
          <p className="featured-exp-subtitle">Handpicked slow journeys and trails guided by native locals</p>
        </div>
        <a href="#browse-all" className="view-all-btn" aria-label="View all experiences">
          Explore All ({experiences.length}) <span className="btn-arrow">↓</span>
        </a>
      </div>

      <div className="featured-exp-grid">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedExperiences;
