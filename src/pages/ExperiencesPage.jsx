import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ExperiencesHero from "../components/experiences/ExperiencesHero";
import FeaturedExperiences from "../components/experiences/FeaturedExperiences";
import ExploreByExperience from "../components/experiences/ExploreByExperience";
import HowItWorks from "../components/experiences/HowItWorks";

function ExperiencesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || searchParams.get("filter") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialCategory);

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

  const handleFilterChange = (newCat) => {
    setActiveFilter(newCat);
    if (newCat === "all") {
      searchParams.delete("category");
      searchParams.delete("filter");
    } else {
      searchParams.set("category", newCat);
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
      <Navbar activePage="experiences" />
      <main className="experiences-page">
        <ExperiencesHero
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          activeFilter={activeFilter}
          setActiveFilter={handleFilterChange}
        />
        <div className="experiences-page-content">
          <FeaturedExperiences
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            activeFilter={activeFilter}
            setActiveFilter={handleFilterChange}
          />
          <ExploreByExperience
            activeFilter={activeFilter}
            setActiveFilter={handleFilterChange}
          />
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ExperiencesPage;
