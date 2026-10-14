import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/common/SEO";
import LocalsHero from "../components/locals/LocalsHero";
import LocalsStatsBar from "../components/locals/LocalsStatsBar";
import LocalsRegionFilter from "../components/locals/LocalsRegionFilter";
import LocalsGrid from "../components/locals/LocalsGrid";
import LocalsMapPanel from "../components/locals/LocalsMapPanel";
import LocalProfileModal from "../components/locals/LocalProfileModal";
import LocalsJoinCTA from "../components/locals/LocalsJoinCTA";
import { VERIFIED_LOCALS } from "../data/localsData";
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
  getCanonicalUrl,
  DEFAULT_OG_IMAGE,
} from "../utils/seo";

function LocalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const matchedLocal = useMemo(() => {
    if (!id) return null;
    return VERIFIED_LOCALS.find((l) => String(l.id) === String(id)) || null;
  }, [id]);

  const initialCategory = searchParams.get("category") || searchParams.get("filter") || "all";
  const initialRegion = searchParams.get("region") || (matchedLocal?.region || "all");
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [activeRegion, setActiveRegion] = useState(initialRegion);
  const [selectedLocal, setSelectedLocal] = useState(matchedLocal);

  useEffect(() => {
    if (matchedLocal) {
      setSelectedLocal(matchedLocal);
      if (matchedLocal.region) setActiveRegion(matchedLocal.region);
    }
  }, [matchedLocal]);

  useEffect(() => {
    const cat = searchParams.get("category") || searchParams.get("filter");
    if (cat && cat !== activeFilter) setActiveFilter(cat);
    const reg = searchParams.get("region");
    if (reg && reg !== activeRegion) setActiveRegion(reg);
    const q = searchParams.get("q");
    if (q !== null && q !== searchQuery) setSearchQuery(q);
  }, [searchParams]);

  const handleSelectRegion = (regionId) => {
    setActiveRegion(regionId);
    if (regionId === "all") searchParams.delete("region");
    else searchParams.set("region", regionId);
    setSearchParams(searchParams, { replace: true });
  };

  const handleFilterChange = (catId) => {
    setActiveFilter(catId);
    if (catId === "all") searchParams.delete("category");
    else searchParams.set("category", catId);
    setSearchParams(searchParams, { replace: true });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (!query) searchParams.delete("q");
    else searchParams.set("q", query);
    setSearchParams(searchParams, { replace: true });
  };

  const handleOpenLocal = (local) => {
    setSelectedLocal(local);
    if (local?.id) {
      navigate(`/locals/${local.id}`, { replace: false });
    }
  };

  const handleCloseLocal = () => {
    setSelectedLocal(null);
    if (id) {
      navigate("/locals", { replace: true });
    }
  };

  const canonicalPath = matchedLocal ? `/locals/${matchedLocal.id}` : "/locals";
  const pageTitle = matchedLocal
    ? `${matchedLocal.name} — ${matchedLocal.role} in ${matchedLocal.location} | Pahadíly`
    : "Verified Local Companions & Mountain Guides in Himachal | Pahadíly";
  const pageDescription = matchedLocal
    ? `${matchedLocal.bio || `${matchedLocal.name} is a verified ${matchedLocal.role} in ${matchedLocal.location}. Languages: ${matchedLocal.lang}. Book direct local companion walks in Himachal Pradesh.`}`
    : "Connect with native mountain companions and trekking guides in Jibhi, Tirthan, and Kullu. Authentic village walks, flora insights, and local Himalayan storytelling.";
  const ogImage = matchedLocal?.image || DEFAULT_OG_IMAGE;

  const structuredData = useMemo(() => {
    const canonicalFull = getCanonicalUrl(canonicalPath);
    if (matchedLocal) {
      return [
        generatePersonSchema(matchedLocal, canonicalFull),
        generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Local Companions", url: "/locals" },
          { name: matchedLocal.name, url: canonicalPath },
        ]),
      ];
    }
    return [
      generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Local Companions", url: "/locals" },
      ]),
    ];
  }, [matchedLocal, canonicalPath]);

  return (
    <div className="pahadily-app">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={canonicalPath}
        ogImage={ogImage}
        ogType={matchedLocal ? "profile" : "website"}
        schema={structuredData}
      />
      <Navbar activePage="locals" />
      <main className="locals-page">
        {/* Hero Section */}
        <LocalsHero
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          activeFilter={activeFilter}
          setActiveFilter={handleFilterChange}
        />

        {/* Stats Bar */}
        <LocalsStatsBar />

        {/* Region Filter Chips */}
        <LocalsRegionFilter
          activeRegion={activeRegion}
          setActiveRegion={handleSelectRegion}
        />

        {/* Main Content Layout: Locals Grid + Sidebar (Map & Why Travel) */}
        <section className="locals-content-section">
          <div className="locals-content-layout section-container">
            <div className="locals-main-col">
              <LocalsGrid
                activeFilter={activeFilter}
                searchQuery={searchQuery}
                activeRegion={activeRegion}
                onSelectLocal={handleOpenLocal}
                onResetFilters={() => {
                  handleSearchChange("");
                  handleFilterChange("all");
                  handleSelectRegion("all");
                }}
              />
            </div>
            <aside className="locals-map-col">
              <LocalsMapPanel
                activeRegion={activeRegion}
                onSelectRegion={setActiveRegion}
                onSelectLocal={handleOpenLocal}
              />
            </aside>
          </div>
        </section>

        {/* Become a Host Banner */}
        <LocalsJoinCTA />
      </main>

      {/* Local Profile Modal */}
      {selectedLocal && (
        <LocalProfileModal
          local={selectedLocal}
          onClose={handleCloseLocal}
        />
      )}

      <Footer />
    </div>
  );
}

export default LocalsPage;
