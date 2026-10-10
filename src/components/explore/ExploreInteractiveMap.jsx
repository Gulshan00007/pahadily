import { useState, useMemo, useEffect, useRef } from "react";

// Geographically accurate projections for Himachal Pradesh and its core sanctuaries
// Core sanctuary bounding box (Central Himachal Pradesh: Kullu, Parvati, Tirthan, Sainj, Upper Beas):
// Lat: ~31.52° N to 32.26° N
// Lon: ~76.96° E to 77.54° E
function projectSanctuaryValley(lat, lon) {
  if (lat == null || lon == null) return null;
  const minLat = 31.52;
  const maxLat = 32.26;
  const minLon = 76.96;
  const maxLon = 77.54;

  const rawX = ((lon - minLon) / (maxLon - minLon)) * 78 + 11;
  const rawY = ((maxLat - lat) / (maxLat - minLat)) * 76 + 12;

  const x = Math.max(9, Math.min(91, Math.round(rawX * 10) / 10));
  const y = Math.max(10, Math.min(90, Math.round(rawY * 10) / 10));
  return { x, y };
}

// Statewide Himachal Pradesh projection:
// Lat: ~30.40° N to 33.30° N
// Lon: ~75.50° E to 79.10° E
function projectHimachalState(lat, lon) {
  if (lat == null || lon == null) return null;
  const minLat = 30.40;
  const maxLat = 33.30;
  const minLon = 75.50;
  const maxLon = 79.10;

  const rawX = ((lon - minLon) / (maxLon - minLon)) * 82 + 9;
  const rawY = ((maxLat - lat) / (maxLat - minLat)) * 80 + 10;

  const x = Math.max(8, Math.min(92, Math.round(rawX * 10) / 10));
  const y = Math.max(8, Math.min(92, Math.round(rawY * 10) / 10));
  return { x, y };
}

// Cluster color scheme
const CLUSTER_COLORS = {
  tirthan: { bg: "#1b4d3e", text: "#e8f5ed", border: "#2f725a", glow: "rgba(27, 77, 62, 0.45)" },
  jibhi: { bg: "#255c47", text: "#e8f5ed", border: "#398065", glow: "rgba(37, 92, 71, 0.45)" },
  shangarh: { bg: "#2d6a4f", text: "#ecfdf5", border: "#40916c", glow: "rgba(45, 106, 79, 0.45)" },
  kalga: { bg: "#b45309", text: "#fef3c7", border: "#d97706", glow: "rgba(180, 83, 9, 0.45)" },
  chalal: { bg: "#9a3412", text: "#ffedd5", border: "#c2410c", glow: "rgba(154, 52, 18, 0.45)" },
  waichin: { bg: "#854d0e", text: "#fef9c3", border: "#a16207", glow: "rgba(133, 77, 14, 0.45)" },
  naggar: { bg: "#6b21a8", text: "#f3e8ff", border: "#8b5cf6", glow: "rgba(107, 33, 168, 0.45)" },
  "lug-valley": { bg: "#155e75", text: "#ecfeff", border: "#0891b2", glow: "rgba(21, 94, 117, 0.45)" },
};

function getClusterColor(id) {
  return CLUSTER_COLORS[id] || { bg: "#1e4635", text: "#eaf3ee", border: "#2d6b53", glow: "rgba(30, 70, 53, 0.4)" };
}

function ExploreInteractiveMap({
  destinations = [],
  allDestinationsCount = 8,
  activeValleyId = "all",
  onSelectValley,
  onBookFlagshipStay,
  selectedLocationId,
  onSelectLocationId,
  hoveredPlaceId,
  onHoverPlace,
  isSplitView = false,
  className = "",
  onToggleFullscreen,
}) {
  const [mapScope, setMapScope] = useState("valley-topo"); // "valley-topo" | "himachal-wide"
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePinId, setActivePinId] = useState(selectedLocationId || null);
  const [userGps, setUserGps] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [filterElevation, setFilterElevation] = useState("all"); // "all" | "low" (<2000m) | "high" (>=2000m)
  const mapContainerRef = useRef(null);

  // Sync external selected ID
  useEffect(() => {
    if (selectedLocationId) {
      setActivePinId(selectedLocationId);
    }
  }, [selectedLocationId]);

  // Sync hovered destination from outside
  useEffect(() => {
    if (hoveredPlaceId && !activePinId) {
      // transient highlight without locking popup
    }
  }, [hoveredPlaceId, activePinId]);

  // Handle elevation filter
  const displayedDestinations = useMemo(() => {
    if (filterElevation === "all") return destinations;
    return destinations.filter((d) => {
      const match = (d.elevation || "").match(/[\d,]+/);
      const elev = match ? parseInt(match[0].replace(/,/g, ""), 10) : 2000;
      if (filterElevation === "low") return elev < 2000;
      if (filterElevation === "high") return elev >= 2000;
      return true;
    });
  }, [destinations, filterElevation]);

  // Projected pins
  const mappedPins = useMemo(() => {
    return displayedDestinations.map((d) => {
      const coords =
        mapScope === "valley-topo"
          ? projectSanctuaryValley(d.latitude, d.longitude)
          : projectHimachalState(d.latitude, d.longitude);

      if (!coords) return null;
      const theme = getClusterColor(d.id);
      const minPrice = d.stays?.length
        ? Math.min(...d.stays.map((s) => s.priceNum || 2000))
        : 1800;

      return {
        ...d,
        x: coords.x,
        y: coords.y,
        theme,
        minPrice,
        staysCount: d.stays?.length || 0,
        attractionsCount: d.nearbyAttractions?.length || 0,
      };
    }).filter(Boolean);
  }, [displayedDestinations, mapScope]);

  // Selected destination object for the floating preview card
  const selectedPin = useMemo(() => {
    const idToFind = activePinId || hoveredPlaceId;
    if (!idToFind) return null;
    return destinations.find((d) => d.id === idToFind) || null;
  }, [destinations, activePinId, hoveredPlaceId]);

  // Handle Pin Click
  const handlePinClick = (destId, e) => {
    if (e) e.stopPropagation();
    if (activePinId === destId) {
      setActivePinId(null);
      if (onSelectLocationId) onSelectLocationId(null);
    } else {
      setActivePinId(destId);
      if (onSelectLocationId) onSelectLocationId(destId);
    }
  };

  // Zoom controls
  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(1, Math.min(2.5, Math.round((prev + delta) * 10) / 10)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setActivePinId(null);
  };

  // User GPS mock/browser geolocation
  const handleLocateUser = () => {
    if (userGps) {
      setUserGps(null);
      return;
    }
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const coords =
            mapScope === "valley-topo"
              ? projectSanctuaryValley(lat, lon)
              : projectHimachalState(lat, lon);
          setUserGps(coords || { x: 50, y: 50 });
          setIsLocating(false);
        },
        () => {
          // Fallback to central Himachal Pradesh (Mandi / Kullu gateway)
          setUserGps({ x: 48, y: 56 });
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      setUserGps({ x: 48, y: 56 });
      setIsLocating(false);
    }
  };

  return (
    <div
      className={`himalaya-interactive-map-root ${isSplitView ? "is-split-mode" : ""} ${className}`}
      ref={mapContainerRef}
    >
      {/* Top Map Action Toolbar */}
      <div className="map-toolbar-strip">
        <div className="map-toolbar-left">
          <div className="map-live-indicator">
            <span className="map-radar-pulse" />
            <span className="map-counter-label">
              <strong>{displayedDestinations.length}</strong> of {allDestinationsCount} Sanctuaries Placed
            </span>
          </div>

          {/* Scope Toggle: Valley Topo vs Himachal Wide */}
          <div className="map-scope-switch" role="group" aria-label="Map spatial projection">
            <button
              type="button"
              className={`scope-switch-btn ${mapScope === "valley-topo" ? "active" : ""}`}
              onClick={() => setMapScope("valley-topo")}
              title="Zoom to Central Valley Sanctuaries (Kullu, Parvati, Tirthan, Sainj)"
            >
              <span>🌲 Central Valleys Topo</span>
            </button>
            <button
              type="button"
              className={`scope-switch-btn ${mapScope === "himachal-wide" ? "active" : ""}`}
              onClick={() => setMapScope("himachal-wide")}
              title="Overview of Himachal Pradesh state boundaries"
            >
              <span>🏔️ All Himachal Overview</span>
            </button>
          </div>
        </div>

        <div className="map-toolbar-right">
          {/* Elevation filter pills */}
          <div className="map-elevation-filter" role="group" aria-label="Filter by elevation">
            <span className="elev-filter-label">Altitude:</span>
            <button
              type="button"
              className={`elev-chip-btn ${filterElevation === "all" ? "active" : ""}`}
              onClick={() => setFilterElevation("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`elev-chip-btn ${filterElevation === "low" ? "active" : ""}`}
              onClick={() => setFilterElevation("low")}
              title="Sanctuaries under 2,000m (Tirthan, Jibhi, Chalal, Lug)"
            >
              &lt; 2,000m
            </button>
            <button
              type="button"
              className={`elev-chip-btn ${filterElevation === "high" ? "active" : ""}`}
              onClick={() => setFilterElevation("high")}
              title="Alpine Sanctuaries above 2,000m (Kalga, Shangarh, Waichin, Naggar)"
            >
              ≥ 2,000m
            </button>
          </div>

          {onToggleFullscreen && (
            <button
              type="button"
              className="map-action-icon-btn"
              onClick={onToggleFullscreen}
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="map-viewport" onClick={() => setActivePinId(null)}>
        {/* Scalable Topographic Canvas */}
        <div
          className="map-scalable-canvas"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
            transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* SVG Topographic Artboard */}
          <div className="map-svg-artboard" aria-hidden="true">
            <svg
              viewBox="0 0 1000 700"
              xmlns="http://www.w3.org/2000/svg"
              className="map-vector-graphic"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Terrain Gradients */}
                <linearGradient id="hpTopoBase" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5efe7" />
                  <stop offset="40%" stopColor="#dceade" />
                  <stop offset="75%" stopColor="#cee2d1" />
                  <stop offset="100%" stopColor="#e1eee4" />
                </linearGradient>

                <linearGradient id="snowPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#d4e8f0" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#b3d4e3" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.75" />
                </linearGradient>

                {/* Drop shadow for pins */}
                <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#092116" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Base Topographic Background */}
              <rect width="1000" height="700" fill="url(#hpTopoBase)" />

              {/* Shaded Relief Mountain Ranges (Pir Panjal & Great Himalayan Crests) */}
              {/* North / North-East High Glaciers */}
              <polygon points="620,0 780,110 520,110" fill="url(#snowPeakGrad)" />
              <polygon points="740,0 890,95 650,95" fill="url(#snowPeakGrad)" />
              <polygon points="850,0 1000,80 780,80" fill="url(#snowPeakGrad)" />
              <polygon points="450,0 580,90 380,90" fill="url(#snowPeakGrad)" />
              <polygon points="200,0 340,75 140,75" fill="url(#snowPeakGrad)" opacity="0.6" />

              {/* Eastern GHNP Alpine Massif */}
              <polygon points="800,160 980,310 740,310" fill="url(#snowPeakGrad)" opacity="0.7" />
              <polygon points="760,260 960,420 720,420" fill="url(#snowPeakGrad)" opacity="0.6" />
              <polygon points="780,400 950,560 750,560" fill="url(#snowPeakGrad)" opacity="0.5" />

              {/* Western Dhauladhar Ridges */}
              <polygon points="0,90 120,180 0,220" fill="url(#snowPeakGrad)" opacity="0.45" />
              <polygon points="0,210 140,320 0,380" fill="url(#snowPeakGrad)" opacity="0.4" />

              {/* Topographic Contour Elevation Rings */}
              <g stroke="rgba(20, 60, 42, 0.08)" fill="none" strokeWidth="1.5">
                <path d="M 50,150 Q 250,120 480,160 T 950,130" />
                <path d="M 30,240 Q 300,200 520,250 T 970,220" strokeWidth="2" stroke="rgba(20, 60, 42, 0.12)" />
                <path d="M 60,330 Q 340,310 560,340 T 950,320" />
                <path d="M 40,430 Q 320,390 580,440 T 980,410" strokeWidth="2" stroke="rgba(20, 60, 42, 0.11)" />
                <path d="M 50,520 Q 350,500 620,530 T 950,510" />
                <path d="M 60,610 Q 380,590 640,620 T 970,600" />
              </g>

              {/* Glacial River Courses */}
              {/* Beas River Corridor (Rohtang -> Naggar -> Kullu -> Bhuntar -> Aut) */}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Beas River */}
                <path
                  d="M 390,30 Q 380,80 370,130 T 360,210 T 380,290 T 430,370 T 460,460 T 430,550 T 380,660"
                  stroke="#2563eb"
                  strokeWidth="5"
                  opacity="0.75"
                />
                <path
                  d="M 390,30 Q 380,80 370,130 T 360,210 T 380,290 T 430,370 T 460,460 T 430,550 T 380,660"
                  stroke="#93c5fd"
                  strokeWidth="2"
                  opacity="0.9"
                />

                {/* Parvati River (Mantalai / Khirganga -> Kalga -> Chalal -> Bhuntar junction) */}
                <path
                  d="M 870,260 Q 800,250 710,240 T 570,250 T 430,270 T 380,290"
                  stroke="#0284c7"
                  strokeWidth="4"
                  opacity="0.75"
                />
                <path
                  d="M 870,260 Q 800,250 710,240 T 570,250 T 430,270 T 380,290"
                  stroke="#bae6fd"
                  strokeWidth="1.6"
                  opacity="0.9"
                />

                {/* Malana & Waichin Stream (joining Parvati) */}
                <path
                  d="M 570,160 Q 560,200 550,230 T 520,255"
                  stroke="#0ea5e9"
                  strokeWidth="2.6"
                  opacity="0.7"
                />

                {/* Sainj River (Shangarh meadows -> Larji Dam reservoir) */}
                <path
                  d="M 720,490 Q 640,480 560,475 T 460,470"
                  stroke="#0284c7"
                  strokeWidth="3.2"
                  opacity="0.7"
                />

                {/* Tirthan River (GHNP glacier springs -> Gushaini -> Banjar -> Larji) */}
                <path
                  d="M 820,570 Q 740,560 660,550 T 540,520 T 460,480"
                  stroke="#0369a1"
                  strokeWidth="3.5"
                  opacity="0.75"
                />
                <path
                  d="M 820,570 Q 740,560 660,550 T 540,520 T 460,480"
                  stroke="#e0f2fe"
                  strokeWidth="1.4"
                  opacity="0.9"
                />

                {/* Sarwari Stream (Lug Valley -> Beas junction at Kullu) */}
                <path
                  d="M 180,270 Q 250,275 310,280 T 370,285"
                  stroke="#0ea5e9"
                  strokeWidth="2.8"
                  opacity="0.65"
                />
              </g>

              {/* Geographic Region & Feature Watermarks */}
              <text x="500" y="32" fill="rgba(12, 42, 29, 0.35)" fontSize="15" fontWeight="900" fontFamily="sans-serif" letterSpacing="5" textAnchor="middle">
                PIR PANJAL &amp; ROHTANG PASS RIDGE (3,978M)
              </text>

              <text x="830" y="360" fill="rgba(12, 42, 29, 0.32)" fontSize="13" fontWeight="800" fontFamily="sans-serif" letterSpacing="4" textAnchor="middle">
                UNESCO GREAT HIMALAYAN NATIONAL PARK
              </text>

              <text x="140" y="310" fill="rgba(12, 42, 29, 0.3)" fontSize="11" fontWeight="700" fontFamily="sans-serif" letterSpacing="2">
                SARWARI CANYON • LUG
              </text>

              <text x="660" y="225" fill="rgba(12, 42, 29, 0.35)" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="2">
                PARVATI VALLEY CORRIDOR
              </text>

              <text x="680" y="535" fill="rgba(12, 42, 29, 0.3)" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="2">
                TIRTHAN TROUT BASIN
              </text>

              <text x="630" y="460" fill="rgba(12, 42, 29, 0.3)" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="2">
                SAINJ VALLEY MEADOWS
              </text>

              <text x="440" y="670" fill="rgba(12, 42, 29, 0.28)" fontSize="12" fontWeight="700" fontFamily="sans-serif" letterSpacing="3">
                JALORI PASS (3,120M) &amp; SHIMLA HIGHWAY
              </text>

              <text x="40" y="660" fill="rgba(12, 42, 29, 0.28)" fontSize="11" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">
                Mandi &amp; Kangra Valley Border
              </text>

              <text x="960" y="90" fill="rgba(12, 42, 29, 0.35)" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="2" textAnchor="end">
                Lahaul &amp; Spiti High Plateau
              </text>

              {/* River water name badges */}
              <text x="410" y="240" fill="#1e40af" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" opacity="0.6">
                Beas River ➔
              </text>
              <text x="640" y="258" fill="#0369a1" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" opacity="0.7">
                ➔ Parvati River
              </text>
              <text x="660" y="565" fill="#0369a1" fontSize="9.5" fontWeight="700" fontFamily="sans-serif" opacity="0.7">
                ➔ Tirthan River
              </text>
            </svg>
          </div>

          {/* User GPS Pin (if enabled) */}
          {userGps && (
            <div
              className="map-user-pin"
              style={{ left: `${userGps.x}%`, top: `${userGps.y}%` }}
              title="Your Location"
            >
              <span className="user-ping-ring" />
              <span className="user-pin-core" />
              <span className="user-pin-tag">You Are Here</span>
            </div>
          )}

          {/* Destination Markers */}
          {mappedPins.map((dest) => {
            const isSelected = activePinId === dest.id;
            const isHovered = hoveredPlaceId === dest.id;
            const isActiveValley = activeValleyId === dest.id;

            return (
              <div
                key={dest.id}
                className={`himalaya-map-pin ${isSelected ? "is-selected" : ""} ${isHovered ? "is-hovered" : ""} ${isActiveValley ? "is-active-valley" : ""}`}
                style={{
                  left: `${dest.x}%`,
                  top: `${dest.y}%`,
                  "--pin-bg": dest.theme.bg,
                  "--pin-border": dest.theme.border,
                  "--pin-glow": dest.theme.glow,
                }}
                onClick={(e) => handlePinClick(dest.id, e)}
                onMouseEnter={() => onHoverPlace && onHoverPlace(dest.id)}
                onMouseLeave={() => onHoverPlace && onHoverPlace(null)}
                tabIndex={0}
                role="button"
                aria-label={`${dest.name}, elevation ${dest.elevation}`}
              >
                {/* Outer Pulse Ring when Selected or Hovered */}
                {(isSelected || isHovered || isActiveValley) && (
                  <span className="pin-pulse-wave" />
                )}

                {/* Altitude Pill Above Pin */}
                <span className="pin-elev-bubble">
                  {dest.elevation}
                </span>

                {/* Marker Body with Icon */}
                <div className="pin-marker-head">
                  <span className="pin-icon">
                    {dest.id === "naggar" ? "🏰" :
                     dest.id === "tirthan" ? "🐟" :
                     dest.id === "jibhi" ? "🌲" :
                     dest.id === "shangarh" ? "🌿" :
                     dest.id === "kalga" ? "🍎" :
                     dest.id === "chalal" ? "🪵" :
                     dest.id === "waichin" ? "✨" : "⛰️"}
                  </span>
                </div>

                {/* Name Label with Starting Price */}
                <div className="pin-name-card">
                  <span className="pin-title">{dest.name.split(" ")[0]}</span>
                  <span className="pin-price">From ₹{dest.minPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Destination Popover Card (When a pin is selected or hovered) */}
        {selectedPin && (
          <div
            className="map-floating-sanctuary-card"
            onClick={(e) => e.stopPropagation()}
            role="region"
            aria-label={`Selected destination ${selectedPin.name}`}
          >
            <button
              type="button"
              className="map-card-close-btn"
              onClick={() => {
                setActivePinId(null);
                if (onSelectLocationId) onSelectLocationId(null);
              }}
              aria-label="Dismiss details"
            >
              ✕
            </button>

            <div className="map-card-content-grid">
              <div className="map-card-img-wrap">
                <img
                  src={selectedPin.images?.[0] || selectedPin.image || "/images/destinations/tirthan-valley.jpg"}
                  alt={selectedPin.name}
                  className="map-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/images/destinations/tirthan-valley.jpg";
                  }}
                />
                <span className="map-card-elev-tag">⛰️ {selectedPin.elevation}</span>
                <span className="map-card-badge-tag">{selectedPin.badge || "Sanctuary"}</span>
              </div>

              <div className="map-card-info">
                <div className="map-card-meta-top">
                  <span className="map-card-district">
                    📍 {selectedPin.subValley || "Kullu District"}
                  </span>
                  <span className="map-card-time">🗓️ {selectedPin.bestTime}</span>
                </div>

                <h4 className="map-card-title">{selectedPin.name}</h4>
                <p className="map-card-desc">{selectedPin.description}</p>

                {/* Stays & Pricing */}
                <div className="map-card-stats-row">
                  <div className="map-card-stat">
                    <span className="stat-num">{selectedPin.stays?.length || 0}</span>
                    <span className="stat-label">Curated Stays</span>
                  </div>
                  <div className="map-card-stat">
                    <span className="stat-num">{selectedPin.nearbyAttractions?.length || 0}</span>
                    <span className="stat-label">Trails &amp; Sights</span>
                  </div>
                  <div className="map-card-stat">
                    <span className="stat-num">
                      ₹{(selectedPin.stays?.[0]?.priceNum || 2000).toLocaleString("en-IN")}
                    </span>
                    <span className="stat-label">Starting / night</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="map-card-actions">
                  <button
                    type="button"
                    className="map-card-btn-explore"
                    onClick={() => {
                      if (onSelectValley) onSelectValley(selectedPin.id);
                    }}
                  >
                    <span>Explore Valley &amp; Hamlets</span>
                    <span className="arrow">→</span>
                  </button>

                  {selectedPin.stays?.[0] && onBookFlagshipStay && (
                    <button
                      type="button"
                      className="map-card-btn-book"
                      onClick={() => {
                        onBookFlagshipStay(selectedPin.stays[0], selectedPin);
                      }}
                    >
                      <span>Book Flagship Stay</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Navigation & Zoom Controls */}
        <div className="map-nav-controls" role="toolbar" aria-label="Map navigation">
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={() => handleZoom(0.25)}
            title="Zoom In"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="map-ctrl-btn"
            onClick={() => handleZoom(-0.25)}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            −
          </button>
          {zoomLevel > 1 && (
            <button
              type="button"
              className="map-ctrl-btn"
              onClick={handleResetZoom}
              title="Reset Zoom"
              aria-label="Reset zoom level"
            >
              ↺
            </button>
          )}
          <button
            type="button"
            className={`map-ctrl-btn ${userGps ? "active" : ""}`}
            onClick={handleLocateUser}
            title={userGps ? "Location Active" : "Find My Location"}
            aria-label="Locate me on map"
            disabled={isLocating}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </button>
        </div>

        {/* Bottom Topographic Legend */}
        <div className="map-legend-strip">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#2563eb" }} />
            <span>Glacial Rivers (Beas, Parvati, Tirthan)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#1b4d3e" }} />
            <span>Cedar Valleys</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#b45309" }} />
            <span>Alpine Backcountry</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#6b21a8" }} />
            <span>Kath-Kuni Heritage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreInteractiveMap;
