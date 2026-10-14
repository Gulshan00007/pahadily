import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isHost,
    isAdmin,
    openAuth,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const accountRef = useRef(null);

  // Close menus and dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

  // Handle scroll for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside clicks for account dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Strict desktop order required by specification:
  // 1. Home, 2. Explore, 3. Experiences, 4. Local Companions, 5. Stays, 6. Stories
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Experiences', path: '/experiences' },
    { name: 'Local Companions', path: '/companions' },
    { name: 'Stays', path: '/stays' },
    { name: 'Stories', path: '/stories' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Determine user status
  const isApplicantPending = Boolean(user?.has_pending_application && user?.role === 'traveler');
  const isCompanion = Boolean(user?.role === 'guide');
  const isVerifiedHost = Boolean(user?.role === 'host');

  return (
    <header
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#F7F5EE',
        borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
        boxShadow: scrolled ? '0 2px 12px rgba(16, 37, 29, 0.05)' : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* 1. Left: Official Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
            zIndex: 2,
          }}
          aria-label="Pahadíly Homepage"
        >
          <img
            src="/images/logo/pahadily-logo.png"
            alt="Pahadíly"
            className="navbar-brand-img"
            style={{
              height: '46px',
              width: 'auto',
              maxHeight: '46px',
              display: 'block',
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const textFallback = document.getElementById('navbar-brand-text-fallback');
              if (textFallback) textFallback.style.display = 'flex';
            }}
          />
          <div
            id="navbar-brand-text-fallback"
            style={{
              display: 'none',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#10251D',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Pahadíly
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#174D39',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              Himalayan Discovery
            </span>
          </div>
        </Link>

        {/* 2. Center: Desktop Navigation Links (Consistent 6 items in exact order) */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '4px',
            margin: '0 auto',
          }}
          className="desktop-nav-menu"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '14px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#174D39' : '#10251D',
                  padding: '7px 13px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  backgroundColor: active ? 'rgba(23, 77, 57, 0.08)' : 'transparent',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(23, 77, 57, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {link.name}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '14px',
                      height: '2px',
                      backgroundColor: '#174D39',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Account Actions Dependent on Authenticated Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, zIndex: 2 }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Role-Specific Primary Action Shortcut */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="role-action-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#92400e',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span>🏔️</span>
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {isCompanion && (
                <Link
                  to="/provider-portal"
                  className="role-action-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#174D39',
                    backgroundColor: 'rgba(23, 77, 57, 0.08)',
                    border: '1px solid rgba(23, 77, 57, 0.2)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span>🌲</span>
                  <span>Companion Dashboard</span>
                </Link>
              )}

              {isVerifiedHost && (
                <Link
                  to="/provider-portal"
                  className="role-action-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#174D39',
                    backgroundColor: 'rgba(23, 77, 57, 0.08)',
                    border: '1px solid rgba(23, 77, 57, 0.2)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span>🏡</span>
                  <span>Host Dashboard</span>
                </Link>
              )}

              {isApplicantPending && (
                <Link
                  to="/become-a-local"
                  className="role-action-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#b45309',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '10px' }}>⏳</span>
                  <span>Application Status</span>
                </Link>
              )}

              {!isAdmin && !isHost && !isApplicantPending && (
                <Link
                  to="/my-bookings"
                  className="role-action-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#10251D',
                    backgroundColor: 'rgba(16, 37, 29, 0.05)',
                    border: '1px solid rgba(16, 37, 29, 0.14)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span>🎒</span>
                  <span>My Bookings</span>
                </Link>
              )}

              {/* Profile Trigger Dropdown */}
              <div style={{ position: 'relative' }} ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(16, 37, 29, 0.15)',
                    borderRadius: '9999px',
                    padding: '5px 12px 5px 6px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.15s ease',
                  }}
                  aria-expanded={accountDropdownOpen}
                  aria-haspopup="true"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#174D39',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left', display: 'none' }} className="user-name-label">
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#10251D', lineHeight: 1.1 }}>
                      {user?.full_name?.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '10px', color: '#174D39', fontWeight: 600, textTransform: 'capitalize' }}>
                      {isApplicantPending ? 'Applicant' : user?.role}
                    </div>
                  </div>
                  <span style={{ fontSize: '8px', color: '#536B5E', marginLeft: '2px' }}>▼</span>
                </button>

                {accountDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      boxShadow: '0 10px 28px rgba(16, 37, 29, 0.12)',
                      border: '1px solid rgba(16, 37, 29, 0.1)',
                      padding: '8px',
                      minWidth: '220px',
                      zIndex: 100,
                    }}
                  >
                    {/* Header info */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
                        marginBottom: '6px',
                      }}
                    >
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#10251D' }}>
                        {user?.full_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#536B5E', wordBreak: 'break-all' }}>{user?.email}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(23, 77, 57, 0.08)',
                            color: '#174D39',
                            textTransform: 'capitalize',
                          }}
                        >
                          Role: {user?.role}
                        </span>
                        {isApplicantPending && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: '#fffbeb',
                              color: '#b45309',
                            }}
                          >
                            Application Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Links based on authenticated role */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          color: '#10251D',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span>🏔️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {isHost && (
                      <Link
                        to="/provider-portal"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          color: '#10251D',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span>🌲</span>
                        <span>{isCompanion ? 'Companion Dashboard' : 'Host Dashboard'}</span>
                      </Link>
                    )}

                    {isApplicantPending && (
                      <Link
                        to="/become-a-local"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          color: '#b45309',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fffbeb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span>⏳</span>
                        <span>Application Status</span>
                      </Link>
                    )}

                    <Link
                      to="/my-bookings"
                      onClick={() => setAccountDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        color: '#10251D',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span>🎒</span>
                      <span>My Bookings</span>
                    </Link>

                    {!isHost && !isApplicantPending && (
                      <Link
                        to="/become-a-local"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          color: '#174D39',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span>🌲</span>
                        <span>Become a Local</span>
                      </Link>
                    )}

                    {/* Sign out */}
                    <div
                      style={{
                        borderTop: '1px solid rgba(16, 37, 29, 0.08)',
                        marginTop: '6px',
                        paddingTop: '6px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          logout();
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#c86d51',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(200, 109, 81, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Logged-out visitor: Sign In and Become a Local */
            <div className="desktop-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/become-a-local"
                className="become-local-btn"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#174D39',
                  backgroundColor: 'rgba(23, 77, 57, 0.06)',
                  border: '1px solid rgba(23, 77, 57, 0.16)',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>🌲</span>
                <span>Become a Local</span>
              </Link>

              <button
                type="button"
                onClick={() => openAuth('login')}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#10251D',
                  backgroundColor: 'transparent',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(16, 37, 29, 0.16)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(23, 77, 57, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(23, 77, 57, 0.08)',
              border: 'none',
              cursor: 'pointer',
              color: '#10251D',
              flexShrink: 0,
            }}
          >
            {mobileMenuOpen ? (
              <span style={{ fontSize: '18px', fontWeight: 700 }}>✕</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            top: '76px',
            backgroundColor: 'rgba(16, 37, 29, 0.4)',
            zIndex: 49,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            style={{
              backgroundColor: '#F7F5EE',
              borderBottom: '2px solid rgba(23, 77, 57, 0.12)',
              padding: '20px',
              maxHeight: 'calc(100vh - 76px)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 6 primary links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      fontSize: '15.5px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#174D39' : '#10251D',
                      backgroundColor: active ? 'rgba(23, 77, 57, 0.08)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{link.name}</span>
                    <span style={{ fontSize: '13px', color: '#536B5E' }}>→</span>
                  </Link>
                );
              })}

              <div
                style={{
                  borderTop: '1px solid rgba(16, 37, 29, 0.08)',
                  margin: '12px 0 8px 0',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div style={{ padding: '0 8px 6px 8px', fontSize: '12px', color: '#536B5E' }}>
                      Signed in as <strong>{user?.full_name}</strong> ({user?.role})
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          fontSize: '14.5px',
                          fontWeight: 600,
                          color: '#92400e',
                          backgroundColor: '#fef3c7',
                          textDecoration: 'none',
                        }}
                      >
                        <span>🏔️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {isCompanion && (
                      <Link
                        to="/provider-portal"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          fontSize: '14.5px',
                          fontWeight: 600,
                          color: '#174D39',
                          backgroundColor: 'rgba(23, 77, 57, 0.08)',
                          textDecoration: 'none',
                        }}
                      >
                        <span>🌲</span>
                        <span>Companion Dashboard</span>
                      </Link>
                    )}

                    {isVerifiedHost && (
                      <Link
                        to="/provider-portal"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          fontSize: '14.5px',
                          fontWeight: 600,
                          color: '#174D39',
                          backgroundColor: 'rgba(23, 77, 57, 0.08)',
                          textDecoration: 'none',
                        }}
                      >
                        <span>🏡</span>
                        <span>Host Dashboard</span>
                      </Link>
                    )}

                    {isApplicantPending && (
                      <Link
                        to="/become-a-local"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          fontSize: '14.5px',
                          fontWeight: 600,
                          color: '#b45309',
                          backgroundColor: '#fffbeb',
                          textDecoration: 'none',
                        }}
                      >
                        <span>⏳</span>
                        <span>Application Status (Pending Review)</span>
                      </Link>
                    )}

                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        fontSize: '14.5px',
                        fontWeight: 600,
                        color: '#10251D',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(16, 37, 29, 0.1)',
                        textDecoration: 'none',
                      }}
                    >
                      <span>🎒</span>
                      <span>My Bookings</span>
                    </Link>

                    {!isHost && !isApplicantPending && (
                      <Link
                        to="/become-a-local"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          fontSize: '14.5px',
                          fontWeight: 600,
                          color: '#174D39',
                          backgroundColor: 'rgba(23, 77, 57, 0.06)',
                          textDecoration: 'none',
                        }}
                      >
                        <span>🌲</span>
                        <span>Become a Local</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#c86d51',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/become-a-local"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '11px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#174D39',
                        backgroundColor: 'rgba(23, 77, 57, 0.08)',
                        textDecoration: 'none',
                        border: '1px solid rgba(23, 77, 57, 0.15)',
                      }}
                    >
                      <span>🌲</span>
                      <span>Become a Local</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuth('login');
                      }}
                      style={{
                        padding: '11px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        backgroundColor: '#174D39',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive layout rules */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav-menu {
            display: flex !important;
          }
          .role-action-btn {
            display: inline-flex !important;
          }
          .become-local-btn {
            display: inline-flex !important;
          }
          .user-name-label {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 959px) {
          .desktop-nav-menu {
            display: none !important;
          }
          .role-action-btn {
            display: none !important;
          }
          .become-local-btn {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-brand-img {
            height: 38px !important;
            max-height: 38px !important;
          }
        }
      `}</style>
    </header>
  );
}