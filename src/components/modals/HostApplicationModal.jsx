import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitHostApplication } from '../../lib/api';

export default function HostApplicationModal() {
  const { activeModal, closeModal, user, showToast, triggerRefresh } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [region, setRegion] = useState('tirthan');
  const [skill, setSkill] = useState('Local Companion');
  const [languages, setLanguages] = useState('Hindi, Pahadi, English');
  const [price, setPrice] = useState('₹500');
  const [bio, setBio] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyDesc, setPropertyDesc] = useState('');

  if (activeModal !== 'hostApplication') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitHostApplication({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        region,
        skill,
        languages: languages.trim(),
        price: price.trim(),
        unit: skill.includes('Homestay') ? '/night' : '/day',
        bio: bio.trim(),
        property_name: propertyName.trim() || null,
        description: propertyDesc.trim() || null,
      });
      setSubmitted(true);
      triggerRefresh();
      showToast('Application submitted! Our team will verify and connect shortly.');
    } catch (err) {
      setError(err.message || 'Could not submit application. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(10, 37, 27, 0.75)',
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
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(6, 25, 18, 0.4)',
          border: '1px solid rgba(16, 38, 29, 0.12)',
          position: 'relative',
          padding: '32px',
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

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>🏔️</div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#174D39', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Welcome to the Community
            </span>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#10251D', margin: '6px 0 12px 0' }}>
              Application Received!
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Thank you for stepping up to share Himachal Pradesh with respectful travelers. Our regional Kullu coordinator will review your native credentials and publish your listing.
            </p>
            <button
              onClick={closeModal}
              style={{
                padding: '10px 24px',
                borderRadius: '9999px',
                backgroundColor: '#174D39',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#174D39', fontWeight: 700 }}>
              Community Earning Initiative
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', color: '#10251D', margin: '4px 0 6px 0' }}>
              Join Pahadíly as a Local Host
            </h2>
            <p style={{ color: '#536B5E', fontSize: '14px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Earn fairly by sharing your native trails, village history, home-cooked food, or mountain homestay. 100% of traveler honorariums go directly to you.
            </p>

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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Negi"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98160 00000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    Valley / Location *
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="tirthan">Tirthan Valley (Gushaini, Nagini, Sai Ropa)</option>
                    <option value="jibhi">Jibhi / Shoja / Banjar</option>
                    <option value="shangarh">Shangarh / Sainj Valley</option>
                    <option value="naggar">Naggar / Jana / Katrain</option>
                    <option value="lug-valley">Lug Valley (Kullu)</option>
                    <option value="kullu">Other Kullu Hamlet</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    What will you offer? *
                  </label>
                  <select
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Local Companion">Local Companion (Village & Waterfall Walks)</option>
                    <option value="Certified Trek Guide">Certified Mountain / Trek Guide</option>
                    <option value="Himachali Food Host">Traditional Himachali Food & Siddu Host</option>
                    <option value="Homestay Host">Homestay / Heritage Wooden House</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    Daily Rate / Honorarium *
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. ₹500"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                  Spoken Languages
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="Hindi, Pahadi, English"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                  Tell us about your native village & experience *
                </label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Where were you born? Which hidden trails, waterfalls, or temples do you love introducing visitors to?"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {skill.includes('Homestay') && (
                <div style={{ marginBottom: '14px', backgroundColor: '#F3EFE6', padding: '12px', borderRadius: '10px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                    Homestay / Cottage Name
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. Deodar Pine Haven Homestay"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '13px',
                      marginBottom: '8px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    value={propertyDesc}
                    onChange={(e) => setPropertyDesc(e.target.value)}
                    placeholder="Rooms count, Kath-Kuni wood style, orchard views..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 38, 29, 0.2)',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '10px 18px', borderRadius: '9999px', color: '#536B5E', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    backgroundColor: '#174D39',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(23, 77, 57, 0.25)',
                  }}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Host Application →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
