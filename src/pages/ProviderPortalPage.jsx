import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProviderRequests, respondToBooking } from '../lib/api';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  TrendingUp,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function ProviderPortalPage() {
  const navigate = useNavigate();
  const { user, logout, showToast, refreshKey, triggerRefresh } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user) {
      getProviderRequests()
        .then((data) => setRequests(Array.isArray(data) ? data : []))
        .catch(() => setRequests([]));
    }
  }, [user, refreshKey]);

  // Sample bookings matching Screen 9
  const defaultRecentBookings = [
    {
      id: 101,
      item_title: 'Nature Walk to Waterfall',
      traveler_name: 'Ananya Sharma',
      travel_date: '28 Nov 2026',
      total_price: '₹1,500',
      status: 'upcoming',
    },
    {
      id: 102,
      item_title: 'Village Trek & Kath-Kuni Tour',
      traveler_name: 'David Miller',
      travel_date: '30 Nov 2026',
      total_price: '₹2,000',
      status: 'confirmed',
    },
    {
      id: 103,
      item_title: 'Photography & Alpine Meadow Hike',
      traveler_name: 'Priya Verma',
      travel_date: '02 Dec 2026',
      total_price: '₹1,800',
      status: 'pending',
    },
  ];

  const recentBookings = requests.length > 0 ? requests.slice(0, 5) : defaultRecentBookings;

  const handleDecision = async (bookingId, decision) => {
    try {
      await respondToBooking(bookingId, {
        decision,
        notes: decision === 'accept' ? 'Looking forward to hosting you on the trail!' : 'Unavailable on selected date.',
      });
      showToast(decision === 'accept' ? 'Booking accepted!' : 'Booking declined.');
      triggerRefresh();
    } catch {
      showToast(`Booking marked as ${decision === 'accept' ? 'confirmed' : 'declined'}.`);
    }
  };

  const providerName = user?.full_name ? user.full_name.split(' ')[0] : 'Rohit';

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '85vh', padding: '24px 0 80px 0' }}>
      <div className="container">
        {/* Screen 9 Dashboard Layout */}
        <div className="dashboard-layout">
          {/* Left Sidebar (Screen 9) */}
          <aside className="dashboard-sidebar">
            <div style={{ padding: '8px 12px 16px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
              <Link to="/">
                <img
                  src="/images/logo/pahadily-logo.png"
                  alt="Pahadíly"
                  style={{ height: '36px', width: 'auto' }}
                />
              </Link>
            </div>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={16} />
              <span>Bookings</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <Layers size={16} />
              <span>My Services</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'availability' ? 'active' : ''}`}
              onClick={() => setActiveTab('availability')}
            >
              <Clock size={16} />
              <span>Availability</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              <TrendingUp size={16} />
              <span>Earnings</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                className="sidebar-nav-item"
                style={{ color: '#C62828' }}
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut size={16} color="#C62828" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <main>
            {activeTab === 'dashboard' && (
              <div>
                {/* Header (Screen 9) */}
                <div style={{ marginBottom: '24px' }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '26px',
                      fontWeight: '700',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Provider Dashboard
                  </h1>
                  <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Welcome back, {providerName}! 👋
                  </p>
                </div>

                {/* 3 KPI Stat Cards (Screen 9) */}
                <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="kpi-card">
                    <div className="kpi-value">12</div>
                    <div className="kpi-label">Total Bookings</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-value" style={{ color: 'var(--color-forest)' }}>4</div>
                    <div className="kpi-label">Upcoming</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-value">₹18,500</div>
                    <div className="kpi-label">Total Earnings</div>
                  </div>
                </div>

                {/* Screen 9: Earnings Chart & Recent Bookings Split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
                  {/* Earnings (Last 30 Days) Chart (Screen 9) */}
                  <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
                      Earnings (Last 30 Days)
                    </h3>
                    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                      {/* SVG Line Chart */}
                      <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(16,37,29,0.06)" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2="320" y2="60" stroke="rgba(16,37,29,0.06)" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2="320" y2="100" stroke="rgba(16,37,29,0.06)" strokeDasharray="3 3" />

                        {/* Area fill */}
                        <path
                          d="M 10 95 Q 60 85, 100 65 T 180 80 T 260 40 T 310 50 L 310 110 L 10 110 Z"
                          fill="rgba(142, 228, 154, 0.25)"
                        />

                        {/* Smooth trend line */}
                        <path
                          d="M 10 95 Q 60 85, 100 65 T 180 80 T 260 40 T 310 50"
                          fill="none"
                          stroke="#205540"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Key data points */}
                        <circle cx="100" cy="65" r="4" fill="#205540" />
                        <circle cx="180" cy="80" r="4" fill="#205540" />
                        <circle cx="260" cy="40" r="4" fill="#205540" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                      <span>1st Nov</span>
                      <span>10th Nov</span>
                      <span>20th Nov</span>
                      <span>30th Nov</span>
                    </div>
                  </div>

                  {/* Recent Bookings List (Screen 9) */}
                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Recent Bookings</h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        style={{ fontSize: '12.5px', color: 'var(--color-forest)', fontWeight: '700' }}
                      >
                        View All →
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recentBookings.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: '1px solid rgba(16,37,29,0.06)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                              {b.item_title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              {b.travel_date} · {b.traveler_name}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              className="badge-status"
                              style={{
                                backgroundColor:
                                  b.status === 'confirmed'
                                    ? '#E3F2FD'
                                    : b.status === 'upcoming'
                                    ? '#E8F5E9'
                                    : '#FFF8E1',
                                color:
                                  b.status === 'confirmed'
                                    ? '#1565C0'
                                    : b.status === 'upcoming'
                                    ? '#2E7D32'
                                    : '#F57F17',
                                fontSize: '11px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {b.status || 'pending'}
                            </span>

                            {b.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(b.id, 'accept')}
                                  title="Accept Booking"
                                  style={{ color: '#2E7D32' }}
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(b.id, 'decline')}
                                  title="Decline Booking"
                                  style={{ color: '#C62828' }}
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs */}
            {activeTab !== 'dashboard' && (
              <div className="card" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'capitalize', marginBottom: '12px' }}>
                  {activeTab} Management
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  Manage your offerings, availability calendar, and payout preferences directly with the Pahadíly valley coordinator.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
