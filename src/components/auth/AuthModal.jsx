import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, login, signup, demoLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("traveler");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAdminShortcut, setShowAdminShortcut] = useState(false);

  useEffect(() => {
    setError("");
  }, [authModalTab, authModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setAuthModalOpen(false);
    };
    if (authModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [authModalOpen, setAuthModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (authModalTab === "login") {
        await login(email, password);
      } else {
        await signup({
          email,
          password,
          full_name: fullName,
          phone,
          role,
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async (demoRole) => {
    setError("");
    setSubmitting(true);
    try {
      await demoLogin(demoRole);
    } catch (err) {
      setError(err.message || "Could not log in as demo user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pahadily-modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={() => setAuthModalOpen(false)}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Branding */}
        <div className="auth-modal-header">
          <div className="auth-badge">HIMALAYAN ACCESS</div>
          <h2 className="auth-title">
            {authModalTab === "login" ? "Welcome Back to Pahadíly" : "Begin Your Mountain Journey"}
          </h2>
          <p className="auth-subtitle">
            {authModalTab === "login"
              ? "Access your bookings, saved places, and conversations with local hosts."
              : "Connect with authentic mountain stays, local guides, and slow journeys."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === "login" ? "active" : ""}`}
            onClick={() => setAuthModalTab("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === "signup" ? "active" : ""}`}
            onClick={() => setAuthModalTab("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Public Demo Fast Login Bar (Traveler & Host only) */}
        <div className="auth-demo-section">
          <span className="demo-label">⚡ 1-Click Prototype Logins:</span>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="demo-pill-btn traveler"
              disabled={submitting}
              onClick={() => handleDemoClick("traveler")}
              title="Log in as Traveler Aarav Sharma"
            >
              🧑 Traveler Demo
            </button>
            <button
              type="button"
              className="demo-pill-btn host"
              disabled={submitting}
              onClick={() => handleDemoClick("host")}
              title="Log in as Host Karan Negi"
            >
              🏡 Host Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {authModalTab === "signup" && (
            <>
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Verma"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="form-field">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="form-field">
                <label>I want to join as</label>
                <div className="role-selector-row">
                  <label className={`role-pill-label ${role === "traveler" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="traveler"
                      checked={role === "traveler"}
                      onChange={() => setRole("traveler")}
                    />
                    <span>🌿 Conscious Traveler</span>
                  </label>
                  <label className={`role-pill-label ${role === "host" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="host"
                      checked={role === "host"}
                      onChange={() => setRole("host")}
                    />
                    <span>🏡 Mountain Host / Guide</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? (
              <span className="btn-spinner-wrap">
                <span className="spinner-dot"></span>
                Processing...
              </span>
            ) : authModalTab === "login" ? (
              "Log In to Pahadíly"
            ) : (
              "Create My Account"
            )}
          </button>
        </form>

        <div className="auth-footer-note">
          <p>
            🛡️ 100% Secure & Privacy Focused. By continuing, you agree to Pahadíly&apos;s mindful travel code of ethics.
          </p>

          {/* Discreet Admin Lock Toggle (Kept hidden from regular users) */}
          <div className="admin-discrete-unlock">
            <button
              type="button"
              className="admin-discrete-btn"
              onClick={() => setShowAdminShortcut(!showAdminShortcut)}
              title="Platform Administrator Access"
            >
              🔒
            </button>
            {showAdminShortcut && (
              <button
                type="button"
                className="admin-quick-unlock-btn"
                onClick={() => handleDemoClick("admin")}
              >
                Unlock Administrator Console (admin@pahadily.com)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
