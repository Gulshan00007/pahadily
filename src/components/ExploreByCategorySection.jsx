import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'hidden-places',
    name: 'Hidden Places',
    count: '14 Sanctuaries',
    desc: 'Unmapped deodar groves, sacred ridges, and secret meadow alcoves.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
    link: '/explore?category=hidden-places',
    icon: '✨',
  },
  {
    id: 'treks',
    name: 'Treks & Ridges',
    count: '9 High Trails',
    desc: 'From Serolsar alpine lake to Jalori pass and Great Himalayan trails.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    link: '/experiences?category=adventure',
    icon: '🥾',
  },
  {
    id: 'waterfalls',
    name: 'Sacred Waterfalls',
    count: '7 Cascades',
    desc: 'Hidden forest falls like Chhoie, Barshangarh, and Jana streams.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    link: '/explore?category=waterfalls',
    icon: '🌊',
  },
  {
    id: 'villages',
    name: 'Kath-Kuni Villages',
    count: '11 Hamlets',
    desc: 'Centuries-old stone and timber architecture in Sharchi, Chehni, and Pekhri.',
    image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=600&q=80',
    link: '/explore?category=villages',
    icon: '🏡',
  },
  {
    id: 'food',
    name: 'Culinary & Siddu',
    count: '6 Traditional Kitchens',
    desc: 'Slow-cooked woodfired Siddu, ghee, mountain walnut chutneys, and royal Dham.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    link: '/experiences?category=food',
    icon: '🍲',
  },
  {
    id: 'stays',
    name: 'Authentic Homestays',
    count: '18 Family Homes',
    desc: 'Stay with local families in traditional cedar rooms and apple orchard cottages.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    link: '/stays',
    icon: '🪵',
  },
  {
    id: 'companions',
    name: 'Local Companions',
    count: '24 Verified Locals',
    desc: 'Native guides who grew up in these valleys and share living oral folklore.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    link: '/companions',
    icon: '🤝',
  },
];

export default function ExploreByCategorySection() {
  return (
    <section style={{ padding: '72px 0', backgroundColor: '#F7F5EE' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#174D39',
                fontWeight: 700,
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Wayfinding & Exploration
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '32px',
                color: '#10251D',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Explore by Category
            </h2>
          </div>
          <Link
            to="/explore"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#174D39',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>View All in Interactive Map</span>
            <span>→</span>
          </Link>
        </div>

        {/* Category Cards Carousel / Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(16, 37, 29, 0.08)',
                boxShadow: '0 4px 16px rgba(16, 37, 29, 0.04)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 37, 29, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 37, 29, 0.04)';
              }}
            >
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(16,37,29,0.7) 100%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(247, 245, 238, 0.95)',
                    color: '#10251D',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.count}</span>
                </span>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '19px',
                    fontWeight: 700,
                    color: '#10251D',
                    margin: '0 0 6px 0',
                  }}
                >
                  {cat.name}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#536B5E',
                    lineHeight: 1.5,
                    margin: '0 0 14px 0',
                    flex: 1,
                  }}
                >
                  {cat.desc}
                </p>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#174D39',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Discover</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
