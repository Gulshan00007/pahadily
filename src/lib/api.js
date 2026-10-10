const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function getAuthHeaders() {
  const token = localStorage.getItem("pahadily_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// --- Authentication ---

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Invalid login credentials");
  return data;
}

export async function signupUser({ email, password, full_name, phone, role = "traveler" }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name, phone, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

export async function sendRegistrationOtp({ email, password, full_name, phone, role = "traveler" }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/send-registration-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name, phone, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to send verification code");
  return data;
}

export async function verifyRegistrationOtp({ email, otp_code }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-registration-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Verification failed");
  return data;
}

export async function demoLoginUser(role = "traveler") {
  const response = await fetch(`${API_BASE_URL}/api/auth/demo-login?role=${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Demo login failed");
  return data;
}

export async function getMe() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) return null;
  return response.json();
}

// --- System Stats ---

export async function getStats() {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  if (!response.ok) throw new Error("Could not fetch stats");
  return response.json();
}

// --- Places / Stays (Dynamic) ---

export async function getPlaces(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.region && params.region !== "all") searchParams.set("region", params.region);
  if (params.category && params.category !== "all") searchParams.set("category", params.category);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/places${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`Places request failed: ${response.status}`);
  return response.json();
}

export async function getPlace(id) {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}`);
  if (!response.ok) throw new Error("Place not found");
  return response.json();
}

export async function createPlace(payload) {
  const response = await fetch(`${API_BASE_URL}/api/places`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to create place");
  return data;
}

export async function updatePlace(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update place");
  return data;
}

export async function deletePlace(id) {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete place");
  return response.json();
}

export async function updatePlaceDynamicDetails(id, { nearby_locations, stay_options }) {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}/dynamic-details`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ nearby_locations, stay_options }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update dynamic details");
  return data;
}

// --- Experiences (Dynamic) ---

export async function getExperiences(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.region && params.region !== "all") searchParams.set("region", params.region);
  if (params.category && params.category !== "all") searchParams.set("category", params.category);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/experiences${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`Experiences request failed: ${response.status}`);
  return response.json();
}

export async function getExperience(id) {
  const response = await fetch(`${API_BASE_URL}/api/experiences/${id}`);
  if (!response.ok) throw new Error("Experience not found");
  return response.json();
}

export async function createExperience(payload) {
  const response = await fetch(`${API_BASE_URL}/api/experiences`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to create experience");
  return data;
}

export async function updateExperience(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/experiences/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update experience");
  return data;
}

export async function deleteExperience(id) {
  const response = await fetch(`${API_BASE_URL}/api/experiences/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete experience");
  return response.json();
}

// --- Locals / Persons (Dynamic) ---

export async function getLocals(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== "all") searchParams.set("category", params.category);
  if (params.region && params.region !== "all") searchParams.set("region", params.region);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/locals${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
}

export async function getLocal(id) {
  const response = await fetch(`${API_BASE_URL}/api/locals/${id}`);
  if (!response.ok) throw new Error("Local person not found");
  return response.json();
}

export async function createLocal(payload) {
  const response = await fetch(`${API_BASE_URL}/api/locals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to create local profile");
  return data;
}

export async function updateLocal(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/locals/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update local profile");
  return data;
}

export async function deleteLocal(id) {
  const response = await fetch(`${API_BASE_URL}/api/locals/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete local");
  return response.json();
}

// --- Users & Accounts Management (Admin / Host) ---

export async function getUsers(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.role && params.role !== "all") searchParams.set("role", params.role);
  if (params.verified && params.verified !== "all") searchParams.set("verified", params.verified);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/users${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Could not load users list");
  return response.json();
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update user role");
  return data;
}

export async function updateUserStatus(userId, { is_active, is_verified }) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_active, is_verified }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update account status");
  return data;
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to delete user");
  return data;
}

// --- Bookings & Payments (Unified) ---

export async function createBooking(payload) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not complete booking request");
  return data;
}

export async function getMyBookings() {
  const response = await fetch(`${API_BASE_URL}/api/bookings/my`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Could not load your bookings");
  return response.json();
}

export async function getAllBookings(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") searchParams.set("status_filter", params.status);
  if (params.payment_status && params.payment_status !== "all") searchParams.set("payment_status", params.payment_status);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/bookings${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Could not load bookings list");
  return response.json();
}

export async function updateBookingStatus(id, newStatus) {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/status?new_status=${newStatus}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update booking status");
  return data;
}

export async function updateBookingPayment(id, { payment_status, payment_method, transaction_ref }) {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/payment`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ payment_status, payment_method, transaction_ref }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update payment details");
  return data;
}

export async function deleteBooking(id) {
  const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to delete booking");
  return data;
}

// --- Host Applications ---

export async function createHostApplication(payload) {
  const response = await fetch(`${API_BASE_URL}/api/host-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not submit host application");
  return data;
}

export async function getHostApplications() {
  const response = await fetch(`${API_BASE_URL}/api/host-applications`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Could not load applications");
  return response.json();
}

export async function getMyHostSubmissions() {
  const response = await fetch(`${API_BASE_URL}/api/host-applications/my-submissions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Could not load your host submissions");
  return response.json();
}

export async function updateHostApplicationStatus(id, statusVal, adminNotes = null) {
  const notesParam = adminNotes ? `&admin_notes=${encodeURIComponent(adminNotes)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/host-applications/${id}/status?status_val=${statusVal}${notesParam}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to update host application");
  return data;
}

export async function deleteHostApplication(id) {
  const response = await fetch(`${API_BASE_URL}/api/host-applications/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Failed to delete host application");
  return data;
}

export { API_BASE_URL };
