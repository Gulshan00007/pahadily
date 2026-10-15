import { Link } from 'react-router-dom';

export default function CommunityImpactSection() {
  const impactStats = [
    {
      value: '85–90%',
      label: 'Direct Community Retention',
      description: 'Unlike commercial online travel agencies that extract 25-40% in commissions, Pahadíly delivers nearly the entire honorarium directly into village households.',
    },
    {
      value: '100%',
      label: 'Native Mountain Guardians',
      description: 'Every companion, trail escort, and homestay host is a permanent resident of Himachal with verifiable roots in their ancestral valleys.',
    },
    {
      value: 'Zero',
      label: 'Middleman Exploitation',
      description: 'Transparent fixed honorariums eliminate coercive shopping stops, hidden kickbacks, and inflated tourist markups.',
    },
    {
      value: '100% Trace',
      label: 'Ecological Leave-No-Trace',
      description: 'Our hosts actively educate visitors on sacred Devta boundaries, zero single-use plastics, and catch-and-release trout ethics.',
    },
  ];

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#10251D', color: '#F7F5EE' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          {/* Left Column: Mission Narrative */}
          <div>
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
              The Pahadíly Ethos
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '34px',
                lineHeight: 1.2,
                color: '#FFFFFF',
                margin: '0 0 18px 0',
              }}
            >
              How Responsible Tourism Strengthens Himalayan Lives
            </h2>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                color: 'rgba(247, 245, 238, 0.85)',
                marginBottom: '24px',
              }}
            >
              Mass tourism often leaves high mountain valleys with overcrowded roads, overflowing landfills, and corporate hotel chains owned by outside investors.
            </p>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                color: 'rgba(247, 245, 238, 0.85)',
                marginBottom: '32px',
              }}
            >
              Pahadíly flips the model: by connecting mindful travelers directly with certified local trek guides, family homestays, and village storytellers, your journey provides sustainable seasonal income that keeps ancestral heritage alive and protects pristine nature.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/become-a-local"
                style={{
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#8EE49A',
                  color: '#10251D',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(142, 228, 154, 0.25)',
                }}
              >
                <span>🌲 Become a Local Partner</span>
                <span>→</span>
              </Link>
              <Link
                to="/explore"
                style={{
                  padding: '12px 22px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(247, 245, 238, 0.1)',
                  color: '#F7F5EE',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid rgba(247, 245, 238, 0.2)',
                }}
              >
                Explore Verified Places
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {impactStats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(23, 77, 57, 0.35)',
                  border: '1px solid rgba(142, 228, 154, 0.18)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#8EE49A',
                    lineHeight: 1,
                    marginBottom: '10px',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#F7F5EE',
                    marginBottom: '8px',
                  }}
                >
                  {stat.label}
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'rgba(247, 245, 238, 0.72)',
                    margin: 0,
                  }}
                >
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
