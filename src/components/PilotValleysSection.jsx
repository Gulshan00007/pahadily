import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PILOT_VALLEYS_DATA = [
  {
    id: 'tirthan',
    name: 'Tirthan Valley',
    tagline: 'Crystal rivers, deodar forests, and UNESCO GHNP trails',
    altitude: '1,600m',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlights: 'Jalori Pass, Serolsar Lake, Chhoie Waterfall, Great Himalayan National Park',
    tags: ['Trout River', 'UNESCO GHNP', 'Kath-Kuni'],
    bestSeason: 'March to November',
    companionsCount: 4,
    description: 'Carved by the pristine glacial Tirthan river, this valley serves as the gateway to the Great Himalayan National Park. Lush with walnut and deodar forests, ancient stone-and-timber hamlets, and crystalline angling streams.',
  },
  {
    id: 'jibhi',
    name: 'Jibhi',
    tagline: 'Quiet pine hamlets, stone-and-timber architectural heritage',
    altitude: '1,880m',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    highlights: 'Chehni Kothi 1,500-year fortress tower, Shringa Rishi Temple, hidden waterfalls',
    tags: ['Heritage Fort', 'Pine Forests', 'Waterfalls'],
    bestSeason: 'Throughout the year',
    companionsCount: 6,
    description: 'An idyllic Himalayan haven nestled in Banjar sub-division. Famous for centuries-old multistory Kath-Kuni fortresses, murmuring streams crossed by wooden footbridges, and gentle walking trails through cedar glades.',
  },
  {
    id: 'shangarh',
    name: 'Shangarh (Sainj)',
    tagline: 'Vast sacred alpine meadow protected by Shangchul Mahadev',
    altitude: '2,100m',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    highlights: 'Sacred meadow, pagoda temples, Sainj river wildlife sanctuary',
    tags: ['Sacred Meadow', 'Pagoda Temple', 'Serenity'],
    bestSeason: 'April to October',
    companionsCount: 3,
    description: 'A mystical high alpine bowl encircled by towering Himalayan cedar pines. The sacred meadow has been safeguarded for centuries under ancient devta rules prohibiting noise and contamination.',
  },
  {
    id: 'naggar',
    name: 'Naggar',
    tagline: 'Ancient Kullu royal capital, timber castellation, and Russian art history',
    altitude: '1,760m',
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
    highlights: 'Naggar Castle, Nicholas Roerich Estate, Tripura Sundari pagoda, Jana Falls',
    tags: ['Royal Castle', 'Himalayan Art', 'Orchards'],
    bestSeason: 'March to December',
    companionsCount: 5,
    description: 'Perched high above the Beas river, Naggar was the capital of the Kullu Rajas for 1,400 years. Famous for the earthquake-resistant timber castle, Nicholas Roerich gallery, and cascading stone watermills.',
  },
  {
    id: 'lug-valley',
    name: 'Lug Valley',
    tagline: 'Untouched western tributary valley of Kullu, wild deodar ridges',
    altitude: '1,950m',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    highlights: 'Chanderkhani western flanks, traditional shepherd trails, organic apple orchards',
    tags: ['Unexplored', 'Shepherd Paths', 'Wild Ridges'],
    bestSeason: 'April to November',
    companionsCount: 2,
    description: 'One of Kullu district’s least-commercialized valleys, branching westward into secluded shepherd trails and wild ridges where traditional village life continues unchanged.',
  },
];

export default function PilotValleysSection() {
  const { openDestinationDetail, openBooking } = useAuth();
  const [selectedTag, setSelectedTag] = useState('All');

  const allTags = ['All', 'Trout River', 'Heritage Fort', 'Sacred Meadow', 'Royal Castle', 'Unexplored'];

  const filteredValleys = PILOT_VALLEYS_DATA.filter((v) => {
    if (selectedTag === 'All') return true;
    return v.tags.includes(selectedTag);
  });

  return (
    <section id="destinations" style={{ padding: '80px 0', backgroundColor: '#FAF8F2' }}>
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
            Phase 1 Pilot Region • Kullu District
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
            Pilot Valleys of Himachal Pradesh
          </h2>
          <p style={{ color: '#536B5E', fontSize: '16px', lineHeight: 1.6, margin: 0 }}>
            We begin our community initiative in Kullu district, focusing on lesser-known river basins, secluded wooden fortresses, and sacred meadows where local knowledge transforms the journey.
          </p>

          {/* Filter pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: selectedTag === tag ? '#174D39' : '#EDE8DC',
                  color: selectedTag === tag ? '#FFFFFF' : '#10251D',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Valleys Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredValleys.map((valley) => (
            <div
              key={valley.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(16, 38, 29, 0.1)',
                boxShadow: '0 8px 24px rgba(10, 37, 27, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Image Banner */}
              <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                <img
                  src={valley.image}
                  alt={valley.name}
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
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  ⛰️ {valley.altitude}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(247, 245, 238, 0.9)',
                    color: '#174D39',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {valley.companionsCount} Local Guides
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '22px',
                    color: '#10251D',
                    margin: '0 0 6px 0',
                  }}
                >
                  {valley.name}
                </h3>
                <p style={{ color: '#536B5E', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0', flex: 1 }}>
                  {valley.tagline}
                </p>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#2b3f35',
                    backgroundColor: '#FAF8F2',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Key Trails:</strong> {valley.highlights}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  {valley.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#F3EFE6',
                        color: '#174D39',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => openDestinationDetail(valley)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '9999px',
                      backgroundColor: '#FAF8F2',
                      border: '1px solid rgba(16, 38, 29, 0.18)',
                      color: '#10251D',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Valley Details
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openBooking(
                        {
                          name: `Native Companion (${valley.name})`,
                          location: `${valley.name}, Kullu`,
                          role: 'Local Guide',
                          price: '₹500',
                          unit: '/day',
                          id: 1,
                        },
                        'local'
                      )
                    }
                    style={{
                      flex: 1,
                      padding: '10px 14px',
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
                    Request Guide
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
