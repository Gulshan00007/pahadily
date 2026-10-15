import { useState, useEffect, useMemo } from 'react';
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
  const targetType = bookingTarget?.type || 'local'; // 'local' | 'experience' | 'place' | 'stay'
  const isStay = targetType === 'stay';

  const [travelDate, setTravelDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [nights, setNights] = useState('2');
  const [timeSlot, setTimeSlot] = useState('full_day'); // 'morning' | 'afternoon' | 'full_day' | 'overnight'
  const [guests, setGuests] = useState('2');
  const [travelerName, setTravelerName] = useState(user?.full_name || '');
  const [travelerEmail, setTravelerEmail] = useState(user?.email || '');
  const [travelerPhone, setTravelerPhone] = useState(user?.phone || '');
  const [activityInterest, setActivityInterest] = useState('Village & Valley Discovery');
  const [mealPlan, setMealPlan] = useState('Village Breakfast & Dinner with Host Family');
  const [message, setMessage] = useState('');

  // Reset modal state on open
  useEffect(() => {
    if (activeModal === 'booking') {
      setStep(1);
      setError('');
      setSubmittedBooking(null);
    }
  }, [activeModal, bookingTarget]);

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

  // Computed check-out date for stays
  const checkOutDate = useMemo(() => {
    if (!travelDate) return '';
    try {
      const d = new Date(travelDate);
      d.setDate(d.getDate() + (parseInt(nights, 10) || 1));
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }, [travelDate, nights]);

  if (activeModal !== 'booking') return null;

  // Price calculations
  const rawPriceStr = targetItem.price || (isStay ? '₹1,800/night' : '₹500');
  const numericPrice = parseInt(rawPriceStr.replace(/[^0-9]/g, ''), 10) || (isStay ? 1800 : 500);
  const numGuests = parseInt(guests, 10) || 1;
  const numNights = parseInt(nights, 10) || 1;
  const isPerPerson = (targetItem.unit || '').includes('person');
  
  const estimatedTotal = isStay
    ? (isPerPerson ? numericPrice * numGuests * numNights : numericPrice * numNights)
    : (isPerPerson ? numericPrice * numGuests : numericPrice);

  // Conflict check for selected date & slot
  const isDateConflicting = !isStay && busyDates.some(
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
        setError('Please provide a valid email address so we can send your confirmation voucher.');
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
        booking_type: isStay ? 'stay' : (targetType === 'experience' ? 'experience' : 'companion'),
        item_id: targetItem.id || 1,
        item_title: targetItem.name || targetItem.title || 'Himalayan Homestay',
        item_image: targetItem.cover_image || targetItem.image || null,
        traveler_name: travelerName.trim(),
        traveler_email: travelerEmail.trim(),
        traveler_phone: travelerPhone.trim() || null,
        travel_date: travelDate,
        end_date: isStay ? checkOutDate : null,
        time_slot: isStay ? 'overnight' : timeSlot,
        activity_type: isStay ? mealPlan : activityInterest,
        guests: String(guests),
        nights: isStay ? numNights : 1,
        total_price: `₹${estimatedTotal.toLocaleString()}`,
        payment_method: 'pay_on_meetup',
        message: message.trim(),
        provider_id: targetItem.id || null,
        provider_name: targetItem.host_name || targetItem.name || 'Local Homestay Host',
      };

      const res = await createBooking(payload);
      setSubmittedBooking(res);
      triggerRefresh();
      if (isStay) {
        if (res.email_delivery?.status === 'accepted') {
          showToast(`Stay reservation request submitted! Confirmation email dispatched to ${payload.traveler_email}`, 'success');
        } else {
          showToast(`Stay reservation request sent to host! Status: Pending Host Review.`, 'info');
        }
      } else {
        showToast(`Request sent to ${payload.provider_name}! Status: Pending Review.`, 'info');
      }
      setStep(6);
    } catch (err) {
      setError(err.message || 'Could not submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const itemTitle = targetItem.name || targetItem.title || (isStay ? 'Authentic Mountain Homestay' : 'Local Companion');
  const itemLocation = isStay
    ? [targetItem.village, targetItem.valley ? `${targetItem.valley} Valley` : '', targetItem.district].filter(Boolean).join(', ') || 'Himachal Pradesh'
    : targetItem.location || 'Kullu District, Himachal Pradesh';

  return (
    <div
      className="booking-modal-overlay"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        className="booking-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dedicated Header: Non-overlapping close button & compact progress indicator */}
        <div className="booking-modal-header">
          <div className="booking-modal-header-top">
            <div className="booking-modal-step-title-wrap">
              <span className="booking-modal-workflow-label">
                Pahadíly {isStay ? 'Stay Reservation' : 'Booking'} • Step {step} of 6
              </span>
              <span className="booking-modal-step-name">
                {step === 1 && (isStay ? 'Homestay & Host Overview' : 'Context & Provider')}
                {step === 2 && (isStay ? 'Check-in Date & Duration' : 'Select Date')}
                {step === 3 && (isStay ? 'Meal & Hospitality Plan' : 'Choose Time Slot')}
                {step === 4 && 'Traveler Details'}
                {step === 5 && 'Price & Confirmation Review'}
                {step === 6 && (isStay ? 'Stay Voucher Issued' : 'Voucher Issued')}
              </span>
            </div>

            <button
              onClick={closeModal}
              className="booking-modal-close-btn"
              aria-label="Close booking modal"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="booking-modal-progress-track">
            <div
              className="booking-modal-progress-bar"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="booking-modal-body">
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
                lineHeight: 1.45,
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* STEP 1: CONTEXT & PROVIDER / HOMESTAY */}
          {step === 1 && (
            <div>
              <h3 id="booking-modal-title" className="booking-step-heading">
                {isStay ? 'Reserve Authentic Himalayan Homestay' : 'Request Local Companion / Experience'}
              </h3>
              <p className="booking-step-desc">
                {isStay
                  ? 'Pahadíly connects you directly with verified Kath-Kuni family homes in Himachal Pradesh. 100% of your stay honorarium goes directly to your host.'
                  : 'Pahadíly connects you directly with native Himalayan locals. No intermediaries. Your request will be personally reviewed by the provider.'}
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-card, #F3EFE6)',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid rgba(16, 38, 29, 0.08)',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-forest-medium, #143D2D)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {targetItem.cover_image || targetItem.image ? (
                    <img
                      src={targetItem.cover_image || targetItem.image}
                      alt={itemTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    isStay ? '🏡' : '🌲'
                  )}
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '17px', color: 'var(--color-text-main, #0C2017)', fontWeight: 700, wordBreak: 'break-word' }}>
                      {itemTitle}
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(32, 85, 64, 0.12)',
                        color: 'var(--color-forest-light, #205540)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isStay ? '✓ Verified Homestay' : '✓ Verified Local'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #536B5E)', marginBottom: '4px', wordBreak: 'break-word' }}>
                    📍 {itemLocation} {isStay ? '• Traditional Kath-Kuni Living' : `• ${targetItem.role || targetItem.duration || 'Himalayan Guide'}`}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-forest-light, #205540)' }}>
                    ₹{numericPrice.toLocaleString()}{' '}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted, #536B5E)' }}>
                      {isStay ? '/ night' : (targetItem.unit || '/day')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE DATE / DURATION */}
          {step === 2 && (
            <div>
              <h3 id="booking-modal-title" className="booking-step-heading">
                {isStay ? 'Step 2: Check-in Date & Stay Duration' : 'Step 2: When are you visiting?'}
              </h3>
              <p className="booking-step-desc">
                {isStay
                  ? 'Select your arrival date and the duration of your stay in the village.'
                  : 'Select your travel date. We automatically verify provider availability to prevent double-booking.'}
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label htmlFor="booking-travel-date" className="booking-form-label">
                  {isStay ? 'Check-in Date *' : 'Trip Date *'}
                </label>
                <input
                  id="booking-travel-date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="booking-form-control"
                  required
                />
              </div>

              {isStay ? (
                <div>
                  <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="booking-nights" className="booking-form-label">
                      Duration of Stay (Nights) *
                    </label>
                    <select
                      id="booking-nights"
                      value={nights}
                      onChange={(e) => setNights(e.target.value)}
                      className="booking-form-control"
                    >
                      <option value="1">1 Night (Quick Gateway)</option>
                      <option value="2">2 Nights (Weekend Immersion - Recommended)</option>
                      <option value="3">3 Nights (Extended Mountain Retreat)</option>
                      <option value="4">4 Nights</option>
                      <option value="5">5 Nights</option>
                      <option value="7">7 Nights (Weekly Remote Workation)</option>
                      <option value="10">10 Nights</option>
                      <option value="14">14 Nights (Two-Week Sabbatical)</option>
                    </select>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(32, 85, 64, 0.08)',
                      border: '1px solid rgba(32, 85, 64, 0.25)',
                      color: 'var(--color-forest-light, #205540)',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      marginBottom: '16px',
                      lineHeight: 1.6,
                    }}
                  >
                    <div>📅 <strong>Check-in:</strong> {travelDate} (From 12:00 PM)</div>
                    <div>🏡 <strong>Check-out:</strong> {checkOutDate} (By 11:00 AM)</div>
                    <div>🌙 <strong>Total Duration:</strong> {numNights} Night{numNights > 1 ? 's' : ''}</div>
                  </div>
                </div>
              ) : isDateConflicting ? (
                <div
                  style={{
                    backgroundColor: 'rgba(200, 109, 81, 0.12)',
                    border: '1px solid #c86d51',
                    color: '#a3391b',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    lineHeight: 1.45,
                  }}
                  role="alert"
                >
                  ⚠️ <strong>Slot Conflict:</strong> This provider is already engaged on {travelDate}. Please choose a different date.
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'rgba(32, 85, 64, 0.08)',
                    border: '1px solid rgba(32, 85, 64, 0.25)',
                    color: 'var(--color-forest-light, #205540)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    lineHeight: 1.45,
                  }}
                >
                  ✅ <strong>Available:</strong> The provider currently has an open slot on {travelDate}.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: TIME SLOT / MEAL PLAN */}
          {step === 3 && (
            <div>
              <h3 id="booking-modal-title" className="booking-step-heading">
                {isStay ? 'Step 3: Meal Plan & Village Hospitality' : 'Step 3: Select Time Window'}
              </h3>
              <p className="booking-step-desc">
                {isStay
                  ? 'Himachali village meals are cooked fresh on traditional hearths using local mountain grains and produce.'
                  : 'Choose whether you want morning exploration, afternoon heritage walks, or a full day companionship.'}
              </p>

              {isStay ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    {
                      id: 'Village Breakfast Included (Fresh Rotis, Siddu & Herbal Tea)',
                      title: 'Traditional Mountain Breakfast Included',
                      desc: 'Wood-fired roti, homemade siddu with walnut/poppy chutney, fresh mountain honey & herbal tea.',
                    },
                    {
                      id: 'Full Village Board (Breakfast, Lunch & Traditional Family Dinner)',
                      title: 'Full Village Board (All Meals with Host Family)',
                      desc: 'Complete Himachali home-cooked dining: Rajma madra, kadi, wood-fired bread & seasonal garden greens.',
                    },
                    {
                      id: 'Room Only (Independent Dining)',
                      title: 'Room Only',
                      desc: 'Lodging only. Explore neighborhood dhabas and village cafes at your own pace.',
                    },
                  ].map((plan) => {
                    const isSelected = mealPlan === plan.id;
                    return (
                      <label
                        key={plan.id}
                        className={`booking-timeslot-row ${isSelected ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="mealPlan"
                          value={plan.id}
                          checked={isSelected}
                          onChange={() => setMealPlan(plan.id)}
                          className="booking-timeslot-radio"
                        />
                        <div className="booking-timeslot-info">
                          <div className="booking-timeslot-title">{plan.title}</div>
                          <div className="booking-timeslot-desc">{plan.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    {
                      id: 'morning',
                      title: 'Morning Exploration',
                      desc: '09:00 AM – 01:00 PM • Best for crisp mountain air and clear valley views',
                    },
                    {
                      id: 'afternoon',
                      title: 'Afternoon & Golden Hour',
                      desc: '02:00 PM – 06:00 PM • Best for village strolls, chai, and sunset ridges',
                    },
                    {
                      id: 'full_day',
                      title: 'Full Day Immersion',
                      desc: '09:30 AM – 05:30 PM • Complete day accompanied with local hidden spots',
                    },
                  ].map((slot) => {
                    const isSelected = timeSlot === slot.id;
                    return (
                      <label
                        key={slot.id}
                        className={`booking-timeslot-row ${isSelected ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot.id}
                          checked={isSelected}
                          onChange={() => setTimeSlot(slot.id)}
                          className="booking-timeslot-radio"
                        />
                        <div className="booking-timeslot-info">
                          <div className="booking-timeslot-title">{slot.title}</div>
                          <div className="booking-timeslot-desc">{slot.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: TRAVELER DETAILS & INTERESTS */}
          {step === 4 && (
            <div>
              <h3 id="booking-modal-title" className="booking-step-heading">
                Step 4: Who is visiting?
              </h3>
              <p className="booking-step-desc">
                {isStay
                  ? 'Help your village homestay host prepare rooms, bedding, and meals for your party.'
                  : 'Help your local provider prepare for your pace, interests, and party size.'}
              </p>

              <div className="booking-form-grid-2col">
                <div>
                  <label htmlFor="booking-guests" className="booking-form-label">
                    Number of Travelers
                  </label>
                  <select
                    id="booking-guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="booking-form-control"
                  >
                    <option value="1">Solo Traveler (1)</option>
                    <option value="2">2 Travelers (Couple / Friends)</option>
                    <option value="3">3 Travelers</option>
                    <option value="4">4 Travelers (Small Family)</option>
                    <option value="5">5+ Travelers</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="booking-interest" className="booking-form-label">
                    {isStay ? 'Stay Purpose' : 'Primary Interest'}
                  </label>
                  <select
                    id="booking-interest"
                    value={activityInterest}
                    onChange={(e) => setActivityInterest(e.target.value)}
                    className="booking-form-control"
                  >
                    <option value="Village & Valley Discovery">Village & Valley Discovery</option>
                    <option value="Cedar Forest & Waterfall Walks">Cedar Forest & Waterfall Walks</option>
                    <option value="Kath-Kuni Heritage & Temples">Kath-Kuni Heritage & Temples</option>
                    <option value="Traditional Food & Siddu Tasting">Traditional Food & Siddu Tasting</option>
                    <option value="Quiet Nature & Remote Work">Quiet Nature & Remote Work</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="booking-traveler-name" className="booking-form-label">
                  Your Full Name *
                </label>
                <input
                  id="booking-traveler-name"
                  type="text"
                  required
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  placeholder="e.g. Ananya Sen"
                  className="booking-form-control"
                />
              </div>

              <div className="booking-form-grid-2col">
                <div>
                  <label htmlFor="booking-traveler-email" className="booking-form-label">
                    Email Address * (Confirmation Sent Here)
                  </label>
                  <input
                    id="booking-traveler-email"
                    type="email"
                    required
                    value={travelerEmail}
                    onChange={(e) => setTravelerEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="booking-form-control"
                  />
                </div>

                <div>
                  <label htmlFor="booking-traveler-phone" className="booking-form-label">
                    Phone / WhatsApp
                  </label>
                  <input
                    id="booking-traveler-phone"
                    type="tel"
                    value={travelerPhone}
                    onChange={(e) => setTravelerPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="booking-form-control"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="booking-message" className="booking-form-label">
                  Note for your Village Host (Optional)
                </label>
                <textarea
                  id="booking-message"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mention estimated arrival time, dietary requests, or arrival roadhead (e.g. Aut tunnel / Banjar)..."
                  className="booking-form-control"
                  style={{ minHeight: '64px', resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* STEP 5: TRANSPARENT PRICING & CONFIRMATION */}
          {step === 5 && (
            <div>
              <h3 id="booking-modal-title" className="booking-step-heading">
                Step 5: Review & Confirm Reservation
              </h3>
              <p className="booking-step-desc">
                Review your stay reservation details. An automated confirmation email will be sent immediately upon reservation.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  border: '1px solid rgba(16, 38, 29, 0.1)',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                  <span style={{ color: 'var(--color-text-muted, #536B5E)', fontSize: '13.5px' }}>{isStay ? 'Homestay Property:' : 'Service / Provider:'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-main, #0C2017)', fontSize: '13.5px', textAlign: 'right' }}>
                    {itemTitle}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                  <span style={{ color: 'var(--color-text-muted, #536B5E)', fontSize: '13.5px' }}>{isStay ? 'Stay Itinerary:' : 'Date & Window:'}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main, #0C2017)', fontSize: '13.5px', textAlign: 'right' }}>
                    {isStay ? `${travelDate} to ${checkOutDate} (${numNights} night${numNights > 1 ? 's' : ''})` : `${travelDate} • ${timeSlot}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                  <span style={{ color: 'var(--color-text-muted, #536B5E)', fontSize: '13.5px' }}>Party Size:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main, #0C2017)', fontSize: '13.5px' }}>
                    {guests} traveler(s)
                  </span>
                </div>
                {isStay && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                    <span style={{ color: 'var(--color-text-muted, #536B5E)', fontSize: '13.5px' }}>Hospitality Plan:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-forest-light, #205540)', fontSize: '13px', textAlign: 'right' }}>
                      {mealPlan}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                  <span style={{ color: 'var(--color-text-muted, #536B5E)', fontSize: '13.5px' }}>Pahadíly Platform Fee:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-forest-light, #205540)', fontSize: '13.5px' }}>
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
                    gap: '12px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--color-text-main, #0C2017)', fontSize: '15px' }}>
                    {isStay ? 'Total Stay Honorarium:' : 'Estimated Host Honorarium:'}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--color-forest-light, #205540)', fontSize: '19px' }}>
                    ₹{estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(217, 197, 163, 0.22)',
                  border: '1px solid rgba(217, 197, 163, 0.65)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  color: '#4A3D2E',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}
              >
                🌿 <strong>Authentic Host Review & Notice:</strong> Once you submit your stay request, a request notification will be sent to your host family and to your email (<strong>{travelerEmail}</strong>). Once the host confirms your dates, an official confirmed stay voucher will be issued.
              </div>
            </div>
          )}

          {/* STEP 6: VOUCHER ISSUED & EMAIL CONFIRMED */}
          {step === 6 && submittedBooking && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: submittedBooking.status === 'confirmed' ? 'rgba(142, 228, 154, 0.25)' : 'rgba(217, 154, 56, 0.25)',
                  color: submittedBooking.status === 'confirmed' ? 'var(--color-forest-light, #205540)' : 'var(--color-gold-warm, #d99a38)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  margin: '0 auto 14px auto',
                }}
              >
                {submittedBooking.status === 'confirmed' ? '✓' : '⏳'}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: submittedBooking.status === 'confirmed' ? 'var(--color-forest-light, #205540)' : 'var(--color-gold-warm, #d99a38)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {submittedBooking.status === 'confirmed' ? 'Stay Reservation Confirmed' : (isStay ? 'Stay Request Submitted' : 'Request Dispatched to Provider')}
              </span>
              <h3 id="booking-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-text-main, #0C2017)', margin: '6px 0 10px 0' }}>
                Pahadíly {isStay ? 'Stay Voucher' : 'Voucher'} #{submittedBooking.id}
              </h3>
              <p style={{ color: 'var(--color-text-muted, #536B5E)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '18px' }}>
                {submittedBooking.status === 'confirmed' ? (
                  <>
                    Your stay at <strong>{submittedBooking.item_title}</strong> is confirmed! An automated confirmation email has been dispatched to <strong>{submittedBooking.traveler_email}</strong>.
                  </>
                ) : isStay ? (
                  <>
                    Your reservation request for <strong>{submittedBooking.item_title}</strong> has been received and sent to your host,{' '}
                    <strong>{submittedBooking.provider_name}</strong>. A request receipt has been logged for <strong>{submittedBooking.traveler_email}</strong>.
                  </>
                ) : (
                  <>
                    Your request for <strong>{submittedBooking.item_title}</strong> on{' '}
                    <strong>{submittedBooking.travel_date}</strong> is now pending confirmation with{' '}
                    <strong>{submittedBooking.provider_name}</strong>.
                  </>
                )}
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface-elevated, #FFFFFF)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(16, 38, 29, 0.1)',
                  textAlign: 'left',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                }}
              >
                <div><strong>Status:</strong> <span style={{ color: submittedBooking.status === 'confirmed' ? '#174D39' : '#99630c', fontWeight: 700 }}>
                  {submittedBooking.status === 'confirmed' ? '✓ Confirmed Reservation' : '⏳ Pending Host Review'}
                </span></div>
                <div><strong>Traveler:</strong> {submittedBooking.traveler_name} ({submittedBooking.traveler_email})</div>
                <div><strong>Check-in:</strong> {submittedBooking.travel_date} (from 12:00 PM)</div>
                {submittedBooking.end_date && <div><strong>Check-out:</strong> {submittedBooking.end_date} (by 11:00 AM)</div>}
                <div><strong>Duration:</strong> {submittedBooking.nights || 1} Night(s)</div>
                <div><strong>Guests:</strong> {submittedBooking.guests} Traveler(s)</div>
                <div><strong>Total Amount:</strong> {submittedBooking.total_price}</div>
                <div><strong>Payment:</strong> Pay on Meetup / Arrival (Cash or UPI)</div>
                <div><strong>Reference Code:</strong> {submittedBooking.transaction_ref}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="booking-modal-footer">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={closeModal}
                className="booking-btn-back"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="booking-btn-primary"
              >
                {isStay ? 'Proceed to Dates & Duration →' : 'Proceed to Date Selection →'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="booking-btn-back"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isDateConflicting}
                className="booking-btn-primary"
              >
                {isStay ? 'Choose Meal Plan →' : 'Choose Time Slot →'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="booking-btn-back"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="booking-btn-primary"
              >
                Traveler Details →
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="booking-btn-back"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="booking-btn-primary"
              >
                Review & Confirm →
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="booking-btn-back"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={loading}
                className="booking-btn-primary"
              >
                {loading ? 'Submitting Stay Request...' : (isStay ? 'Submit Stay Request →' : 'Submit Booking Request →')}
              </button>
            </>
          )}

          {step === 6 && (
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={closeModal}
                className="booking-btn-back"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  openMyBookings();
                }}
                className="booking-btn-primary"
              >
                View in "My Bookings" →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
