import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ExperiencesPage from './pages/ExperiencesPage';
import CompanionsPage from './pages/CompanionsPage';
import StaysPage from './pages/StaysPage';
import BecomeALocalPage from './pages/BecomeALocalPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProviderPortalPage from './pages/ProviderPortalPage';
import AdminPortalPage from './pages/AdminPortalPage';

// Global Modals & Notifications
import AuthModal from './components/modals/AuthModal';
import BookingModal from './components/modals/BookingModal';
import MyBookingsModal from './components/modals/MyBookingsModal';
import ProviderPortalModal from './components/modals/ProviderPortalModal';
import AdminPortalModal from './components/modals/AdminPortalModal';
import HostApplicationModal from './components/modals/HostApplicationModal';
import DestinationDetailModal from './components/modals/DestinationDetailModal';
import Toast from './components/Toast';

function AppLayout() {
  return (
    <div
      className="pahadily-app"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F7F5EE',
      }}
    >
      {/* 1. Official Pahadíly Brand Logo & Role-Aware Sticky Navbar */}
      <Navbar />

      {/* 2. Main Content Routing */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/companions" element={<CompanionsPage />} />
          <Route path="/locals" element={<CompanionsPage />} />
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/stories" element={<Navigate to="/explore" replace />} />
          <Route path="/become-a-local" element={<BecomeALocalPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/provider-portal" element={<ProviderPortalPage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
          {/* Fallback to Home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* 3. Authentic Himalayan Footer */}
      <Footer />

      {/* 4. Global Modals (accessible across all pages & buttons) */}
      <AuthModal />
      <BookingModal />
      <MyBookingsModal />
      <ProviderPortalModal />
      <AdminPortalModal />
      <HostApplicationModal />
      <DestinationDetailModal />

      {/* 5. Notification Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}