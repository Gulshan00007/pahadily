import { Link } from 'react-router-dom';
import { STORIES_DATA } from '../data/storiesData';

export default function StoriesSection() {
  const featuredStories = STORIES_DATA.slice(0, 3);

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#FAF8F2' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
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
              Himalayan Journal & Field Notes
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '34px',
                color: '#10251D',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Stories from the High Valleys
            </h2>
          </div>
          <Link
            to="/stories"
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
            <span>Read All Journal Entries</span>
            <span>→</span>
          </Link>
        </div>

        {/* Stories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '28px',
          }}
        >
          {featuredStories.map((story) => (
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
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(101, 184, 142, 0.45)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(10, 37, 27, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(10, 37, 27, 0.08)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 37, 27, 0.04)';
              }}
            >
              {/* Image banner */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
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

              {/* Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', color: '#536B5E', marginBottom: '8px', fontWeight: 600 }}>
                  📍 {story.valley}
                </div>

                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    lineHeight: 1.3,
                    color: '#10251D',
                    margin: '0 0 10px 0',
                    fontWeight: 700,
                  }}
                >
                  <Link
                    to={`/stories?slug=${story.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {story.title}
                  </Link>
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

                {/* Author footer */}
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
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
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

                  <Link
                    to={`/stories?slug=${story.slug}`}
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#174D39',
                      textDecoration: 'none',
                    }}
                  >
                    Read Story →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
