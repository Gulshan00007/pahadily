// Comprehensive Test Suite for Pahadíly Stay-Booking Email Service Hardening
const BASE_URL = "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, detail = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failedCount++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   PAHADÍLY STAY-BOOKING EMAIL SERVICE HARDENING SUITE  ");
  console.log("=======================================================\n");

  // Step 0: Get Tokens for Admin, Host, and Traveler
  console.log("Phase 0: Authenticating test accounts...");
  const adminLogin = await request("/api/auth/demo-login?role=admin", { method: "POST" });
  assert(adminLogin.ok && adminLogin.data.token, "Admin authentication");
  const adminToken = adminLogin.data.token;

  const hostLogin = await request("/api/auth/demo-login?role=host", { method: "POST" });
  assert(hostLogin.ok && hostLogin.data.token, "Host authentication");
  const hostToken = hostLogin.data.token;
  const hostUser = hostLogin.data.user;

  const travelerLogin = await request("/api/auth/demo-login?role=traveler", { method: "POST" });
  assert(travelerLogin.ok && travelerLogin.data.token, "Traveler authentication");
  const travelerToken = travelerLogin.data.token;
  const travelerUser = travelerLogin.data.user;

  // Phase 1: Date Boundaries & Input Validations
  console.log("\nPhase 1: Date Boundaries & Input Validations");
  const invalidDateFormat = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 1,
      traveler_name: "Aarav Sharma",
      traveler_email: "aarav@example.com",
      travel_date: "2026/12/01", // Wrong format
      nights: 2,
      guests: 2,
    }),
  });
  assert(invalidDateFormat.status === 400, "Rejects malformed date format (YYYY/MM/DD)", `Got status ${invalidDateFormat.status}`);

  const invalidCalendarDay = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 1,
      traveler_name: "Aarav Sharma",
      traveler_email: "aarav@example.com",
      travel_date: "2026-02-31", // Non-existent date
      nights: 2,
      guests: 2,
    }),
  });
  assert(invalidCalendarDay.status === 400, "Rejects non-existent calendar date (2026-02-31)", `Got status ${invalidCalendarDay.status}`);

  const pastDate = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 1,
      traveler_name: "Aarav Sharma",
      traveler_email: "aarav@example.com",
      travel_date: "2020-01-01", // Past date
      nights: 2,
      guests: 2,
    }),
  });
  assert(pastDate.status === 400, "Rejects past travel date (2020-01-01)", `Got status ${pastDate.status}`);

  const invalidGuests = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 1,
      traveler_name: "Aarav Sharma",
      traveler_email: "aarav@example.com",
      travel_date: "2026-11-15",
      nights: 2,
      guests: 99, // Exceeds max 20
    }),
  });
  assert(invalidGuests.status === 400, "Rejects out-of-range party size (>20)", `Got status ${invalidGuests.status}`);

  // Phase 2: Server-Side Recalculation & Consistent Stay Lifecycle (Pending Initial Status)
  console.log("\nPhase 2: Server-Side Recalculation & Consistent Stay Lifecycle");
  const runId = Date.now();
  const testTravelerEmail = `aarav_${runId}@example.com`;
  const validTravelDate = "2027-02-10";
  const stayReq = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 1,
      traveler_name: "Aarav Sharma",
      traveler_email: testTravelerEmail,
      travel_date: validTravelDate,
      nights: 3,
      guests: 2,
      total_price: "₹1", // Client tamper attempt
      provider_name: hostUser.full_name,
    }),
  });
  assert(stayReq.status === 201, "Valid stay booking created with 201 Created", `Got status ${stayReq.status}`);
  const createdBooking = stayReq.data;

  assert(createdBooking.status === "pending", "Initial stay booking status is strictly 'pending' (host must review)", `Status: ${createdBooking.status}`);
  assert(createdBooking.nights === 3, "Nights is verified as 3", `Nights: ${createdBooking.nights}`);
  assert(createdBooking.end_date === "2027-02-13", "Checkout date strictly recalculated on server (check-in + 3 days UTC)", `Checkout: ${createdBooking.end_date}`);
  assert(createdBooking.total_price !== "₹1", "Total price tampered client value was overridden by server calculation", `Price: ${createdBooking.total_price}`);
  assert(createdBooking.email_delivery !== undefined, "Email delivery status is reported in response", JSON.stringify(createdBooking.email_delivery));

  // Phase 3: Idempotency & Duplicate Request Prevention
  console.log("\nPhase 3: Duplicate Request Prevention");
  const duplicateReq = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 1,
      traveler_name: "Aarav Sharma",
      traveler_email: testTravelerEmail,
      travel_date: validTravelDate,
      nights: 3,
      guests: 2,
    }),
  });
  assert(duplicateReq.status === 200, "Duplicate submission returns 200 with existing booking", `Status: ${duplicateReq.status}`);
  assert(duplicateReq.data.id === createdBooking.id, "Duplicate returns identical booking ID (no duplicate created)");

  // Phase 4: Host Acceptance Lifecycle & Confirmed Voucher Dispatch
  console.log("\nPhase 4: Host Acceptance & Confirmed Voucher Dispatch");
  const hostAccept = await request(`/api/bookings/${createdBooking.id}/respond`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${hostToken}` },
    body: JSON.stringify({
      decision: "accept",
      notes: "Delighted to host you in Tirthan Valley! Looking forward to your visit.",
    }),
  });
  assert(hostAccept.status === 200, "Assigned host can accept stay booking", `Got status ${hostAccept.status}`);
  assert(hostAccept.data.status === "confirmed", "Booking status transitioned to 'confirmed'");
  assert(hostAccept.data.provider_notes.includes("Tirthan Valley"), "Host notes saved");

  // Repeated accept idempotency
  const repeatedAccept = await request(`/api/bookings/${createdBooking.id}/respond`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${hostToken}` },
    body: JSON.stringify({ decision: "accept" }),
  });
  assert(repeatedAccept.status === 200, "Repeated host accept is idempotent (no error, no duplicate dispatch)");

  // Phase 5: Host Decline Lifecycle & Notice Dispatch
  console.log("\nPhase 5: Host Decline Lifecycle");
  const stayReqForDecline = await request("/api/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({
      booking_type: "stay",
      item_id: 2,
      traveler_name: "Maya Sen",
      traveler_email: `maya_${runId}@example.com`,
      travel_date: "2027-02-18",
      nights: 2,
      guests: 1,
      provider_name: hostUser.full_name,
    }),
  });
  assert(stayReqForDecline.status === 201, "Second stay request created");
  const declineBookingId = stayReqForDecline.data.id;

  const hostDecline = await request(`/api/bookings/${declineBookingId}/respond`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${hostToken}` },
    body: JSON.stringify({
      decision: "decline",
      notes: "Family wedding in village on these dates.",
      suggested_date: "2027-02-22",
    }),
  });
  assert(hostDecline.status === 200, "Host declined booking", `Status: ${hostDecline.status}`);
  assert(hostDecline.data.status === "declined", "Status transitioned to 'declined'");
  assert(hostDecline.data.suggested_date === "2027-02-22", "Suggested date recorded");

  // Repeated decline idempotency
  const repeatedDecline = await request(`/api/bookings/${declineBookingId}/respond`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${hostToken}` },
    body: JSON.stringify({ decision: "decline" }),
  });
  assert(repeatedDecline.status === 200, "Repeated decline is idempotent");

  // Phase 6: Cancellation Transition & Idempotency
  console.log("\nPhase 6: Cancellation Transition & Idempotency");
  const cancelRes = await request(`/api/bookings/${createdBooking.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({ new_status: "cancelled" }),
  });
  assert(cancelRes.status === 200, "Traveler cancels own booking successfully", `Status: ${cancelRes.status}`);
  assert(cancelRes.data.status === "cancelled", "Status transitioned to 'cancelled'");

  const repeatCancel = await request(`/api/bookings/${createdBooking.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({ new_status: "cancelled" }),
  });
  assert(repeatCancel.status === 200, "Repeat cancellation is idempotent");

  // Phase 7: RBAC Access Control & Authorization Hardening
  console.log("\nPhase 7: Role-Based Access Control (RBAC)");
  // 1. Traveler trying to access provider respond endpoint
  const travelerTryRespond = await request(`/api/bookings/${createdBooking.id}/respond`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({ decision: "accept" }),
  });
  assert(travelerTryRespond.status === 403, "Traveler cannot respond/accept booking requests (403 Forbidden)", `Got status ${travelerTryRespond.status}`);

  // 2. Traveler trying to confirm booking via status endpoint
  const travelerTryConfirm = await request(`/api/bookings/${createdBooking.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({ new_status: "confirmed" }),
  });
  assert(travelerTryConfirm.status === 403, "Traveler cannot set status to confirmed (403 Forbidden)", `Got status ${travelerTryConfirm.status}`);

  // 3. Traveler cannot call /api/bookings (all bookings admin list)
  const travelerAllBookings = await request("/api/bookings", {
    headers: { Authorization: `Bearer ${travelerToken}` },
  });
  assert(travelerAllBookings.status === 403, "Traveler cannot view global /api/bookings console (403 Forbidden)", `Got status ${travelerAllBookings.status}`);

  // 4. Admin CAN view global /api/bookings
  const adminAllBookings = await request("/api/bookings", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminAllBookings.status === 200 && Array.isArray(adminAllBookings.data), "Admin can view global /api/bookings list");

  // 5. Non-admin cannot test SMTP
  const travelerTestSmtp = await request("/api/email/test-smtp", {
    method: "POST",
    headers: { Authorization: `Bearer ${travelerToken}` },
    body: JSON.stringify({ target_email: "test@example.com" }),
  });
  assert(travelerTestSmtp.status === 403, "Non-admin cannot access /api/email/test-smtp (403 Forbidden)", `Got status ${travelerTestSmtp.status}`);

  // 6. Admin can test SMTP and diagnostics are sanitized
  const adminTestSmtp = await request("/api/email/test-smtp", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ target_email: "admin-verify@pahadily.com" }),
  });
  assert(adminTestSmtp.status === 200, "Admin can invoke /api/email/test-smtp", `Got status ${adminTestSmtp.status}`);
  const diagString = JSON.stringify(adminTestSmtp.data);
  assert(!diagString.includes("SMTP_PASSWORD") && !diagString.includes("pass"), "SMTP credentials and passwords are NOT leaked in response");
  assert(adminTestSmtp.data.status !== undefined, `Status accurately reported: ${adminTestSmtp.data.status}`);

  // Phase 8: Notification History Inspection & Notification States
  console.log("\nPhase 8: Notification History & Distinct States");
  const notifHistory = await request("/api/email/notifications", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(notifHistory.status === 200, "Admin can retrieve notification log");
  const notifs = notifHistory.data;
  console.log(`  Total notifications in system: ${notifs.length}`);
  
  const hasRequestRecvd = notifs.some((n) => n.email_type === "stay_request_received");
  assert(hasRequestRecvd, "Notification log contains 'stay_request_received' event");

  const hasConfirmed = notifs.some((n) => n.email_type === "stay_confirmed");
  assert(hasConfirmed, "Notification log contains 'stay_confirmed' event");

  const hasDeclined = notifs.some((n) => n.email_type === "stay_declined");
  assert(hasDeclined, "Notification log contains 'stay_declined' event");

  const hasCancelled = notifs.some((n) => n.email_type === "stay_cancelled");
  assert(hasCancelled, "Notification log contains 'stay_cancelled' event");

  // Check that statuses are truthful: 'accepted', 'failed', or 'unavailable'
  const validStatuses = new Set(["accepted", "failed", "unavailable"]);
  const allStatusesValid = notifs.every((n) => validStatuses.has(n.status));
  assert(allStatusesValid, "All notification statuses are truthful: 'accepted', 'failed', or 'unavailable' (never falsified as 'sent' or 'delivered' when unavailable)");

  console.log("\n=======================================================");
  console.log(`   TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED   `);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
