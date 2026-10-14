import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExperiences } from '../lib/api';

const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    title: 'Hidden Cedar Forest & Secret Waterfall Walk',
    region: 'jibhi',
    location: 'Jibhi & Shoja, HP',
    category: 'nature',
    duration: '2–3 hours',
    difficulty: 'Easy',
    price: '₹500',
    unit: 'per person',
    guide: 'Rahul (Local Companion)',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    description: 'A quiet walking trail through centuries-old Himalayan cedar pine glades leading to secluded waterfall nooks away from any roads.',
    inclusions: ['Native walking escort', 'Herbal mountain chai', 'Himalayan flora insights'],
  },
  {
    id: 2,
    title: 'Authentic Himachali Siddu & Dham Home Lunch',
    region: 'kullu',
    location: 'Kullu Valley, HP',
    category: 'food',
    duration: '2 hours',
    difficulty: 'Culinary Experience',
    price: '₹350',
    unit: 'per person',
    guide: 'Sushma (Local Host)',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    description: 'Experience steamed wheat Siddu stuffed with spiced walnut and poppy paste, served with pure cow ghee and family-cooked Rajma.',
    inclusions: ['Full Himachali thali meal', 'Traditional kitchen tour', 'Family recipe sharing'],
  },
  {
    id: 3,
    title: 'Sunrise Viewpoint Ridge Trek above Jalori',
    region: 'jibhi',
    location: 'Shoja / Jalori Pass, HP',
    category: 'adventure',
    duration: '3–4 hours',
    difficulty: 'Moderate',
    price: '₹700',
    unit: 'per person',
    guide: 'Aman (Local Guide)',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    description: 'Ascend high alpine ridges looking out onto the 6,000m peaks of the Great Himalayan range as the golden morning dawn breaks.',
    inclusions: ['Experienced mountain escort', 'Trekking poles', 'Hot thermos chai'],
  },
  {
    id: 4,
    title: 'Kath-Kuni Village Heritage & Handloom Walk',
    region: 'tirthan',
    location: 'Gushaini, Tirthan Valley',
    category: 'culture',
    duration: '2–3 hours',
    difficulty: 'Cultural Walk',
    price: '₹450',
    unit: 'per person',
    guide: 'Meena (Local Host)',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    description: 'Discover centuries of earthquake-resistant interlocked timber-and-stone architecture, sheep wool spinning, and village orchards.',
    inclusions: ['Village elder guide', 'Handloom wool demo', 'Organic orchard fruit taste'],
  },
];

export default function ExperiencesSection() {
  const { openBooking, refreshKey } = useAuth();
  const [experiencesList, setExperiencesList] = useState(DEFAULT_EXPERIENCES);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    getExperiences()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setExperiencesList(data);
        }
      })
      .catch((err) => console.warn('Using experiences fallback:', err));
  }, [refreshKey]);

  const filtered = experiencesList.filter((exp) => {
    if (categoryFilter === 'all') return true;
    return exp.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <section id="experiences" style={{ padding: '80px 0', backgroundColor: '#FAF8F2' }}>
      <div className="section-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
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
            Authentic Himalayan Activities
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
            Curated Local Experiences
          </h2>
          <p style={{ color: '#536B5E', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
            Slow down and immerse yourself in traditional Himalayan culture, wood-fired gastronomy, and untouched nature led by the people who call these mountains home.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
            {[
              { id: 'all', label: 'All Experiences' },
              { id: 'nature', label: 'Forest & Rivers' },
              { id: 'culture', label: 'Village & Heritage' },
              { id: 'food', label: 'Siddu & Home Meals' },
              { id: 'adventure', label: 'Ridge Treks' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: categoryFilter === cat.id ? '#174D39' : '#EDE8DC',
                  color: categoryFilter === cat.id ? '#FFFFFF' : '#10251D',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experiences Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filtered.map((exp) => (
            <div
              key={exp.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(16, 38, 29, 0.1)',
                boxShadow: '0 8px 24px rgba(10, 37, 27, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img
                  src={exp.image}
                  alt={exp.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(10, 37, 27, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#8EE49A',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  ⏱️ {exp.duration}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(247, 245, 238, 0.95)',
                    color: '#10251D',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {exp.difficulty}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', color: '#174D39', fontWeight: 700, marginBottom: '4px' }}>
                  {exp.guide}
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '19px',
                    color: '#10251D',
                    margin: '0 0 8px 0',
                    lineHeight: 1.3,
                  }}
                >
                  {exp.title}
                </h3>
                <p style={{ color: '#536B5E', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0', flex: 1 }}>
                  {exp.description}
                </p>

                {/* Inclusions */}
                {Array.isArray(exp.inclusions) && (
                  <div
                    style={{
                      backgroundColor: '#FAF8F2',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#2b3f35',
                      marginBottom: '16px',
                    }}
                  >
                    <strong>Includes:</strong> {exp.inclusions.join(' • ')}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(16, 38, 29, 0.08)',
                    marginTop: 'auto',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#174D39' }}>{exp.price}</span>
                    <span style={{ fontSize: '12px', color: '#536B5E' }}> /{exp.unit || 'person'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBooking(exp, 'experience')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      backgroundColor: '#174D39',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(23, 77, 57, 0.2)',
                    }}
                  >
                    Request Experience →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
