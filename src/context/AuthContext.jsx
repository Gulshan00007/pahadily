import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, loginUser, signupUser, demoLoginUser, sendRegistrationOtp, verifyRegistrationOtp } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("pahadily_token"));
  const [loading, setLoading] = useState(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'signup'

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null); // { item, type: 'local' | 'place' | 'experience' }

  const [myBookingsOpen, setMyBookingsOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch current user if token exists
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
          // Token invalid
          localStorage.removeItem("pahadily_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        localStorage.removeItem("pahadily_token");
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
    localStorage.setItem("pahadily_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Welcome back, ${res.user.full_name}!`);
    return res.user;
  };

  const signup = async (data) => {
    const res = await signupUser(data);
    localStorage.setItem("pahadily_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Account created! Welcome to Pahadíly, ${res.user.full_name}!`);
    return res.user;
  };

  const requestRegistrationOtp = async (data) => {
    const res = await sendRegistrationOtp(data);
    showToast(res.message || "Verification code sent!");
    return res;
  };

  const confirmRegistrationOtp = async ({ email, otp_code }) => {
    const res = await verifyRegistrationOtp({ email, otp_code });
    localStorage.setItem("pahadily_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Account verified! Welcome to Pahadíly, ${res.user.full_name}!`);
    return res.user;
  };

  const demoLogin = async (role = "traveler") => {
    const res = await demoLoginUser(role);
    localStorage.setItem("pahadily_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Logged in as Demo ${role.toUpperCase()} (${res.user.full_name})`);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("pahadily_token");
    setToken(null);
    setUser(null);
    showToast("You have been logged out", "info");
  };

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const openBooking = (item, type = "local") => {
    setBookingTarget({ item, type });
    setBookingModalOpen(true);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role || "guest",
    isAdmin: user?.role === "admin",
    isHost: user?.role === "host" || user?.role === "admin",
    login,
    signup,
    requestRegistrationOtp,
    confirmRegistrationOtp,
    demoLogin,
    logout,
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    bookingModalOpen,
    setBookingModalOpen,
    bookingTarget,
    openBooking,
    myBookingsOpen,
    setMyBookingsOpen,
    toast,
    showToast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
