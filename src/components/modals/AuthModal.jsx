import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';

export default function AuthModal() {
  const { activeModal, closeModal, authTab, login, signup, demoLogin } = useAuth();
  const [tab, setTab] = useState(authTab || 'login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authTab) setTab(authTab);
    setError('');
  }, [authTab, activeModal]);

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
          role: 'traveler',
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      await demoLogin(role);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
              }}
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: tab === 'login' ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                borderBottom: tab === 'login' ? '2px solid var(--color-forest)' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError('');
              }}
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: tab === 'signup' ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                borderBottom: tab === 'signup' ? '2px solid var(--color-forest)' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              Sign Up
            </button>
          </div>

          <button type="button" className="btn-icon" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Card Headline (Screen 11) */}
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}
            >
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {tab === 'login'
                ? 'Login to your Pahadíly account'
                : 'Join Pahadíly and start exploring'}
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFEBEE',
                color: '#C62828',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Gulshan Thakur"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password *</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: '600' }}
                    onClick={() => alert('For password recovery in development, use the demo logins or register a new account.')}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-forest btn-pill w-full"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                backgroundColor: '#205540',
                color: '#FFFFFF',
                fontWeight: '700',
              }}
            >
              {loading
                ? 'Processing...'
                : tab === 'login'
                ? 'Login'
                : 'Sign Up'}
            </button>
          </form>

          {/* Social / Google Divider (Screen 11) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '20px 0 16px 0',
              color: 'var(--color-text-muted)',
              fontSize: '12.5px',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span>or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-pill w-full"
            onClick={() => handleDemo('traveler')}
            style={{
              width: '100%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '13.5px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Quick Demo Role Switcher */}
          <div
            style={{
              marginTop: '16px',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-secondary)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              INSTANT PREVIEW SWITCH
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemo('traveler')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Traveler
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemo('host')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Host
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemo('admin')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Bottom toggle (Screen 11) */}
          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px' }}>
            {tab === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--color-forest)', fontWeight: '700' }}
                  onClick={() => {
                    setTab('signup');
                    setError('');
                  }}
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--color-forest)', fontWeight: '700' }}
                  onClick={() => {
                    setTab('login');
                    setError('');
                  }}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
