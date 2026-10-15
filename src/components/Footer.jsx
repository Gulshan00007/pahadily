import { Link } from 'react-router-dom';

export default function Footer() {

  return (
    <footer
      style={{
        backgroundColor: '#10251D',
        color: '#F7F5EE',
        padding: '72px 0 36px 0',
        borderTop: '1px solid rgba(142, 228, 154, 0.12)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '48px',
            marginBottom: '56px',
          }}
        >
          {/* Col 1: Brand Info & Official Logo */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Link to="/" style={{ display: 'inline-block' }}>
                <img
                  src="/images/logo/pahadily-logo.png"
                  alt="Pahadíly"
                  style={{
                    height: '52px',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById('footer-brand-fallback');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span
                  id="footer-brand-fallback"
                  style={{
                    display: 'none',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#F7F5EE',
                  }}
                >
                  Pahadíly
                </span>
              </Link>
            </div>

            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '13px',
                letterSpacing: '0.12em',
                color: '#8EE49A',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              RARE PLACES. REAL PEOPLE. LASTING STORIES.
            </div>

            <p
              style={{
                color: 'rgba(247, 245, 238, 0.72)',
                fontSize: '13.5px',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Pahadíly is an authentic Himalayan discovery and community-earning platform. We connect mindful travelers directly with native companions, family homestays, and certified guides across Himachal Pradesh.
            </p>
          </div>

          {/* Col 2: Explore & Valleys */}
          <div>
            <h4
              style={{
                fontSize: '12.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#D9C5A3',
                marginBottom: '18px',
                fontWeight: 700,
              }}
            >
              Explore & Valleys
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '14px',
                lineHeight: 2.2,
                color: 'rgba(247, 245, 238, 0.8)',
              }}
            >
              <li>
                <Link to="/explore" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Explore Destinations Directory
                </Link>
              </li>
              <li>
                <Link to="/explore?valley=tirthan" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Tirthan Valley & GHNP
                </Link>
              </li>
              <li>
                <Link to="/explore?valley=jibhi" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Jibhi & Chehni Kothi
                </Link>
              </li>
              <li>
                <Link to="/explore?valley=shangarh" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Shangarh Sacred Meadow
                </Link>
              </li>
              <li>
                <Link to="/explore?valley=naggar" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Naggar Castle & Heritage
                </Link>
              </li>
              <li>
                <Link to="/explore?valley=lug-valley" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Lug Valley Hamlets
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Experiences & Homestays */}
          <div>
            <h4
              style={{
                fontSize: '12.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#D9C5A3',
                marginBottom: '18px',
                fontWeight: 700,
              }}
            >
              Experiences & Stays
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '14px',
                lineHeight: 2.2,
                color: 'rgba(247, 245, 238, 0.8)',
              }}
            >
              <li>
                <Link to="/experiences" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Authentic Himalayan Experiences
                </Link>
              </li>
              <li>
                <Link to="/companions" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Verified Local Companions
                </Link>
              </li>
              <li>
                <Link to="/stays" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Kath-Kuni & Village Stays
                </Link>
              </li>
              <li>
                <Link to="/become-a-local" style={{ color: '#8EE49A', fontWeight: 600, textDecoration: 'none' }}>
                  Become a Local Host / Guide ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community Ethos & Safety */}
          <div>
            <h4
              style={{
                fontSize: '12.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#D9C5A3',
                marginBottom: '18px',
                fontWeight: 700,
              }}
            >
              Ethos & Mountain Care
            </h4>
            <p
              style={{
                color: 'rgba(247, 245, 238, 0.72)',
                fontSize: '13px',
                lineHeight: 1.6,
                margin: '0 0 14px 0',
              }}
            >
              85–90% of all payments flow directly to native guides, homestay families, and trail cooks. We strictly adhere to sacred Devta sanctuary codes and Leave-No-Trace principles.
            </p>
            <div
              style={{
                backgroundColor: 'rgba(23, 77, 57, 0.4)',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(142, 228, 154, 0.2)',
              }}
            >
              <div style={{ fontSize: '11px', color: '#D9C5A3', fontWeight: 700, textTransform: 'uppercase' }}>
                Himalayan Safety Helplines
              </div>
              <div style={{ fontSize: '12.5px', color: '#FFFFFF', marginTop: '4px' }}>
                Kullu Disaster Control: <strong>1077</strong>
              </div>
              <div style={{ fontSize: '12.5px', color: '#FFFFFF' }}>
                Unified Mountain Emergency: <strong>112</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div
          style={{
            borderTop: '1px solid rgba(247, 245, 238, 0.1)',
            paddingTop: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '12.5px',
            color: 'rgba(247, 245, 238, 0.65)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Pahadíly Inc. All rights reserved. Handcrafted with reverence for the Western Himalayas.
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span>Zero-Middleman Guarantee</span>
            <span>Sacred Devta Code</span>
            <span>Pack-It-In Pack-It-Out</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
