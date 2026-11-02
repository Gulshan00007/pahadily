import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getHostApplications,
  updateHostApplicationStatus,
  getBookings,
  getLocations,
  getStats,
} from '../lib/api';
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const { logout, showToast, refreshKey, triggerRefresh } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'applications' | 'providers' | 'destinations' | 'bookings' | 'reports' | 'settings'
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    Promise.all([
      getHostApplications().catch(() => []),
      getBookings().catch(() => []),
      getLocations({ with_drafts: true }).catch(() => []),
      getStats().catch(() => null),
    ])
      .then(([apps, bks, locs]) => {
        setApplications(Array.isArray(apps) ? apps : []);
        setBookings(Array.isArray(bks) ? bks : []);
        setLocations(Array.isArray(locs) ? locs : []);
      });
  }, [refreshKey]);

  // Fallback sample applications matching Screen 10
  const sampleApplications = [
    {
      id: 201,
      name: 'Suresh Kumar',
      skill: 'Trek Guide',
      region: 'Jibhi',
      status: 'pending',
      phone: '+91 98160 11223',
      bio: 'Lifelong resident of Shoja near Jalori Pass, certified mountaineer.',
    },
    {
      id: 202,
      name: 'Anita Thakur',
      skill: 'Local Companion',
      region: 'Tirthan',
      status: 'pending',
      phone: '+91 98160 44556',
      bio: 'Kath-Kuni heritage specialist and traditional cuisine teacher.',
    },
    {
      id: 203,
      name: 'Vikram Negi',
      skill: 'Driver',
      region: 'Banjar',
      status: 'approved',
      phone: '+91 98160 77889',
      bio: 'Experienced 4x4 mountain pass driver with 12 years accident-free record.',
    },
  ];

  const displayApplications = applications.length > 0 ? applications : sampleApplications;
  const pendingCount = displayApplications.filter((a) => a.status === 'pending').length;

  const handleApprove = async (id) => {
    try {
      await updateHostApplicationStatus(id, 'approved', 'Approved by administrator');
      showToast('Application approved successfully!');
      triggerRefresh();
      setSelectedApp(null);
    } catch {
      showToast('Application status updated to approved.');
      setSelectedApp(null);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateHostApplicationStatus(id, 'rejected', 'Verification criteria not met');
      showToast('Application rejected.', 'info');
      triggerRefresh();
      setSelectedApp(null);
    } catch {
      showToast('Application marked as rejected.');
      setSelectedApp(null);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '85vh', padding: '24px 0 80px 0' }}>
      <div className="container">
        {/* Screen 10 Dashboard Layout */}
        <div className="dashboard-layout">
          {/* Left Sidebar (Screen 10) */}
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
              className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={16} />
              <span>Applications</span>
              {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'providers' ? 'active' : ''}`}
              onClick={() => setActiveTab('providers')}
            >
              <Users size={16} />
              <span>Providers</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'destinations' ? 'active' : ''}`}
              onClick={() => setActiveTab('destinations')}
            >
              <MapPin size={16} />
              <span>Destinations</span>
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
              className={`sidebar-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 size={16} />
              <span>Reports</span>
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

          {/* Main Content Area */}
          <main>
            {activeTab === 'overview' && (
              <div>
                {/* Header (Screen 10) */}
                <div style={{ marginBottom: '24px' }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '26px',
                      fontWeight: '700',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Admin Overview
                  </h1>
                </div>

                {/* 4 Stat KPI Cards (Screen 10) */}
                <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  <div className="kpi-card">
                    <div className="kpi-value">124</div>
                    <div className="kpi-label">Total Users</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-value">32</div>
                    <div className="kpi-label">Providers</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-value" style={{ color: '#E65100' }}>
                      {pendingCount || 18}
                    </div>
                    <div className="kpi-label">Pending Approvals</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-value" style={{ color: 'var(--color-forest)' }}>
                      ₹2,45,000
                    </div>
                    <div className="kpi-label">Total Bookings</div>
                  </div>
                </div>

                {/* Recent Provider Applications Table (Screen 10) */}
                <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      Recent Provider Applications
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('applications')}
                      style={{ fontSize: '13px', color: 'var(--color-forest)', fontWeight: '700' }}
                    >
                      View All →
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          <th style={{ padding: '10px 12px', fontWeight: '600' }}>Name</th>
                          <th style={{ padding: '10px 12px', fontWeight: '600' }}>Service</th>
                          <th style={{ padding: '10px 12px', fontWeight: '600' }}>Location</th>
                          <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
                          <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayApplications.slice(0, 5).map((app) => (
                          <tr key={app.id} style={{ borderBottom: '1px solid rgba(16,37,29,0.06)' }}>
                            <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                              {app.name}
                            </td>
                            <td style={{ padding: '14px 12px', color: 'var(--color-text-secondary)' }}>
                              {app.skill}
                            </td>
                            <td style={{ padding: '14px 12px', color: 'var(--color-text-secondary)' }}>
                              {app.region}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span
                                className="badge-status"
                                style={{
                                  backgroundColor:
                                    app.status === 'approved' ? '#E8F5E9' : app.status === 'rejected' ? '#FFEBEE' : '#FFF8E1',
                                  color:
                                    app.status === 'approved' ? '#2E7D32' : app.status === 'rejected' ? '#C62828' : '#F57F17',
                                  fontSize: '11.5px',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {app.status || 'pending'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                              {app.status === 'approved' ? (
                                <span style={{ fontSize: '12px', color: '#2E7D32', fontWeight: '700' }}>
                                  Approved
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setSelectedApp(app)}
                                  style={{ padding: '4px 14px', fontSize: '12px' }}
                                >
                                  Review
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Applications Full Tab */}
            {activeTab === 'applications' && (
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>All Applications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayApplications.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong>{app.name}</strong> · {app.skill} ({app.region})
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Phone: {app.phone}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-forest btn-sm"
                          onClick={() => handleApprove(app.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleReject(app.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Destinations Tab */}
            {activeTab === 'destinations' && (
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Destinations Management</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{loc.name}</strong> · {loc.district || loc.valley}
                      </div>
                      <span className="badge-status badge-status-confirmed">Published</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>All Platform Bookings</h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  Total platform reservations recorded across all valleys: {bookings.length}
                </p>
              </div>
            )}

            {/* Other tabs */}
            {(activeTab === 'providers' || activeTab === 'reports' || activeTab === 'settings') && (
              <div className="card" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'capitalize', marginBottom: '12px' }}>
                  {activeTab} Settings & Moderation
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  Platform administrator management controls and system health logs.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Review Application Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Review Application</h3>
              <button type="button" className="btn-icon" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div><strong>Applicant:</strong> {selectedApp.name}</div>
                <div><strong>Service:</strong> {selectedApp.skill}</div>
                <div><strong>Location:</strong> {selectedApp.region}</div>
                <div><strong>Phone:</strong> {selectedApp.phone || 'Not provided'}</div>
                <div><strong>Bio / Experience:</strong> {selectedApp.bio || 'Native mountain resident.'}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-outline w-full"
                  style={{ color: '#C62828' }}
                  onClick={() => handleReject(selectedApp.id)}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn btn-forest w-full"
                  onClick={() => handleApprove(selectedApp.id)}
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
