import { useState } from "react";

const REGIONS = [
  { id: "all", label: "All Regions", count: "43 locals", img: null },
  { id: "kullu", label: "Kullu", count: "18 locals", img: "/images/destinations/parvati-valley.jpg" },
  { id: "manali", label: "Manali", count: "28 locals", img: "/images/destinations/spiti-valley.jpg" },
  { id: "tirthan", label: "Tirthan Valley", count: "19 locals", img: "/images/destinations/tirthan-valley.jpg" },
  { id: "jibhi", label: "Jibhi", count: "21 locals", img: "/images/destinations/jibhi.jpg" },
  { id: "kasol", label: "Kasol", count: "8 locals", img: "/images/destinations/kasol.jpg" },
  { id: "pangi", label: "Pangi Valley", count: "6 locals", img: "/images/destinations/pangi-valley.jpg" },
  { id: "spiti", label: "Spiti Valley", count: "12 locals", img: "/images/destinations/spiti-valley.jpg" },
];

function LocalsRegionFilter({ activeRegion, setActiveRegion }) {
  return (
    <div className="locals-region-filter section-container">
      <div className="locals-region-header">
        <h2 className="locals-region-title">Find Locals by Region</h2>
        <p className="locals-region-subtitle">Explore locals available in different regions of Himachal.</p>
      </div>
      <div className="locals-region-scroll">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={"locals-region-chip" + (activeRegion === r.id ? " active" : "")}
            onClick={() => setActiveRegion(r.id)}
            aria-pressed={activeRegion === r.id}
          >
            {r.img ? (
              <img src={r.img} alt={r.label} className="locals-region-chip-img" />
            ) : (
              <span className="locals-region-chip-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/>
                </svg>
              </span>
            )}
            <span className="locals-region-chip-label">{r.label}</span>
            <span className="locals-region-chip-count">{r.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocalsRegionFilter;
