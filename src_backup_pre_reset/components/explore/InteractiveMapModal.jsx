import { useState } from "react";
import ExploreInteractiveMap from "./ExploreInteractiveMap";

function InteractiveMapModal({ isOpen, onClose, destinations, activeValley, onSelectValley }) {
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(activeValley !== "all" ? activeValley : null);

  if (!isOpen) return null;

  return (
    <div className="map-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Interactive Map of Himachal Pradesh">
      <div className="map-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <div className="map-modal-title-box">
            <span className="map-modal-eyebrow">🗺️ TOPOGRAPHIC SPATIAL DIRECTORY</span>
            <h3 className="map-modal-title">Interactive Map of Himachal Pradesh</h3>
          </div>
          <button className="map-modal-close-btn" onClick={onClose} aria-label="Close Map">
            ✕ Close Map
          </button>
        </div>

        <div className="map-modal-body">
          <ExploreInteractiveMap
            destinations={destinations}
            allDestinationsCount={destinations.length}
            activeValleyId={activeValley}
            onSelectValley={(valId) => {
              onSelectValley(valId);
              onClose();
            }}
            selectedLocationId={selectedLocationId}
            onSelectLocationId={setSelectedLocationId}
            hoveredPlaceId={hoveredPlaceId}
            onHoverPlace={setHoveredPlaceId}
          />
        </div>
      </div>
    </div>
  );
}

export default InteractiveMapModal;

