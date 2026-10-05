import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocalsHero from "../components/locals/LocalsHero";
import LocalsStatsBar from "../components/locals/LocalsStatsBar";
import LocalsRegionFilter from "../components/locals/LocalsRegionFilter";
import LocalsGrid from "../components/locals/LocalsGrid";
import LocalsMapPanel from "../components/locals/LocalsMapPanel";
import LocalProfileModal from "../components/locals/LocalProfileModal";
import LocalsJoinCTA from "../components/locals/LocalsJoinCTA";

function LocalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || searchParams.get("filter") || "all";
  const initialRegion = searchParams.get("region") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [activeRegion, setActiveRegion] = useState(initialRegion);
  const [selectedLocal, setSelectedLocal] = useState(null);

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

  return (
    <div className="pahadily-app">
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
                onSelectLocal={setSelectedLocal}
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
                onSelectLocal={setSelectedLocal}
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
          onClose={() => setSelectedLocal(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default LocalsPage;
