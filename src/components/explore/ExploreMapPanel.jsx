import { useState } from "react";

const MAP_PINS = [
  { id: "pangi", name: "Pangi Valley", x: 62, y: 10, type: "trek" },
  { id: "spiti", name: "Spiti Valley", x: 82, y: 18, type: "place" },
  { id: "kasol", name: "Kasol", x: 30, y: 44, type: "homestay" },
  { id: "jibhi", name: "Jibhi", x: 52, y: 50, type: "place" },
  { id: "parvati", name: "Parvati Valley", x: 78, y: 55, type: "local" },
  { id: "tirthan", name: "Tirthan Valley", x: 42, y: 68, type: "trek" },
];

const PIN_COLORS = {
  place: "#2b7050",
  trek: "#1a5c9f",
  homestay: "#c07028",
  local: "#8b34a3",
};

function MapPin({ pin, active, onClick }) {
  const color = PIN_COLORS[pin.type] || "#2b7050";
  return (
    <button
      className={`map-pin${active ? " map-pin-active" : ""}`}
      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
      onClick={() => onClick(pin.id)}
      aria-label={`${pin.name} on map`}
      title={pin.name}
    >
      <span className="map-pin-dot" style={{ background: color }} />
      <span className="map-pin-label">{pin.name}</span>
    </button>
  );
}

function ExploreMapPanel() {
  const [activePin, setActivePin] = useState(null);
  const [mapView, setMapView] = useState("map");

  const handlePin = (id) => setActivePin(activePin === id ? null : id);

  return (
    <div className="ep-map-panel">
      {/* Map Header */}
      <div className="ep-map-header">
        <div className="ep-map-view-toggle" role="group" aria-label="Map view toggle">
          <button
            className={`ep-map-tab${mapView === "map" ? " active" : ""}`}
            onClick={() => setMapView("map")}
          >Map</button>
          <button
            className={`ep-map-tab${mapView === "list" ? " active" : ""}`}
            onClick={() => setMapView("list")}
          >List</button>
        </div>
        <button className="ep-map-fullscreen" aria-label="View in fullscreen">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          View in Fullscreen
        </button>
      </div>

      {/* Map Body */}
      <div className="ep-map-body">
        {mapView === "map" ? (
          <div className="ep-map-container">
            {/* Topographic map background */}
            <div className="ep-map-topo">
              <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
                <defs>
                  <linearGradient id="topoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c8dbc0"/>
                    <stop offset="35%" stopColor="#b8d4c8"/>
                    <stop offset="65%" stopColor="#a4c4b0"/>
                    <stop offset="100%" stopColor="#d4e8d0"/>
                  </linearGradient>
                  <linearGradient id="snowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e8f4f0"/>
                    <stop offset="100%" stopColor="#c8dce8"/>
                  </linearGradient>
                </defs>
                {/* Background */}
                <rect width="400" height="320" fill="url(#topoGrad)" rx="0"/>
                {/* Topo contour lines */}
                <path d="M0 60 Q80 40 160 55 Q240 70 320 50 Q360 42 400 48" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
                <path d="M0 90 Q60 75 140 85 Q230 95 310 78 Q370 68 400 75" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <path d="M0 120 Q100 110 180 120 Q260 130 340 112 Q380 104 400 110" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                <path d="M0 150 Q80 138 200 148 Q300 158 400 142" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
                <path d="M0 180 Q120 168 200 178 Q280 188 400 175" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                <path d="M0 210 Q100 200 200 208 Q300 218 400 205" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
                <path d="M0 240 Q150 232 250 240 Q330 248 400 235" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                {/* Snow-capped peaks top right */}
                <polygon points="280,0 340,60 220,60" fill="url(#snowGrad)" opacity="0.7"/>
                <polygon points="320,0 380,50 260,50" fill="url(#snowGrad)" opacity="0.55"/>
                <polygon points="360,0 400,40 310,40" fill="url(#snowGrad)" opacity="0.5"/>
                {/* Rivers */}
                <path d="M20 80 Q60 100 80 140 Q100 180 140 200 Q180 220 200 280" fill="none" stroke="#6ab4d0" strokeWidth="2.5" opacity="0.6"/>
                <path d="M260 30 Q280 70 290 110 Q300 150 320 200" fill="none" stroke="#6ab4d0" strokeWidth="2" opacity="0.5"/>
                {/* Region label */}
                <text x="155" y="155" fill="rgba(30,60,40,0.55)" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="2">HIMACHAL PRADESH</text>
                <text x="24" y="240" fill="rgba(30,60,40,0.4)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">Punjab</text>
                <text x="320" y="300" fill="rgba(30,60,40,0.4)" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">Uttarakhand</text>
              </svg>
            </div>

            {/* Pins */}
            {MAP_PINS.map((pin) => (
              <MapPin
                key={pin.id}
                pin={pin}
                active={activePin === pin.id}
                onClick={handlePin}
              />
            ))}

            {/* Zoom controls */}
            <div className="ep-map-zoom">
              <button className="ep-map-zoom-btn" aria-label="Zoom in">+</button>
              <button className="ep-map-zoom-btn" aria-label="Zoom out">-</button>
              <button className="ep-map-zoom-btn" aria-label="My location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="ep-map-list">
            {MAP_PINS.map((pin) => (
              <div key={pin.id} className="ep-map-list-item">
                <span className="ep-map-list-dot" style={{ background: PIN_COLORS[pin.type] }} />
                <span className="ep-map-list-name">{pin.name}</span>
                <span className="ep-map-list-type">{pin.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="ep-map-legend">
        {Object.entries(PIN_COLORS).map(([type, color]) => (
          <div key={type} className="ep-map-legend-item">
            <span className="ep-map-legend-dot" style={{ background: color }} />
            <span className="ep-map-legend-label">{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreMapPanel;
