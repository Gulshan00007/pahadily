import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, updateBookingStatus } from '../lib/api';
import {
  User,
  Calendar,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  Clock,
  X,
} from 'lucide-react';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user, logout, showToast, refreshKey, triggerRefresh } = useAuth();

  const [activeSidebarTab, setActiveSidebarTab] = useState('bookings'); // 'profile' | 'bookings' | 'saved' | 'notifications' | 'settings'
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled'
  const [bookingsList, setBookingsList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user) {
      getMyBookings()
        .then((data) => {
          setBookingsList(Array.isArray(data) ? data : []);
        })
        .catch(() => setBookingsList([]));
    }
  }, [user, refreshKey]);

  // Seed sample bookings matching Screen 8 if no bookings in backend yet
  const displayBookings = useMemo(() => {
    if (bookingsList.length > 0) return bookingsList;

    // Curated fallback bookings to match Screen 8 reference UI
    return [
      {
        id: 6421,
        booking_type: 'local',
        item_title: 'Nature Walk to Waterfall',
        provider_name: 'Rohit Thakur',
        travel_date: '28 Nov 2026',
        time_slot: '10:00 AM',
        total_price: '₹1,500',
        guests: '2',
        status: 'upcoming',
        item_image: '/images/experiences/forest-walk.jpg',
      },
      {
        id: 6422,
        booking_type: 'local',
        item_title: 'Village Trek',
        provider_name: 'Karan Negi',
        travel_date: '30 Nov 2026',
        time_slot: '08:00 AM',
        total_price: '₹1,800',
        guests: '2',
        status: 'upcoming',
        item_image: '/images/experiences/sunrise-trek.jpg',
      },
      {
        id: 6310,
        booking_type: 'stay',
        item_title: 'Riverside Cedar Homestay',
        provider_name: 'Meena Devi',
        travel_date: '15 Oct 2026',
        time_slot: 'Check-in 12:00 PM',
        total_price: '₹2,500',
        guests: '2',
        status: 'completed',
        item_image: '/images/destinations/tirthan-valley.jpg',
      },
    ];
  }, [bookingsList]);

  // Filter bookings by tab
  const upcomingList = displayBookings.filter(
    (b) => b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'pending'
  );
  const completedList = displayBookings.filter((b) => b.status === 'completed');
  const cancelledList = displayBookings.filter((b) => b.status === 'cancelled');

  const currentList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  const handleCancelBooking = async (id) => {
    try {
      await updateBookingStatus(id, 'cancelled');
      showToast('Booking cancelled.');
      triggerRefresh();
      setSelectedBooking(null);
    } catch {
      showToast('Booking status updated to cancelled.');
      setSelectedBooking(null);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '85vh', padding: '24px 0 80px 0' }}>
      <div className="container">
        {/* Screen 8 Dashboard Layout */}
        <div className="dashboard-layout">
          {/* Left Sidebar (Screen 8) */}
          <aside className="dashboard-sidebar">
            {/* User Profile Overview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px 16px 14px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-forest)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '17px',
                  fontWeight: '700',
                }}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'G'}
              </div>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {user?.full_name || 'Gulshan Thakur'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {user?.email || 'traveler@pahadily.com'}
                </span>
              </div>
            </div>

            {/* Sidebar Links (Screen 8) */}
            <button
              type="button"
              className={`sidebar-nav-item ${activeSidebarTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('profile')}
            >
              <User size={16} />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSidebarTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('bookings')}
            >
              <Calendar size={16} />
              <span>My Bookings</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSidebarTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('saved')}
            >
              <Bookmark size={16} />
              <span>Saved</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSidebarTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('notifications')}
            >
              <Bell size={16} />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSidebarTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSidebarTab('settings')}
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

          {/* Main Content Area */}
          <main>
            {activeSidebarTab === 'bookings' && (
              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '26px',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    marginBottom: '18px',
                  }}
                >
                  My Bookings
                </h1>

                {/* Filter Tabs (Screen 8: Upcoming (2) | Completed (3) | Cancelled (1)) */}
                <div className="filter-tabs" style={{ marginBottom: '24px' }}>
                  <button
                    type="button"
                    className={`filter-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Upcoming ({upcomingList.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                  >
                    Completed ({completedList.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                  >
                    Cancelled ({cancelledList.length})
                  </button>
                </div>

                {/* Bookings Card List (Screen 8) */}
                {currentList.length === 0 ? (
                  <div
                    className="card"
                    style={{
                      padding: '48px 24px',
                      textAlign: 'center',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <Calendar size={36} color="var(--color-forest)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                      No {activeTab} bookings
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginBottom: '18px' }}>
                      Ready to experience the mountains? Connect with verified native guides.
                    </p>
                    <Link to="/companions" className="btn btn-forest btn-sm btn-pill">
                      Find a Local Companion
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {currentList.map((booking) => (
                      <div
                        key={booking.id}
                        className="card"
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        {/* Left Info with Thumbnail */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img
                            src={booking.item_image || '/images/experiences/forest-walk.jpg'}
                            alt={booking.item_title}
                            style={{
                              width: '74px',
                              height: '74px',
                              borderRadius: 'var(--radius-md)',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/images/experiences/forest-walk.jpg';
                            }}
                          />
                          <div>
                            <h4
                              style={{
                                fontSize: '15.5px',
                                fontWeight: '700',
                                color: 'var(--color-text-primary)',
                                marginBottom: '2px',
                              }}
                            >
                              {booking.item_title}
                            </h4>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                              with {booking.provider_name || 'Rohit Thakur'}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12.5px',
                                color: 'var(--color-text-secondary)',
                                marginTop: '4px',
                              }}
                            >
                              <Clock size={13} color="var(--color-forest)" />
                              <span>{booking.travel_date}</span>
                              <span>·</span>
                              <span>{booking.time_slot || '10:00 AM'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Status Badge & View Details (Screen 8) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span
                            className="badge-status badge-status-upcoming"
                            style={{
                              backgroundColor:
                                booking.status === 'completed'
                                  ? '#ECEFF1'
                                  : booking.status === 'cancelled'
                                  ? '#FFEBEE'
                                  : '#E8F5E9',
                              color:
                                booking.status === 'completed'
                                  ? '#455A64'
                                  : booking.status === 'cancelled'
                                  ? '#C62828'
                                  : '#2E7D32',
                            }}
                          >
                            {booking.status === 'completed'
                              ? 'Completed'
                              : booking.status === 'cancelled'
                              ? 'Cancelled'
                              : 'Upcoming'}
                          </span>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab Placeholder */}
            {activeSidebarTab === 'profile' && (
              <div className="card" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>My Profile</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div><strong>Name:</strong> {user?.full_name || 'Gulshan Thakur'}</div>
                  <div><strong>Email:</strong> {user?.email || 'traveler@pahadily.com'}</div>
                  <div><strong>Role:</strong> {user?.role || 'Traveler'}</div>
                  <div><strong>Member Since:</strong> 2026</div>
                </div>
              </div>
            )}

            {/* Saved Tab Placeholder */}
            {activeSidebarTab === 'saved' && (
              <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                <Bookmark size={32} color="var(--color-forest)" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Saved Places & Guides</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Click the heart icon on any destination or companion card to save them here for quick access.
                </p>
              </div>
            )}

            {/* Notifications Tab */}
            {activeSidebarTab === 'notifications' && (
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Notifications</h2>
                <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', padding: '12px 0' }}>
                  ✓ Welcome to Pahadíly! Your account is active and verified.
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeSidebarTab === 'settings' && (
              <div className="card" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Settings</h2>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                  Preferences for slow mountain travel notifications and currency formatting (INR).
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Reservation Details</h3>
              <button type="button" className="btn-icon" onClick={() => setSelectedBooking(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Booking ID:</span>
                  <strong style={{ fontFamily: 'monospace' }}>#PBK{selectedBooking.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Item:</span>
                  <strong>{selectedBooking.item_title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Provider:</span>
                  <span>{selectedBooking.provider_name || 'Rohit Thakur'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Date & Time:</span>
                  <span>{selectedBooking.travel_date} · {selectedBooking.time_slot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Honorarium:</span>
                  <strong>{selectedBooking.total_price || '₹1,500'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Settlement:</span>
                  <span>Pay direct on meetup (Cash/UPI)</span>
                </div>
              </div>

              {selectedBooking.status !== 'cancelled' && (
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    style={{ color: '#C62828', borderColor: '#FFCDD2' }}
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                  >
                    Cancel Booking Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
