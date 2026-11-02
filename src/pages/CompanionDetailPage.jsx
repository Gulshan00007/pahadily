import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLocal } from '../lib/api';
import { VERIFIED_LOCALS } from '../data/localsData';
import {
  ArrowLeft,
  Share2,
  Heart,
  ShieldCheck,
  Star,
  Clock,
  Languages,
  Compass,
  CheckCircle,
} from 'lucide-react';

export default function CompanionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openBooking, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'services' | 'availability' | 'reviews'
  const [companion, setCompanion] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Find in curated data or fetch from backend API
    const foundCurated = VERIFIED_LOCALS.find((l) => String(l.id) === String(id));
    if (foundCurated) {
      setCompanion(foundCurated);
      setLoading(false);
    } else {
      getLocal(id)
        .then((data) => {
          setCompanion(data);
        })
        .catch(() => {
          // Fallback to first companion
          setCompanion(VERIFIED_LOCALS[0]);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${companion?.name} — Local Companion on Pahadíly`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p>Loading companion profile...</p>
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Companion not found</h2>
        <Link to="/companions" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Companions
        </Link>
      </div>
    );
  }

  const servicesList = [
    {
      title: 'Village & Forest Heritage Trail',
      duration: '4 - 5 hours',
      price: companion.price || '₹1,500',
      description: 'Slow walking route through ancient deodar glades, traditional Kath-Kuni homes, and secret mountain streams.',
    },
    {
      title: 'Hidden Waterfall & Stream Hike',
      duration: 'Full day (6 hours)',
      price: '₹2,000',
      description: 'Offbeat backcountry hike to secluded glacial waterfalls with traditional homemade lunch packed in deodar leaves.',
    },
  ];

  const reviewsList = [
    {
      author: 'Ananya Sharma',
      date: 'October 2026',
      rating: 5,
      comment: 'Hiking with Rohit felt like walking with a lifelong friend who knows every leaf and stream. The Kath-Kuni village tour was an unforgettable experience!',
    },
    {
      author: 'David Miller',
      date: 'September 2026',
      rating: 5,
      comment: 'Authentic slow travel at its best. Safe, incredibly knowledgeable about mountain trails, and respectful of local devta traditions.',
    },
  ];

  return (
    <div style={{ paddingBottom: '90px' }}>
      {/* Top Bar with Navigation & Actions */}
      <div className="container" style={{ padding: '20px 0 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-pill"
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={handleShare}
              aria-label="Share profile"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsFavorite((prev) => !prev)}
              style={{ color: isFavorite ? '#E53935' : 'inherit' }}
              aria-label="Add to favorites"
            >
              <Heart size={16} fill={isFavorite ? '#E53935' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="container-narrow">
        {/* Screen 4: Large Profile Portrait / Cover */}
        <div className="profile-cover-box">
          <img
            src={companion.image || '/images/locals/rahul.jpg'}
            alt={companion.name}
            className="profile-cover-img"
            onError={(e) => {
              e.currentTarget.src = '/images/locals/rahul.jpg';
            }}
          />
          {companion.verified && (
            <div className="profile-verified-badge-top">
              <ShieldCheck size={16} color="#205540" />
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Companion Title & Location Header (Screen 4) */}
        <div style={{ marginTop: '24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {companion.name}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14.5px',
              color: 'var(--color-text-secondary)',
              marginTop: '4px',
            }}
          >
            <span>{companion.role || 'Local Companion'}</span>
            <span>·</span>
            <span>{companion.location}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            <Star size={16} fill="#D99A38" color="#D99A38" />
            <span>{companion.rating}</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
              ({companion.reviews} reviews)
            </span>
          </div>
        </div>

        {/* 4 Highlight Badges (Screen 4) */}
        <div className="profile-highlights-grid">
          <div className="profile-highlight-card">
            <Clock size={20} className="profile-highlight-icon" />
            <div>
              <div className="profile-highlight-title">{companion.experience || '5+ Years'}</div>
              <div className="profile-highlight-sub">Experience</div>
            </div>
          </div>

          <div className="profile-highlight-card">
            <Languages size={20} className="profile-highlight-icon" />
            <div>
              <div className="profile-highlight-title">Speaks</div>
              <div className="profile-highlight-sub">{companion.lang || 'Hindi, English'}</div>
            </div>
          </div>

          <div className="profile-highlight-card">
            <Compass size={20} className="profile-highlight-icon" />
            <div>
              <div className="profile-highlight-title">Local Expert</div>
              <div className="profile-highlight-sub">Native Resident</div>
            </div>
          </div>

          <div className="profile-highlight-card">
            <ShieldCheck size={20} className="profile-highlight-icon" />
            <div>
              <div className="profile-highlight-title">Identity</div>
              <div className="profile-highlight-sub">Verified</div>
            </div>
          </div>
        </div>

        {/* Profile Tabs (Screen 4: About | Services | Availability | Reviews) */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '24px',
          }}
        >
          {['about', 'services', 'availability', 'reviews'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 4px',
                fontSize: '14.5px',
                fontWeight: '600',
                color: activeTab === tab ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--color-forest)' : '2px solid transparent',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              About {companion.name}
            </h3>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-text-primary)' }}>
              {companion.bio ||
                "I'm a local from Jibhi with deep knowledge of nearby villages, forest trails and hidden waterfalls. I love sharing the beauty of my home with travelers."}
            </p>

            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>
                Areas of Expertise
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {companion.tags?.map((tag) => (
                  <span key={tag} className="tag-pill" style={{ padding: '6px 14px', fontSize: '13px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {servicesList.map((srv, idx) => (
              <div key={idx} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {srv.title}
                  </h4>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-forest)' }}>
                    {srv.price}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {srv.duration}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  {srv.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Seasonal Schedule & Mountain Timing
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Available for half-day morning walks (08:00 AM - 01:00 PM) and afternoon meadow treks (02:00 PM - 06:00 PM). Open 7 days a week from April through December.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-forest)', fontSize: '13.5px', fontWeight: '600' }}>
              <CheckCircle size={16} /> Currently accepting bookings for upcoming dates.
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviewsList.map((rev, idx) => (
              <div key={idx} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '14.5px', color: 'var(--color-text-primary)' }}>{rev.author}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{rev.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="#D99A38" color="#D99A38" />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar (Screen 4) */}
      <div className="profile-sticky-bar">
        <div className="container-narrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {companion.price || '₹1,500'}{' '}
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                {companion.unit || '/ day'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: '600' }}>
              100% fair honorarium to local guide
            </div>
          </div>

          <button
            type="button"
            className="btn btn-forest btn-lg btn-pill"
            style={{ padding: '12px 36px', fontSize: '15px' }}
            onClick={() => openBooking(companion, 'local')}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
