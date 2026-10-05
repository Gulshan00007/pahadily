import { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [selectedLocal, setSelectedLocal] = useState(null);

  const handleSelectRegion = (regionId) => {
    setActiveRegion(regionId);
  };

  return (
    <div className="pahadily-app">
      <Navbar activePage="locals" />
      <main className="locals-page">
        {/* Hero Section */}
        <LocalsHero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
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
