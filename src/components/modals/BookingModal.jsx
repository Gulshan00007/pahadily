import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createBooking, getBusyDates } from '../../lib/api';

export default function BookingModal() {
  const { activeModal, closeModal, bookingTarget, user, showToast, openMyBookings, triggerRefresh } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [busyDates, setBusyDates] = useState([]);
  const [error, setError] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Form inputs
  const targetItem = bookingTarget?.item || {};
  const targetType = bookingTarget?.type || 'local'; // 'local' | 'experience' | 'place'

  const [travelDate, setTravelDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [timeSlot, setTimeSlot] = useState('full_day'); // 'morning' | 'afternoon' | 'full_day'
  const [guests, setGuests] = useState('2');
  const [travelerName, setTravelerName] = useState(user?.full_name || '');
  const [travelerEmail, setTravelerEmail] = useState(user?.email || '');
  const [travelerPhone, setTravelerPhone] = useState(user?.phone || '');
  const [activityInterest, setActivityInterest] = useState('Village & Valley Discovery');
  const [message, setMessage] = useState('');

  // Fetch busy dates for provider
  useEffect(() => {
    if (activeModal === 'booking' && targetItem.id && targetType === 'local') {
      getBusyDates(targetItem.id)
        .then((data) => setBusyDates(data || []))
        .catch((err) => console.warn('Could not fetch busy dates:', err));
    }
  }, [activeModal, targetItem.id, targetType]);

  // Sync user info if user logs in while modal is open
  useEffect(() => {
    if (user) {
      setTravelerName((prev) => prev || user.full_name || '');
      setTravelerEmail((prev) => prev || user.email || '');
      if (user.phone) setTravelerPhone((prev) => prev || user.phone);
    }
  }, [user]);

  if (activeModal !== 'booking') return null;

  // Price calculations
  const rawPriceStr = targetItem.price || '₹500';
  const numericPrice = parseInt(rawPriceStr.replace(/[^0-9]/g, ''), 10) || 500;
  const numGuests = parseInt(guests, 10) || 1;
  const isPerPerson = (targetItem.unit || '').includes('person');
  const estimatedTotal = isPerPerson ? numericPrice * numGuests : numericPrice;

  // Conflict check for selected date & slot
  const isDateConflicting = busyDates.some(
    (b) => b.date === travelDate && (b.time_slot === 'full_day' || timeSlot === 'full_day' || b.time_slot === timeSlot)
  );

  const handleNext = () => {
    setError('');
    if (step === 2 && isDateConflicting) {
      setError(`This provider already has a confirmed booking on ${travelDate} for this time slot. Please choose another date or slot.`);
      return;
    }
    if (step === 4) {
      if (!travelerName.trim()) {
        setError('Please provide your name.');
        return;
      }
      if (!travelerEmail.trim() || !travelerEmail.includes('@')) {
        setError('Please provide a valid email address so the provider can reach you.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmitRequest = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        booking_type: targetType === 'experience' ? 'experience' : 'companion',
        item_id: targetItem.id || 1,
        item_title: targetItem.title || targetItem.name || 'Local Himalayan Experience',
        item_image: targetItem.image || null,
        traveler_name: travelerName.trim(),
        traveler_email: travelerEmail.trim(),
        traveler_phone: travelerPhone.trim() || null,
        travel_date: travelDate,
        time_slot: timeSlot,
        activity_type: activityInterest,
        guests: String(guests),
        nights: 1,
        total_price: `₹${estimatedTotal.toLocaleString()}`,
        payment_method: 'pay_on_meetup',
        message: message.trim(),
        provider_id: targetItem.id || null,
        provider_name: targetItem.name || targetItem.guide || 'Local Companion',
      };

      const res = await createBooking(payload);
      setSubmittedBooking(res);
      triggerRefresh();
      showToast(`Request sent to ${payload.provider_name}! Status: Pending Review.`);
      setStep(6);
    } catch (err) {
      setError(err.message || 'Could not submit request. Please try again.');
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

        {/* Step indicator */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#174D39', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pahadíly Request Workflow • Step {step} of 6
            </span>
            <span style={{ fontSize: '12px', color: '#536B5E' }}>
              {step === 1 && 'Context & Provider'}
              {step === 2 && 'Select Date'}
              {step === 3 && 'Choose Time Slot'}
              {step === 4 && 'Traveler Details'}
              {step === 5 && 'Price & Review'}
              {step === 6 && 'Voucher Issued'}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '4px', backgroundColor: '#E0DACD', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(step / 6) * 100}%`,
                backgroundColor: '#174D39',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
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

        {/* STEP 1: CONTEXT */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#10251D', margin: '0 0 10px 0' }}>
              Request Local Companion / Experience
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              Pahadíly connects you directly with native Himalayan locals. No intermediaries. Your request will be personally reviewed by the provider.
            </p>

            <div
              style={{
                backgroundColor: '#F3EFE6',
                borderRadius: '14px',
                padding: '18px',
                border: '1px solid rgba(16, 38, 29, 0.08)',
                marginBottom: '24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {targetItem.image ? (
                  <img
                    src={targetItem.image}
                    alt={targetItem.name || targetItem.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  '🌲'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#10251D', fontWeight: 700 }}>
                    {targetItem.name || targetItem.title || 'Local Companion'}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(23, 77, 57, 0.12)',
                      color: '#174D39',
                      fontWeight: 600,
                    }}
                  >
                    Verified Local
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#536B5E', marginBottom: '6px' }}>
                  📍 {targetItem.location || 'Kullu District, Himachal Pradesh'} • {targetItem.role || targetItem.duration || 'Himalayan Guide'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#174D39' }}>
                  {rawPriceStr}{' '}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#536B5E' }}>
                    {targetItem.unit || '/day'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  color: '#536B5E',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(23, 77, 57, 0.25)',
                }}
              >
                Proceed to Date Selection →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE DATE */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#10251D', margin: '0 0 10px 0' }}>
              Step 2: When are you visiting?
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', marginBottom: '18px' }}>
              Select your travel date. We automatically verify provider availability to prevent double-booking.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#10251D', marginBottom: '6px' }}>
                Trip Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 38, 29, 0.2)',
                  fontSize: '15px',
                  backgroundColor: '#FFFFFF',
                  color: '#10251D',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {isDateConflicting ? (
              <div
                style={{
                  backgroundColor: 'rgba(200, 109, 81, 0.12)',
                  border: '1px solid #c86d51',
                  color: '#a3391b',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '20px',
                }}
              >
                ⚠️ <strong>Slot Conflict:</strong> This provider is already engaged on {travelDate}. Please choose a different date.
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(23, 77, 57, 0.08)',
                  border: '1px solid rgba(23, 77, 57, 0.2)',
                  color: '#174D39',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '20px',
                }}
              >
                ✅ <strong>Available:</strong> The provider currently has an open slot on {travelDate}.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{ padding: '10px 18px', borderRadius: '9999px', color: '#536B5E', fontWeight: 600, fontSize: '14px' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isDateConflicting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  backgroundColor: isDateConflicting ? '#B0ACA2' : '#174D39',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isDateConflicting ? 'not-allowed' : 'pointer',
                }}
              >
                Choose Time Slot →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TIME SLOT */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#10251D', margin: '0 0 10px 0' }}>
              Step 3: Select Time Window
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', marginBottom: '20px' }}>
              Choose whether you want morning exploration, afternoon heritage walks, or a full day companionship.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'morning', title: 'Morning Exploration', desc: '09:00 AM – 01:00 PM • Best for crisp mountain air and clear valley views' },
                { id: 'afternoon', title: 'Afternoon & Golden Hour', desc: '02:00 PM – 06:00 PM • Best for village strolls, chai, and sunset ridges' },
                { id: 'full_day', title: 'Full Day Immersion', desc: '09:30 AM – 05:30 PM • Complete day accompanied with local hidden spots' },
              ].map((slot) => (
                <label
                  key={slot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${timeSlot === slot.id ? '#174D39' : 'rgba(16, 38, 29, 0.12)'}`,
                    backgroundColor: timeSlot === slot.id ? 'rgba(23, 77, 57, 0.06)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot.id}
                    checked={timeSlot === slot.id}
                    onChange={() => setTimeSlot(slot.id)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#10251D', fontSize: '15px' }}>{slot.title}</div>
                    <div style={{ fontSize: '13px', color: '#536B5E', marginTop: '2px' }}>{slot.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{ padding: '10px 18px', borderRadius: '9999px', color: '#536B5E', fontWeight: 600, fontSize: '14px' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Traveler Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TRAVELER DETAILS & INTERESTS */}
        {step === 4 && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#10251D', margin: '0 0 10px 0' }}>
              Step 4: Who is visiting?
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', marginBottom: '18px' }}>
              Help your local provider prepare for your pace, interests, and party size.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                  Number of Travelers
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="1">Solo Traveler (1)</option>
                  <option value="2">2 Travelers (Couple / Friends)</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4 Travelers (Small Family)</option>
                  <option value="5">5+ Travelers</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                  Primary Interest
                </label>
                <select
                  value={activityInterest}
                  onChange={(e) => setActivityInterest(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Village & Valley Discovery">Village & Valley Discovery</option>
                  <option value="Cedar Forest & Waterfall Walks">Cedar Forest & Waterfall Walks</option>
                  <option value="Kath-Kuni Heritage & Temples">Kath-Kuni Heritage & Temples</option>
                  <option value="Traditional Food & Siddu Tasting">Traditional Food & Siddu Tasting</option>
                  <option value="Quiet Nature & Photography">Quiet Nature & Photography</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={travelerName}
                onChange={(e) => setTravelerName(e.target.value)}
                placeholder="e.g. Ananya Sen"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 38, 29, 0.2)',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={travelerEmail}
                  onChange={(e) => setTravelerEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
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
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={travelerPhone}
                  onChange={(e) => setTravelerPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 38, 29, 0.2)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#10251D', marginBottom: '4px' }}>
                Note for your Local Host (Optional)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention walking pace, interests, arrival points (e.g. arriving in Aut / Banjar)..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 38, 29, 0.2)',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{ padding: '10px 18px', borderRadius: '9999px', color: '#536B5E', fontWeight: 600, fontSize: '14px' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Review & Price →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TRANSPARENT PRICING & SUBMIT */}
        {step === 5 && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#10251D', margin: '0 0 10px 0' }}>
              Step 5: Review & Send Request
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', marginBottom: '18px' }}>
              Review the summary before dispatching. No upfront payment required; pay your host directly on meetup or UPI once accepted.
            </p>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '18px',
                border: '1px solid rgba(16, 38, 29, 0.1)',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#536B5E', fontSize: '14px' }}>Service / Provider:</span>
                <span style={{ fontWeight: 700, color: '#10251D', fontSize: '14px' }}>
                  {targetItem.name || targetItem.title}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#536B5E', fontSize: '14px' }}>Date & Window:</span>
                <span style={{ fontWeight: 600, color: '#10251D', fontSize: '14px' }}>
                  {travelDate} • {timeSlot === 'full_day' ? 'Full Day' : timeSlot === 'morning' ? 'Morning' : 'Afternoon'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#536B5E', fontSize: '14px' }}>Travelers:</span>
                <span style={{ fontWeight: 600, color: '#10251D', fontSize: '14px' }}>
                  {guests} person(s)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#536B5E', fontSize: '14px' }}>Pahadíly Platform Fee:</span>
                <span style={{ fontWeight: 600, color: '#174D39', fontSize: '14px' }}>
                  ₹0 (Fair Community Model)
                </span>
              </div>
              <div
                style={{
                  borderTop: '1px dashed rgba(16, 38, 29, 0.15)',
                  paddingTop: '10px',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, color: '#10251D', fontSize: '16px' }}>Estimated Host Honorarium:</span>
                <span style={{ fontWeight: 800, color: '#174D39', fontSize: '20px' }}>
                  ₹{estimatedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(217, 197, 163, 0.2)',
                border: '1px solid rgba(217, 197, 163, 0.6)',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#4A3D2E',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}
            >
              🌿 <strong>How Acceptance Works:</strong> Submitting sends a direct booking request to {targetItem.name || 'the local provider'}. Once they review and click <em>Accept</em>, your voucher turns to <strong>Confirmed</strong> and you receive meetup coordination details.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                style={{ padding: '10px 18px', borderRadius: '9999px', color: '#536B5E', fontWeight: 600, fontSize: '14px' }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={loading}
                style={{
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '15px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px rgba(23, 77, 57, 0.3)',
                }}
              >
                {loading ? 'Submitting to Local Host...' : 'Submit Booking Request ✓'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: VOUCHER ISSUED */}
        {step === 6 && submittedBooking && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(142, 228, 154, 0.25)',
                color: '#174D39',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 16px auto',
              }}
            >
              ✓
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#174D39',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Request Dispatched to Provider
            </span>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#10251D', margin: '6px 0 10px 0' }}>
              Pahadíly Voucher #{submittedBooking.id}
            </h3>
            <p style={{ color: '#536B5E', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              Your request for <strong>{submittedBooking.item_title}</strong> on{' '}
              <strong>{submittedBooking.travel_date}</strong> is now pending confirmation with{' '}
              <strong>{submittedBooking.provider_name}</strong>.
            </p>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(16, 38, 29, 0.1)',
                textAlign: 'left',
                fontSize: '13px',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              <div><strong>Status:</strong> <span style={{ color: '#d99a38', fontWeight: 700 }}>Pending Host Acceptance</span></div>
              <div><strong>Traveler:</strong> {submittedBooking.traveler_name} ({submittedBooking.traveler_email})</div>
              <div><strong>Estimated Honorarium:</strong> {submittedBooking.total_price}</div>
              <div><strong>Payment:</strong> Pay on Meetup (Cash or UPI)</div>
              <div><strong>Reference Code:</strong> {submittedBooking.transaction_ref}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  openMyBookings();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                View in "My Bookings" →
              </button>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  backgroundColor: 'transparent',
                  color: '#536B5E',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: '1px solid rgba(16, 38, 29, 0.2)',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
