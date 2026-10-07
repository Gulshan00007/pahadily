import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar({ activePage = "home" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    user,
    isAuthenticated,
    isHost,
    isAdmin,
    logout,
    openAuthModal,
    setMyBookingsOpen,
  } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PA";

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <a href="/" className="navbar-brand" aria-label="Pahadíly Home">
          <img
            src="/images/logo/pahadily-logo.png"
            alt="Pahadíly — Rare Places. Real People. Lasting Stories."
            className="navbar-brand-logo"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links" aria-label="Main Navigation">
          <a href="/" className={`nav-link${activePage === "home" ? " active" : ""}`}>
            Home
          </a>
          <a href="/explore" className={`nav-link${activePage === "explore" ? " active" : ""}`}>
            Explore
          </a>
          <a href="/experiences" className={`nav-link${activePage === "experiences" ? " active" : ""}`}>
            Experiences
          </a>
          <a href="/locals" className={`nav-link${activePage === "locals" ? " active" : ""}`}>
            Local Guides
          </a>
          {/* Only visible to authenticated Admin or Host */}
          {(isAdmin || isHost) && (
            <>
              <a href="/host" className={`nav-link host-nav-pill${activePage === "host" ? " active" : ""}`}>
                🏡 List Your Stay
              </a>
              <a href="/admin" className={`nav-link admin-nav-link${activePage === "admin" ? " active" : ""}`}>
                ⚡ Platform Operations
              </a>
            </>
          )}
        </nav>

        {/* Action Buttons / User Menu */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="auth-authenticated-actions">
              <button
                type="button"
                className="my-bookings-nav-btn"
                onClick={() => setMyBookingsOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>My Trips</span>
              </button>

              <div className="navbar-user-menu" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-profile-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <div className="navbar-avatar-circle">
                    <span>{userInitials}</span>
                  </div>
                  <div className="user-name-col">
                    <span className="user-nav-name">{user.full_name.split(" ")[0]}</span>
                    <span className="user-nav-role">{user.role}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <strong>{user.full_name}</strong>
                      <span className="user-dropdown-email">{user.email}</span>
                    </div>

                    <div className="user-dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setMyBookingsOpen(true);
                      }}
                    >
                      <span>📅 My Bookings & Trips</span>
                    </button>

                    <a
                      href="/host"
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span>🏡 Host Portal & List Stay</span>
                    </a>

                    {(isAdmin || isHost) && (
                      <a
                        href="/admin"
                        className="dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span>⚙️ Platform Operations</span>
                      </a>
                    )}

                    <div className="user-dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item logout"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                    >
                      <span>🚪 Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-action-buttons">
              <button
                type="button"
                className="login-button"
                onClick={() => openAuthModal("login")}
              >
                Login
              </button>
              <button
                type="button"
                className="signup-button"
                onClick={() => openAuthModal("signup")}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown">
          <a href="/" onClick={() => setMobileMenuOpen(false)}>
            🏠 Home
          </a>
          <a href="/explore" onClick={() => setMobileMenuOpen(false)}>
            🏔️ Explore
          </a>
          <a href="/experiences" onClick={() => setMobileMenuOpen(false)}>
            Experiences
          </a>
          <a href="/locals" onClick={() => setMobileMenuOpen(false)}>
            Local Guides
          </a>
          {(isAdmin || isHost) && (
            <a href="/admin" onClick={() => setMobileMenuOpen(false)}>
              ⚡ Host / Admin Portal
            </a>
          )}
          <div className="mobile-dropdown-actions">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="mobile-btn-action bookings"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMyBookingsOpen(true);
                  }}
                >
                  📅 My Bookings ({user.full_name.split(" ")[0]})
                </button>
                <button
                  type="button"
                  className="mobile-btn-action logout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="login-button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="signup-button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signup");
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;