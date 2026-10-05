import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ExperiencesHero from "../components/experiences/ExperiencesHero";
import FeaturedExperiences from "../components/experiences/FeaturedExperiences";
import ExploreByExperience from "../components/experiences/ExploreByExperience";
import HowItWorks from "../components/experiences/HowItWorks";

function ExperiencesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="pahadily-app">
      <Navbar activePage="experiences" />
      <main className="experiences-page">
        <ExperiencesHero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <div className="experiences-page-content">
          <FeaturedExperiences />
          <ExploreByExperience />
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ExperiencesPage;
