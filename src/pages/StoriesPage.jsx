import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { STORIES_DATA } from '../data/storiesData';
import { ArrowLeft, ArrowRight, Clock, MapPin, Compass } from 'lucide-react';

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
    <div style={{ padding: '36px 0 80px 0', minHeight: 'calc(100vh - 76px)' }}>
      {/* If a story is selected, show the deep reading view */}
      {activeStory ? (
        <article className="container" style={{ maxWidth: '800px' }}>
          <button
            type="button"
            onClick={closeStory}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              marginBottom: '28px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Stories</span>
          </button>

          {/* Meta header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: 'var(--color-forest)',
                color: 'var(--color-sage)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {activeStory.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <MapPin size={14} />
              <span>{activeStory.valley}</span>
              <span>•</span>
              <Clock size={14} />
              <span>{activeStory.readingTime}</span>
            </div>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 4vw, 38px)',
              lineHeight: 1.2,
              color: 'var(--color-text-primary)',
              margin: '0 0 16px 0',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {activeStory.title}
          </h1>

          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)',
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
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '32px',
            }}
          >
            <img
              src={activeStory.author.avatar}
              alt={activeStory.author.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {activeStory.author.name}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                {activeStory.author.role} • {activeStory.author.location}
              </div>
            </div>
          </div>

          {/* Feature Image */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '36px', height: 'clamp(220px, 45vw, 420px)' }}>
            <img
              src={activeStory.image}
              alt={activeStory.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Article Paragraphs */}
          <div style={{ fontSize: '16.5px', lineHeight: 1.8, color: 'var(--color-text-primary)' }}>
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
                backgroundColor: 'rgba(32, 85, 64, 0.08)',
                borderLeft: '4px solid var(--color-forest)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                padding: '20px 24px',
                marginTop: '40px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-forest)',
                  marginBottom: '4px',
                }}
              >
                Himalayan Responsible Travel Note
              </div>
              <div style={{ fontSize: '14.5px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                {activeStory.ethicsTip}
              </div>
            </div>
          )}

          {/* Next Steps CTA */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <Compass size={36} color="var(--color-forest)" style={{ margin: '0 auto 12px auto' }} />
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              Experience {activeStory.valley} In Person
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              Pahadíly connects you directly with native guardians who walk these sacred paths and share living cultural traditions with you.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                to={`/explore?valley=${activeStory.valley.toLowerCase().includes('shangarh') ? 'shangarh' : activeStory.valley.toLowerCase().includes('tirthan') ? 'tirthan' : 'jibhi'}`}
                className="btn-forest"
                style={{
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
              >
                <span>Explore {activeStory.valley}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </article>
      ) : (
        /* Stories Index View */
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Himalayan Travel Journal
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Oral lore, vernacular architecture, and living field notes from the valleys of Himachal Pradesh.
            </p>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '32px',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn-pill ${active ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Stories Grid */}
          <div className="destination-grid">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                className="destination-card"
                onClick={() => openStory(story)}
                style={{ cursor: 'pointer' }}
              >
                <div className="destination-img-wrap">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="destination-img"
                    loading="lazy"
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(10, 37, 27, 0.82)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--color-sage)',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {story.category}
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(250, 248, 242, 0.92)',
                      color: 'var(--color-text-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={11} />
                    <span>{story.readingTime}</span>
                  </div>
                </div>

                <div className="destination-body">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    <MapPin size={12} />
                    <span>{story.valley}</span>
                  </div>

                  <h3 className="destination-name" style={{ fontSize: '18px', marginBottom: '8px' }}>
                    {story.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: 'var(--color-text-secondary)',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {story.excerpt}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={story.author.avatar}
                        alt={story.author.name}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {story.author.name}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: 'var(--color-forest-dark)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Read</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
