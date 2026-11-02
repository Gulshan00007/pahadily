import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Compass, Shield, HelpCircle, FileText, Lock } from 'lucide-react';

const PATH_MAP = {
  '/about': 'about',
  '/how-it-works': 'how-it-works',
  '/safety': 'safety',
  '/help': 'help',
  '/terms': 'terms',
  '/privacy': 'privacy',
};

export default function StaticInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab = PATH_MAP[location.pathname] || 'about';
  const [activeSection, setActiveSection] = useState(initialTab);

  useEffect(() => {
    const current = PATH_MAP[location.pathname];
    if (current) {
      setActiveSection(current);
    }
  }, [location.pathname]);

  const cards = [
    { id: 'about', title: 'About Us', path: '/about', icon: Users, desc: 'Our mission and Himalayan community roots' },
    { id: 'how-it-works', title: 'How it Works', path: '/how-it-works', icon: Compass, desc: 'Zero commission, 100% fair honorariums' },
    { id: 'safety', title: 'Safety', path: '/safety', icon: Shield, desc: 'Mountain guidelines and verified guide vetting' },
    { id: 'help', title: 'Help / FAQ', path: '/help', icon: HelpCircle, desc: 'Frequently asked slow travel questions' },
    { id: 'terms', title: 'Terms & Conditions', path: '/terms', icon: FileText, desc: 'Platform rules and respect for local culture' },
    { id: 'privacy', title: 'Privacy Policy', path: '/privacy', icon: Lock, desc: 'Data security and traveler privacy principles' },
  ];

  const handleCardClick = (card) => {
    setActiveSection(card.id);
    navigate(card.path);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '36px 0 80px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Screen 12: 6 Cards Navigation Grid */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Pahadíly Community & Trust
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Learn about our slow travel ethos, verified local guides, and community guidelines.
          </p>
        </div>

        {/* 6-Card Grid (Screen 12) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {cards.map((c) => {
            const Icon = c.icon;
            const isSelected = activeSection === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className="card card-hover"
                onClick={() => handleCardClick(c)}
                style={{
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--color-forest)' : 'var(--color-border)',
                  backgroundColor: isSelected ? 'rgba(32, 85, 64, 0.05)' : '#FFFFFF',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--color-forest)' : 'var(--bg-secondary)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                    {c.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Section Detailed Content */}
        <div className="card" style={{ padding: '40px', maxWidth: '840px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>
          {activeSection === 'about' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '700', marginBottom: '14px' }}>
                About Pahadíly
              </h2>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                Pahadíly was born in the cedar glades of Kullu and Tirthan Valley with a singular goal: to connect travelers directly with the people who call the mountains home.
              </p>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                For decades, commercial mass tourism has funneled visitors into crowded tourist towns while extracting wealth away from indigenous villages. We believe travel is at its finest when it is slow, personal, and regenerative.
              </p>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', marginTop: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Our Three Pledges</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>
                  <li><strong>100% Direct Retention:</strong> Zero platform commission from guides or village families.</li>
                  <li><strong>Verified Local Knowledge:</strong> Every guide is an authentic valley native vetted for mountain safety.</li>
                  <li><strong>Cultural Sanctity:</strong> Strict leave-no-trace and devta respect guidelines for all guests.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'how-it-works' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '700', marginBottom: '14px' }}>
                How Pahadíly Works
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-forest)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Discover Hidden Valleys</h4>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Browse authentic offbeat hamlets, glacial streams, and heritage Kath-Kuni homestays away from commercial crowds.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-forest)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Book Directly with Verified Locals</h4>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Select your travel date and preferred time slot. Your reservation goes directly to the local guide or host.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-forest)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Pay on Meetup</h4>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Pay honorariums directly to your guide or host family in cash or UPI when you meet in the village. No platform cuts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'safety' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '700', marginBottom: '14px' }}>
                Himalayan Safety & Mountain Ethos
              </h2>
              <p style={{ fontSize: '14.5px', lineHeight: '1.7', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                The Himalayas command profound respect. Rapid weather changes, high altitudes, and sacred sanctums require preparedness.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div style={{ padding: '14px', borderLeft: '3px solid var(--color-forest)', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 8px 8px 0' }}>
                  <strong>Always Walk with a Guide:</strong> High altitude ridges around Jalori, Serolsar, and Parvati can become disorienting in mist or snow. Never hike unmarked trails alone.
                </div>
                <div style={{ padding: '14px', borderLeft: '3px solid var(--color-forest)', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 8px 8px 0' }}>
                  <strong>Leave No Trace:</strong> Carry all plastic packaging, wrappers, and water bottles back down to main roadheads. Never discard non-biodegradables in village streams.
                </div>
                <div style={{ padding: '14px', borderLeft: '3px solid var(--color-forest)', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 8px 8px 0' }}>
                  <strong>Devta Shrine Etiquette:</strong> Village temples are active sacred sanctuaries governed by local devtas. Always remove shoes and ask permission before photographing wood carvings.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'help' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '700', marginBottom: '14px' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>How do payments work?</h4>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Pahadíly charges 0% booking fees. You settle the agreed honorarium directly with your host or guide upon arrival via cash or UPI.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Can I cancel or reschedule?</h4>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Yes. Free cancellation and date rescheduling are supported anytime through your "My Bookings" dashboard.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Who are the guides?</h4>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    All companions are verified native residents of the specific valley. High altitude trek guides hold formal mountaineering certifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'terms' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '700', marginBottom: '14px' }}>
                Terms & Conditions
              </h2>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-secondary)' }}>
                By booking through Pahadíly, travelers agree to uphold local community norms, respect mountain safety advisories, and treat village hosts with dignity and fair compensation. Pahadíly serves as a verified community discovery conduit connecting mindful travelers with independent native service providers.
              </p>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '700', marginBottom: '14px' }}>
                Privacy Policy
              </h2>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-secondary)' }}>
                We respect your personal privacy. Traveler contact details (phone, email) are shared exclusively with the confirmed local host for reservation coordination. We never sell traveler information or track browsing history for third-party advertising.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
