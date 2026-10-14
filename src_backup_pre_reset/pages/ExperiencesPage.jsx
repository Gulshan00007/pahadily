import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/common/SEO";
import ExperiencesHero from "../components/experiences/ExperiencesHero";
import FeaturedExperiences from "../components/experiences/FeaturedExperiences";
import ExploreByExperience from "../components/experiences/ExploreByExperience";
import HowItWorks from "../components/experiences/HowItWorks";
import { VERIFIED_EXPERIENCES } from "../data/experiencesData";
import {
  generateTouristTripSchema,
  generateBreadcrumbSchema,
  getCanonicalUrl,
} from "../utils/seo";

function ExperiencesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();

  const matchedExperience = useMemo(() => {
    if (!id) return null;
    return VERIFIED_EXPERIENCES.find((e) => String(e.id) === String(id)) || null;
  }, [id]);

  const initialCategory = searchParams.get("category") || searchParams.get("filter") || (matchedExperience?.category || "all");
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialCategory);

  useEffect(() => {
    if (matchedExperience) {
      if (matchedExperience.category) {
        setActiveFilter(matchedExperience.category);
      }
    }
  }, [matchedExperience]);

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

  const canonicalPath = matchedExperience ? `/experiences/${matchedExperience.id}` : "/experiences";
  const pageTitle = matchedExperience
    ? `${matchedExperience.title} in ${matchedExperience.location} | Pahadíly`
    : "Authentic Himalayan Slow Travel Experiences & Trails | Pahadíly";
  const pageDescription = matchedExperience
    ? `${matchedExperience.description} Guided by ${matchedExperience.guide}. Duration: ${matchedExperience.duration}. Price: ${matchedExperience.price} ${matchedExperience.unit}. Authentic Himachal Pradesh slow travel experience.`
    : "Experience slow community-guided journeys across Himachal Pradesh: hidden deodar forest walks, authentic Himachali home meals, and sunrise ridge treks.";
  const ogImage = matchedExperience?.image || "/images/experiences/forest-walk.jpg";

  const structuredData = useMemo(() => {
    const canonicalFull = getCanonicalUrl(canonicalPath);
    if (matchedExperience) {
      return [
        generateTouristTripSchema(matchedExperience, canonicalFull),
        generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Local Experiences", url: "/experiences" },
          { name: matchedExperience.title, url: canonicalPath },
        ]),
      ];
    }
    return [
      generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Local Experiences", url: "/experiences" },
      ]),
    ];
  }, [matchedExperience, canonicalPath]);

  return (
    <div className="pahadily-app">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={canonicalPath}
        ogImage={ogImage}
        ogType={matchedExperience ? "article" : "website"}
        schema={structuredData}
      />
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
