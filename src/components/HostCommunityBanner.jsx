import { useAuth } from '../context/AuthContext';

export default function HostCommunityBanner() {
  const { openHostApplication } = useAuth();

  return (
    <section style={{ padding: '60px 0', backgroundColor: '#FAF8F2' }}>
      <div className="section-container">
        <div
          style={{
            backgroundColor: '#174D39',
            borderRadius: '24px',
            padding: '48px 40px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            boxShadow: '0 16px 40px rgba(10, 37, 27, 0.25)',
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(142, 228, 154, 0.15) 0%, transparent 40%)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#8EE49A',
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: '8px',
              }}
            >
              Himalayan Community Earning
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '32px',
                margin: '0 0 12px 0',
                lineHeight: 1.25,
              }}
            >
              Live in Himachal Pradesh? Earn sharing your native valley.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(247, 245, 238, 0.85)', lineHeight: 1.6, margin: 0 }}>
              Whether you are a certified trek guide, village storyteller, organic farmer, home-cook, or homestay host, Pahadíly connects you with mindful travelers who value your knowledge.
            </p>
          </div>

          <div style={{ flexShrink: 0 }}>
            <button
              type="button"
              onClick={openHostApplication}
              style={{
                padding: '16px 32px',
                borderRadius: '9999px',
                backgroundColor: '#FAF8F2',
                color: '#10251D',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              Join as Local Companion / Host →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
