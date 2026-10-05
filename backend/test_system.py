import urllib.request
import urllib.error
import json
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE = "http://127.0.0.1:8000"

def req(path, method="GET", data=None, token=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            content = response.read().decode("utf-8")
            return response.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        return e.code, json.loads(content) if content else {"error": str(e)}

print("\n========================================================")
print("     PAHADILY FULL-STACK AUTOMATED TEST SUITE           ")
print("========================================================\n")

# 1. System Health
st, res = req("/healthz")
assert st == 200 and res.get("status") == "ok", f"Healthz failed: {st} {res}"
print(" [PASS] 1. System Health Check (/healthz)")

# 2. Stats
st, stats = req("/api/stats")
assert st == 200 and "places" in stats and "total_revenue" in stats, f"Stats failed: {st} {stats}"
print(f" [PASS] 2. System Stats Endpoint (Revenue: {stats['total_revenue']} | Users: {stats['users']})")

# 3. Auth Tests: Signup & Login
test_email = "explorer_test_2026@pahadily.com"
st, signup_res = req("/api/auth/signup", method="POST", data={
    "email": test_email,
    "password": "strongpassword123",
    "full_name": "Himalayan Explorer",
    "phone": "+91 98765 00000",
    "role": "traveler"
})
if st == 400:
    st, login_res = req("/api/auth/login", method="POST", data={
        "email": test_email,
        "password": "strongpassword123"
    })
    token = login_res["token"]
    user = login_res["user"]
    print(f" [PASS] 3. Auth Login ({user['full_name']} / {user['role']})")
else:
    assert st == 201, f"Signup failed: {st} {signup_res}"
    token = signup_res["token"]
    user = signup_res["user"]
    print(f" [PASS] 3. Auth Signup ({user['full_name']} / {user['role']})")

# 4. Auth Me
st, me_res = req("/api/auth/me", token=token)
assert st == 200 and me_res["email"] == test_email, f"Me check failed: {st} {me_res}"
print(" [PASS] 4. Session Token Verification (/api/auth/me)")

# 5. Demo Logins
for r in ["traveler", "host", "admin"]:
    st, d_res = req(f"/api/auth/demo-login?role={r}", method="POST")
    assert st == 200 and d_res["user"]["role"] == r, f"Demo {r} failed: {st} {d_res}"
    print(f" [PASS] 5. 1-Click Demo Login: [{r.upper()}] ({d_res['user']['full_name']})")

admin_token = req("/api/auth/demo-login?role=admin", method="POST")[1]["token"]

# 6. User Management Endpoints (Admin)
st, users_list = req("/api/users", token=admin_token)
assert st == 200 and len(users_list) >= 3, f"List users failed: {st}"
print(f" [PASS] 6. GET /api/users (Found {len(users_list)} registered user accounts)")

# Update user status
target_u_id = users_list[-1]["id"]
st, upd_status = req(f"/api/users/{target_u_id}/status", method="PATCH", data={"is_verified": True}, token=admin_token)
assert st == 200 and upd_status["is_verified"] is True, f"Status update failed: {st}"
print(f" [PASS] 7. PATCH /api/users/{{id}}/status (Verified User ID: {target_u_id})")

# 7. Unified Booking with Payment Info
st, new_booking = req("/api/bookings", method="POST", data={
    "booking_type": "place",
    "item_id": 1,
    "item_title": "Tirthan Valley River Sanctuary",
    "item_image": "/images/destinations/tirthan-valley.jpg",
    "traveler_name": "Aarav Sharma",
    "traveler_email": test_email,
    "traveler_phone": "+91 98765 00000",
    "travel_date": "2026-11-10",
    "end_date": "2026-11-14",
    "guests": "2 Guests",
    "nights": 4,
    "total_price": "9600",
    "payment_method": "upi",
    "payment_status": "paid",
    "message": "Arriving by afternoon bus at Aut tunnel."
}, token=token)
assert st == 201 and "payment_id" in new_booking, f"Create booking failed: {st} {new_booking}"
b_id = new_booking["id"]
print(f" [PASS] 8. POST /api/bookings (Created Booking ID: {b_id} | Ref: {new_booking['payment_id']})")

# 8. List Bookings (Admin & User)
st, all_bookings = req("/api/bookings", token=admin_token)
assert st == 200 and len(all_bookings) >= 1, f"List all bookings failed: {st}"
print(f" [PASS] 9. GET /api/bookings (Admin: {len(all_bookings)} total bookings managed)")

st, my_bookings = req("/api/bookings/my", token=token)
assert st == 200 and len(my_bookings) >= 1, f"List my bookings failed: {st}"
print(f" [PASS] 10. GET /api/bookings/my (Traveler: {len(my_bookings)} personal reservations)")

# 9. Update Payment & Reservation Status
st, pay_upd = req(f"/api/bookings/{b_id}/payment", method="PATCH", data={"payment_status": "paid"}, token=admin_token)
assert st == 200 and pay_upd["payment_status"] == "paid", f"Payment update failed: {st}"
print(f" [PASS] 11. PATCH /api/bookings/{{id}}/payment (Updated payment status to PAID)")

st, stat_upd = req(f"/api/bookings/{b_id}/status?new_status=confirmed", method="PATCH", token=admin_token)
assert st == 200 and stat_upd["status"] == "confirmed", f"Status update failed: {st}"
print(f" [PASS] 12. PATCH /api/bookings/{{id}}/status (Confirmed reservation)")

# 10. Host Application & Auto-Approval
st, host_app = req("/api/host-applications", method="POST", data={
    "name": "Sunil Negi",
    "email": test_email,
    "phone": "+91 98160 55555",
    "region": "Sangla Valley",
    "skill": "High Alpine Trek Leader",
    "bio": "Certified guide with 12 years of Kinnaur and Spiti expedition leadership."
})
assert st == 201, f"Host app failed: {st}"
app_id = host_app["id"]
print(f" [PASS] 13. POST /api/host-applications (Submitted Application ID: {app_id})")

st, app_approved = req(f"/api/host-applications/{app_id}/status?status_val=approved", method="PATCH", token=admin_token)
assert st == 200, f"Approve host failed: {st}"
print(f" [PASS] 14. PATCH /api/host-applications/{{id}}/status (Approved & Auto-Upgraded Account)")

# Cleanup test booking
st, del_res = req(f"/api/bookings/{b_id}", method="DELETE", token=admin_token)
assert st == 200, f"Delete booking failed: {st}"
print(f" [PASS] 15. DELETE /api/bookings/{{id}} (Cleaned up test reservation)")

print("\n========================================================")
print("  ALL 15/15 AUTOMATED INTEGRATION TESTS PASSED! [100%]   ")
print("========================================================\n")
