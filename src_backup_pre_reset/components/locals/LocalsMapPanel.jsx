import { useState } from "react";

const LOCAL_MAP_PINS = [
  { id: "manali", name: "Manali", x: 62, y: 18, count: "28 locals" },
  { id: "spiti", name: "Spiti", x: 82, y: 22, count: "12 locals" },
  { id: "kullu", name: "Kullu", x: 42, y: 38, count: "18 locals" },
  { id: "kasol", name: "Kasol", x: 30, y: 52, count: "8 locals" },
  { id: "jibhi", name: "Jibhi", x: 54, y: 60, count: "21 locals" },
  { id: "tirthan", name: "Tirthan", x: 44, y: 74, count: "19 locals" },
  { id: "pangi", name: "Pangi", x: 22, y: 16, count: "6 locals" },
];

const POPULAR_DESTINATIONS = [
  { id: "tirthan", label: "Tirthan Valley", count: "19 locals", img: "/images/destinations/tirthan-valley.jpg" },
  { id: "jibhi", label: "Jibhi", count: "21 locals", img: "/images/destinations/jibhi.jpg" },
  { id: "kasol", label: "Kasol", count: "8 locals", img: "/images/destinations/kasol.jpg" },
  { id: "manali", label: "Manali", count: "28 locals", img: "/images/destinations/spiti-valley.jpg" },
];

const LEGEND_ITEMS = [
  { label: "Companions", color: "#8b34a3" },
  { label: "Trek Guides", color: "#1a5c9f" },
  { label: "Food Hosts", color: "#c07028" },
  { label: "Drivers", color: "#2b5226" },
  { label: "Storytellers", color: "#7c4a0a" },
  { label: "Photographers", color: "#b03060" },
];

function LocalsMapPanel({ activeRegion, onSelectRegion }) {
  const [activePin, setActivePin] = useState(null);
  const [mapView, setMapView] = useState("map");
  const [zoomLevel, setZoomLevel] = useState(1);

  const handlePinClick = (pinId) => {
    setActivePin(activePin === pinId ? null : pinId);
    if (onSelectRegion) {
      onSelectRegion(pinId);
    }
  };

  const handleZoom = (direction) => {
    if (direction === "in" && zoomLevel < 1.4) {
      setZoomLevel((prev) => Math.min(prev + 0.15, 1.4));
    } else if (direction === "out" && zoomLevel > 0.85) {
      setZoomLevel((prev) => Math.max(prev - 0.15, 0.85));
    } else if (direction === "reset") {
      setZoomLevel(1);
    }
  };

  return (
    <div className="locals-sidebar">
      {/* ── MAP PANEL ── */}
      <div className="ep-map-panel locals-map-panel">
        <div className="ep-map-header">
          <div className="ep-map-view-toggle">
            <button
              className={"ep-map-tab" + (mapView === "map" ? " active" : "")}
              onClick={() => setMapView("map")}
            >
              Interactive Map
            </button>
            <button
              className={"ep-map-tab" + (mapView === "list" ? " active" : "")}
              onClick={() => setMapView("list")}
            >
              List View
            </button>
          </div>
          <span className="locals-map-badge">
            <span className="live-dot"></span> 150+ Verified
          </span>
        </div>

        <div className="ep-map-body">
          {mapView === "map" ? (
            <div
              className="ep-map-container"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}
            >
              {/* SVG map background */}
              <div className="ep-map-topo">
                <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
                  <defs>
                    <linearGradient id="localsTopoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c8dbc0" />
                      <stop offset="35%" stopColor="#b8d4c8" />
                      <stop offset="65%" stopColor="#a4c4b0" />
                      <stop offset="100%" stopColor="#d4e8d0" />
                    </linearGradient>
                    <linearGradient id="localsSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e8f4f0" />
                      <stop offset="100%" stopColor="#c8dce8" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="320" fill="url(#localsTopoGrad)" />
                  <path d="M0 60 Q80 40 160 55 Q240 70 320 50 Q360 42 400 48" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                  <path d="M0 90 Q60 75 140 85 Q230 95 310 78 Q370 68 400 75" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <path d="M0 120 Q100 110 180 120 Q260 130 340 112 Q380 104 400 110" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <path d="M0 150 Q80 138 200 148 Q300 158 400 142" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                  <path d="M0 180 Q120 168 200 178 Q280 188 400 175" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <polygon points="280,0 340,60 220,60" fill="url(#localsSnowGrad)" opacity="0.7" />
                  <polygon points="320,0 380,50 260,50" fill="url(#localsSnowGrad)" opacity="0.55" />
                  <path d="M20 80 Q60 100 80 140 Q100 180 140 200 Q180 220 200 280" fill="none" stroke="#6ab4d0" strokeWidth="2.5" opacity="0.6" />
                  <text x="140" y="150" fill="rgba(30,60,40,0.55)" fontSize="11" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="1">
                    HIMACHAL PRADESH
                  </text>
                  <text x="20" y="240" fill="rgba(30,60,40,0.4)" fontSize="9" fontFamily="Plus Jakarta Sans, sans-serif">
                    Punjab
                  </text>
                  <text x="310" y="305" fill="rgba(30,60,40,0.4)" fontSize="9" fontFamily="Plus Jakarta Sans, sans-serif">
                    Uttarakhand
                  </text>
                </svg>
              </div>

              {/* Map Pins */}
              {LOCAL_MAP_PINS.map((pin) => {
                const isSelected = activeRegion === pin.id || activePin === pin.id;
                return (
                  <button
                    key={pin.id}
                    type="button"
                    className={"map-pin locals-map-pin" + (isSelected ? " map-pin-active" : "")}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    onClick={() => handlePinClick(pin.id)}
                    title={`${pin.name}: ${pin.count}`}
                    aria-label={`${pin.name}: ${pin.count}`}
                  >
                    <span className="locals-pin-bubble">
                      <span className="locals-pin-avatar" />
                      <span className="locals-pin-name">{pin.name}</span>
                      <span className="locals-pin-count">{pin.count}</span>
                    </span>
                  </button>
                );
              })}

              {/* Zoom controls */}
              <div className="ep-map-zoom">
                <button
                  type="button"
                  className="ep-map-zoom-btn"
                  aria-label="Zoom in"
                  onClick={() => handleZoom("in")}
                >
                  +
                </button>
                <button
                  type="button"
                  className="ep-map-zoom-btn"
                  aria-label="Zoom out"
                  onClick={() => handleZoom("out")}
                >
                  -
                </button>
                <button
                  type="button"
                  className="ep-map-zoom-btn"
                  aria-label="Reset zoom"
                  onClick={() => handleZoom("reset")}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="ep-map-list">
              {LOCAL_MAP_PINS.map((pin) => (
                <div
                  key={pin.id}
                  className={"ep-map-list-item" + (activeRegion === pin.id ? " active" : "")}
                  onClick={() => onSelectRegion && onSelectRegion(pin.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="ep-map-list-dot" style={{ background: "#2b7050" }} />
                  <span className="ep-map-list-name">{pin.name}</span>
                  <span className="ep-map-list-type">{pin.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="ep-map-legend locals-map-legend">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="ep-map-legend-item">
              <span className="ep-map-legend-dot" style={{ background: item.color }} />
              <span className="ep-map-legend-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY TRAVEL WITH LOCALS ── */}
      <div className="locals-why-card">
        <div className="locals-why-img-wrap">
          <img src="/images/destinations/tirthan-valley.jpg" alt="Trek with local guide" className="locals-why-img" />
          <div className="locals-why-img-overlay" />
          <div className="locals-why-badge">
            <span>SAFE · LOCAL · AUTHENTIC</span>
          </div>
        </div>
        <div className="locals-why-body">
          <h3 className="locals-why-title">
            Why Travel<br />with Locals?
          </h3>
          <ul className="locals-why-list">
            {[
              "Hidden places & secret mountain trails",
              "Authentic home cooked Pahadi food",
              "100% direct support to native hosts",
              "Slow, respectful, and safe travel",
              "Verified identity and mountain expertise",
            ].map((item) => (
              <li key={item} className="locals-why-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2b7050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── POPULAR DESTINATIONS ── */}
      <div className="locals-popular-destinations">
        <h3 className="locals-popular-title">Popular Hubs for Local Hosts</h3>
        <p className="locals-popular-subtitle">Click to filter hosts by valley</p>
        <div className="locals-popular-grid">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className={"locals-popular-card" + (activeRegion === dest.id ? " selected" : "")}
              onClick={() => onSelectRegion && onSelectRegion(dest.id)}
              role="button"
              tabIndex={0}
            >
              <img src={dest.img} alt={dest.label} className="locals-popular-img" />
              <div className="locals-popular-overlay" />
              <div className="locals-popular-info">
                <span className="locals-popular-name">{dest.label}</span>
                <span className="locals-popular-count">{dest.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LocalsMapPanel;
