import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

// Color tokens for categories
const CATEGORY_COLORS = {
  campsite: "#2b7050", // Pine Green
  homestay: "#c07028", // Terracotta Cedar
};

// Geographically accurate bounding box for Himachal Pradesh
// Latitude: ~30.5° N to 33.3° N
// Longitude: ~75.5° E to 78.8° E
function projectToMap(lat, lon) {
  if (lat == null || lon == null) return null;
  const minLat = 30.5;
  const maxLat = 33.3;
  const minLon = 75.5;
  const maxLon = 78.8;

  const x = Math.max(10, Math.min(90, ((lon - minLon) / (maxLon - minLon)) * 100));
  const y = Math.max(12, Math.min(88, ((maxLat - lat) / (maxLat - minLat)) * 100));
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function ExploreMapPanel({
  destinations = [],
  activeValley,
  onSelectValley,
  hoveredPlaceId,
  onHoverPlace,
  userLocation,
  onRequestLocation,
  selectedLocationId,
  onSelectLocationId,
}) {
  const { openBooking } = useAuth();
  const [activePinId, setActivePinId] = useState(selectedLocationId || null);
  const [mapView, setMapView] = useState("map"); // "map" | "list"
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);

  // Sync active pin with selectedLocationId or hovered place from grid
  useEffect(() => {
    if (selectedLocationId) {
      setActivePinId(selectedLocationId);
    } else if (hoveredPlaceId) {
      setActivePinId(hoveredPlaceId);
    }
  }, [selectedLocationId, hoveredPlaceId]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Active selected destination object
  const activeDestination = useMemo(() => {
    return destinations.find((d) => d.id === activePinId) || null;
  }, [destinations, activePinId]);

  // Project real destinations onto the map
  const mappedPins = useMemo(() => {
    return destinations
      .map((d) => {
        const coords = projectToMap(d.latitude, d.longitude);
        if (!coords) return null;
        return {
          ...d,
          mapX: coords.x,
          mapY: coords.y,
          color:
            d.category?.toLowerCase().includes("camp") ||
            d.category?.toLowerCase().includes("glamp")
              ? CATEGORY_COLORS.campsite
              : CATEGORY_COLORS.homestay,
        };
      })
      .filter(Boolean);
  }, [destinations]);

  // User location pin projection
  const userMapCoords = useMemo(() => {
    if (!userLocation) return null;
    return projectToMap(userLocation.lat, userLocation.lon);
  }, [userLocation]);

  // Valley summary list for the "List" view tab
  const valleySummaries = useMemo(() => {
    const counts = {};
    destinations.forEach((d) => {
      const reg = d.region ? d.region.toLowerCase() : "himachal";
      counts[reg] = (counts[reg] || 0) + 1;
    });

    const list = [
      { id: "tirthan", name: "Tirthan Valley & Gushaini", desc: "Riverside cedar cabins & GHNP World Heritage" },
      { id: "jibhi", name: "Jibhi & Shoja Pine Ridge", desc: "Jalori Pass, Serolsar Lake & waterfalls" },
      { id: "shangarh", name: "Sainj Valley & Shangarh", desc: "Fairytale alpine grasslands & Shangchul temple" },
      { id: "kalga", name: "Kalga & Pulga (Parvati)", desc: "Car-free apple orchards & fairy forest trails" },
      { id: "chalal", name: "Chalal & Katagla", desc: "Riverside pine groves & serene hammocks" },
      { id: "naggar", name: "Naggar & Hallan Valley", desc: "1460 AD castle, apple terraces & Hallan hamlets" },
      { id: "waichin", name: "Waichin (Magic Valley)", desc: "Remote alpine amphitheater above Malana stream" },
      { id: "lug-valley", name: "Lug Valley & Mathasaur", desc: "Virgin pine canopies & sacred ridge lake" },
    ];

    return list.map((v) => ({
      ...v,
      count: counts[v.id] || 0,
    }));
  }, [destinations]);

  const handlePinClick = (id) => {
    if (activePinId === id && selectedLocationId === id) {
      setActivePinId(null);
      if (onSelectLocationId) onSelectLocationId(null);
    } else {
      setActivePinId(id);
      if (onSelectLocationId) onSelectLocationId(id);
      const cardEl = document.getElementById(`dest-card-${id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(1, Math.min(2.4, Math.round((prev + delta) * 10) / 10)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setActivePinId(null);
  };

  return (
    <>
      <div className={`ep-map-panel${isFullscreen ? " is-fullscreen-modal" : ""}`}>
        {/* Map Header */}
        <div className="ep-map-header">
          <div className="ep-map-view-toggle" role="group" aria-label="Map view mode">
            <button
              type="button"
              className={`ep-map-tab${mapView === "map" ? " active" : ""}`}
              onClick={() => setMapView("map")}
            >
              🗺️ Map View
            </button>
            <button
              type="button"
              className={`ep-map-tab${mapView === "list" ? " active" : ""}`}
              onClick={() => setMapView("list")}
            >
              📋 Valleys ({valleySummaries.length})
            </button>
          </div>

          <div className="ep-map-header-actions">
            <button
              type="button"
              className="ep-map-fullscreen-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? "Exit fullscreen map" : "Expand map to fullscreen"}
              title={isFullscreen ? "Exit fullscreen (Esc)" : "Expand map"}
            >
              {isFullscreen ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>Close Fullscreen</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Map Body */}
        <div className="ep-map-body" ref={mapContainerRef}>
          {mapView === "map" ? (
            <div className="ep-map-container" style={{ overflow: "hidden" }}>
              {/* Scalable Map Canvas */}
              <div
                className="ep-map-canvas"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 0.25s ease-out",
                }}
              >
                {/* Topographic Vector Relief Map */}
                <div className="ep-map-topo" aria-hidden="true">
                  <svg
                    viewBox="0 0 400 320"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      inset: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="topoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c5ddcb" />
                        <stop offset="35%" stopColor="#b4d7c6" />
                        <stop offset="65%" stopColor="#a0c6af" />
                        <stop offset="100%" stopColor="#d3e8cf" />
                      </linearGradient>
                      <linearGradient id="snowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#eaf5f0" />
                        <stop offset="100%" stopColor="#c5dee8" />
                      </linearGradient>
                    </defs>

                    {/* Base Relief */}
                    <rect width="400" height="320" fill="url(#topoGrad)" />

                    {/* Topo Elevation Contours */}
                    <path d="M0 50 Q80 30 160 45 Q240 60 320 40 Q360 32 400 38" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                    <path d="M0 80 Q60 65 140 75 Q230 85 310 68 Q370 58 400 65" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                    <path d="M0 110 Q100 100 180 110 Q260 120 340 102 Q380 94 400 100" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <path d="M0 140 Q80 128 200 138 Q300 148 400 132" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                    <path d="M0 170 Q120 158 200 168 Q280 178 400 165" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                    <path d="M0 200 Q100 190 200 198 Q300 208 400 195" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <path d="M0 230 Q150 222 250 230 Q330 238 400 225" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

                    {/* Snow-capped Himalayan Ridges */}
                    <polygon points="270,0 330,55 210,55" fill="url(#snowGrad)" opacity="0.75" />
                    <polygon points="310,0 370,45 250,45" fill="url(#snowGrad)" opacity="0.6" />
                    <polygon points="350,0 400,35 300,35" fill="url(#snowGrad)" opacity="0.5" />
                    <polygon points="120,0 170,40 80,40" fill="url(#snowGrad)" opacity="0.55" />

                    {/* Glacial Rivers (Beas, Tirthan, Chenab, Spiti) */}
                    <path d="M20 70 Q60 90 80 130 Q100 170 140 190 Q180 210 200 270" fill="none" stroke="#5faac7" strokeWidth="2.5" opacity="0.65" />
                    <path d="M250 25 Q270 65 280 105 Q290 145 310 195" fill="none" stroke="#5faac7" strokeWidth="2" opacity="0.55" />
                    <path d="M70 20 Q120 40 150 70 Q180 90 210 120" fill="none" stroke="#5faac7" strokeWidth="1.8" opacity="0.5" />

                    {/* Region labels */}
                    <text x="140" y="160" fill="rgba(23,66,49,0.45)" fontSize="13" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="3">
                      HIMACHAL PRADESH
                    </text>
                    <text x="18" y="245" fill="rgba(23,66,49,0.35)" fontSize="9.5" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
                      Punjab Border
                    </text>
                    <text x="310" y="300" fill="rgba(23,66,49,0.35)" fontSize="9.5" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
                      Uttarakhand
                    </text>
                    <text x="320" y="25" fill="rgba(23,66,49,0.4)" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">
                      Tibet / Spiti Ridge
                    </text>
                  </svg>
                </div>

                {/* Real User GPS Pin (if permitted) */}
                {userMapCoords && (
                  <div
                    className="ep-map-user-pin"
                    style={{ left: `${userMapCoords.x}%`, top: `${userMapCoords.y}%` }}
                    title="Your current location"
                  >
                    <span className="ep-user-pulse-ring" />
                    <span className="ep-user-dot" />
                    <span className="ep-user-label">You Are Here</span>
                  </div>
                )}

                {/* Real Destination Pins */}
                {mappedPins.map((pin) => {
                  const isActive = activePinId === pin.id;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      className={`map-pin${isActive ? " map-pin-active" : ""}`}
                      style={{ left: `${pin.mapX}%`, top: `${pin.mapY}%` }}
                      onClick={() => handlePinClick(pin.id)}
                      onMouseEnter={() => onHoverPlace && onHoverPlace(pin.id)}
                      onMouseLeave={() => onHoverPlace && onHoverPlace(null)}
                      aria-label={`${pin.name} (${pin.category || "stay"})`}
                      title={`${pin.name} - ${pin.price}`}
                    >
                      <span className="map-pin-dot" style={{ background: pin.color }} />
                      <span className="map-pin-label">
                        {pin.name.length > 22 ? pin.name.slice(0, 20) + "…" : pin.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Map Floating Preview Card (when a pin is selected) */}
              {activeDestination && (
                <div className="ep-map-floating-popup" role="dialog" aria-label={activeDestination.name}>
                  <button
                    type="button"
                    className="ep-popup-close-btn"
                    onClick={() => setActivePinId(null)}
                    aria-label="Close preview"
                  >
                    ✕
                  </button>
                  <div className="ep-popup-flex">
                    <img
                      src={activeDestination.image || "/images/destinations/tirthan-valley.jpg"}
                      alt={activeDestination.name}
                      className="ep-popup-img"
                      loading="lazy"
                    />
                    <div className="ep-popup-content">
                      <span className="ep-popup-valley">
                        📍 {activeDestination.region ? `${activeDestination.region.toUpperCase()} VALLEY` : "HIMACHAL"}
                      </span>
                      <h4 className="ep-popup-title">{activeDestination.name}</h4>
                      <div className="ep-popup-meta">
                        <span className="ep-popup-price">{activeDestination.price}</span>
                        <span className="ep-popup-unit">{activeDestination.unit || "/night"}</span>
                        <span className="ep-popup-rating">★ {activeDestination.rating || 4.8}</span>
                      </div>
                      <div className="ep-popup-actions">
                        <button
                          type="button"
                          className="ep-popup-book-btn"
                          onClick={() => {
                            if (onSelectLocationId) onSelectLocationId(activeDestination.id);
                            const cardEl = document.getElementById(`dest-card-${activeDestination.id}`);
                            if (cardEl) {
                              cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                        >
                          View Stays & Services ↓
                        </button>
                        <button
                          type="button"
                          className="ep-popup-view-btn"
                          onClick={() => openBooking(activeDestination, "place")}
                        >
                          Book Stay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zoom & Navigation Controls */}
              <div className="ep-map-zoom" role="toolbar" aria-label="Map zoom controls">
                <button
                  type="button"
                  className="ep-map-zoom-btn"
                  onClick={() => handleZoom(0.3)}
                  aria-label="Zoom in map"
                  title="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  className="ep-map-zoom-btn"
                  onClick={() => handleZoom(-0.3)}
                  aria-label="Zoom out map"
                  title="Zoom out"
                >
                  -
                </button>
                {zoomLevel > 1 && (
                  <button
                    type="button"
                    className="ep-map-zoom-btn"
                    onClick={resetView}
                    aria-label="Reset zoom level"
                    title="Reset view"
                  >
                    ↺
                  </button>
                )}
                <button
                  type="button"
                  className={`ep-map-zoom-btn${userLocation ? " active" : ""}`}
                  onClick={onRequestLocation}
                  aria-label="Locate me on map"
                  title={userLocation ? "GPS location active" : "Find my location"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Valley List View Mode */
            <div className="ep-map-list" role="list" aria-label="Himachal Valleys list">
              {valleySummaries.map((val) => (
                <div
                  key={val.id}
                  role="listitem"
                  className={`ep-map-list-item${activeValley === val.id ? " active-valley" : ""}`}
                  onClick={() => onSelectValley && onSelectValley(val.id)}
                  tabIndex={0}
                >
                  <div className="ep-map-list-header">
                    <span className="ep-map-list-dot" style={{ background: CATEGORY_COLORS.homestay }} />
                    <span className="ep-map-list-name">{val.name}</span>
                    <span className="ep-map-list-count">
                      {val.count > 0 ? `${val.count} stays` : "Scenic Valley"}
                    </span>
                  </div>
                  <p className="ep-map-list-desc">{val.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="ep-map-legend" aria-label="Map category legend">
          <div className="ep-map-legend-item">
            <span className="ep-map-legend-dot" style={{ background: CATEGORY_COLORS.homestay }} />
            <span className="ep-map-legend-label">Heritage Homestays</span>
          </div>
          <div className="ep-map-legend-item">
            <span className="ep-map-legend-dot" style={{ background: CATEGORY_COLORS.campsite }} />
            <span className="ep-map-legend-label">Campsites & Glamping</span>
          </div>
          {userLocation && (
            <div className="ep-map-legend-item">
              <span className="ep-map-legend-dot" style={{ background: "#2563eb" }} />
              <span className="ep-map-legend-label">Your Location</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ExploreMapPanel;
