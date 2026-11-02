import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#FAF8F2',
        borderTop: '1px solid rgba(16, 37, 29, 0.08)',
        padding: '56px 0 36px 0',
        marginTop: '64px',
      }}
    >
      <div className="container">
        {/* Main Footer Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '340px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
              <img
                src="/images/logo/pahadily-logo.png"
                alt="Pahadíly"
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p
              style={{
                fontSize: '13.5px',
                lineHeight: '1.6',
                color: '#69766D',
                margin: 0,
              }}
            >
              Connecting travelers with verified local companions, traditional homestays, and authentic mountain experiences across Himachal Pradesh.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(24px, 5vw, 48px)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#10251D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Explore
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <Link to="/explore" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link to="/companions" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Find a Local
                  </Link>
                </li>
                <li>
                  <Link to="/stays" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Homestays
                  </Link>
                </li>
                <li>
                  <Link to="/experiences" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Experiences
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#10251D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Community
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <Link to="/become-a-local" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Become a Local
                  </Link>
                </li>
                <li>
                  <Link to="/about" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    About Pahadíly
                  </Link>
                </li>
                <li>
                  <Link to="/safety" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Safety Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#10251D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '14px',
                }}
              >
                Trust & Support
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <Link to="/help" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Help & FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/terms" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" style={{ fontSize: '13.5px', color: '#69766D', textDecoration: 'none' }}>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hairline Separator */}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(16, 37, 29, 0.08)', margin: '0 0 24px 0' }} />

        {/* Bottom Copyright */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12.5px',
            color: '#84948A',
          }}
        >
          <div>
            © {new Date().getFullYear()} Pahadíly. Rare Places. Real People. Lasting Stories.
          </div>
          <div>
            Himachal Pradesh, India
          </div>
        </div>
      </div>
    </footer>
  );
}
