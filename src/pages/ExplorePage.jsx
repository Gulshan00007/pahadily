import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/common/SEO";
import ExploreHeroRef from "../components/explore/ExploreHeroRef";
import ValleySwitcherNav from "../components/explore/ValleySwitcherNav";
import AllDestinationsOverview from "../components/explore/AllDestinationsOverview";
import DestinationShowcase from "../components/explore/DestinationShowcase";
import PlacesNearbySection from "../components/explore/PlacesNearbySection";
import StaysNearSection from "../components/explore/StaysNearSection";
import InPageStayBookingModal from "../components/explore/InPageStayBookingModal";
import InteractiveMapModal from "../components/explore/InteractiveMapModal";
import { EXPLORE_DESTINATIONS } from "../data/exploreDestinationsData";
import {
  generateTouristDestinationSchema,
  generateTouristAttractionSchema,
  generateLodgingBusinessSchema,
  generateBreadcrumbSchema,
  getCanonicalUrl,
} from "../utils/seo";

function findStayData(stayParam) {
  if (!stayParam) return null;
  const sStr = String(stayParam);
  for (const dest of EXPLORE_DESTINATIONS) {
    const found = dest.stays?.find((s) => String(s.id) === sStr);
    if (found) return { stay: found, dest };
  }
  return null;
}

function findAttractionData(attractionParam) {
  if (!attractionParam) return null;
  const aLower = attractionParam.toLowerCase();
  for (const dest of EXPLORE_DESTINATIONS) {
    const found = dest.nearbyAttractions?.find(
      (att) => att.id?.toLowerCase() === aLower
    );
    if (found) return { attraction: found, dest };
  }
  return null;
}

function findSlugDest(slugParam) {
  if (!slugParam) return null;
  const sLower = slugParam.toLowerCase();
  return (
    EXPLORE_DESTINATIONS.find(
      (d) =>
        d.slug?.toLowerCase() === sLower ||
        d.id?.toLowerCase() === sLower ||
        d.region?.toLowerCase() === sLower
    ) || null
  );
}

function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug, stayId, attractionId } = useParams();
  const navigate = useNavigate();

  const initialStayParam = stayId || searchParams.get("stay") || searchParams.get("place");
  const matchedStayData = findStayData(initialStayParam);
  const matchedAttractionData = findAttractionData(attractionId);
  const matchedSlugDest =
    matchedStayData?.dest ||
    matchedAttractionData?.dest ||
    findSlugDest(slug);

  // Initial valley selection
  const initialValley = useMemo(() => {
    if (matchedStayData) return matchedStayData.dest.id;
    if (matchedAttractionData) return matchedAttractionData.dest.id;
    if (matchedSlugDest) return matchedSlugDest.id;
    const queryValley =
      searchParams.get("valley") ||
      searchParams.get("region") ||
      searchParams.get("location");
    return queryValley ? queryValley.toLowerCase() : "all";
  }, [matchedStayData, matchedAttractionData, matchedSlugDest, searchParams]);

  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [selectedValleyId, setSelectedValleyId] = useState(initialValley);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // In-page stay modal state (for slideshow & booking system)
  const [selectedStay, setSelectedStay] = useState(matchedStayData?.stay || null);
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState(
    matchedStayData?.dest || null
  );
  const [isStayModalOpen, setIsStayModalOpen] = useState(Boolean(matchedStayData));

  // Active Attraction modal state
  const [activeAttraction, setActiveAttraction] = useState(
    matchedAttractionData?.attraction || null
  );

  // Map modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Sync selectedValleyId when slug, stayId, or attractionId changes
  useEffect(() => {
    if (matchedStayData) {
      setSelectedValleyId(matchedStayData.dest.id);
      setSelectedStay(matchedStayData.stay);
      setSelectedDestinationForModal(matchedStayData.dest);
      setIsStayModalOpen(true);
    } else if (matchedAttractionData) {
      setSelectedValleyId(matchedAttractionData.dest.id);
      setActiveAttraction(matchedAttractionData.attraction);
    } else if (matchedSlugDest) {
      setSelectedValleyId(matchedSlugDest.id);
    } else if (!slug && !stayId && !attractionId) {
      const qv = searchParams.get("valley") || searchParams.get("region") || searchParams.get("location");
      setSelectedValleyId(qv ? qv.toLowerCase() : "all");
    }
  }, [slug, stayId, attractionId, matchedStayData, matchedAttractionData, matchedSlugDest, searchParams]);

  // Active Destination matching the selected valley (if not "all")
  const currentDestination = useMemo(() => {
    if (selectedValleyId === "all") return null;
    const found = EXPLORE_DESTINATIONS.find(
      (d) =>
        d.id.toLowerCase() === selectedValleyId.toLowerCase() ||
        d.region.toLowerCase() === selectedValleyId.toLowerCase() ||
        d.slug?.toLowerCase() === selectedValleyId.toLowerCase()
    );
    return found || EXPLORE_DESTINATIONS[0];
  }, [selectedValleyId]);

  // Handle valley change
  const handleValleyChange = (valleyId) => {
    const targetId = valleyId ? valleyId.toLowerCase() : "all";
    setSelectedValleyId(targetId);

    if (targetId === "all") {
      navigate("/explore", { replace: false });
    } else {
      const targetDest = EXPLORE_DESTINATIONS.find((d) => d.id === targetId);
      const destSlug = targetDest?.slug || targetId;
      navigate(`/destinations/${destSlug}`, { replace: false });
    }
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
        const destSlug = matched.slug || matched.id;
        navigate(`/destinations/${destSlug}`, { replace: false });
        return;
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
    if (stay?.id) {
      navigate(`/stays/${stay.id}`, { replace: false });
    }
  };

  const handleCloseStay = () => {
    setIsStayModalOpen(false);
    setSelectedStay(null);
    setSelectedDestinationForModal(null);
    if (stayId) {
      navigate(currentDestination ? `/destinations/${currentDestination.slug || currentDestination.id}` : "/explore", { replace: true });
    }
  };

  const handleSelectAttraction = (attraction) => {
    setActiveAttraction(attraction);
    if (attraction?.id) {
      navigate(`/attractions/${attraction.id}`, { replace: false });
    }
  };

  const handleCloseAttraction = () => {
    setActiveAttraction(null);
    if (attractionId) {
      navigate(currentDestination ? `/destinations/${currentDestination.slug || currentDestination.id}` : "/explore", { replace: true });
    }
  };

  // Other destinations to show when browsing a single valley
  const otherDestinations = useMemo(() => {
    if (!currentDestination) return [];
    return EXPLORE_DESTINATIONS.filter((d) => d.id !== currentDestination.id);
  }, [currentDestination]);

  // Dynamic SEO Metadata Calculation
  let pageTitle = "Explore Mountain Sanctuaries & Offbeat Valleys in Himachal | Pahadíly";
  let pageDescription = "Discover 8 authentic mountain sanctuaries across Kullu and Himachal Pradesh. Compare elevations, best seasons, Kath-Kuni heritage hamlets, and 32 verified stays.";
  let canonicalPath = "/explore";
  let ogImage = "/images/hero/himachal-hero.jpg";
  let ogType = "website";

  if (matchedStayData) {
    const { stay, dest } = matchedStayData;
    pageTitle = `${stay.name} in ${stay.subLocation || dest.name}, Himachal Pradesh | Pahadíly`;
    pageDescription = `${stay.description || stay.tagline} Verified Himalayan stay in ${dest.name}. ${stay.price} ${stay.unit || "/night"}. Direct host booking with zero middleman commissions.`;
    canonicalPath = `/stays/${stay.id}`;
    ogImage = stay.images?.[0] || stay.image || dest.image || "/images/hero/himachal-hero.jpg";
    ogType = "place";
  } else if (matchedAttractionData) {
    const { attraction, dest } = matchedAttractionData;
    pageTitle = `Visit ${attraction.name} near ${dest.name}, Himachal Pradesh | Pahadíly`;
    pageDescription = `${attraction.description} Distance: ${attraction.distance} from ${dest.name}. Category: ${attraction.category}. Discover nearby authentic homestays in Himachal Pradesh.`;
    canonicalPath = `/attractions/${attraction.id}`;
    ogImage = attraction.image || dest.image || "/images/hero/himachal-hero.jpg";
    ogType = "place";
  } else if (currentDestination && selectedValleyId !== "all") {
    pageTitle = `Explore ${currentDestination.name}, Himachal Pradesh | Pahadíly`;
    pageDescription = `${currentDestination.description.slice(0, 150)}... Elevation: ${currentDestination.elevation}. Best season: ${currentDestination.bestTime}. Discover nearby attractions and verified village homestays.`;
    canonicalPath = `/destinations/${currentDestination.slug || currentDestination.id}`;
    ogImage = currentDestination.images?.[0] || currentDestination.image || "/images/hero/himachal-hero.jpg";
    ogType = "article";
  }

  // Build Structured Data Schema.org
  const structuredData = useMemo(() => {
    const canonicalFull = getCanonicalUrl(canonicalPath);

    if (matchedStayData) {
      const { stay, dest } = matchedStayData;
      return [
        generateLodgingBusinessSchema(stay, dest, canonicalFull),
        generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Stays", url: "/stays" },
          { name: dest.name, url: `/destinations/${dest.slug || dest.id}` },
          { name: stay.name, url: `/stays/${stay.id}` },
        ]),
      ];
    }

    if (matchedAttractionData) {
      const { attraction, dest } = matchedAttractionData;
      return [
        generateTouristAttractionSchema(attraction, dest, canonicalFull),
        generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Explore", url: "/explore" },
          { name: dest.name, url: `/destinations/${dest.slug || dest.id}` },
          { name: attraction.name, url: `/attractions/${attraction.id}` },
        ]),
      ];
    }

    if (currentDestination && selectedValleyId !== "all") {
      return [
        generateTouristDestinationSchema(currentDestination, canonicalFull),
        generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Explore", url: "/explore" },
          { name: currentDestination.name, url: `/destinations/${currentDestination.slug || currentDestination.id}` },
        ]),
      ];
    }

    return [
      generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Explore Sanctuaries", url: "/explore" },
      ]),
    ];
  }, [matchedStayData, matchedAttractionData, currentDestination, selectedValleyId, canonicalPath]);

  return (
    <div className="pahadily-app">
      {/* Dynamic SEO Tag Management */}
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={canonicalPath}
        ogImage={ogImage}
        ogType={ogType}
        schema={structuredData}
      />

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
                  <a
                    href="/explore"
                    className="back-to-all-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleValleyChange("all");
                    }}
                  >
                    <span>← Back to All 8 Himalayan Places</span>
                  </a>
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
                  activeAttraction={activeAttraction}
                  onSelectAttraction={handleSelectAttraction}
                  onCloseAttraction={handleCloseAttraction}
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
                    <a
                      href="/explore"
                      className="view-all-valleys-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleValleyChange("all");
                      }}
                    >
                      <span>View All 8 Valleys</span>
                      <span className="arrow">→</span>
                    </a>
                  </div>

                  <div className="more-valleys-grid">
                    {otherDestinations.slice(0, 4).map((other) => {
                      const thumb = other.images?.[0] || other.image || "/images/destinations/tirthan-valley.jpg";
                      const otherSlug = other.slug || other.id;
                      return (
                        <a
                          key={other.id}
                          href={`/destinations/${otherSlug}`}
                          className="mini-valley-card"
                          onClick={(e) => {
                            e.preventDefault();
                            handleValleyChange(other.id);
                          }}
                          aria-label={`Explore ${other.name}`}
                          style={{ textDecoration: "none", color: "inherit" }}
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
                        </a>
                      );
                    })}
                  </div>
                </section>
              </div>
            )
          )}
        </div>

        {/* IN-PAGE STAY SLIDESHOW & BOOKING SYSTEM IN A FORM */}
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
