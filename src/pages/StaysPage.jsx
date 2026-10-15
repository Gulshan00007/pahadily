import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocations } from '../lib/api';

export default function StaysPage() {
  const [searchParams] = useSearchParams();
  const { openBooking, openHostApplication, refreshKey } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedValley, setSelectedValley] = useState(searchParams.get('valley') || 'all');
  const [staysList, setStaysList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Stays are genuine locations or approved homestays
    getLocations({ status: 'published' })
      .then((data) => {
        const publishedStays = (Array.isArray(data) ? data : []).filter(
          (loc) => loc.category === 'villages' || loc.category === 'homestays' || (loc.tags && loc.tags.some((t) => t.toLowerCase().includes('stay') || t.toLowerCase().includes('homestay')))
        );
        setStaysList(publishedStays);
      })
      .catch((err) => {
        console.warn('Could not load stays:', err);
        setStaysList([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filteredStays = useMemo(() => {
    return staysList.filter((stay) => {
      if (selectedValley !== 'all') {
        const v = String(stay.valley || '').toLowerCase();
        if (!v.includes(selectedValley.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = stay.name.toLowerCase().includes(q);
        const matchesDesc = stay.description?.toLowerCase().includes(q);
        const matchesLoc = stay.village?.toLowerCase().includes(q) || stay.valley?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc) return false;
      }
      return true;
    });
  }, [staysList, selectedValley, searchQuery]);

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section
        style={{
          backgroundColor: '#10251D',
          color: '#F7F5EE',
          padding: '60px 0 48px 0',
          borderBottom: '1px solid rgba(142, 228, 154, 0.15)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: '720px' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#8EE49A',
                fontWeight: 700,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Verified Village Homestays
            </span>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px',
                color: '#FFFFFF',
                margin: '0 0 12px 0',
                lineHeight: 1.2,
              }}
            >
              Himalayan Architectural Stays
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(247, 245, 238, 0.85)', lineHeight: 1.6, margin: 0 }}>
              Stay inside authentic Kath-Kuni homes and indigenous apple orchard cottages with verified host families. No commercial hotels or fabricated listings.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 0 24px' }}>
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedValley}
              onChange={(e) => setSelectedValley(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                backgroundColor: '#FFFFFF',
                fontSize: '13.5px',
                color: '#10251D',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Valleys</option>
              <option value="tirthan">Tirthan Valley</option>
              <option value="jibhi">Jibhi / Banjar</option>
              <option value="parvati">Parvati Valley</option>
              <option value="spiti">Spiti Valley</option>
              <option value="kullu">Kullu</option>
            </select>

            <input
              type="text"
              placeholder="Search stays by name, village, valley..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 37, 29, 0.15)',
                backgroundColor: '#FFFFFF',
                fontSize: '13.5px',
                width: '280px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="button"
            onClick={openHostApplication}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: '#174D39',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Apply to Host a Stay +
          </button>
        </div>
        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#536B5E' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🪵</div>
            <p style={{ fontSize: '15px' }}>Loading verified homestays...</p>
          </div>
        )}

        {/* Honest Empty State */}
        {!loading && filteredStays.length === 0 && (
          <div
            style={{
              maxWidth: '640px',
              margin: '20px auto 60px auto',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '48px 32px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              boxShadow: '0 4px 20px rgba(16, 37, 29, 0.04)',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🪵</div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#10251D',
                marginBottom: '10px',
              }}
            >
              No stays have been listed here yet.
            </h2>
            <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.6, marginBottom: '24px' }}>
              We do not populate fake homestays or sample rooms. If you own a traditional Kath-Kuni house or village home in Himachal Pradesh, submit an application to join our verified community.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openHostApplication}
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Apply to Become a Local Host
              </button>
              <Link
                to="/explore"
                style={{
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(23, 77, 57, 0.08)',
                  color: '#174D39',
                  border: '1px solid rgba(23, 77, 57, 0.2)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Explore Valid Destinations
              </Link>
            </div>
          </div>
        )}

        {/* Real Stays Grid */}
        {!loading && filteredStays.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredStays.map((stay) => (
              <div
                key={stay.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(16, 37, 29, 0.08)',
                  boxShadow: '0 2px 10px rgba(16, 37, 29, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: '220px', backgroundColor: '#EBE7DE' }}>
                  {stay.cover_image ? (
                    <img src={stay.cover_image} alt={stay.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#88988E' }}>
                      🪵 Verified Village Stay
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(10, 37, 27, 0.8)',
                      color: '#8EE49A',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {stay.valley || stay.district}
                  </div>
                </div>

                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', margin: '0 0 6px 0' }}>
                    {stay.name}
                  </h3>
                  <p style={{ color: '#536B5E', fontSize: '13.5px', lineHeight: 1.55, margin: '0 0 16px 0', flex: 1 }}>
                    {stay.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(16, 37, 29, 0.08)' }}>
                    <div>
                      <span style={{ fontSize: '12.5px', color: '#688575', fontWeight: 600 }}>
                        {stay.village ? `${stay.village}, ${stay.district}` : stay.district}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openBooking(stay, 'stay')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '9999px',
                        backgroundColor: '#174D39',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Request Stay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
