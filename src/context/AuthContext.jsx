import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, signupUser, demoLoginUser } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('pahadily_token'));
  const [loading, setLoading] = useState(true);

  // Global UI modal states
  const [activeModal, setActiveModal] = useState(null); 
  // 'auth' | 'booking' | 'myBookings' | 'providerPortal' | 'adminPortal' | 'hostApplication' | 'destinationDetail'
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'signup'
  const [bookingTarget, setBookingTarget] = useState(null); // { item, type: 'local' | 'experience' | 'place' }
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Global toast
  const [toast, setToast] = useState(null);

  // Counter to force reload bookings / listings when state changes
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch current user on mount or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const userData = await getMe();
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem('pahadily_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        localStorage.removeItem('pahadily_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    localStorage.setItem('pahadily_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setActiveModal(null);
    showToast(`Welcome back, ${res.user.full_name}!`);
    return res.user;
  };

  const signup = async (data) => {
    const res = await signupUser(data);
    localStorage.setItem('pahadily_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setActiveModal(null);
    showToast(`Account created! Welcome to Pahadíly, ${res.user.full_name}!`);
    return res.user;
  };

  const demoLogin = async (role = 'traveler') => {
    const res = await demoLoginUser(role);
    localStorage.setItem('pahadily_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setActiveModal(null);
    showToast(`Switched to Demo ${role.toUpperCase()} (${res.user.full_name})`);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('pahadily_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  // Modal Openers
  const openAuth = (tab = 'login') => {
    setAuthTab(tab);
    setActiveModal('auth');
  };

  const openBooking = (item, type = 'local') => {
    setBookingTarget({ item, type });
    setActiveModal('booking');
  };

  const openMyBookings = () => {
    setActiveModal('myBookings');
  };

  const openProviderPortal = () => {
    setActiveModal('providerPortal');
  };

  const openAdminPortal = () => {
    setActiveModal('adminPortal');
  };

  const openHostApplication = () => {
    setActiveModal('hostApplication');
  };

  const openDestinationDetail = (destination) => {
    setSelectedDestination(destination);
    setActiveModal('destinationDetail');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role || 'guest',
    isAdmin: user?.role === 'admin',
    isHost: user?.role === 'host' || user?.role === 'guide' || user?.role === 'admin',
    activeModal,
    authTab,
    bookingTarget,
    selectedDestination,
    toast,
    refreshKey,
    login,
    signup,
    demoLogin,
    logout,
    openAuth,
    openBooking,
    openMyBookings,
    openProviderPortal,
    openAdminPortal,
    openHostApplication,
    openDestinationDetail,
    closeModal,
    showToast,
    triggerRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
