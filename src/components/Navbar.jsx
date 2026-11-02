import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, ChevronDown, Calendar, Shield, MapPin, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Find a Local', path: '/companions' },
    { name: 'Stays', path: '/stays' },
    { name: 'Experiences', path: '/experiences' },
    { name: 'Become a Local', path: '/become-a-local' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header
      className={`site-navbar ${scrolled ? 'scrolled shadow-sm' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: scrolled ? 'rgba(250, 248, 242, 0.98)' : 'rgba(250, 248, 242, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
        height: '76px',
        transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: scrolled ? '0 4px 18px rgba(10, 37, 27, 0.06)' : 'none',
      }}
    >
      <div className="container site-navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        {/* 1. Brand Logo (preserved original file and path) */}
        <Link to="/" className="navbar-brand-link" aria-label="Pahadíly Homepage" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/logo/pahadily-logo.png"
            alt="Pahadíly"
            className="navbar-brand-img"
            style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* 2. Desktop Navigation Links */}
        <nav className="navbar-links" aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
              style={{
                fontSize: '14.5px',
                fontWeight: '500',
                color: isActive(link.path) ? '#205540' : '#10251D',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. Right Zone: Search Icon, Login, Sign Up or Profile Dropdown */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => navigate('/explore')}
            aria-label="Search destinations"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#10251D',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16, 37, 29, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Search size={19} />
          </button>

          {isAuthenticated ? (
            <div className="account-dropdown-wrapper" ref={accountRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-pill"
                onClick={() => setAccountDropdownOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(16, 37, 29, 0.12)',
                  borderRadius: '9999px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#205540',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                  }}
                >
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#10251D', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name?.split(' ')[0] || 'My Account'}
                </span>
                <ChevronDown size={14} color="#69766D" />
              </button>

              {accountDropdownOpen && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '230px',
                    padding: '8px',
                    zIndex: 100,
                    boxShadow: '0 8px 24px rgba(10, 37, 27, 0.12)',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 37, 29, 0.08)',
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(16,37,29,0.06)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#10251D' }}>{user?.full_name}</div>
                    <div style={{ fontSize: '11.5px', color: '#69766D', textTransform: 'capitalize' }}>Role: {user?.role || 'Traveler'}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 0' }}>
                    <Link
                      to="/my-bookings"
                      className="sidebar-nav-item"
                      style={{ padding: '8px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      <Calendar size={15} color="#205540" />
                      My Bookings
                    </Link>

                    {isHost && (
                      <Link
                        to="/provider-portal"
                        className="sidebar-nav-item"
                        style={{ padding: '8px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <MapPin size={15} color="#205540" />
                        Host Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="sidebar-nav-item"
                        style={{ padding: '8px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <Shield size={15} color="#205540" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(16,37,29,0.06)', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                      }}
                      className="sidebar-nav-item"
                      style={{ padding: '8px 10px', fontSize: '13px', color: '#C62828', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <LogOut size={15} color="#C62828" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-pill"
                onClick={() => openAuth('login')}
                style={{
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#10251D',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(16, 37, 29, 0.16)',
                  borderRadius: '9999px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-pill"
                onClick={() => openAuth('signup')}
                style={{
                  padding: '8px 22px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  backgroundColor: '#0A251B',
                  border: 'none',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 6px rgba(10, 37, 27, 0.15)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#205540';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0A251B';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="btn-icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={22} color="#10251D" /> : <Menu size={22} color="#10251D" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: '76px 0 0 0',
            backgroundColor: 'rgba(10, 37, 27, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 85,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FAF8F2',
              width: '84%',
              maxWidth: '320px',
              height: '100%',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '10px 0',
                    color: isActive(link.path) ? '#205540' : '#10251D',
                    textDecoration: 'none',
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(16,37,29,0.08)', margin: '12px 0' }} />

            {!isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-pill w-full"
                  style={{
                    padding: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(16, 37, 29, 0.16)',
                    color: '#10251D',
                    fontWeight: '600',
                    borderRadius: '9999px',
                  }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('login');
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="btn btn-pill w-full"
                  style={{
                    padding: '10px',
                    backgroundColor: '#0A251B',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    borderRadius: '9999px',
                  }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('signup');
                  }}
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  to="/my-bookings"
                  className="btn btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                {isHost && (
                  <Link
                    to="/provider-portal"
                    className="btn btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Host Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: '#C62828' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded CSS for responsive toggle button display */}
      <style>{`
        @media (max-width: 900px) {
          .navbar-links {
            display: none !important;
          }
          #mobile-nav-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}