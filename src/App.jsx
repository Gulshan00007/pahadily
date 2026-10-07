import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StartupPillars from "./components/StartupPillars";
import HostOnboarding from "./components/HostOnboarding";
import FeaturedDestinations from "./components/FeaturedDestinations";
import ImpactSection from "./components/ImpactSection";
import Footer from "./components/Footer";
import ExplorePage from "./pages/ExplorePage";
import BookStayPage from "./pages/BookStayPage";
import ExperiencesPage from "./pages/ExperiencesPage";
import LocalsPage from "./pages/LocalsPage";
import AdminPage from "./pages/AdminPage";
import AuthModal from "./components/auth/AuthModal";
import BookingModal from "./components/booking/BookingModal";
import MyBookingsModal from "./components/booking/MyBookingsModal";
import Toast from "./components/common/Toast";

function HomePage() {
  return (
    <div className="pahadily-app">
      <Navbar activePage="home" />
      <main>
        <Hero />
        <FeaturedDestinations />
        <StartupPillars />
        <HostOnboarding />
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
          <Route path="/" element={<HomePage />} />
          <Route path="/book-stay" element={<BookStayPage />} />
          <Route path="/book" element={<BookStayPage />} />
          <Route path="/stays" element={<BookStayPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/locals" element={<LocalsPage />} />
          <Route path="/admin" element={<AdminPage />} />
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