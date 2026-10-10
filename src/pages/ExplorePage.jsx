import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ExploreHeroRef from "../components/explore/ExploreHeroRef";
import ValleySwitcherNav from "../components/explore/ValleySwitcherNav";
import AllDestinationsOverview from "../components/explore/AllDestinationsOverview";
import DestinationShowcase from "../components/explore/DestinationShowcase";
import PlacesNearbySection from "../components/explore/PlacesNearbySection";
import StaysNearSection from "../components/explore/StaysNearSection";
import InPageStayBookingModal from "../components/explore/InPageStayBookingModal";
import InteractiveMapModal from "../components/explore/InteractiveMapModal";
import { EXPLORE_DESTINATIONS } from "../data/exploreDestinationsData";

function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const initialValley =
    searchParams.get("valley") ||
    searchParams.get("region") ||
    searchParams.get("location") ||
    "all"; // Default to "all" so users see all places ready for launch!

  const initialStayParam = searchParams.get("stay") || searchParams.get("place");
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [selectedValleyId, setSelectedValleyId] = useState(initialValley.toLowerCase());
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // In-page stay modal state (for slideshow & booking system in a form)
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState(null);
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);

  // Map modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Active Destination matching the selected valley (if not "all")
  const currentDestination = useMemo(() => {
    if (selectedValleyId === "all") return null;
    const found = EXPLORE_DESTINATIONS.find(
      (d) =>
        d.id.toLowerCase() === selectedValleyId.toLowerCase() ||
        d.region.toLowerCase() === selectedValleyId.toLowerCase() ||
        d.slug.toLowerCase() === selectedValleyId.toLowerCase()
    );
    return found || EXPLORE_DESTINATIONS[0];
  }, [selectedValleyId]);

  // Handle URL sync
  useEffect(() => {
    const v = searchParams.get("valley") || searchParams.get("region") || searchParams.get("location");
    if (v && v.toLowerCase() !== selectedValleyId.toLowerCase()) {
      setSelectedValleyId(v.toLowerCase());
    } else if (!v && selectedValleyId !== "all") {
      // If no valley param, maintain "all"
    }
    const q = searchParams.get("q");
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Handle initial stay parameter from URL (e.g. ?stay=101)
  useEffect(() => {
    if (initialStayParam) {
      for (const dest of EXPLORE_DESTINATIONS) {
        const stayMatch = dest.stays?.find(
          (s) => String(s.id) === String(initialStayParam)
        );
        if (stayMatch) {
          setSelectedStay(stayMatch);
          setSelectedDestinationForModal(dest);
          setIsStayModalOpen(true);
          break;
        }
      }
    }
  }, [initialStayParam]);

  // SEO Page Title
  useEffect(() => {
    if (selectedValleyId === "all" || !currentDestination) {
      document.title = "Explore Mountain Sanctuaries & Village Stays | Pahadíly";
    } else {
      document.title = `${currentDestination.name} — Mountain Sanctuaries & Stays | Pahadíly`;
    }
  }, [selectedValleyId, currentDestination]);

  // Handle valley change
  const handleValleyChange = (valleyId) => {
    const targetId = valleyId ? valleyId.toLowerCase() : "all";
    setSelectedValleyId(targetId);

    const newParams = new URLSearchParams(searchParams);
    if (targetId === "all") {
      newParams.delete("valley");
    } else {
      newParams.set("valley", targetId);
    }
    newParams.delete("stay");
    setSearchParams(newParams, { replace: true });
  };

  // Handle search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newParams.set("q", query.trim());
      // Try to find matching valley if user searched for one
      const qLower = query.toLowerCase();
      const matched = EXPLORE_DESTINATIONS.find(
        (d) =>
          d.name.toLowerCase().includes(qLower) ||
          d.id.toLowerCase().includes(qLower) ||
          d.location.toLowerCase().includes(qLower)
      );
      if (matched) {
        setSelectedValleyId(matched.id);
        newParams.set("valley", matched.id);
      }
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Handle Category Pills
  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === "stays") {
      const el = document.querySelector(".stays-near-section") || document.querySelector(".all-dest-stays-preview");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (catId === "experiences") {
      const el = document.querySelector(".places-nearby-section") || document.querySelector(".all-dest-grid");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (catId === "destinations") {
      const el = document.querySelector(".all-destinations-section") || document.querySelector(".dest-showcase-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Open in-page stay slideshow & booking system in form
  const handleOpenStay = (stay, optionalDest = null) => {
    setSelectedStay(stay);
    setSelectedDestinationForModal(optionalDest || currentDestination || EXPLORE_DESTINATIONS[0]);
    setIsStayModalOpen(true);
  };

  const handleCloseStay = () => {
    setIsStayModalOpen(false);
    setSelectedStay(null);
    setSelectedDestinationForModal(null);
  };

  // Other destinations to show when browsing a single valley
  const otherDestinations = useMemo(() => {
    if (!currentDestination) return [];
    return EXPLORE_DESTINATIONS.filter((d) => d.id !== currentDestination.id);
  }, [currentDestination]);

  return (
    <div className="pahadily-app">
      <Navbar activePage="explore" />

      <main className="explore-page-ref-layout">
        {/* Top Hero Banner */}
        <ExploreHeroRef
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          selectedValley={selectedValleyId}
          onSelectValley={handleValleyChange}
          valleysList={EXPLORE_DESTINATIONS}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
          onPerformSearch={handleSearch}
        />

        {/* Visual Himalayan Valley Switcher Bar (Quickly browse all 8 places) */}
        <ValleySwitcherNav
          valleys={EXPLORE_DESTINATIONS}
          selectedValleyId={selectedValleyId}
          onSelectValley={handleValleyChange}
        />

        <div className="explore-ref-main-container">
          {/* VIEW MODE 1: ALL DESTINATIONS CATALOG (Default or when "All Places" is selected) */}
          {selectedValleyId === "all" ? (
            <AllDestinationsOverview
              destinations={EXPLORE_DESTINATIONS}
              onSelectValley={handleValleyChange}
              onBookFlagshipStay={(stay, dest) => handleOpenStay(stay, dest)}
              onOpenMap={() => setIsMapModalOpen(true)}
              searchQuery={searchQuery}
            />
          ) : (
            /* VIEW MODE 2: SINGLE VALLEY DEEP-DIVE */
            currentDestination && (
              <div className="single-valley-deep-dive">
                {/* Back to All Places Breadcrumb Bar */}
                <div className="valley-nav-breadcrumbs">
                  <button
                    type="button"
                    className="back-to-all-btn"
                    onClick={() => handleValleyChange("all")}
                  >
                    <span>← Back to All 8 Himalayan Places</span>
                  </button>
                  <span className="crumb-sep">/</span>
                  <span className="current-crumb">{currentDestination.name}</span>
                  <span className="crumb-badge">{currentDestination.badge}</span>
                </div>

                {/* Main Destination Showcase with Slideshow & Details */}
                <DestinationShowcase
                  destination={currentDestination}
                  onOpenMap={() => setIsMapModalOpen(true)}
                />

                {/* Places to Explore Nearby in this valley */}
                <PlacesNearbySection
                  destination={currentDestination}
                  onSelectAttraction={() => {}}
                />

                {/* Stays Near This Destination with 1-click Slideshow & Booking System */}
                <StaysNearSection
                  destination={currentDestination}
                  onSelectStay={(stay) => handleOpenStay(stay, currentDestination)}
                />

                {/* Discover More Hidden Valleys Strip */}
                <section className="more-valleys-section" aria-label="Explore other Himalayan places">
                  <div className="more-valleys-header">
                    <h3 className="more-valleys-title">
                      More Places to Explore in Himachal Pradesh
                    </h3>
                    <button
                      type="button"
                      className="view-all-valleys-link"
                      onClick={() => handleValleyChange("all")}
                    >
                      <span>View All 8 Valleys</span>
                      <span className="arrow">→</span>
                    </button>
                  </div>

                  <div className="more-valleys-grid">
                    {otherDestinations.slice(0, 4).map((other) => {
                      const thumb = other.images?.[0] || other.image || "/images/destinations/tirthan-valley.jpg";
                      return (
                        <div
                          key={other.id}
                          className="mini-valley-card"
                          onClick={() => handleValleyChange(other.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleValleyChange(other.id);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Explore ${other.name}`}
                        >
                          <div className="mini-valley-img-wrap">
                            <img src={thumb} alt={other.name} loading="lazy" />
                            <span className="mini-elev-tag">⛰️ {other.elevation}</span>
                            <span className="mini-subvalley-tag">{other.subValley || "Kullu"}</span>
                          </div>
                          <div className="mini-valley-info">
                            <span className="mini-valley-tagline">{other.badge || "Mountain Sanctuary"}</span>
                            <h4 className="mini-valley-name">{other.name}</h4>
                            <p className="mini-valley-desc">{other.location}</p>
                            <span className="mini-explore-cta">
                              <span>Explore Valley & Stays</span>
                              <span className="arrow">→</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )
          )}
        </div>

        {/* IN-PAGE STAY SLIDESHOW & BOOKING SYSTEM IN A FORM (No navigation away!) */}
        <InPageStayBookingModal
          isOpen={isStayModalOpen}
          onClose={handleCloseStay}
          stay={selectedStay}
          destination={selectedDestinationForModal || currentDestination}
        />

        {/* Interactive Map Modal showing all 8 destinations */}
        <InteractiveMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          destinations={EXPLORE_DESTINATIONS}
          activeValley={selectedValleyId}
          onSelectValley={handleValleyChange}
        />
      </main>

      <Footer />
    </div>
  );
}

export default ExplorePage;
