import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitHostApplication, getMyHostSubmissions } from '../lib/api';

export default function BecomeALocalPage() {
  const { user, showToast, refreshKey, triggerRefresh } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [existingSubmissions, setExistingSubmissions] = useState([]);

  useEffect(() => {
    if (user) {
      getMyHostSubmissions()
        .then((data) => setExistingSubmissions(data || []))
        .catch(() => setExistingSubmissions([]));
    } else {
      setExistingSubmissions([]);
    }
  }, [user, refreshKey]);

  // Form state
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

  // Interactive Earnings Calculator
  const [daysPerMonth, setDaysPerMonth] = useState(12);
  const [dailyRate, setDailyRate] = useState(600);

  const estimatedMonthly = Math.round(daysPerMonth * dailyRate * 0.9);

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
      showToast('Host application submitted! Administrator review pending.');
    } catch (err) {
      setError(err.message || 'Could not submit application. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Hero Header */}
      <section
        style={{
          backgroundColor: '#10251D',
          color: '#F7F5EE',
          padding: '72px 0 56px 0',
          borderBottom: '1px solid rgba(142, 228, 154, 0.15)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: '780px' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#8EE49A',
                fontWeight: 700,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Community Partnership Model
            </span>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px, 6vw, 40px)',
                color: '#FFFFFF',
                margin: '0 0 18px 0',
                lineHeight: 1.15,
              }}
            >
              Earn with Dignity. Share Your Himalayan Homeland.
            </h1>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'rgba(247, 245, 238, 0.85)',
                margin: 0,
              }}
            >
              Join Pahadíly as a verified local companion, certified trek guide, traditional culinary host, or homestay family. We believe local knowledge is priceless: you set your availability, keep 85–90% of earnings, and guide travelers who revere mountain traditions.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section style={{ maxWidth: '1280px', margin: '-32px auto 60px auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(16, 37, 29, 0.1)',
              boxShadow: '0 8px 24px rgba(16, 37, 29, 0.06)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>💰</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                color: '#10251D',
                marginBottom: '8px',
              }}
            >
              85–90% Direct Retention
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#536B5E', margin: 0 }}>
              No predatory 30–40% agency commissions. Transparent honorariums flow directly into your bank account promptly after every completed booking.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(16, 37, 29, 0.1)',
              boxShadow: '0 8px 24px rgba(16, 37, 29, 0.06)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>🏔️</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                color: '#10251D',
                marginBottom: '8px',
              }}
            >
              Respectful Mindful Travelers
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#536B5E', margin: 0 }}>
              Every traveler must sign and accept our Himalayan Responsible Travel Code. No rowdy parties, zero trash in sacred devta meadows, and deep reverence for family homes.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(16, 37, 29, 0.1)',
              boxShadow: '0 8px 24px rgba(16, 37, 29, 0.06)',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '14px' }}>🛡️</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                color: '#10251D',
                marginBottom: '8px',
              }}
            >
              Total Schedule Autonomy
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#536B5E', margin: 0 }}>
              You are never forced into shifts. Review each incoming traveler request and accept or decline based on actual trail conditions, apple harvest seasons, and personal availability.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Application Form & Earnings Calculator */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(14px, 3vw, 24px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'flex-start' }}>
          {/* Left Column: Interactive Calculator & Requirements */}
          <div>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                padding: 'clamp(20px, 4vw, 32px)',
                border: '1px solid rgba(16, 37, 29, 0.08)',
                boxShadow: '0 6px 24px rgba(16, 37, 29, 0.04)',
                marginBottom: '32px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#174D39',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Estimate Your Earnings
              </span>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '22px',
                  color: '#10251D',
                  margin: '0 0 20px 0',
                }}
              >
                Local Community Income Calculator
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#10251D' }}>Days Guided / Month:</span>
                  <strong style={{ color: '#174D39' }}>{daysPerMonth} days</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="26"
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#174D39' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#10251D' }}>Daily Honorarium Rate:</span>
                  <strong style={{ color: '#174D39' }}>₹{dailyRate} / day</strong>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#174D39' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: '#10251D',
                  color: '#F7F5EE',
                  borderRadius: '14px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: '#8EE49A', fontWeight: 700, textTransform: 'uppercase' }}>
                  Estimated Net Monthly Earnings
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '36px',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    margin: '6px 0',
                  }}
                >
                  ₹{estimatedMonthly.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(247, 245, 238, 0.7)' }}>
                  Based on 90% direct payout. Homestay hosts with multi-room occupancy earn up to ₹45,000–₹80,000/mo.
                </div>
              </div>
            </div>

            {/* Verification Process Card */}
            <div
              style={{
                backgroundColor: '#FAF8F2',
                borderRadius: '18px',
                padding: '28px',
                border: '1px solid rgba(16, 37, 29, 0.1)',
              }}
            >
              <h4
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '18px',
                  color: '#10251D',
                  marginBottom: '16px',
                }}
              >
                How Verification Works
              </h4>
              <ol style={{ paddingLeft: '20px', fontSize: '13.5px', lineHeight: 1.7, color: '#1e362c' }}>
                <li>
                  <strong>Submit Details:</strong> Fill out your name, contact, home valley, and skills below.
                </li>
                <li>
                  <strong>Phone / WhatsApp Verification:</strong> Our Kullu community lead calls you within 24 hours to verify local residency and credentials.
                </li>
                <li>
                  <strong>Listing Activation:</strong> Your profile is published to Pahadíly, and travelers can immediately send you booking requests!
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: The Host Application Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 36px)',
              border: '1px solid rgba(16, 37, 29, 0.1)',
              boxShadow: '0 8px 30px rgba(16, 37, 29, 0.06)',
            }}
          >
            {/* Real Application Status for Logged-In Users */}
            {user && existingSubmissions.length > 0 && (
              <div
                style={{
                  backgroundColor: '#F3EFE6',
                  border: '1px solid rgba(16, 37, 29, 0.15)',
                  borderRadius: '14px',
                  padding: '18px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#10251D', fontWeight: 700 }}>
                    📋 Your Application Status
                  </h4>
                  <span style={{ fontSize: '12px', color: '#536B5E' }}>
                    {existingSubmissions.length} application(s)
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {existingSubmissions.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#10251D' }}>
                            {app.property_name || app.name} ({app.skill})
                          </div>
                          <div style={{ fontSize: '12px', color: '#536B5E', marginTop: '2px' }}>
                            Region: {app.region} • Submitted {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            textTransform: 'uppercase',
                            backgroundColor:
                              app.status === 'approved'
                                ? '#dcfce7'
                                : app.status === 'rejected'
                                ? '#fee2e2'
                                : '#fef3c7',
                            color:
                              app.status === 'approved'
                                ? '#15803d'
                                : app.status === 'rejected'
                                ? '#b91c1c'
                                : '#b45309',
                          }}
                        >
                          {app.status === 'approved' ? '✓ Approved' : app.status === 'rejected' ? '✕ Declined' : '⏳ Under Review'}
                        </span>
                      </div>
                      {app.admin_notes && (
                        <div style={{ fontSize: '12px', color: '#334155', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', marginTop: '8px' }}>
                          <strong>Administrator Feedback:</strong> {app.admin_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '26px',
                    color: '#10251D',
                    marginBottom: '12px',
                  }}
                >
                  Application Received!
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#536B5E', maxWidth: '440px', margin: '0 auto 24px auto' }}>
                  Dhanyavaad, <strong>{name}</strong>! Your application for <strong>{region.toUpperCase()}</strong> has been saved. Our Kullu coordinator will review your listing and reach out to you at <strong>{phone}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '9999px',
                    backgroundColor: '#174D39',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Listing
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#174D39',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Step 1 of 1 • Official Onboarding
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '26px',
                    color: '#10251D',
                    margin: '0 0 20px 0',
                  }}
                >
                  Join as Local Host or Guide
                </h2>

                {error && (
                  <div
                    style={{
                      backgroundColor: 'rgba(200, 109, 81, 0.1)',
                      border: '1px solid #c86d51',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#c86d51',
                      fontSize: '13px',
                      marginBottom: '20px',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Thakur"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        backgroundColor: '#FAF8F2',
                        fontSize: '14px',
                        color: '#10251D',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                      WhatsApp Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98160 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        backgroundColor: '#FAF8F2',
                        fontSize: '14px',
                        color: '#10251D',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Email & Region */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@pahadily.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        backgroundColor: '#FAF8F2',
                        fontSize: '14px',
                        color: '#10251D',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                      Primary Pilot Valley *
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        backgroundColor: '#FAF8F2',
                        fontSize: '14px',
                        color: '#10251D',
                        outline: 'none',
                      }}
                    >
                      <option value="tirthan">Tirthan Valley & Gushaini</option>
                      <option value="jibhi">Jibhi, Banjar & Shoja</option>
                      <option value="shangarh">Shangarh & Sainj Sanctuary</option>
                      <option value="kullu">Naggar & Upper Beas</option>
                      <option value="lug-valley">Lug Valley</option>
                      <option value="kasol">Parvati Valley / Manikaran</option>
                    </select>
                  </div>
                </div>

                {/* Role / Skill & Price */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                      Service / Role *
                    </label>
                    <select
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        backgroundColor: '#FAF8F2',
                        fontSize: '14px',
                        color: '#10251D',
                        outline: 'none',
                      }}
                    >
                      <option value="Local Companion">Local Companion (Village Walks, Hidden Sights)</option>
                      <option value="Trek Guide">Certified Trek Guide (High Altitude)</option>
                      <option value="Homestay Host">Homestay Host (Kath-Kuni / Farmhouse)</option>
                      <option value="Food & Farm Host">Food & Farm Host (Siddu, Orchard Tours)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                      Suggested Rate *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹500/day or ₹2,500/night"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 37, 29, 0.2)',
                        backgroundColor: '#FAF8F2',
                        fontSize: '14px',
                        color: '#10251D',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Languages */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                    Languages You Speak Fluently
                  </label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="e.g. Hindi, Pahadi, English"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 37, 29, 0.2)',
                      backgroundColor: '#FAF8F2',
                      fontSize: '14px',
                      color: '#10251D',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* If Homestay Host, show property name & description */}
                {skill.includes('Homestay') && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                        Homestay / Property Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cedar Whisper Cottage"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(16, 37, 29, 0.2)',
                          backgroundColor: '#FAF8F2',
                          fontSize: '14px',
                          color: '#10251D',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                        Homestay Features & Rooms Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Kath-Kuni wood suites overlooking Tirthan river with private balcony"
                        value={propertyDesc}
                        onChange={(e) => setPropertyDesc(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(16, 37, 29, 0.2)',
                          backgroundColor: '#FAF8F2',
                          fontSize: '14px',
                          color: '#10251D',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Bio / Experience */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                    Tell Us About Yourself & Your Valley Knowledge *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Where did you grow up? What secret waterfalls, ridge views, or family food traditions will you share with visitors?"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 37, 29, 0.2)',
                      backgroundColor: '#FAF8F2',
                      fontSize: '14px',
                      color: '#10251D',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '9999px',
                    backgroundColor: submitting ? '#536B5E' : '#174D39',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: submitting ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(23, 77, 57, 0.25)',
                  }}
                >
                  {submitting ? 'Submitting to Local Coordinator...' : 'Submit Application for Review →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
