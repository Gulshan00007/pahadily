import { useAuth } from '../../context/AuthContext';

export default function DestinationDetailModal() {
  const { activeModal, closeModal, selectedDestination, openBooking } = useAuth();

  if (activeModal !== 'destinationDetail' || !selectedDestination) return null;

  const dest = selectedDestination;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(10, 37, 27, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          backgroundColor: '#FAF8F2',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(6, 25, 18, 0.4)',
          border: '1px solid rgba(16, 38, 29, 0.12)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            fontSize: '20px',
            color: '#FFFFFF',
            backgroundColor: 'rgba(10, 37, 27, 0.6)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Hero image header */}
        <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
          <img
            src={dest.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'}
            alt={dest.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10, 37, 27, 0.9) 0%, rgba(10, 37, 27, 0.2) 60%, transparent 100%)',
            }}
          />
          <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', color: '#FFFFFF' }}>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                backgroundColor: 'rgba(142, 228, 154, 0.25)',
                color: '#8EE49A',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              Kullu District Pilot Valley
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', margin: '0 0 4px 0' }}>
              {dest.name}
            </h2>
            <div style={{ fontSize: '14px', color: 'rgba(247, 245, 238, 0.85)' }}>
              {dest.tagline}
            </div>
          </div>
        </div>

        {/* Content body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Fast metadata chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#F3EFE6', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Altitude</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#174D39' }}>{dest.altitude || '1,800m'}</div>
            </div>
            <div style={{ backgroundColor: '#F3EFE6', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Sub-Region</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10251D' }}>Kullu District</div>
            </div>
            <div style={{ backgroundColor: '#F3EFE6', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Best Season</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#174D39' }}>March – Nov</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#10251D', margin: '0 0 8px 0' }}>
              Valley Landscape & Culture
            </h4>
            <p style={{ fontSize: '14px', color: '#2b3f35', lineHeight: 1.6, margin: 0 }}>
              {dest.description ||
                `${dest.name} is one of Himachal Pradesh's most serene mountain sanctuaries, characterized by traditional Kath-Kuni timber architecture, sacred devta temples, crisp deodar forests, and gentle river walks. Exploration here is best done on foot accompanied by native valley companions who know ancient footpaths and village customs.`}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#10251D', margin: '0 0 8px 0' }}>
              Key Local Trails & Attractions
            </h4>
            <div style={{ fontSize: '14px', color: '#536B5E', backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 38, 29, 0.08)' }}>
              📍 {dest.highlights}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(23, 77, 57, 0.08)',
              border: '1px solid rgba(23, 77, 57, 0.2)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#174D39' }}>
                Explore with a Native of {dest.name}
              </div>
              <div style={{ fontSize: '13px', color: '#536B5E' }}>
                Local companions stationed here from ₹500/day
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeModal();
                openBooking(
                  {
                    name: `Native Guide (${dest.name})`,
                    location: `${dest.name}, Kullu`,
                    role: 'Local Companion',
                    price: '₹500',
                    unit: '/day',
                    id: 1,
                  },
                  'local'
                );
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Request Local Companion →
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={closeModal}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 38, 29, 0.2)',
                color: '#536B5E',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
