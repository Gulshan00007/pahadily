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
    demoLogin,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const demoRef = useRef(null);
  const accountRef = useRef(null);

  // Close dropdowns on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDemoDropdownOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

  // Handle scroll for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSelect = (role) => {
    demoLogin(role);
    setDemoDropdownOpen(false);
  };

  const navLinks = [
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

  return (
    <header
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#F7F5EE',
        borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
        boxShadow: scrolled ? '0 4px 20px rgba(16, 37, 29, 0.06)' : 'none',
        transition: 'all 0.25s ease',
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
        }}
      >
        {/* Left: Official Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
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
                fontSize: '24px',
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
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              Himalayan Discovery
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
          }}
          className="desktop-nav-menu"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '14.5px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#174D39' : '#10251D',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  backgroundColor: active ? 'rgba(23, 77, 57, 0.08)' : 'transparent',
                  transition: 'all 0.18s ease',
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
                      width: '16px',
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

        {/* Right: Actions, Demo Switcher, & Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Become a Local CTA */}
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
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span>🌲</span>
            <span>Become a Local</span>
          </Link>

          {/* Quick Demo Switcher */}
          <div style={{ position: 'relative' }} ref={demoRef} className="navbar-persona-wrapper">
            <button
              type="button"
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: '#174D39',
                border: '1px solid rgba(23, 77, 57, 0.22)',
                padding: '6px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              title="Switch demo persona for testing"
            >
              <span>⚡</span>
              <span className="persona-btn-label">Persona</span>
              <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
            </button>

            {demoDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 16px 36px rgba(16, 37, 29, 0.16)',
                  border: '1px solid rgba(16, 37, 29, 0.1)',
                  padding: '8px',
                  minWidth: '230px',
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#536B5E',
                    padding: '6px 10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Test Role Perspective:
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('traveler')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#10251D',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '16px' }}>🎒</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Traveler</div>
                    <div style={{ fontSize: '11px', color: '#536B5E' }}>Book & view vouchers</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('host')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#10251D',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '16px' }}>🌲</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Local Companion</div>
                    <div style={{ fontSize: '11px', color: '#536B5E' }}>Accept / decline requests</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('admin')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#10251D',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '16px' }}>🏔️</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Administrator</div>
                    <div style={{ fontSize: '11px', color: '#536B5E' }}>Review & approve hosts</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Authenticated Account Dropdown or Sign In */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(16, 37, 29, 0.16)',
                  borderRadius: '9999px',
                  padding: '5px 12px 5px 6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
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
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="user-name-label">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#10251D', lineHeight: 1.1 }}>
                    {user.full_name?.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#174D39', fontWeight: 600 }}>
                    {user.role}
                  </div>
                </div>
                <span style={{ fontSize: '9px', color: '#536B5E' }}>▼</span>
              </button>

              {accountDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    boxShadow: '0 16px 36px rgba(16, 37, 29, 0.16)',
                    border: '1px solid rgba(16, 37, 29, 0.1)',
                    padding: '8px',
                    minWidth: '220px',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#10251D' }}>
                      {user.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#536B5E' }}>{user.email}</div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(23, 77, 57, 0.1)',
                        color: '#174D39',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>

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
                      <span>Provider Dashboard</span>
                    </Link>
                  )}

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
                      <span>Admin Ops Console</span>
                    </Link>
                  )}

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
          ) : (
            <div className="desktop-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => openAuth('login')}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#10251D',
                  backgroundColor: 'transparent',
                  padding: '7px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(23, 77, 57, 0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuth('signup')}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#174D39',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(23, 77, 57, 0.22)',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#10251D';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#174D39';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Join
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
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(23, 77, 57, 0.08)',
              border: 'none',
              cursor: 'pointer',
              color: '#10251D',
              flexShrink: 0,
            }}
          >
            {mobileMenuOpen ? (
              <span style={{ fontSize: '20px', fontWeight: 700 }}>✕</span>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            top: '76px',
            backgroundColor: 'rgba(16, 37, 29, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 49,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            style={{
              backgroundColor: '#F7F5EE',
              borderBottom: '2px solid rgba(23, 77, 57, 0.15)',
              padding: '24px',
              maxHeight: 'calc(100vh - 76px)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#174D39' : '#10251D',
                      backgroundColor: active ? 'rgba(23, 77, 57, 0.1)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{link.name}</span>
                    <span style={{ fontSize: '14px', color: '#536B5E' }}>→</span>
                  </Link>
                );
              })}

              <div
                style={{
                  borderTop: '1px solid rgba(16, 37, 29, 0.08)',
                  margin: '12px 0',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Link
                  to="/become-a-local"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#174D39',
                    backgroundColor: 'rgba(23, 77, 57, 0.08)',
                    textDecoration: 'none',
                  }}
                >
                  <span>🌲</span>
                  <span>Become a Local Host / Guide</span>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/my-bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#10251D',
                        textDecoration: 'none',
                      }}
                    >
                      <span>🎒</span>
                      <span>My Bookings</span>
                    </Link>

                    {isHost && (
                      <Link
                        to="/provider-portal"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#174D39',
                          textDecoration: 'none',
                        }}
                      >
                        <span>🌲</span>
                        <span>Provider Dashboard</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#10251D',
                          textDecoration: 'none',
                        }}
                      >
                        <span>🏔️</span>
                        <span>Admin Ops Console</span>
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
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#c86d51',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Sign Out ({user.full_name})
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuth('login');
                      }}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#10251D',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(16, 37, 29, 0.15)',
                        cursor: 'pointer',
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuth('signup');
                      }}
                      style={{
                        flex: 1,
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
                      Join Pahadíly
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive media styling for desktop menu visibility */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav-menu {
            display: flex !important;
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
        @media (max-width: 680px) {
          .desktop-auth-btns {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .persona-btn-label {
            display: none !important;
          }
          .navbar-brand-img {
            height: 38px !important;
            max-height: 38px !important;
          }
        }
      `}</style>
    </header>
  );
}