import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { activeModal, closeModal, authTab, login, signup, demoLogin } = useAuth();
  const [tab, setTab] = useState(authTab || 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('traveler'); // 'traveler' | 'host'

  if (activeModal !== 'auth') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await signup({
          email,
          password,
          full_name: fullName,
          phone,
          role,
        });
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(demoRole);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(10, 37, 27, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          backgroundColor: '#FAF8F2',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '460px',
          padding: '32px',
          boxShadow: '0 24px 64px rgba(6, 25, 18, 0.35)',
          border: '1px solid rgba(16, 38, 29, 0.12)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '20px',
            color: '#536B5E',
            cursor: 'pointer',
            padding: '6px',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#174D39',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '6px',
            }}
          >
            Himalayan Community Platform
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '26px',
              color: '#10251D',
              margin: '0 0 8px 0',
            }}
          >
            {tab === 'login' ? 'Welcome Back' : 'Join Pahadíly'}
          </h2>
          <p style={{ color: '#536B5E', fontSize: '14px', margin: 0 }}>
            {tab === 'login'
              ? 'Sign in to access your Himalayan bookings & requests'
              : 'Create an account to explore or offer local knowledge'}
          </p>
        </div>

        {/* Tab switchers */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#EAE6DB',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: tab === 'login' ? '#174D39' : 'transparent',
              color: tab === 'login' ? '#FFFFFF' : '#10251D',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: tab === 'signup' ? '#174D39' : 'transparent',
              color: tab === 'signup' ? '#FFFFFF' : '#10251D',
              transition: 'all 0.2s',
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(200, 109, 81, 0.12)',
              border: '1px solid #c86d51',
              color: '#a3391b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#10251D',
                    marginBottom: '4px',
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Thakur"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    color: '#10251D',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#10251D',
                    marginBottom: '4px',
                  }}
                >
                  I want to join as:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${role === 'traveler' ? '#174D39' : '#D9C5A3'}`,
                      backgroundColor: role === 'traveler' ? 'rgba(23, 77, 57, 0.08)' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#10251D',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="traveler"
                      checked={role === 'traveler'}
                      onChange={() => setRole('traveler')}
                    />
                    🎒 Traveler
                  </label>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${role === 'host' ? '#174D39' : '#D9C5A3'}`,
                      backgroundColor: role === 'host' ? 'rgba(23, 77, 57, 0.08)' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#10251D',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="host"
                      checked={role === 'host'}
                      onChange={() => setRole('host')}
                    />
                    🌲 Local Host
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#10251D',
                    marginBottom: '4px',
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98160 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    color: '#10251D',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#10251D',
                marginBottom: '4px',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(16, 38, 29, 0.2)',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                color: '#10251D',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#10251D',
                marginBottom: '4px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(16, 38, 29, 0.2)',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                color: '#10251D',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#174D39',
              color: '#FFFFFF',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 18px rgba(23, 77, 57, 0.25)',
              marginBottom: '20px',
            }}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In to Account' : 'Create My Account'}
          </button>
        </form>

        {/* 1-Click Fast Demo Logins */}
        <div style={{ borderTop: '1px solid rgba(16, 38, 29, 0.1)', paddingTop: '18px' }}>
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#536B5E',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            Or 1-Click Instant Demo Login:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDemoSwitch('traveler')}
              disabled={loading}
              style={{
                padding: '8px 6px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(16, 38, 29, 0.15)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#10251D',
                textAlign: 'center',
              }}
            >
              🎒 Traveler
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('host')}
              disabled={loading}
              style={{
                padding: '8px 6px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(16, 38, 29, 0.15)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#10251D',
                textAlign: 'center',
              }}
            >
              🌲 Local Guide
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('admin')}
              disabled={loading}
              style={{
                padding: '8px 6px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(16, 38, 29, 0.15)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#10251D',
                textAlign: 'center',
              }}
            >
              🏔️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
