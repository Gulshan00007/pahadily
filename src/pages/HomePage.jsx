import Hero from '../components/Hero';
import ExploreByCategorySection from '../components/ExploreByCategorySection';
import PilotValleysSection from '../components/PilotValleysSection';
import ExperiencesSection from '../components/ExperiencesSection';
import LocalCompanionsSection from '../components/LocalCompanionsSection';
import CommunityImpactSection from '../components/CommunityImpactSection';
import HowItWorksEthos from '../components/HowItWorksEthos';
import HostCommunityBanner from '../components/HostCommunityBanner';
import ResponsibleTravelSection from '../components/ResponsibleTravelSection';

export default function HomePage() {
  return (
    <div className="homepage-content">
      {/* 1. Preserved Hero Section with search, handwritten notes, and pilot pills */}
      <Hero />

      {/* 2. Explore by Category */}
      <ExploreByCategorySection />

      {/* 3. Featured Himalayan Destinations (Kullu Pilot Valleys) */}
      <PilotValleysSection />

      {/* 4. Recommended Local Experiences */}
      <ExperiencesSection />

      {/* 5. Verified Local Companions */}
      <LocalCompanionsSection />

      {/* 6. Community Impact & Economic Retention Model */}
      <CommunityImpactSection />

      {/* 7. Pahadíly 4-Step Working Ethos */}
      <HowItWorksEthos />

      {/* 8. Host Onboarding Call to Action */}
      <HostCommunityBanner />

      {/* 9. Sacred Devta & Leave-No-Trace Mountain Codes */}
      <ResponsibleTravelSection />
    </div>
  );
}
