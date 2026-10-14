export default function ResponsibleTravelSection() {
  const codes = [
    {
      title: 'Sacred Devta Traditions',
      desc: 'Village deities hold supreme reverence in Himachal. Respect designated sacred meadow rules (such as Shangarh), remove leather/shoes where required, and never enter village sanctums without permission from elders.',
      icon: '🏛️',
    },
    {
      title: 'Plastic-Free Watersheds',
      desc: 'The Tirthan and Sainj rivers are lifeline waters for downstream communities and wild brown trout. Carry all plastic wrappers, bottles, and snack packs back to main road collection bins.',
      icon: '💧',
    },
    {
      title: 'Direct Local Prosperity',
      desc: 'Choose locally owned wooden homestays, purchase handloom shawls directly from artisan weavers, and pay your companions fair honorariums for their time and guidance.',
      icon: '🤝',
    },
  ];

  return (
    <section style={{ padding: '70px 0', backgroundColor: '#FAF8F2', borderTop: '1px solid rgba(16, 38, 29, 0.08)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px auto' }}>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#174D39',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '6px',
            }}
          >
            Pahadíly Mountain Ethos
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '32px',
              color: '#10251D',
              margin: '0 0 10px 0',
            }}
          >
            Responsible Himalayan Travel Code
          </h2>
          <p style={{ color: '#536B5E', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            The Himalayas are fragile ecosystems and ancient sacred homelands. Mindful travelers leave only footprints and take only lasting stories.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          {codes.map((c, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid rgba(16, 38, 29, 0.08)',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#10251D', margin: '0 0 8px 0' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#536B5E', lineHeight: 1.6, margin: 0 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Emergency contact bar */}
        <div
          style={{
            backgroundColor: '#F3EFE6',
            borderRadius: '12px',
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '13px',
            color: '#10251D',
          }}
        >
          <div>
            <strong>🚨 Himachal Emergency & Mountain Support:</strong>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span>Kullu Disaster Control: <strong>1077</strong></span>
            <span>Emergency Unified: <strong>112</strong></span>
            <span>GHNP Forest HQ: <strong>+91 1902 265320</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
