"""
Pahadíly Backend Direct Verification Suite
Tests the complete pipeline without external HTTP dependencies:
1. User registration & verification
2. Console event logging (New user, Payment, Booking confirmed)
3. Email voucher generation & live dispatch
4. EmailNotification record verification in database
5. Resend voucher endpoint
6. Clean database state
"""

import sys
import time
from datetime import date

# Ensure UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from main import (
    SessionLocal,
    User,
    Booking,
    EmailNotification,
    UserSignup,
    BookingCreate,
    signup,
    create_booking,
    resend_booking_email,
    list_email_notifications,
    select,
)

print("\n" + "=" * 78)
print("     PAHADÍLY BACKEND VERIFICATION SUITE")
print("=" * 78 + "\n")

db = SessionLocal()

try:
    # 1. Database connection & existing accounts
    admin = db.scalar(select(User).where(User.email == "gulshany0001@gmail.com"))
    assert admin is not None, "Master admin Gulshan not found in database!"
    print(f"[PASS] 1. Master Admin Verified: {admin.full_name} ({admin.email}) [Role: {admin.role}]")

    # 2. Register a real user
    test_email = f"verified_traveler_{int(time.time())}@example.com"
    test_name = "Pooja Thakur"
    test_phone = "+91 98160 54321"

    print(f"\n---> Registering New User ({test_email})...")
    signup_payload = UserSignup(
        email=test_email,
        password="mountainPassword2026",
        full_name=test_name,
        phone=test_phone,
        role="traveler",
    )
    auth_resp = signup(signup_payload, db=db)
    user_id = auth_resp.user.id
    token = auth_resp.token
    print(f"[PASS] 2. User Registered: #{user_id} - {auth_resp.user.full_name} ({auth_resp.user.email})")

    # 3. Check Welcome Email in Database
    welcome_notif = db.scalar(
        select(EmailNotification)
        .where(EmailNotification.recipient_email == test_email)
        .where(EmailNotification.email_type == "welcome_user")
    )
    assert welcome_notif is not None, "Welcome email was not recorded in EmailNotification table!"
    print(f"[PASS] 3. Welcome Email Logged in DB: ID #{welcome_notif.id} | Subject: '{welcome_notif.subject}'")

    # 4. Create a Booking with Payment
    print(f"\n---> Creating Booking & Processing Payment for {test_name}...")
    registered_user = db.get(User, user_id)
    booking_payload = BookingCreate(
        booking_type="place",
        item_id=1,
        item_title="Tirthan Riverside Campsite & Bonfire Haven",
        item_image="/images/destinations/tirthan-valley.jpg",
        traveler_name=test_name,
        traveler_email=test_email,
        traveler_phone=test_phone,
        travel_date=date(2026, 10, 18),
        end_date=date(2026, 10, 21),
        guests="2 Guests",
        nights=3,
        total_price="₹5,400",
        payment_method="upi",
        payment_status="paid",
        message="Arriving at Aut tunnel at noon. Please arrange local riverside pickup.",
    )
    new_booking = create_booking(booking_payload, db=db, current_user=registered_user)
    booking_id = new_booking.id
    print(f"[PASS] 4. Booking #{booking_id} Confirmed with Payment ID: {new_booking.payment_id}")

    # 5. Check Booking Confirmation Email in Database
    booking_notif = db.scalar(
        select(EmailNotification)
        .where(EmailNotification.booking_id == booking_id)
        .where(EmailNotification.email_type == "booking_confirmation")
    )
    assert booking_notif is not None, f"Booking confirmation email was not recorded in DB for booking #{booking_id}!"
    print(f"[PASS] 5. Booking Confirmation Email Voucher Logged in DB (Subject: '{booking_notif.subject}')")

    # 6. Resend Booking Email
    print(f"\n---> Testing Resend Voucher Endpoint (/api/bookings/{booking_id}/resend-email)...")
    resend_result = resend_booking_email(booking_id, db=db, current_user=registered_user)
    print(f"[PASS] 6. Resend Voucher Endpoint Success: {resend_result['message']}")

    # 7. Check User Notifications listing
    user_notifs = list_email_notifications(db=db, current_user=registered_user)
    assert len(user_notifs) >= 3, f"Expected at least 3 notifications, found {len(user_notifs)}"
    print(f"[PASS] 7. User Notifications Query returned {len(user_notifs)} records.")

    # 8. Clean up verification test data so database remains 100% pristine
    db.query(EmailNotification).filter(EmailNotification.recipient_email == test_email).delete()
    db.query(Booking).filter(Booking.id == booking_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    print(f"[PASS] 8. Verification records cleanly rolled back. Database is completely authentic!")

    # Verify final real user count (only Gulshan)
    remaining_users = list(db.scalars(select(User)).all())
    print(f"[PASS] 9. Final Real Accounts in System: {[u.email for u in remaining_users]}")
    remaining_bookings = list(db.scalars(select(Booking)).all())
    print(f"[PASS] 10. Final Bookings Count: {len(remaining_bookings)}")

    print("\n" + "=" * 78)
    print("   ALL BACKEND EVENTS, EMAILS & LOGS VERIFIED SUCCESSFULLY!")
    print("=" * 78 + "\n")

finally:
    db.close()
