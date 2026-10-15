import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { STORIES_DATA } from '../data/storiesData';

export default function StoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get('slug');

  const [activeStory, setActiveStory] = useState(() => {
    if (slugParam) {
      return STORIES_DATA.find((s) => s.slug === slugParam) || null;
    }
    return null;
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (slugParam) {
      const found = STORIES_DATA.find((s) => s.slug === slugParam);
      if (found) setActiveStory(found);
    }
  }, [slugParam]);

  const categories = [
    { id: 'all', label: 'All Journal Entries' },
    { id: 'Sacred Traditions', label: 'Sacred Traditions' },
    { id: 'Heritage & Craft', label: 'Heritage & Craft' },
    { id: 'Wildlife & Trails', label: 'Wildlife & Trails' },
    { id: 'Culinary Heritage', label: 'Culinary Heritage' },
  ];

  const filteredStories = useMemo(() => {
    if (selectedCategory === 'all') return STORIES_DATA;
    return STORIES_DATA.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const openStory = (story) => {
    setActiveStory(story);
    setSearchParams({ slug: story.slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeStory = () => {
    setActiveStory(null);
    setSearchParams({});
  };

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* If a story is selected, show the deep reading view */}
      {activeStory ? (
        <article style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>
          <button
            type="button"
            onClick={closeStory}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(16, 37, 29, 0.15)',
              color: '#174D39',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '28px',
            }}
          >
            ← Back to All Stories
          </button>

          {/* Meta header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span
              style={{
                backgroundColor: '#174D39',
                color: '#8EE49A',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {activeStory.category}
            </span>
            <span style={{ fontSize: '13px', color: '#536B5E' }}>
              📍 {activeStory.valley} • {activeStory.readingTime}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(26px, 5vw, 36px)',
              lineHeight: 1.2,
              color: '#10251D',
              margin: '0 0 16px 0',
              fontWeight: 700,
            }}
          >
            {activeStory.title}
          </h1>

          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.5,
              color: '#536B5E',
              fontStyle: 'italic',
              marginBottom: '28px',
            }}
          >
            {activeStory.subtitle}
          </p>

          {/* Author bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              marginBottom: '32px',
            }}
          >
            <img
              src={activeStory.author.avatar}
              alt={activeStory.author.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#10251D' }}>
                {activeStory.author.name}
              </div>
              <div style={{ fontSize: '12.5px', color: '#536B5E' }}>
                {activeStory.author.role} • {activeStory.author.location}
              </div>
            </div>
          </div>

          {/* Feature Image */}
          <div style={{ borderRadius: '18px', overflow: 'hidden', marginBottom: '36px', height: 'clamp(220px, 45vw, 400px)' }}>
            <img
              src={activeStory.image}
              alt={activeStory.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Article Paragraphs */}
          <div style={{ fontSize: '16.5px', lineHeight: 1.75, color: '#1e362c' }}>
            {activeStory.content?.map((para, i) => (
              <p key={i} style={{ marginBottom: '24px' }}>
                {para}
              </p>
            ))}
          </div>

          {/* Ethical Footnote Callout */}
          {activeStory.ethicsTip && (
            <div
              style={{
                backgroundColor: 'rgba(23, 77, 57, 0.08)',
                borderLeft: '4px solid #174D39',
                borderRadius: '0 12px 12px 0',
                padding: '20px 24px',
                marginTop: '40px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#174D39',
                  marginBottom: '4px',
                }}
              >
                Himalayan Responsible Travel Note
              </div>
              <div style={{ fontSize: '14.5px', color: '#10251D', lineHeight: 1.5 }}>
                {activeStory.ethicsTip}
              </div>
            </div>
          )}

          {/* Next Steps CTA */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(16, 37, 29, 0.08)',
              padding: '28px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                color: '#10251D',
                marginBottom: '8px',
              }}
            >
              Experience {activeStory.valley} In Person
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
              Pahadíly connects you directly with native guardians who will walk these sacred paths and share living history with you.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                to={`/explore?valley=${activeStory.valley.toLowerCase().includes('shangarh') ? 'shangarh' : activeStory.valley.toLowerCase().includes('tirthan') ? 'tirthan' : 'jibhi'}`}
                style={{
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Explore Destinations in {activeStory.valley} →
              </Link>
            </div>
          </div>
        </article>
      ) : (
        /* Stories Index View */
        <div>
          {/* Header */}
          <section
            style={{
              backgroundColor: '#10251D',
              color: '#F7F5EE',
              padding: '60px 0 48px 0',
              borderBottom: '1px solid rgba(142, 228, 154, 0.15)',
            }}
          >
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
              <div style={{ maxWidth: '720px' }}>
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
                  Oral Lore & Vernacular Field Notes
                </span>
                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(28px, 6vw, 38px)',
                    color: '#FFFFFF',
                    margin: '0 0 16px 0',
                    lineHeight: 1.15,
                  }}
                >
                  Himalayan Travel Journal
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: 'rgba(247, 245, 238, 0.85)',
                    margin: 0,
                  }}
                >
                  Deep narratives on sacred Devta customs, 1,000-year earthquake-resistant timber joinery, glacial trout rivers, and the living food heritage of the Western Himalayas.
                </p>
              </div>
            </div>
          </section>

          {/* Filter Pills */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid rgba(16, 37, 29, 0.08)',
              padding: '16px 0',
              position: 'sticky',
              top: '76px',
              zIndex: 40,
            }}
          >
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? '#174D39' : 'transparent',
                        color: active ? '#FFFFFF' : '#10251D',
                        border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Stories Grid */}
          <div style={{ maxWidth: '1280px', margin: '40px auto 0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
                gap: '24px',
              }}
            >
              {filteredStories.map((story) => (
                <article
                  key={story.id}
                  style={{
                    backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(10, 37, 27, 0.08)',
                    boxShadow: '0 2px 8px rgba(10, 37, 27, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onClick={() => openStory(story)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(101, 184, 142, 0.45)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(10, 37, 27, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
                  }}
                >
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img
                      src={story.image}
                      alt={story.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(23, 77, 57, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#8EE49A',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {story.category}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(247, 245, 238, 0.92)',
                        color: '#10251D',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '9999px',
                      }}
                    >
                      ⏱️ {story.readingTime}
                    </span>
                  </div>

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '12px', color: '#536B5E', marginBottom: '8px', fontWeight: 600 }}>
                      📍 {story.valley}
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '21px',
                        lineHeight: 1.3,
                        color: '#10251D',
                        margin: '0 0 10px 0',
                        fontWeight: 700,
                      }}
                    >
                      {story.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '13.5px',
                        lineHeight: 1.55,
                        color: '#536B5E',
                        margin: '0 0 20px 0',
                        flex: 1,
                      }}
                    >
                      {story.excerpt}
                    </p>

                    <div
                      style={{
                        borderTop: '1px solid rgba(16, 37, 29, 0.08)',
                        paddingTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={story.author.avatar}
                          alt={story.author.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#10251D' }}>
                            {story.author.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#536B5E' }}>
                            {story.author.role}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#174D39' }}>
                        Read Article →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
