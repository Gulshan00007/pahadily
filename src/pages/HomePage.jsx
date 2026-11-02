import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { ArrowRight, MapPin, Users, Mountain, Leaf, Store } from 'lucide-react';

export default function HomePage() {
  // 4 Featured Kullu destinations matching reference exactly
  const kulluDestinations = [
    {
      id: 'jibhi',
      name: 'Jibhi',
      location: 'Kullu, HP',
      image: '/images/destinations/jibhi.jpg',
      link: '/explore?q=Jibhi',
    },
    {
      id: 'tirthan',
      name: 'Tirthan Valley',
      location: 'Kullu, HP',
      image: '/images/destinations/tirthan-valley.jpg',
      link: '/explore?q=Tirthan',
    },
    {
      id: 'shoja',
      name: 'Shoja',
      location: 'Kullu, HP',
      image: '/images/experiences/sunrise-trek.jpg',
      link: '/explore?q=Shoja',
    },
    {
      id: 'ghnp',
      name: 'Great Himalayan NP',
      location: 'Kullu, HP',
      image: '/images/destinations/spiti-valley.jpg',
      link: '/explore?q=Great+Himalayan',
    },
  ];

  // 4 Core Value Pillars / Benefits
  const benefits = [
    {
      icon: Users,
      title: 'Meet Verified Locals',
      desc: 'Travel with trusted people',
    },
    {
      icon: Mountain,
      title: 'Discover Hidden Places',
      desc: 'Offbeat & authentic spots',
    },
    {
      icon: Leaf,
      title: 'Experience Local Culture',
      desc: 'Food, lifestyle & traditions',
    },
    {
      icon: Store,
      title: 'Support Local Communities',
      desc: 'Your travel creates real impact',
    },
  ];

  return (
    <div className="homepage-minimalist" style={{ paddingBottom: '32px' }}>
      {/* 1. Hero Section with Location Label, Headline, Subtitle, and Floating Search Panel */}
      <Hero />

      {/* 2. Benefits Strip (Screen 1 Reference) */}
      <section className="benefits-strip-wrapper" style={{ padding: '24px 0 36px 0' }}>
        <div className="container">
          <div
            className="benefits-strip-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              boxShadow: '0 2px 10px rgba(10, 37, 27, 0.03)',
            }}
          >
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="benefit-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    borderRight: idx < benefits.length - 1 ? '1px solid rgba(16, 37, 29, 0.08)' : 'none',
                    paddingRight: idx < benefits.length - 1 ? '16px' : '0',
                  }}
                >
                  {/* Soft Sage Rounded Square Icon Box */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#E8F1E8',
                      color: '#205540',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '14.5px',
                        fontWeight: '700',
                        color: '#10251D',
                        marginBottom: '2px',
                        lineHeight: 1.25,
                      }}
                    >
                      {b.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '12.5px',
                        color: '#69766D',
                        margin: 0,
                        lineHeight: 1.35,
                      }}
                    >
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Explore Kullu Section (Reference Match) */}
      <section className="explore-kullu-section" style={{ padding: '24px 0 44px 0' }}>
        <div className="container">
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    width: '4px',
                    height: '24px',
                    backgroundColor: '#205540',
                    borderRadius: '2px',
                    display: 'inline-block',
                  }}
                />
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(24px, 3.2vw, 30px)',
                    fontWeight: '700',
                    color: '#10251D',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  Explore Kullu
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: '#69766D', margin: 0, paddingLeft: '14px' }}>
                From peaceful villages to stunning valleys, find places that locals love.
              </p>
            </div>

            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14.5px',
                fontWeight: '700',
                color: '#205540',
                textDecoration: 'none',
                transition: 'gap 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.gap = '9px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.gap = '6px';
              }}
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* 4 Destination Cards Grid */}
          <div
            className="explore-kullu-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {kulluDestinations.map((dest) => (
              <Link
                key={dest.id}
                to={dest.link}
                className="kullu-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(16, 37, 29, 0.08)',
                  textDecoration: 'none',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                  boxShadow: '0 2px 8px rgba(10, 37, 27, 0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 27, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(32, 85, 64, 0.25)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.04)';
                  const arrow = e.currentTarget.querySelector('.kullu-arrow-btn');
                  if (arrow) {
                    arrow.style.backgroundColor = '#0A251B';
                    arrow.style.color = '#FFFFFF';
                    arrow.style.borderColor = '#0A251B';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(16, 37, 29, 0.08)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                  const arrow = e.currentTarget.querySelector('.kullu-arrow-btn');
                  if (arrow) {
                    arrow.style.backgroundColor = '#FFFFFF';
                    arrow.style.color = '#10251D';
                    arrow.style.borderColor = 'rgba(16, 37, 29, 0.12)';
                  }
                }}
              >
                {/* Image Container with 4:3 Ratio */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    overflow: 'hidden',
                    backgroundColor: '#EBE7DE',
                  }}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/destinations/tirthan-valley.jpg';
                    }}
                  />
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: '700',
                        color: '#10251D',
                        marginBottom: '4px',
                      }}
                    >
                      {dest.name}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        color: '#69766D',
                      }}
                    >
                      <MapPin size={13} color="#69766D" />
                      <span>{dest.location}</span>
                    </div>
                  </div>

                  {/* Circular Arrow Button */}
                  <div
                    className="kullu-arrow-btn"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(16, 37, 29, 0.12)',
                      color: '#10251D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Become a Local CTA Banner (Pale Sage with Himalayan Mountain Silhouettes) */}
      <section className="become-local-banner-section" style={{ padding: '20px 0 16px 0' }}>
        <div className="container">
          <div
            className="become-local-card"
            style={{
              position: 'relative',
              backgroundColor: '#E8F1E8',
              borderRadius: '20px',
              padding: 'clamp(28px, 4vw, 42px) clamp(24px, 4.5vw, 48px)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              border: '1px solid rgba(32, 85, 64, 0.1)',
            }}
          >
            {/* Left Decorative Mountain & Pine Tree Silhouette Graphics */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: '100%',
                width: '180px',
                pointerEvents: 'none',
                opacity: 0.18,
                zIndex: 1,
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 180 120" fill="none" preserveAspectRatio="none">
                {/* Mountain Ridge */}
                <path d="M-20 120L40 40L100 90L160 30L200 120Z" fill="#205540" />
                {/* Pine Trees */}
                <path d="M20 120L32 80L44 120Z" fill="#10251D" />
                <path d="M50 120L62 70L74 120Z" fill="#0A251B" />
                <path d="M85 120L95 85L105 120Z" fill="#174232" />
              </svg>
            </div>

            {/* Right Decorative Mountain & Pine Tree Silhouette Graphics */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                height: '100%',
                width: '180px',
                pointerEvents: 'none',
                opacity: 0.18,
                zIndex: 1,
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 180 120" fill="none" preserveAspectRatio="none">
                {/* Mountain Ridge */}
                <path d="M-20 120L30 35L90 85L140 25L200 120Z" fill="#205540" />
                {/* Pine Trees */}
                <path d="M110 120L122 75L134 120Z" fill="#10251D" />
                <path d="M140 120L152 65L164 120Z" fill="#0A251B" />
              </svg>
            </div>

            {/* Text Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(22px, 3.2vw, 32px)',
                  fontWeight: '700',
                  color: '#0A251B',
                  marginBottom: '10px',
                  lineHeight: '1.25',
                }}
              >
                Know your mountains? Share them.
              </h2>
              <p
                style={{
                  fontSize: 'clamp(14px, 1.8vw, 15.5px)',
                  color: '#2A453B',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                Join as a local companion and turn your local knowledge into an earning opportunity.
              </p>
            </div>

            {/* CTA Button */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <Link
                to="/become-a-local"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 30px',
                  backgroundColor: '#0A251B',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(10, 37, 27, 0.15)',
                  transition: 'background-color 0.15s ease, transform 0.15s ease',
                  whiteSpace: 'nowrap',
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
                <span>Become a Local</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Styles for Benefits Strip and Destination Cards */}
      <style>{`
        @media (max-width: 960px) {
          .benefits-strip-card {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .benefit-item {
            border-right: none !important;
            padding-right: 0 !important;
          }
          .explore-kullu-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 580px) {
          .benefits-strip-card {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
            gap: 14px !important;
          }
          .explore-kullu-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .become-local-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 24px 20px !important;
          }
          .become-local-card a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
