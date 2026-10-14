const CATEGORIES = [
  {
    id: "nature",
    label: "Nature & Trails",
    bg: "#f0f7ec",
    iconColor: "#4a8c5c",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12m0 0C12 6 6 4 3 8c3 0 6 1 9 4zm0 0c0-6 6-8 9-4-3 0-6 1-9 4" />
      </svg>
    ),
  },
  {
    id: "village",
    label: "Village Life",
    bg: "#fdf4e7",
    iconColor: "#c07a2a",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />
      </svg>
    ),
  },
  {
    id: "food",
    label: "Local Food",
    bg: "#fef3e8",
    iconColor: "#d4762a",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    id: "adventure",
    label: "Adventure",
    bg: "#edf3fb",
    iconColor: "#3a6fb5",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  {
    id: "culture",
    label: "Culture & Traditions",
    bg: "#f3eefb",
    iconColor: "#7c57b8",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="22" x2="22" y2="22" />
        <path d="M6 18V10M10 18V10M14 18V10M18 18V10" />
        <path d="M2 10l10-8 10 8" />
      </svg>
    ),
  },
  {
    id: "photography",
    label: "Photography",
    bg: "#edfbf3",
    iconColor: "#2a8c60",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
];

function ExploreByExperience({ activeFilter, setActiveFilter }) {
  const handleCategoryClick = (catId) => {
    if (setActiveFilter) {
      setActiveFilter(catId);
      const el = document.querySelector(".featured-exp-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="exp-by-category-section section-container">
      <div className="exp-by-category-header">
        <h2 className="exp-by-category-title">Explore by Experience</h2>
        <p className="exp-by-category-subtitle">Find the kind of experience that speaks to you</p>
      </div>

      <div className="exp-category-grid">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`exp-category-card${isActive ? " active" : ""}`}
              style={{
                backgroundColor: cat.bg,
                outline: isActive ? `2px solid ${cat.iconColor}` : "none",
              }}
              onClick={() => handleCategoryClick(cat.id)}
              aria-label={`Explore ${cat.label} experiences`}
            >
              <span className="exp-category-icon" style={{ color: cat.iconColor }}>
                {cat.icon}
              </span>
              <span className="exp-category-label" style={{ color: cat.iconColor }}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ExploreByExperience;
