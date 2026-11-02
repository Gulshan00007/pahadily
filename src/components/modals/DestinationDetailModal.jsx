import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Star, Compass } from 'lucide-react';

export default function DestinationDetailModal() {
  const navigate = useNavigate();
  const { activeModal, closeModal, selectedDestination } = useAuth();

  if (activeModal !== 'destinationDetail' || !selectedDestination) return null;

  const dest = selectedDestination;
  const imageSrc = dest.image || dest.cover_image || '/images/destinations/tirthan-valley.jpg';

  const handleExploreCompanions = () => {
    closeModal();
    navigate(`/companions?q=${encodeURIComponent(dest.name || dest.district || '')}`);
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: 0 }}
      >
        {/* Cover Image & Close */}
        <div style={{ position: 'relative', width: '100%', height: '260px', overflow: 'hidden' }}>
          <img
            src={imageSrc}
            alt={dest.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = '/images/destinations/tirthan-valley.jpg';
            }}
          />
          <button
            type="button"
            className="btn-icon"
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(10, 37, 27, 0.7)',
              color: '#FFFFFF',
              border: 'none',
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              backgroundColor: 'rgba(10, 37, 27, 0.75)',
              backdropFilter: 'blur(6px)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MapPin size={13} color="#8EE49A" />
            <span>{dest.district || dest.valley || 'Himachal Pradesh'}</span>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                }}
              >
                {dest.name}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {dest.category ? dest.category.toUpperCase() : 'HIMALAYAN DESTINATION'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '700' }}>
              <Star size={16} fill="#D99A38" color="#D99A38" />
              <span>{dest.rating || 4.9}</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                ({dest.reviews || 42})
              </span>
            </div>
          </div>

          <p style={{ fontSize: '14.5px', lineHeight: '1.65', color: 'var(--color-text-primary)', marginBottom: '20px' }}>
            {dest.description ||
              'A tranquil mountain paradise of deodar cedar woodlands, ancient Kath-Kuni wood and stone architecture, and serene walking trails far from commercial tourism.'}
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '13px',
              marginBottom: '24px',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11.5px' }}>
                Best Season
              </span>
              <strong>{dest.best_time || 'April to November'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11.5px' }}>
                Walking Difficulty
              </span>
              <strong>{dest.difficulty || 'Moderate / Leisurely'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-forest btn-pill w-full"
              onClick={handleExploreCompanions}
              style={{ padding: '12px' }}
            >
              <Compass size={16} /> Find Local Guides in {dest.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
