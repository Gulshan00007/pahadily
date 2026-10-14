export default function HowItWorksEthos() {
  const steps = [
    {
      num: '01',
      title: 'Discover Rare Places',
      desc: 'Move past overcrowded tourist circuits into secluded cedar glades, sacred meadows, and centuries-old Kath-Kuni fortress hamlets.',
      icon: '🏔️',
    },
    {
      num: '02',
      title: 'Meet Real People',
      desc: 'Connect with native village companions, qualified mountain escorts, and family home-cooks who know every ridge and story.',
      icon: '🌲',
    },
    {
      num: '03',
      title: 'Request Directly',
      desc: 'Choose your date and time window with instant availability check. No surge pricing or hidden platform commissions.',
      icon: '🤝',
    },
    {
      num: '04',
      title: 'Support Himalayan Families',
      desc: '100% of traveler honorariums go directly into local hands, strengthening valley livelihoods and ecological stewardship.',
      icon: '🌾',
    },
  ];

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#F3EFE6' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#174D39',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '8px',
            }}
          >
            The Pahadíly Model
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '36px',
              color: '#10251D',
              margin: '0 0 14px 0',
              lineHeight: 1.2,
            }}
          >
            Discover Places. Meet People. Earn Locally.
          </h2>
          <p style={{ color: '#536B5E', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
            We are redefining Himalayan travel into an authentic encounter between respectful travelers and local community guardians.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          {steps.map((st) => (
            <div
              key={st.num}
              style={{
                backgroundColor: '#FAF8F2',
                borderRadius: '16px',
                padding: '28px 22px',
                border: '1px solid rgba(16, 38, 29, 0.08)',
                boxShadow: '0 6px 20px rgba(10, 37, 27, 0.03)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: "'Playfair Display', serif",
                  color: 'rgba(23, 77, 57, 0.25)',
                  marginBottom: '12px',
                }}
              >
                {st.num}
              </div>
              <div style={{ fontSize: '26px', marginBottom: '12px' }}>{st.icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', color: '#10251D', margin: '0 0 8px 0' }}>
                {st.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#536B5E', lineHeight: 1.5, margin: 0 }}>
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
