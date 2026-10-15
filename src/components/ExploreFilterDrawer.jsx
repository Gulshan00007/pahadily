import { useState, useEffect } from 'react';

/**
 * ExploreFilterDrawer
 * Clean modal drawer (desktop/tablet) and bottom sheet (mobile)
 * for organizing Category and Valley filters in Pahadíly's Explore page.
 */
export default function ExploreFilterDrawer({
  isOpen,
  onClose,
  categories = [],
  valleys = [],
  selectedCategory = 'all',
  selectedValley = 'all',
  onApply,
  onClear,
  getMatchingCount,
}) {
  const [stagedCategory, setStagedCategory] = useState(selectedCategory);
  const [stagedValley, setStagedValley] = useState(selectedValley);

  // Sync staged state whenever drawer opens or active filters change
  useEffect(() => {
    if (isOpen) {
      setStagedCategory(selectedCategory);
      setStagedValley(selectedValley);
    }
  }, [isOpen, selectedCategory, selectedValley]);

  // Lock background scroll when open & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeStagedCount =
    (stagedCategory !== 'all' ? 1 : 0) + (stagedValley !== 'all' ? 1 : 0);

  const matchingCount =
    typeof getMatchingCount === 'function'
      ? getMatchingCount(stagedCategory, stagedValley)
      : null;

  const handleApply = () => {
    onApply({
      category: stagedCategory,
      valley: stagedValley,
    });
    onClose();
  };

  const handleClearStaged = () => {
    setStagedCategory('all');
    setStagedValley('all');
    if (typeof onClear === 'function') {
      onClear();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter places by category and valley"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'rgba(6, 25, 18, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        transition: 'opacity 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Container: Bottom Sheet on Mobile, Centered Modal Drawer on Desktop */}
      <div
        className="filter-drawer-container"
        style={{
          backgroundColor: '#FAF8F2',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 32px rgba(6, 25, 18, 0.2)',
          border: '1px solid rgba(12, 32, 23, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.22s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div
          className="drawer-mobile-handle"
          style={{
            width: '100%',
            padding: '10px 0 4px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: 'rgba(12, 32, 23, 0.2)',
              borderRadius: '9999px',
            }}
          />
        </div>

        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            borderBottom: '1px solid rgba(12, 32, 23, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '22px',
                  color: '#0C2017',
                  margin: 0,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Filter Places
              </h2>
              {activeStagedCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#205540',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {activeStagedCount} active
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: '12.5px',
                color: '#536B5E',
                margin: '3px 0 0 0',
              }}
            >
              Refine directory by mountain category and valley destination
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(12, 32, 23, 0.12)',
              backgroundColor: '#F3EFE6',
              color: '#0C2017',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Section 1: Categories */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#205540',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🏷️</span>
                <span>Category</span>
              </label>
              {stagedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStagedCategory('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c86d51',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  Reset category
                </button>
              )}
            </div>

            {categories.length === 0 ? (
              <p
                style={{
                  fontSize: '13px',
                  color: '#536B5E',
                  backgroundColor: '#F3EFE6',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  margin: 0,
                }}
              >
                No specific categories configured yet.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {/* All Categories Option */}
                <button
                  type="button"
                  onClick={() => setStagedCategory('all')}
                  style={{
                    padding: '8px 14px',
                    minHeight: '40px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: stagedCategory === 'all' ? 700 : 500,
                    backgroundColor: stagedCategory === 'all' ? '#205540' : '#F3EFE6',
                    color: stagedCategory === 'all' ? '#FFFFFF' : '#0C2017',
                    border:
                      stagedCategory === 'all'
                        ? '1px solid #205540'
                        : '1px solid rgba(12, 32, 23, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>✨</span>
                  <span>All Categories</span>
                </button>

                {categories.map((cat) => {
                  const isSelected =
                    stagedCategory.toLowerCase() === cat.id.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setStagedCategory(isSelected ? 'all' : cat.id)
                      }
                      style={{
                        padding: '8px 14px',
                        minHeight: '40px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? '#205540' : '#F3EFE6',
                        color: isSelected ? '#FFFFFF' : '#0C2017',
                        border: isSelected
                          ? '1px solid #205540'
                          : '1px solid rgba(12, 32, 23, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{cat.icon || '🏔️'}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Valley / District */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#205540',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📍</span>
                <span>Valley &amp; District</span>
              </label>
              {stagedValley !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStagedValley('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c86d51',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  Reset valley
                </button>
              )}
            </div>

            {valleys.length === 0 ? (
              <p
                style={{
                  fontSize: '13px',
                  color: '#536B5E',
                  backgroundColor: '#F3EFE6',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  margin: 0,
                }}
              >
                No valleys documented in the database yet.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {/* All Valleys Option */}
                <button
                  type="button"
                  onClick={() => setStagedValley('all')}
                  style={{
                    padding: '8px 14px',
                    minHeight: '40px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: stagedValley === 'all' ? 700 : 500,
                    backgroundColor: stagedValley === 'all' ? '#205540' : '#F3EFE6',
                    color: stagedValley === 'all' ? '#FFFFFF' : '#0C2017',
                    border:
                      stagedValley === 'all'
                        ? '1px solid #205540'
                        : '1px solid rgba(12, 32, 23, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🏔️</span>
                  <span>All Valleys</span>
                </button>

                {valleys.map((val) => {
                  const isSelected =
                    stagedValley.toLowerCase() === val.toLowerCase();
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setStagedValley(isSelected ? 'all' : val)
                      }
                      style={{
                        padding: '8px 14px',
                        minHeight: '40px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? '#205540' : '#F3EFE6',
                        color: isSelected ? '#FFFFFF' : '#0C2017',
                        border: isSelected
                          ? '1px solid #205540'
                          : '1px solid rgba(12, 32, 23, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>📍</span>
                      <span>{val}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(12, 32, 23, 0.08)',
            backgroundColor: '#FAF8F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={handleClearStaged}
            disabled={stagedCategory === 'all' && stagedValley === 'all'}
            style={{
              padding: '10px 18px',
              minHeight: '44px',
              borderRadius: '9999px',
              border: '1px solid rgba(12, 32, 23, 0.15)',
              backgroundColor: '#F3EFE6',
              color:
                stagedCategory === 'all' && stagedValley === 'all'
                  ? '#94A3B8'
                  : '#0C2017',
              fontSize: '13px',
              fontWeight: 600,
              cursor:
                stagedCategory === 'all' && stagedValley === 'all'
                  ? 'not-allowed'
                  : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              flex: 1,
              maxWidth: '300px',
              padding: '11px 22px',
              minHeight: '44px',
              borderRadius: '9999px',
              backgroundColor: '#205540',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(32, 85, 64, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#174D39';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#205540';
            }}
          >
            <span>Apply filters</span>
            {matchingCount !== null && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                }}
              >
                {matchingCount} {matchingCount === 1 ? 'place' : 'places'}
              </span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          .filter-drawer-container {
            border-radius: 20px !important;
            margin: auto !important;
          }
          .drawer-mobile-handle {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .filter-drawer-container {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            max-height: 85vh !important;
          }
        }
      `}</style>
    </div>
  );
}
