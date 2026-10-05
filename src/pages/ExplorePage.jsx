import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ExploreHero from "../components/explore/ExploreHero";
import ExploreDestinationsGrid from "../components/explore/ExploreDestinationsGrid";
import ExploreMapPanel from "../components/explore/ExploreMapPanel";

function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || searchParams.get("filter") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    const cat = searchParams.get("category") || searchParams.get("filter");
    if (cat && cat !== activeFilter) {
      setActiveFilter(cat);
    }
    const q = searchParams.get("q");
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    if (newFilter === "all") {
      searchParams.delete("category");
      searchParams.delete("filter");
    } else {
      searchParams.set("category", newFilter);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleSearchChange = (newQuery) => {
    setSearchQuery(newQuery);
    if (!newQuery) {
      searchParams.delete("q");
    } else {
      searchParams.set("q", newQuery);
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="pahadily-app">
      <Navbar activePage="explore" />
      <main className="explore-page">
        <ExploreHero
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          activeFilter={activeFilter}
          setActiveFilter={handleFilterChange}
        />
        <section className="explore-content-section">
          <div className="explore-content-layout">
            <div className="explore-main-col">
              <ExploreDestinationsGrid
                activeFilter={activeFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchQuery}
                onResetFilters={() => {
                  handleSearchChange("");
                  handleFilterChange("all");
                }}
              />
            </div>
            <aside className="explore-map-col">
              <ExploreMapPanel />
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ExplorePage;
