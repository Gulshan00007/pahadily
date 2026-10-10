import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  getPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  getLocals,
  createLocal,
  updateLocal,
  deleteLocal,
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getAllBookings,
  updateBookingStatus,
  updateBookingPayment,
  deleteBooking,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getHostApplications,
  updateHostApplicationStatus,
  getStats,
} from "../lib/api";

function AdminPage() {
  const { user, isHost, isAdmin, login, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    places: 0,
    experiences: 0,
    locals: 0,
    bookings: 0,
    users: 0,
    total_revenue: "₹0",
    paid_revenue: "₹0",
    pending_revenue: "₹0",
    bookings_confirmed: 0,
    bookings_pending: 0,
    bookings_cancelled: 0,
  });

  // Admin gate login form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [gateError, setGateError] = useState("");
  const [gateSubmitting, setGateSubmitting] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userVerifiedFilter, setUserVerifiedFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState("all");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");

  // Host Applications state
  const [applications, setApplications] = useState([]);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");

  // Places state
  const [places, setPlaces] = useState([]);
  const [placeForm, setPlaceForm] = useState({
    name: "",
    tagline: "",
    region: "tirthan",
    category: "River Chalet",
    price: "₹2,400",
    unit: "/night",
    altitude: "1,800m",
    tags: "Pine Forest, Bonfire, Trout Stream, Home Food",
    image: "/images/destinations/tirthan-valley.jpg",
    description: "",
    host_name: "",
  });
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");

  // Locals state
  const [locals, setLocals] = useState([]);
  const [localForm, setLocalForm] = useState({
    name: "",
    role: "Local Companion",
    category: "companions",
    region: "jibhi",
    location: "Jibhi, Himachal Pradesh",
    lang: "Hindi, English, Pahadi",
    price: "₹600",
    unit: "/day",
    tags: "Village Walks, Hidden Spots, River Trails",
    image: "",
    gradient: "linear-gradient(135deg, #2b7050, #78caa0)",
    bio: "",
    verified: true,
    certified: false,
    phone: "",
    email: "",
  });
  const [editingLocalId, setEditingLocalId] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // Experiences state
  const [experiences, setExperiences] = useState([]);
  const [expForm, setExpForm] = useState({
    title: "",
    region: "jibhi",
    location: "Jibhi, Himachal Pradesh",
    category: "nature",
    duration: "2–3 hours",
    difficulty: "Easy",
    price: "₹500",
    unit: "per person",
    guide: "Local Host",
    image: "/images/experiences/forest-walk.jpg",
    description: "",
    inclusions: "Guided Walk, Herbal Tea, Nature Lore",
  });
  const [editingExpId, setEditingExpId] = useState(null);
  const [expSearchQuery, setExpSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load data when authorized
  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const s = await getStats().catch(() => ({}));
      setStats((prev) => ({ ...prev, ...s }));

      if (activeTab === "overview") {
        const [b, u, h] = await Promise.all([
          getAllBookings().catch(() => []),
          getUsers().catch(() => []),
          getHostApplications().catch(() => []),
        ]);
        setBookings(b.slice(0, 5));
        setUsersList(u.slice(0, 5));
        setApplications(h);
      } else if (activeTab === "bookings") {
        const b = await getAllBookings({
          status: bookingStatusFilter,
          payment_status: bookingPaymentFilter,
          q: bookingSearchQuery,
        });
        setBookings(b);
      } else if (activeTab === "users") {
        const u = await getUsers({
          role: userRoleFilter,
          verified: userVerifiedFilter,
          q: userSearchQuery,
        });
        setUsersList(u);
      } else if (activeTab === "applications") {
        const h = await getHostApplications();
        setApplications(h);
      } else if (activeTab === "places") {
        const p = await getPlaces();
        setPlaces(p);
      } else if (activeTab === "locals") {
        const l = await getLocals();
        setLocals(l);
      } else if (activeTab === "experiences") {
        const e = await getExperiences();
        setExperiences(e);
      }
    } catch (err) {
      console.error("Error loading control data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    activeTab,
    bookingStatusFilter,
    bookingPaymentFilter,
    bookingSearchQuery,
    userRoleFilter,
    userVerifiedFilter,
    userSearchQuery,
    user,
    isAdmin,
  ]);

  // Handle Admin Gate Login
  const handleGateLogin = async (e) => {
    e.preventDefault();
    setGateError("");
    setGateSubmitting(true);
    try {
      const loggedUser = await login(adminEmail, adminPassword);
      if (loggedUser.role !== "admin") {
        setGateError("Access restricted. This page is strictly for Platform Administrators.");
      } else {
        showToast(`Welcome to Platform Control, ${loggedUser.full_name}!`);
      }
    } catch (err) {
      setGateError(err.message || "Invalid administrator credentials");
    } finally {
      setGateSubmitting(false);
    }
  };

  // --- User & Account Handlers ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole.toUpperCase()}`);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to update role", "error");
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await updateUserStatus(userId, { is_active: !currentActive });
      showToast(`Account ${!currentActive ? "activated" : "suspended"}`);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to update account status", "error");
    }
  };

  const handleToggleUserVerify = async (userId, currentVerified) => {
    try {
      await updateUserStatus(userId, { is_verified: !currentVerified });
      showToast(`Account verification updated!`);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to update verification", "error");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete account "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      showToast(`Account "${userName}" deleted.`);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to delete user", "error");
    }
  };

  const handleCleanUnverifiedUsers = async () => {
    const unverifiedList = usersList.filter((u) => !u.is_verified && u.id !== user.id);
    if (unverifiedList.length === 0) {
      showToast("No unverified user accounts found.", "info");
      return;
    }
    if (!window.confirm(`Clean and delete ${unverifiedList.length} unverified account(s)?`)) return;
    try {
      let deletedCount = 0;
      for (const u of unverifiedList) {
        await deleteUser(u.id);
        deletedCount++;
      }
      showToast(`Cleaned ${deletedCount} unverified account(s) successfully.`);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to clean unverified users", "error");
    }
  };

  // --- Booking & Payment Handlers ---
  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      showToast(`Reservation #${bookingId} marked as ${newStatus.toUpperCase()}`);
      loadData();
    } catch (err) {
      showToast(err.message || "Status update failed", "error");
    }
  };

  const handleBookingPaymentChange = async (bookingId, newPaymentStatus) => {
    try {
      await updateBookingPayment(bookingId, { payment_status: newPaymentStatus });
      showToast(`Payment for Booking #${bookingId} marked as ${newPaymentStatus.toUpperCase()}`);
      loadData();
    } catch (err) {
      showToast(err.message || "Payment update failed", "error");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(`Delete reservation #${bookingId}? This cannot be undone.`)) return;
    try {
      await deleteBooking(bookingId);
      showToast(`Reservation #${bookingId} removed.`);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to delete booking", "error");
    }
  };

  // --- Host Application Handlers ---
  const handleApproveHostApp = async (appId, applicantName) => {
    try {
      const res = await updateHostApplicationStatus(appId, "approved", adminNotesInput || undefined);
      if (res?.published_place_id) {
        showToast(`Approved ${applicantName}! Sanctuary published live as Place #${res.published_place_id}`);
      } else {
        showToast(`Approved ${applicantName}! Account upgraded to Host.`);
      }
      setSelectedAppModal(null);
      setAdminNotesInput("");
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to approve application", "error");
    }
  };

  const handleRejectHostApp = async (appId) => {
    try {
      await updateHostApplicationStatus(appId, "rejected", adminNotesInput || undefined);
      showToast("Application marked as rejected.");
      setSelectedAppModal(null);
      setAdminNotesInput("");
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to update application", "error");
    }
  };

  // --- Place Handlers ---
  const handleSavePlace = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        name: placeForm.name,
        tagline: placeForm.tagline,
        region: placeForm.region,
        category: placeForm.category,
        price: placeForm.price,
        unit: placeForm.unit,
        altitude: placeForm.altitude,
        tags: typeof placeForm.tags === "string" ? placeForm.tags.split(",").map((s) => s.trim()).filter(Boolean) : placeForm.tags,
        image: placeForm.image || "/images/destinations/tirthan-valley.jpg",
        description: placeForm.description,
        host_name: placeForm.host_name || user?.full_name || "Pahadíly Host",
      };

      if (editingPlaceId) {
        await updatePlace(editingPlaceId, payload);
        showToast(`Place "${payload.name}" updated successfully!`);
        setEditingPlaceId(null);
      } else {
        await createPlace(payload);
        showToast(`New Place "${payload.name}" published live!`);
      }

      setPlaceForm({
        name: "",
        tagline: "",
        region: "tirthan",
        category: "River Chalet",
        price: "₹2,400",
        unit: "/night",
        altitude: "1,800m",
        tags: "Pine Forest, Bonfire, Trout Stream, Home Food",
        image: "/images/destinations/tirthan-valley.jpg",
        description: "",
        host_name: "",
      });
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to save place", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditPlace = (p) => {
    setEditingPlaceId(p.id);
    setPlaceForm({
      name: p.name,
      tagline: p.tagline,
      region: p.region,
      category: p.category,
      price: p.price,
      unit: p.unit || "/night",
      altitude: p.altitude || "1,800m",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
      image: p.image || "",
      description: p.description || "",
      host_name: p.host_name || "",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeletePlace = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deletePlace(id);
      showToast(`Place "${name}" deleted.`);
      loadData();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  // --- Local Guide Handlers ---
  const handleSaveLocal = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        name: localForm.name,
        role: localForm.role,
        category: localForm.category,
        region: localForm.region,
        location: localForm.location,
        lang: localForm.lang,
        price: localForm.price,
        unit: localForm.unit,
        tags: typeof localForm.tags === "string" ? localForm.tags.split(",").map((s) => s.trim()).filter(Boolean) : localForm.tags,
        image: localForm.image || null,
        gradient: localForm.gradient,
        bio: localForm.bio,
        verified: localForm.verified,
        certified: localForm.certified,
        phone: localForm.phone,
        email: localForm.email,
      };

      if (editingLocalId) {
        await updateLocal(editingLocalId, payload);
        showToast(`Guide "${payload.name}" updated!`);
        setEditingLocalId(null);
      } else {
        await createLocal(payload);
        showToast(`New Local "${payload.name}" added!`);
      }

      setLocalForm({
        name: "",
        role: "Local Companion",
        category: "companions",
        region: "jibhi",
        location: "Jibhi, Himachal Pradesh",
        lang: "Hindi, English, Pahadi",
        price: "₹600",
        unit: "/day",
        tags: "Village Walks, Hidden Spots, River Trails",
        image: "",
        gradient: "linear-gradient(135deg, #2b7050, #78caa0)",
        bio: "",
        verified: true,
        certified: false,
        phone: "",
        email: "",
      });
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to save person", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditLocal = (l) => {
    setEditingLocalId(l.id);
    setLocalForm({
      name: l.name,
      role: l.role,
      category: l.category,
      region: l.region,
      location: l.location,
      lang: l.lang,
      price: l.price,
      unit: l.unit || "/day",
      tags: Array.isArray(l.tags) ? l.tags.join(", ") : l.tags || "",
      image: l.image || "",
      gradient: l.gradient || "linear-gradient(135deg, #2b7050, #78caa0)",
      bio: l.bio || "",
      verified: l.verified ?? true,
      certified: l.certified ?? false,
      phone: l.phone || "",
      email: l.email || "",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteLocal = async (id, name) => {
    if (!window.confirm(`Delete local profile "${name}"?`)) return;
    try {
      await deleteLocal(id);
      showToast(`Local "${name}" removed.`);
      loadData();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  // --- Experience Handlers ---
  const handleSaveExp = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        title: expForm.title,
        region: expForm.region,
        location: expForm.location,
        category: expForm.category,
        duration: expForm.duration,
        difficulty: expForm.difficulty,
        price: expForm.price,
        unit: expForm.unit,
        guide: expForm.guide,
        image: expForm.image || "/images/experiences/forest-walk.jpg",
        description: expForm.description,
        inclusions: typeof expForm.inclusions === "string" ? expForm.inclusions.split(",").map((s) => s.trim()).filter(Boolean) : expForm.inclusions,
      };

      if (editingExpId) {
        await updateExperience(editingExpId, payload);
        showToast(`Experience "${payload.title}" updated!`);
        setEditingExpId(null);
      } else {
        await createExperience(payload);
        showToast(`Experience "${payload.title}" created!`);
      }

      setExpForm({
        title: "",
        region: "jibhi",
        location: "Jibhi, Himachal Pradesh",
        category: "nature",
        duration: "2–3 hours",
        difficulty: "Easy",
        price: "₹500",
        unit: "per person",
        guide: "Local Host",
        image: "/images/experiences/forest-walk.jpg",
        description: "",
        inclusions: "Guided Walk, Herbal Tea, Nature Lore",
      });
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to save experience", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditExp = (e) => {
    setEditingExpId(e.id);
    setExpForm({
      title: e.title,
      region: e.region,
      location: e.location,
      category: e.category,
      duration: e.duration,
      difficulty: e.difficulty,
      price: e.price,
      unit: e.unit,
      guide: e.guide,
      image: e.image,
      description: e.description || "",
      inclusions: Array.isArray(e.inclusions) ? e.inclusions.join(", ") : e.inclusions || "",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteExp = async (id, title) => {
    if (!window.confirm(`Delete experience "${title}"?`)) return;
    try {
      await deleteExperience(id);
      showToast(`Experience "${title}" deleted.`);
      loadData();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  // --- ACCESS GATE: HOST ATTEMPTING ADMIN ACCESS ---
  if (user && isHost && !isAdmin) {
    return (
      <div className="pahadily-app">
        <Navbar activePage="admin" />
        <main className="admin-gate-page">
          <div className="admin-gate-card">
            <div className="admin-gate-header">
              <div className="admin-gate-icon">🏡</div>
              <h2>Host Account Detected</h2>
              <p>
                Platform Operations & Financial Management is strictly restricted to Platform Administrators.
              </p>
              <p style={{ marginTop: "12px", color: "#2b7050", fontSize: "0.92rem", lineHeight: "1.5" }}>
                As a Mountain Host, please use your dedicated <strong>Host Portal</strong> to list stays, manage details, and track approval status.
              </p>
            </div>
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
              <a
                href="/host"
                className="admin-gate-btn"
                style={{ display: "inline-block", textDecoration: "none", textAlign: "center", width: "auto", padding: "12px 28px" }}
              >
                Go to Host Portal (List Your Stay) →
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ACCESS GATE FOR NON-ADMINISTRATORS ---
  if (!isAdmin) {
    return (
      <div className="pahadily-app">
        <Navbar activePage="admin" />
        <main className="admin-gate-page">
          <div className="admin-gate-card">
            <div className="admin-gate-header">
              <div className="admin-gate-icon">👑</div>
              <h2>Platform Administrator Access</h2>
              <p>Sign in with verified administrator credentials to access platform management.</p>
            </div>

            {gateError && <div className="admin-gate-error">{gateError}</div>}

            <form onSubmit={handleGateLogin} className="admin-gate-form">
              <div className="admin-form-group">
                <label>Administrator Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@pahadily.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="admin-input"
                />
              </div>

              <button type="submit" disabled={gateSubmitting} className="admin-gate-btn">
                {gateSubmitting ? "Authenticating..." : "Unlock Operations Center →"}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pahadily-app">
      <Navbar activePage="admin" />

      <main className="admin-dashboard-page">
        {/* Dashboard Top Header */}
        <section className="admin-header-section">
          <div className="admin-header-container">
            <div className="admin-badge-row">
              <span className="admin-role-badge">
                👑 Master Platform Administrator
              </span>
              <span className="admin-live-pulse">
                <span className="dot"></span> Live Sync Active
              </span>
            </div>
            <h1 className="admin-dash-title">Pahadíly Operations & Control</h1>
            <p className="admin-dash-subtitle">
              Manage live bookings, accounts, payments, sanctuaries, experiences, and native companions.
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="admin-tabs-nav">
          <div className="admin-tabs-container">
            <button
              className={`admin-nav-tab${activeTab === "overview" ? " active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Financial Overview
            </button>
            <button
              className={`admin-nav-tab${activeTab === "bookings" ? " active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              📅 Bookings & Payments
              {stats.bookings_pending > 0 && (
                <span className="tab-pill-alert">{stats.bookings_pending}</span>
              )}
            </button>
            <button
              className={`admin-nav-tab${activeTab === "users" ? " active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 Accounts & Users ({stats.users || 0})
            </button>
            <button
              className={`admin-nav-tab${activeTab === "applications" ? " active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              📝 Host Applications
            </button>
            <button
              className={`admin-nav-tab${activeTab === "places" ? " active" : ""}`}
              onClick={() => setActiveTab("places")}
            >
              🏔️ Stays & Sanctuaries ({stats.places || 0})
            </button>
            <button
              className={`admin-nav-tab${activeTab === "experiences" ? " active" : ""}`}
              onClick={() => setActiveTab("experiences")}
            >
              🧭 Experiences & Treks ({stats.experiences || 0})
            </button>
            <button
              className={`admin-nav-tab${activeTab === "locals" ? " active" : ""}`}
              onClick={() => setActiveTab("locals")}
            >
              🤝 Native Guides ({stats.locals || 0})
            </button>
          </div>
        </div>

        {/* Tab Content Section */}
        <div className="admin-main-container">
          {/* ========================================================= */}
          {/* TAB 1: FINANCIAL & OPERATIONS OVERVIEW                    */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="admin-overview-tab">
              {/* Financial KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="kpi-card revenue-card">
                  <div className="kpi-icon">💰</div>
                  <div className="kpi-info">
                    <span className="kpi-label">Gross Platform Revenue</span>
                    <strong className="kpi-val">{stats.total_revenue || "₹0"}</strong>
                    <span className="kpi-sub green">Paid & Processed: {stats.paid_revenue || "₹0"}</span>
                  </div>
                </div>

                <div className="kpi-card bookings-card">
                  <div className="kpi-icon">🎟️</div>
                  <div className="kpi-info">
                    <span className="kpi-label">Total Reservations</span>
                    <strong className="kpi-val">{stats.bookings || 0}</strong>
                    <span className="kpi-sub">
                      ✓ {stats.bookings_confirmed || 0} Confirmed • ⏳ {stats.bookings_pending || 0} Pending
                    </span>
                  </div>
                </div>

                <div className="kpi-card users-card">
                  <div className="kpi-icon">👥</div>
                  <div className="kpi-info">
                    <span className="kpi-label">Registered Accounts</span>
                    <strong className="kpi-val">{stats.users || 0}</strong>
                    <span className="kpi-sub">
                      {stats.users_travelers || 0} Travelers • {stats.users_hosts || 0} Hosts
                    </span>
                  </div>
                </div>

                <div className="kpi-card inventory-card">
                  <div className="kpi-icon">🏔️</div>
                  <div className="kpi-info">
                    <span className="kpi-label">Active Himalayan Sanctuaries</span>
                    <strong className="kpi-val">{stats.places || 0}</strong>
                    <span className="kpi-sub">{stats.locals || 0} Verified Guides</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="admin-overview-split">
                {/* Recent Bookings Quick Table */}
                <div className="overview-card">
                  <div className="overview-card-header">
                    <h3>Recent Reservations</h3>
                    <button className="overview-link-btn" onClick={() => setActiveTab("bookings")}>
                      View All →
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <p className="empty-txt">No recent bookings recorded.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Traveler</th>
                            <th>Sanctuary / Experience</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((b) => (
                            <tr key={b.id}>
                              <td><strong>#{b.id}</strong></td>
                              <td>{b.traveler_name}</td>
                              <td>{b.item_title}</td>
                              <td><strong>{b.total_price || "₹2,000"}</strong></td>
                              <td>
                                <span className={`payment-pill ${b.payment_status || "paid"}`}>
                                  {b.payment_status?.toUpperCase() || "PAID"}
                                </span>
                              </td>
                              <td>
                                <span className={`status-pill ${b.status}`}>
                                  {b.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Quick Management Shortcuts */}
                <div className="overview-card shortcuts-card">
                  <div className="overview-card-header">
                    <h3>Management Quick Access</h3>
                  </div>
                  <div className="shortcuts-grid">
                    <button className="shortcut-btn" onClick={() => setActiveTab("places")}>
                      <span className="icon">🏡</span>
                      <strong>Add New Stay</strong>
                      <small>Publish homestay or chalet</small>
                    </button>
                    <button className="shortcut-btn" onClick={() => setActiveTab("locals")}>
                      <span className="icon">🤝</span>
                      <strong>Verify Guide</strong>
                      <small>Add local mountain companion</small>
                    </button>
                    <button className="shortcut-btn" onClick={() => setActiveTab("users")}>
                      <span className="icon">👥</span>
                      <strong>Manage Users</strong>
                      <small>Assign roles & review hosts</small>
                    </button>
                    <button className="shortcut-btn" onClick={() => setActiveTab("bookings")}>
                      <span className="icon">💳</span>
                      <strong>Process Payments</strong>
                      <small>Review receipts & status</small>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: BOOKINGS & PAYMENTS                                */}
          {/* ========================================================= */}
          {activeTab === "bookings" && (
            <div className="admin-bookings-tab">
              <div className="admin-tab-topbar">
                <div>
                  <h2>All Reservations & Transactions</h2>
                  <p>Track guest dates, verify payment confirmations, and manage reservation statuses.</p>
                </div>

                {/* Filters */}
                <div className="admin-filters-row">
                  <input
                    type="text"
                    placeholder="Search traveler, email, Ref ID..."
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    className="admin-search-input"
                  />
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">All Booking Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={bookingPaymentFilter}
                    onChange={(e) => setBookingPaymentFilter(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Payment Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="admin-loading">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="admin-empty">No reservations matching current filter.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table full-width">
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Traveler & Contact</th>
                        <th>Sanctuary / Entity</th>
                        <th>Dates & Guests</th>
                        <th>Total Amount</th>
                        <th>Payment Method & Status</th>
                        <th>Reservation Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong>#{b.id}</strong>
                            <div className="ref-code">{b.payment_id || `PHD-PAY-${b.id}`}</div>
                          </td>
                          <td>
                            <strong>{b.traveler_name}</strong>
                            <div className="sub-contact">{b.traveler_email}</div>
                            {b.traveler_phone && <div className="sub-contact">📞 {b.traveler_phone}</div>}
                          </td>
                          <td>
                            <div className="entity-cell">
                              <span className="entity-type-badge">{b.booking_type}</span>
                              <strong>{b.item_title}</strong>
                            </div>
                          </td>
                          <td>
                            <div>📅 {b.travel_date}</div>
                            {b.end_date && <div className="sub-contact">to {b.end_date}</div>}
                            <div className="sub-contact">👥 {b.guests}</div>
                          </td>
                          <td>
                            <strong className="price-bold">{b.total_price || "₹2,000"}</strong>
                          </td>
                          <td>
                            <div className="payment-cell">
                              <span className="pay-method-tag">{(b.payment_method || "UPI").toUpperCase()}</span>
                              <span className={`payment-pill ${b.payment_status || "paid"}`}>
                                {b.payment_status?.toUpperCase() || "PAID"}
                              </span>
                              {b.transaction_ref && (
                                <small className="txn-ref-small">{b.transaction_ref}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <select
                              value={b.status}
                              onChange={(e) => handleBookingStatusChange(b.id, e.target.value)}
                              className={`status-select ${b.status}`}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              {b.payment_status !== "paid" && (
                                <button
                                  className="action-btn-mini pay"
                                  onClick={() => handleBookingPaymentChange(b.id, "paid")}
                                  title="Mark as Paid"
                                >
                                  ✓ Mark Paid
                                </button>
                              )}
                              {b.payment_status === "paid" && (
                                <button
                                  className="action-btn-mini refund"
                                  onClick={() => handleBookingPaymentChange(b.id, "refunded")}
                                  title="Mark as Refunded"
                                >
                                  Refund
                                </button>
                              )}
                              <button
                                className="action-btn-mini delete"
                                onClick={() => handleDeleteBooking(b.id)}
                                title="Delete Booking"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: USERS & ACCOUNTS                                   */}
          {/* ========================================================= */}
          {activeTab === "users" && (
            <div className="admin-users-tab">
              <div className="admin-tab-topbar">
                <div>
                  <h2>Registered User Accounts</h2>
                  <p>View registered travelers, verify native mountain hosts, and grant platform permissions.</p>
                </div>

                <div className="admin-filters-row">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="admin-search-input"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="traveler">Travelers</option>
                    <option value="host">Hosts</option>
                    <option value="admin">Administrators</option>
                  </select>
                  <select
                    value={userVerifiedFilter}
                    onChange={(e) => setUserVerifiedFilter(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="true">✓ Verified Only</option>
                    <option value="false">Unverified Only</option>
                  </select>
                  <button
                    type="button"
                    className="admin-action-btn clean-unverified"
                    onClick={handleCleanUnverifiedUsers}
                    title="Remove unverified accounts from the system"
                  >
                    🧹 Clean Unverified Data
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="admin-loading">Loading users...</div>
              ) : usersList.length === 0 ? (
                <div className="admin-empty">No user accounts found matching query.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table full-width">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Name & Email</th>
                        <th>Phone</th>
                        <th>Assigned Role</th>
                        <th>Active Status</th>
                        <th>Verification</th>
                        <th>Total Bookings</th>
                        <th>Registered Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td><strong>#{u.id}</strong></td>
                          <td>
                            <strong>{u.full_name}</strong>
                            <div className="sub-contact">{u.email}</div>
                          </td>
                          <td>{u.phone || "—"}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className={`role-select ${u.role}`}
                              disabled={u.id === user.id && user.role === "admin"}
                            >
                              <option value="traveler">Traveler</option>
                              <option value="host">Host</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className={`status-toggle-btn ${u.is_active !== false ? "active" : "disabled"}`}
                              onClick={() => handleToggleUserStatus(u.id, u.is_active !== false)}
                              title="Toggle account active/suspend"
                              disabled={u.id === user.id}
                            >
                              {u.is_active !== false ? "● Active" : "○ Suspended"}
                            </button>
                          </td>
                          <td>
                            <button
                              className={`verify-toggle-btn ${u.is_verified ? "verified" : "unverified"}`}
                              onClick={() => handleToggleUserVerify(u.id, !!u.is_verified)}
                              title="Toggle verified badge"
                            >
                              {u.is_verified ? "✓ Verified" : "+ Verify"}
                            </button>
                          </td>
                          <td>
                            <strong>{u.bookings_count || 0}</strong> reservations
                          </td>
                          <td>
                            <small>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</small>
                          </td>
                          <td>
                            {u.id !== user.id && (
                              <button
                                className="action-btn-mini delete"
                                onClick={() => handleDeleteUser(u.id, u.full_name)}
                                title="Delete account"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: HOST APPLICATIONS                                 */}
          {/* ========================================================= */}
          {activeTab === "applications" && (
            <div className="admin-applications-tab">
              <div className="admin-tab-topbar">
                <div>
                  <h2>Host & Location Submissions ({applications.length})</h2>
                  <p>Review mountain natives and their submitted sanctuaries. Approving automatically publishes the stay live to the catalog.</p>
                </div>
              </div>

              {loading ? (
                <div className="admin-loading">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="admin-empty">No host or location submissions found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table full-width">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Host Profile</th>
                        <th>Sanctuary & Location</th>
                        <th>Price & Valley</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td><strong>#{app.id}</strong></td>
                          <td>
                            <strong>{app.name}</strong>
                            {app.email && <div className="sub-contact">{app.email}</div>}
                            {app.phone && <div className="sub-contact">📞 {app.phone}</div>}
                            {app.languages && <small className="sub-contact">🗣️ {app.languages}</small>}
                          </td>
                          <td>
                            {app.property_name ? (
                              <div className="app-property-preview-cell">
                                {app.image && (
                                  <img
                                    src={app.image}
                                    alt={app.property_name}
                                    className="app-table-thumb"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                                <div>
                                  <strong className="app-prop-name">{app.property_name}</strong>
                                  <div className="sub-contact">{app.category || "Homestay"} · {app.tagline || ""}</div>
                                  {app.published_place_id && (
                                    <span className="live-pill">✨ Published Live (#{app.published_place_id})</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="sub-contact">{app.skill || "Host"}</span>
                                <div className="bio-preview">{app.bio || "No location details attached."}</div>
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{app.price || "—"}</strong>
                            <div className="sub-contact">📍 {app.region} ({app.altitude || "—"})</div>
                          </td>
                          <td>
                            <span className={`status-pill ${app.status}`}>
                              {app.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <small>{app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}</small>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              <button
                                type="button"
                                className="action-btn-mini inspect-btn"
                                onClick={() => {
                                  setSelectedAppModal(app);
                                  setAdminNotesInput(app.admin_notes || "");
                                }}
                                title="Inspect full host and location details"
                              >
                                🔍 Inspect
                              </button>
                              {app.status !== "approved" && (
                                <button
                                  type="button"
                                  className="action-btn-mini pay"
                                  onClick={() => handleApproveHostApp(app.id, app.name)}
                                  title="Approve host and publish stay live"
                                >
                                  ✓ Approve & Publish
                                </button>
                              )}
                              {app.status !== "rejected" && (
                                <button
                                  type="button"
                                  className="action-btn-mini delete"
                                  onClick={() => handleRejectHostApp(app.id)}
                                  title="Reject submission"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Host & Location Inspection Modal */}
              {selectedAppModal && (
                <div className="pahadily-modal-overlay" onClick={() => setSelectedAppModal(null)}>
                  <div className="admin-inspection-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-top-bar">
                      <div>
                        <span className="badge-inspect">SUBMISSION #{selectedAppModal.id}</span>
                        <h2>{selectedAppModal.property_name || selectedAppModal.name}</h2>
                      </div>
                      <button
                        type="button"
                        className="modal-close-icon"
                        onClick={() => setSelectedAppModal(null)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="modal-inspect-body">
                      {/* Host Profile Info */}
                      <div className="inspect-section-card">
                        <h3>👤 Host Profile</h3>
                        <div className="inspect-grid-2">
                          <div>
                            <strong>Full Name:</strong> <span>{selectedAppModal.name}</span>
                          </div>
                          <div>
                            <strong>Contact Email:</strong> <span>{selectedAppModal.email || "—"}</span>
                          </div>
                          <div>
                            <strong>Phone / WhatsApp:</strong> <span>{selectedAppModal.phone || "—"}</span>
                          </div>
                          <div>
                            <strong>Native Region:</strong> <span>{selectedAppModal.region}</span>
                          </div>
                          <div>
                            <strong>Languages:</strong> <span>{selectedAppModal.languages || "—"}</span>
                          </div>
                          <div>
                            <strong>Assigned Skill:</strong> <span>{selectedAppModal.skill || "Native Host"}</span>
                          </div>
                        </div>
                        {selectedAppModal.bio && (
                          <div className="inspect-bio-box">
                            <strong>Host Story & Bio:</strong>
                            <p>{selectedAppModal.bio}</p>
                          </div>
                        )}
                      </div>

                      {/* Property & Location Info */}
                      {selectedAppModal.property_name && (
                        <div className="inspect-section-card">
                          <h3>🏔️ Location & Sanctuary Details</h3>
                          {selectedAppModal.image && (
                            <div
                              className="inspect-cover-banner"
                              style={{ backgroundImage: `url('${selectedAppModal.image}')` }}
                            >
                              <span className="cover-badge">{selectedAppModal.category || "Homestay"}</span>
                              <span className="price-badge">{selectedAppModal.price} {selectedAppModal.unit || "/night"}</span>
                            </div>
                          )}
                          <div className="inspect-grid-2" style={{ marginTop: 14 }}>
                            <div>
                              <strong>Tagline:</strong> <span>{selectedAppModal.tagline || "—"}</span>
                            </div>
                            <div>
                              <strong>Altitude:</strong> <span>{selectedAppModal.altitude || "—"}</span>
                            </div>
                            <div>
                              <strong>Valley / Region:</strong> <span>{selectedAppModal.region}</span>
                            </div>
                            <div>
                              <strong>Category:</strong> <span>{selectedAppModal.category}</span>
                            </div>
                          </div>

                          {selectedAppModal.tags && (
                            <div className="inspect-tags-row">
                              <strong>Amenities:</strong>
                              <div className="tags-chips">
                                {selectedAppModal.tags.split(",").map((t, i) => (
                                  <span key={i} className="chip">{t.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedAppModal.description && (
                            <div className="inspect-desc-box">
                              <strong>Description:</strong>
                              <p>{selectedAppModal.description}</p>
                            </div>
                          )}

                          {/* Nearby locations */}
                          {Array.isArray(selectedAppModal.nearby_locations) && selectedAppModal.nearby_locations.length > 0 && (
                            <div className="inspect-sublist">
                              <h4>📍 Nearby Spots ({selectedAppModal.nearby_locations.length}):</h4>
                              <ul>
                                {selectedAppModal.nearby_locations.map((item, idx) => (
                                  <li key={idx}>
                                    <strong>{item.name}</strong> — {item.distance}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Room options */}
                          {Array.isArray(selectedAppModal.stay_options) && selectedAppModal.stay_options.length > 0 && (
                            <div className="inspect-sublist">
                              <h4>🛏️ Room / Stay Options ({selectedAppModal.stay_options.length}):</h4>
                              <ul>
                                {selectedAppModal.stay_options.map((opt, idx) => (
                                  <li key={idx}>
                                    <strong>{opt.name}</strong>: {opt.price} ({opt.features || "Standard"})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status & Live Link */}
                      <div className="inspect-section-card">
                        <h3>⚡ Status & Publishing</h3>
                        <div className="status-inspect-row">
                          <span>Current Status:</span>
                          <span className={`status-pill ${selectedAppModal.status}`}>
                            {selectedAppModal.status.toUpperCase()}
                          </span>
                        </div>
                        {selectedAppModal.published_place_id && (
                          <div className="published-alert">
                            ✨ This location is published live in the catalog as <strong>Place #{selectedAppModal.published_place_id}</strong>!
                          </div>
                        )}

                        <div className="admin-notes-form-group">
                          <label>Administrator Review Notes / Feedback:</label>
                          <textarea
                            rows={2}
                            placeholder="Add notes for the host (e.g. Verified water quality and road connectivity)..."
                            value={adminNotesInput}
                            onChange={(e) => setAdminNotesInput(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-inspect-footer">
                      <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={() => setSelectedAppModal(null)}
                      >
                        Cancel
                      </button>

                      {selectedAppModal.status !== "rejected" && (
                        <button
                          type="button"
                          className="btn-modal-reject"
                          onClick={() => handleRejectHostApp(selectedAppModal.id)}
                        >
                          ✕ Reject Submission
                        </button>
                      )}

                      {selectedAppModal.status !== "approved" && (
                        <button
                          type="button"
                          className="btn-modal-approve-publish"
                          onClick={() => handleApproveHostApp(selectedAppModal.id, selectedAppModal.name)}
                        >
                          ✓ Approve & Publish Live to Stays Catalog
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: STAYS & SANCTUARIES                                */}
          {/* ========================================================= */}
          {activeTab === "places" && (
            <div className="admin-crud-tab">
              {/* Add / Edit Form */}
              <div className="admin-form-card">
                <h3>{editingPlaceId ? "✏️ Edit Sanctuary Details" : "➕ Add New Himalayan Sanctuary"}</h3>
                <form onSubmit={handleSavePlace} className="admin-crud-form">
                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label>Sanctuary Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Great Himalayan Eco Chalet"
                        value={placeForm.name}
                        onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Tagline / Essence</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hidden river sanctuary with cedar fires"
                        value={placeForm.tagline}
                        onChange={(e) => setPlaceForm({ ...placeForm, tagline: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="admin-form-group">
                      <label>Valley / Region</label>
                      <select
                        value={placeForm.region}
                        onChange={(e) => setPlaceForm({ ...placeForm, region: e.target.value })}
                        className="admin-input"
                      >
                        <option value="tirthan">Tirthan Valley</option>
                        <option value="jibhi">Jibhi</option>
                        <option value="spiti">Spiti Valley</option>
                        <option value="pangi">Pangi Valley</option>
                        <option value="kasol">Kasol</option>
                        <option value="parvati">Parvati Valley</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        placeholder="River Chalet, Mud Homestay, etc."
                        value={placeForm.category}
                        onChange={(e) => setPlaceForm({ ...placeForm, category: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Price & Unit</label>
                      <input
                        type="text"
                        placeholder="₹2,400"
                        value={placeForm.price}
                        onChange={(e) => setPlaceForm({ ...placeForm, price: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label>Altitude</label>
                      <input
                        type="text"
                        placeholder="1,800m"
                        value={placeForm.altitude}
                        onChange={(e) => setPlaceForm({ ...placeForm, altitude: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Feature Tags (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Pine Forest, Bonfire, Trout Stream"
                        value={placeForm.tags}
                        onChange={(e) => setPlaceForm({ ...placeForm, tags: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      placeholder="/images/destinations/tirthan-valley.jpg"
                      value={placeForm.image}
                      onChange={(e) => setPlaceForm({ ...placeForm, image: e.target.value })}
                      className="admin-input"
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" disabled={formSubmitting} className="admin-submit-btn">
                      {formSubmitting ? "Saving..." : editingPlaceId ? "Update Sanctuary" : "Publish Sanctuary Live"}
                    </button>
                    {editingPlaceId && (
                      <button
                        type="button"
                        className="admin-cancel-btn"
                        onClick={() => {
                          setEditingPlaceId(null);
                          setPlaceForm({
                            name: "",
                            tagline: "",
                            region: "tirthan",
                            category: "River Chalet",
                            price: "₹2,400",
                            unit: "/night",
                            altitude: "1,800m",
                            tags: "Pine Forest, Bonfire, Trout Stream, Home Food",
                            image: "/images/destinations/tirthan-valley.jpg",
                            description: "",
                            host_name: "",
                          });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Places List Table */}
              <div className="admin-items-list-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ margin: 0 }}>Live Sanctuaries ({places.length})</h3>
                  <input
                    type="text"
                    placeholder="Search sanctuary, region, tagline..."
                    value={placeSearchQuery}
                    onChange={(e) => setPlaceSearchQuery(e.target.value)}
                    className="admin-search-input"
                    style={{ maxWidth: "300px" }}
                  />
                </div>
                <div className="table-responsive">
                  <table className="admin-table full-width">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Sanctuary</th>
                        <th>Region</th>
                        <th>Price</th>
                        <th>Altitude</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {places
                        .filter((p) => {
                          if (!placeSearchQuery.trim()) return true;
                          const q = placeSearchQuery.toLowerCase();
                          return (
                            p.name?.toLowerCase().includes(q) ||
                            p.tagline?.toLowerCase().includes(q) ||
                            p.region?.toLowerCase().includes(q) ||
                            p.category?.toLowerCase().includes(q)
                          );
                        })
                        .map((p) => (
                        <tr key={p.id}>
                          <td><strong>#{p.id}</strong></td>
                          <td>
                            <strong>{p.name}</strong>
                            <div className="sub-contact">{p.tagline}</div>
                          </td>
                          <td><span className="entity-type-badge">{p.region}</span></td>
                          <td><strong>{p.price}</strong> {p.unit}</td>
                          <td>{p.altitude}</td>
                          <td>★ {p.rating} ({p.reviews})</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-btn-mini edit" onClick={() => handleEditPlace(p)}>Edit</button>
                              <button className="action-btn-mini delete" onClick={() => handleDeletePlace(p.id, p.name)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: EXPERIENCES & TREKS                                */}
          {/* ========================================================= */}
          {activeTab === "experiences" && (
            <div className="admin-crud-tab">
              <div className="admin-form-card">
                <h3>{editingExpId ? "✏️ Edit Experience" : "➕ Create New Curated Experience"}</h3>
                <form onSubmit={handleSaveExp} className="admin-crud-form">
                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ancient Kath-Kuni Village Trail"
                        value={expForm.title}
                        onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Guide Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. With Karan Negi (Native Naturalist)"
                        value={expForm.guide}
                        onChange={(e) => setExpForm({ ...expForm, guide: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="admin-form-group">
                      <label>Region</label>
                      <select
                        value={expForm.region}
                        onChange={(e) => setExpForm({ ...expForm, region: e.target.value })}
                        className="admin-input"
                      >
                        <option value="jibhi">Jibhi</option>
                        <option value="tirthan">Tirthan Valley</option>
                        <option value="spiti">Spiti Valley</option>
                        <option value="pangi">Pangi Valley</option>
                        <option value="kasol">Kasol</option>
                        <option value="parvati">Parvati</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Price</label>
                      <input
                        type="text"
                        placeholder="₹500"
                        value={expForm.price}
                        onChange={(e) => setExpForm({ ...expForm, price: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Duration</label>
                      <input
                        type="text"
                        placeholder="3–4 hours"
                        value={expForm.duration}
                        onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" disabled={formSubmitting} className="admin-submit-btn">
                      {formSubmitting ? "Saving..." : editingExpId ? "Update Experience" : "Publish Experience"}
                    </button>
                    {editingExpId && (
                      <button type="button" className="admin-cancel-btn" onClick={() => setEditingExpId(null)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-items-list-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ margin: 0 }}>Curated Experiences ({experiences.length})</h3>
                  <input
                    type="text"
                    placeholder="Search experiences, guide..."
                    value={expSearchQuery}
                    onChange={(e) => setExpSearchQuery(e.target.value)}
                    className="admin-search-input"
                    style={{ maxWidth: "300px" }}
                  />
                </div>
                <div className="table-responsive">
                  <table className="admin-table full-width">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Experience</th>
                        <th>Guide</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences
                        .filter((exp) => {
                          if (!expSearchQuery.trim()) return true;
                          const q = expSearchQuery.toLowerCase();
                          return (
                            exp.title?.toLowerCase().includes(q) ||
                            exp.guide?.toLowerCase().includes(q) ||
                            exp.region?.toLowerCase().includes(q) ||
                            exp.category?.toLowerCase().includes(q)
                          );
                        })
                        .map((exp) => (
                        <tr key={exp.id}>
                          <td><strong>#{exp.id}</strong></td>
                          <td><strong>{exp.title}</strong></td>
                          <td>{exp.guide}</td>
                          <td>{exp.duration}</td>
                          <td><strong>{exp.price}</strong> {exp.unit}</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-btn-mini edit" onClick={() => handleEditExp(exp)}>Edit</button>
                              <button className="action-btn-mini delete" onClick={() => handleDeleteExp(exp.id, exp.title)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: LOCAL GUIDES & PERSONS                             */}
          {/* ========================================================= */}
          {activeTab === "locals" && (
            <div className="admin-crud-tab">
              <div className="admin-form-card">
                <h3>{editingLocalId ? "✏️ Edit Local Companion" : "➕ Add Native Guide / Artisan"}</h3>
                <form onSubmit={handleSaveLocal} className="admin-crud-form">
                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Thakur"
                        value={localForm.name}
                        onChange={(e) => setLocalForm({ ...localForm, name: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Native Craft / Role</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Native Trek Leader & Storyteller"
                        value={localForm.role}
                        onChange={(e) => setLocalForm({ ...localForm, role: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="admin-form-group">
                      <label>Category</label>
                      <select
                        value={localForm.category}
                        onChange={(e) => setLocalForm({ ...localForm, category: e.target.value })}
                        className="admin-input"
                      >
                        <option value="companions">Companions</option>
                        <option value="elders">Elders & Storytellers</option>
                        <option value="artisans">Craft Artisans</option>
                        <option value="guides">Certified Guides</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Region</label>
                      <select
                        value={localForm.region}
                        onChange={(e) => setLocalForm({ ...localForm, region: e.target.value })}
                        className="admin-input"
                      >
                        <option value="jibhi">Jibhi</option>
                        <option value="tirthan">Tirthan</option>
                        <option value="spiti">Spiti</option>
                        <option value="pangi">Pangi</option>
                        <option value="kasol">Kasol</option>
                        <option value="parvati">Parvati</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Price</label>
                      <input
                        type="text"
                        placeholder="₹600"
                        value={localForm.price}
                        onChange={(e) => setLocalForm({ ...localForm, price: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" disabled={formSubmitting} className="admin-submit-btn">
                      {formSubmitting ? "Saving..." : editingLocalId ? "Update Profile" : "Add Local Profile"}
                    </button>
                    {editingLocalId && (
                      <button type="button" className="admin-cancel-btn" onClick={() => setEditingLocalId(null)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="admin-items-list-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ margin: 0 }}>Verified Native Guides & Artisans ({locals.length})</h3>
                  <input
                    type="text"
                    placeholder="Search guides, role, region..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="admin-search-input"
                    style={{ maxWidth: "300px" }}
                  />
                </div>
                <div className="table-responsive">
                  <table className="admin-table full-width">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Region</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locals
                        .filter((l) => {
                          if (!localSearchQuery.trim()) return true;
                          const q = localSearchQuery.toLowerCase();
                          return (
                            l.name?.toLowerCase().includes(q) ||
                            l.role?.toLowerCase().includes(q) ||
                            l.region?.toLowerCase().includes(q) ||
                            l.location?.toLowerCase().includes(q)
                          );
                        })
                        .map((l) => (
                        <tr key={l.id}>
                          <td><strong>#{l.id}</strong></td>
                          <td><strong>{l.name}</strong></td>
                          <td>{l.role}</td>
                          <td><span className="entity-type-badge">{l.region}</span></td>
                          <td><strong>{l.price}</strong> {l.unit}</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-btn-mini edit" onClick={() => handleEditLocal(l)}>Edit</button>
                              <button className="action-btn-mini delete" onClick={() => handleDeleteLocal(l.id, l.name)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminPage;
