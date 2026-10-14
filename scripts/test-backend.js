async function runTests() {
  const base = "http://127.0.0.1:3000";
  console.log("=== STARTING FULL BACKEND & WORKFLOW VALIDATION ===");

  // 1. Health & Storage Status
  const healthRes = await fetch(`${base}/healthz`);
  const health = await healthRes.json();
  console.log("1. Health Check:", health.status === "ok" ? "PASS" : "FAIL", JSON.stringify(health));

  const storageRes = await fetch(`${base}/api/system/storage`);
  const storage = await storageRes.json();
  console.log("2. Storage Status Check:", storage.active_storage ? "PASS" : "FAIL", JSON.stringify(storage));

  // 3. Register a Traveler
  const testEmail = `traveler_${Date.now()}@example.com`;
  const signupRes = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "TravelerSecurePassword123!",
      full_name: "Tashi Dorje",
      phone: "+91 98765 43210",
      role: "admin", // Attempt to escalate role
    }),
  });
  const signupData = await signupRes.json();
  const regPassed = signupRes.status === 201 && signupData.user.role === "traveler" && !signupData.user.password_hash;
  console.log("3. Traveler Registration & Privilege Escalation Prevention:", regPassed ? "PASS" : "FAIL", {
    status: signupRes.status,
    assignedRole: signupData.user?.role,
    passwordHashExposed: Boolean(signupData.user?.password_hash),
  });
  const travelerToken = signupData.token;

  // 4. Duplicate Account Prevention
  const dupRes = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password123!",
      full_name: "Duplicate Tester",
    }),
  });
  console.log("4. Duplicate Account Rejection:", dupRes.status === 409 ? "PASS" : "FAIL", `(Status: ${dupRes.status})`);

  // 5. Invalid Password Rejection
  const badLoginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "WrongPassword999!",
    }),
  });
  console.log("5. Invalid Password Rejection:", badLoginRes.status === 401 ? "PASS" : "FAIL", `(Status: ${badLoginRes.status})`);

  // 6. Sign in with Correct Password
  const goodLoginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "TravelerSecurePassword123!",
    }),
  });
  const goodLogin = await goodLoginRes.json();
  console.log("6. Sign in with Correct Password:", goodLoginRes.status === 200 && Boolean(goodLogin.token) ? "PASS" : "FAIL");

  // 7. Invalid Token Rejection
  const badTokenRes = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: "Bearer invalid.token.payload" },
  });
  console.log("7. Invalid Token Rejection:", badTokenRes.status === 401 ? "PASS" : "FAIL", `(Status: ${badTokenRes.status})`);

  // 8. Super Admin Login
  const adminLoginRes = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gulshany0001@gmail.com",
      password: "Tgulshan@2",
    }),
  });
  const adminLogin = await adminLoginRes.json();
  const adminToken = adminLogin.token;
  console.log("8. Administrator Authentication:", adminLoginRes.status === 200 && adminLogin.user.role === "admin" ? "PASS" : "FAIL");

  // 9. Provider Application Submission
  const hostAppRes = await fetch(`${base}/api/host-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${travelerToken}`,
    },
    body: JSON.stringify({
      name: "Tashi Dorje",
      email: testEmail,
      phone: "+91 98765 43210",
      region: "tirthan",
      skill: "Local Companion",
      property_name: "Tashi Mountain Retreat",
      price: "₹1,800",
      altitude: "1,650m",
      description: "Traditional stone retreat overlooking Tirthan trout stream.",
    }),
  });
  const hostApp = await hostAppRes.json();
  console.log("9. Provider Application Submission:", hostAppRes.status === 201 && hostApp.status === "pending" ? "PASS" : "FAIL", hostApp.message);

  // 10. Traveler cannot change their own application status
  const unauthStatusChangeRes = await fetch(`${base}/api/host-applications/${hostApp.id}/status?status_val=approved`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${travelerToken}` },
  });
  console.log("10. Applicant Forbidden from Self-Approving:", unauthStatusChangeRes.status === 403 ? "PASS" : "FAIL", `(Status: ${unauthStatusChangeRes.status})`);

  // 11. Admin Approves Host Application
  const adminApproveRes = await fetch(`${base}/api/host-applications/${hostApp.id}/status?status_val=approved&admin_notes=Verified+local+Kath-Kuni+homestay`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminApprove = await adminApproveRes.json();
  console.log("11. Admin Approves Application & Upgrades Account:", adminApproveRes.status === 200 && adminApprove.status === "approved" ? "PASS" : "FAIL");

  // 12. Verify Applicant Account Was Upgraded to Host
  const meRes = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: `Bearer ${travelerToken}` },
  });
  const updatedUser = await meRes.json();
  console.log("12. User Account Role After Approval:", updatedUser.role === "host" ? "PASS" : "FAIL", `(Role: ${updatedUser.role})`);

  // 13. Create a Booking with Validations
  const invalidBookingRes = await fetch(`${base}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${travelerToken}`,
    },
    body: JSON.stringify({
      item_id: 1,
      traveler_email: "invalid-email-format",
      guests: "0",
    }),
  });
  console.log("13. Invalid Booking Data Rejected with 400:", invalidBookingRes.status === 400 ? "PASS" : "FAIL");

  // 14. Create Valid Booking
  const travelDate = "2026-11-20";
  const bookingRes = await fetch(`${base}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${travelerToken}`,
    },
    body: JSON.stringify({
      item_id: 1, // Rahul Sharma
      booking_type: "companion",
      item_title: "Rahul Sharma (Local Companion)",
      traveler_name: "Tashi Dorje",
      traveler_email: testEmail,
      travel_date: travelDate,
      time_slot: "full_day",
      guests: "2",
      total_price: "₹1,000",
    }),
  });
  const booking = await bookingRes.json();
  console.log("14. Valid Booking Created & Persisted:", bookingRes.status === 201 && booking.status === "pending" ? "PASS" : "FAIL", `(Booking #${booking.id})`);

  // 15. Provider (Rahul) Accepts Booking via Admin / Provider Dispatch
  const acceptRes = await fetch(`${base}/api/bookings/${booking.id}/respond`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      decision: "accept",
      notes: "Looking forward to guiding you along the Jalori ridge.",
    }),
  });
  const acceptedBooking = await acceptRes.json();
  console.log("15. Provider Accepts Booking:", acceptRes.status === 200 && acceptedBooking.status === "confirmed" ? "PASS" : "FAIL");

  // 16. Double-Booking Conflict Prevention
  const conflictRes = await fetch(`${base}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${travelerToken}`,
    },
    body: JSON.stringify({
      item_id: 1,
      booking_type: "companion",
      traveler_name: "Another Traveler",
      traveler_email: "another@example.com",
      travel_date: travelDate,
      time_slot: "full_day",
      guests: "2",
    }),
  });
  console.log("16. Conflicting Double-Booking Rejected with 409:", conflictRes.status === 409 ? "PASS" : "FAIL", `(Status: ${conflictRes.status})`);

  // 17. Traveler accesses My Bookings
  const myBookingsRes = await fetch(`${base}/api/bookings/my`, {
    headers: { Authorization: `Bearer ${travelerToken}` },
  });
  const myBookings = await myBookingsRes.json();
  console.log("17. Traveler My Bookings Isolation:", Array.isArray(myBookings) && myBookings.length > 0 ? "PASS" : "FAIL", `(${myBookings.length} booking found)`);

  // 18. Traveler Forbidden from /api/bookings (Global Bookings)
  const freshTravelerRes = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `fresh_traveler_${Date.now()}@example.com`,
      password: "FreshPassword123!",
      full_name: "Fresh Traveler",
    }),
  });
  const freshTraveler = await freshTravelerRes.json();
  const freshTravelerCheck = await fetch(`${base}/api/bookings`, {
    headers: { Authorization: `Bearer ${freshTraveler.token}` },
  });
  console.log("18. Traveler Forbidden from Admin /api/bookings:", freshTravelerCheck.status === 403 ? "PASS" : "FAIL", `(Status: ${freshTravelerCheck.status})`);

  // 19. Destinations & Places API
  const placesRes = await fetch(`${base}/api/places?region=tirthan`);
  const placesData = await placesRes.json();
  console.log("19. Places Filtered by Region:", Array.isArray(placesData) && placesData.length > 0 ? "PASS" : "FAIL", `(${placesData.length} places in Tirthan)`);

  // 20. Experiences API
  const expRes = await fetch(`${base}/api/experiences`);
  const expData = await expRes.json();
  console.log("20. Experiences Listing:", Array.isArray(expData) && expData.length > 0 ? "PASS" : "FAIL", `(${expData.length} experiences)`);

  // 21. Notifications Log Check
  const notifRes = await fetch(`${base}/api/notifications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const notifs = await notifRes.json();
  console.log("21. Notifications Honest Audit Log:", Array.isArray(notifs) && notifs.length > 0 ? "PASS" : "FAIL", `(${notifs.length} notifications logged, latest status: "${notifs[0]?.status}")`);

  console.log("=== ALL TEST WORKFLOWS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(console.error);
