import { useState } from "react";

const LOCAL_FILTERS = [
  { id: "all", label: "All", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: "companions", label: "Local Companions", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: "trek-guides", label: "Trek Guides", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg> },
  { id: "food-hosts", label: "Food Hosts", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { id: "drivers", label: "Drivers", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v3h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { id: "storytellers", label: "Storytellers", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { id: "photographers", label: "Photographers", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
];

function LocalsHero({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }) {
  return (
    <div className="locals-hero">
      <div className="locals-hero-bg" style={{ backgroundImage: "url('/images/locals/hero-bg.jpg')" }}>
        <div className="locals-hero-overlay" />
      </div>

      {/* Script note */}
      <div className="locals-hero-script-note" aria-hidden="true">
        <span>Real People</span>
        <span>Real Stories</span>
        <span>Real Himalayas</span>
      </div>

      <div className="locals-hero-content section-container">
        <span className="locals-hero-eyebrow">LOCALS</span>
        <h1 className="locals-hero-title">
          Meet the People<br />
          <span className="locals-hero-title-accent">Behind the Mountains</span>
        </h1>
        <p className="locals-hero-subtitle">
          Discover Himachal through people who live here,<br />
          know these places, and love sharing them.
        </p>

        <div className="locals-search-wrap">
          <form
            className="explore-search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.querySelector(".locals-content-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="explore-search-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a7060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search guides, companions, drivers, storytellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search locals"
            />
            {searchQuery && (
              <button
                type="button"
                className="explore-search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button type="submit" className="explore-search-btn">Search</button>
          </form>
        </div>

        <div className="explore-filter-tabs" role="tablist">
          {LOCAL_FILTERS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeFilter === tab.id}
              className={"explore-filter-tab" + (activeFilter === tab.id ? " active" : "")}
              onClick={() => setActiveFilter(tab.id)}
            >
              <span className="filter-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LocalsHero;
