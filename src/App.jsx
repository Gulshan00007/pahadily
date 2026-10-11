import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedDestinations from "./components/FeaturedDestinations";
import ImpactSection from "./components/ImpactSection";
import Footer from "./components/Footer";
import SEO from "./components/common/SEO";
import ExplorePage from "./pages/ExplorePage";
import BookStayPage from "./pages/BookStayPage";
import ExperiencesPage from "./pages/ExperiencesPage";
import LocalsPage from "./pages/LocalsPage";
import AdminPage from "./pages/AdminPage";
import HostPortalPage from "./pages/HostPortalPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthModal from "./components/auth/AuthModal";
import BookingModal from "./components/booking/BookingModal";
import MyBookingsModal from "./components/booking/MyBookingsModal";
import Toast from "./components/common/Toast";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
} from "./utils/seo";

function HomePage() {
  const homeSchemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateBreadcrumbSchema([{ name: "Home", url: "/" }]),
  ];

  return (
    <div className="pahadily-app">
      <SEO
        title="Pahadíly | Discover Hidden Places & Homestays in Himachal Pradesh"
        description="Discover authentic Himalayan homestays, local mountain guides, and slow community travel experiences across Kullu, Tirthan, and offbeat Himachal Pradesh valleys."
        canonicalPath="/"
        ogImage="/images/hero/himachal-hero.jpg"
        schema={homeSchemas}
      />
      <Navbar activePage="home" />
      <main>
        <Hero />
        <FeaturedDestinations />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Indexable Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          
          {/* Destination Deep-Dive Canonical Routes */}
          <Route path="/destinations/:slug" element={<ExplorePage />} />
          <Route path="/destination/:slug" element={<ExplorePage />} />
          <Route path="/explore/:slug" element={<ExplorePage />} />

          {/* Stays & Accommodation Routes */}
          <Route path="/stays" element={<BookStayPage />} />
          <Route path="/book-stay" element={<BookStayPage />} />
          <Route path="/book" element={<BookStayPage />} />
          <Route path="/stays/:stayId" element={<ExplorePage />} />
          <Route path="/stay/:stayId" element={<ExplorePage />} />

          {/* Attractions Routes */}
          <Route path="/attractions/:attractionId" element={<ExplorePage />} />
          <Route path="/attraction/:attractionId" element={<ExplorePage />} />

          {/* Slow Travel Experiences Routes */}
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/experiences/:id" element={<ExperiencesPage />} />

          {/* Local Companions & Mountain Guides Routes */}
          <Route path="/locals" element={<LocalsPage />} />
          <Route path="/locals/:id" element={<LocalsPage />} />

          {/* Partner & Host Portals (noindex) */}
          <Route path="/host" element={<HostPortalPage />} />
          <Route path="/host-portal" element={<HostPortalPage />} />
          <Route path="/become-a-host" element={<HostPortalPage />} />

          {/* Operations & Administration (noindex, nofollow) */}
          <Route path="/admin" element={<AdminPage />} />

          {/* 404 Catch-All Route with Crawlable Links */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global Modals & Notifications */}
        <AuthModal />
        <BookingModal />
        <MyBookingsModal />
        <Toast />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;