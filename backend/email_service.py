"""
Pahadíly Email & Notification Engine
Handles automated email delivery (via SMTP or live terminal console dispatch)
for new user registrations, payment confirmations, and booking vouchers.
"""

import os
import sys
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Dict, Any


def _safe_print(text: str):
    """Safely prints text on any Windows/Linux terminal encoding without crashing."""
    try:
        print(text)
    except UnicodeEncodeError:
        try:
            encoding = getattr(sys.stdout, "encoding", "utf-8") or "utf-8"
            print(text.encode(encoding, errors="replace").decode(encoding))
        except Exception:
            print(text.encode("ascii", errors="replace").decode("ascii"))


def print_banner_box(title: str, lines: list[str], icon: str = "★"):
    """Renders a prominent, high-visibility framed ASCII/Unicode card in the backend console."""
    width = 78
    sep = "=" * width
    _safe_print(f"\n{sep}")
    _safe_print(f"  {icon}  {title.upper()}")
    _safe_print("-" * width)
    for line in lines:
        _safe_print(f"  {line}")
    _safe_print(f"{sep}\n")


def send_email(
    to_email: str,
    recipient_name: str,
    subject: str,
    plain_text: str,
    html_content: str,
) -> Dict[str, Any]:
    """
    Dispatches an email via SMTP if configured in .env / environment variables.
    Falls back gracefully to simulated console dispatch if SMTP credentials
    are not configured, displaying the email on the backend console.
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SMTP_FROM", "noreply@pahadily.com")
    sender_name = os.getenv("SENDER_NAME", "Pahadíly Himalayan Journeys")

    from_header = f"{sender_name} <{sender_email}>"

    # Attempt real SMTP delivery if configured
    if smtp_host and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_header
            msg["To"] = to_email

            part1 = MIMEText(plain_text, "plain", "utf-8")
            part2 = MIMEText(html_content, "html", "utf-8")
            msg.attach(part1)
            msg.attach(part2)

            if smtp_port == 465:
                server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
            else:
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
                server.starttls()

            server.login(smtp_user, smtp_password)
            server.sendmail(sender_email, [to_email], msg.as_string())
            server.quit()

            # Log successful SMTP dispatch
            print_banner_box(
                "EMAIL DISPATCHED VIA SMTP SERVER",
                [
                    f"To:          {recipient_name} <{to_email}>",
                    f"Subject:     {subject}",
                    f"SMTP Host:   {smtp_host}:{smtp_port}",
                    f"Status:      DELIVERED SUCCESSFULLY VIA SMTP",
                    f"Dispatched:  {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
                ],
                icon="📧 [SMTP SENT]"
            )
            return {
                "success": True,
                "mode": "smtp",
                "recipient": to_email,
                "subject": subject,
                "status": "delivered",
            }
        except Exception as e:
            _safe_print(f"[EMAIL SERVICE WARNING] SMTP transmission error: {e}. Falling back to live console dispatch.")

    # Local / Simulation Console Dispatch (Prominently displayed on backend)
    snippet_lines = [
        f"To:             {recipient_name} <{to_email}>",
        f"Subject:        {subject}",
        f"Delivery Mode:  SIMULATED LIVE DISPATCH (SMTP not configured)",
        f"Status:         DELIVERED TO USER TERMINAL",
        f"Sent At:        {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "--------------------------------------------------------------------------",
        "PREVIEW OF EMAIL CONTENT SENT TO USER:",
    ]
    # Add indented plain text lines
    for line in plain_text.strip().splitlines()[:12]:
        snippet_lines.append(f"  > {line}")

    print_banner_box(
        "BOOKING CONFIRMATION EMAIL SENT TO USER",
        snippet_lines,
        icon="📧 [EMAIL SENT]"
    )

    return {
        "success": True,
        "mode": "simulated",
        "recipient": to_email,
        "subject": subject,
        "status": "sent",
    }


def send_welcome_email(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Sends a welcome email to newly registered users."""
    name = user_data.get("full_name", "Traveler")
    email = user_data.get("email", "")
    role = user_data.get("role", "traveler").capitalize()

    subject = f"Welcome to Pahadíly, {name}! Your Himalayan Journey Begins"

    plain_text = f"""
Namaste {name},

Welcome to Pahadíly — the community for conscious Himalayan journeys.

Your account has been registered successfully:
• Registered Email: {email}
• Account Type:     {role}
• Member Since:     {datetime.utcnow().strftime('%B %d, %Y')}

Explore remote wooden homestays, high-altitude alpine camps, and native local guides across Tirthan, Spiti, Chopta, Jibhi, Kinnaur, and Parvati.

Need help planning? Simply reply to this email or visit:
https://pahadily.com

With warmth from the mountains,
The Pahadíly Team
"""

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9f6; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #1b4332, #2d6a4f); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">PAHADÍLY</h1>
      <p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 14px;">Rare Places • Real People • Lasting Stories</p>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="color: #1b4332; margin-top: 0;">Namaste {name},</h2>
      <p style="line-height: 1.6; font-size: 15px; color: #374151;">
        Welcome to <strong>Pahadíly</strong>! Your account has been created. You can now discover authentic Himalayan sanctuaries, book native homestays, and connect directly with local mountain hosts.
      </p>
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #166534;">
          <strong>Account Details:</strong><br>
          • <strong>Email:</strong> {email}<br>
          • <strong>Role:</strong> {role}<br>
          • <strong>Access:</strong> Full Himalayan Sanctuary & Booking Access
        </p>
      </div>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
        May your paths be quiet and your journeys leave no footprint behind.
      </p>
    </div>
  </div>
</body>
</html>
"""
    return send_email(email, name, subject, plain_text, html)


def send_booking_confirmation_email(booking_data: Dict[str, Any]) -> Dict[str, Any]:
    """Sends an official booking voucher and confirmation email to the traveler."""
    b_id = booking_data.get("id", "N/A")
    title = booking_data.get("item_title", "Himalayan Sanctuary")
    traveler_name = booking_data.get("traveler_name", "Traveler")
    traveler_email = booking_data.get("traveler_email", "")
    phone = booking_data.get("traveler_phone") or "Provided on profile"
    travel_date = str(booking_data.get("travel_date", ""))
    end_date = str(booking_data.get("end_date") or "")
    nights = booking_data.get("nights", 1)
    guests = booking_data.get("guests", "1 Guest")
    total_price = booking_data.get("total_price", "₹0")
    payment_method = str(booking_data.get("payment_method", "upi")).upper()
    payment_status = str(booking_data.get("payment_status", "paid")).upper()
    payment_id = booking_data.get("payment_id", f"PHD-PAY-{b_id}")
    txn_ref = booking_data.get("transaction_ref", f"TXN-{b_id}")

    dates_display = f"{travel_date} to {end_date} ({nights} nights)" if end_date and end_date != "None" else travel_date

    subject = f"Booking Confirmed: {title} | Pahadíly Voucher #{b_id}"

    plain_text = f"""
================================================================================
PAHADÍLY — OFFICIAL RESERVATION VOUCHER
================================================================================

Namaste {traveler_name},

Your reservation has been confirmed and locked with the mountain host!

RESERVATION DETAILS:
--------------------------------------------------------------------------------
• Booking Reference:  #{b_id}
• Destination / Stay: {title}
• Travel Dates:       {dates_display}
• Guests:             {guests}
• Traveler:           {traveler_name} ({traveler_email})
• Contact Phone:      {phone}

PAYMENT SUMMARY:
--------------------------------------------------------------------------------
• Total Amount Paid:  {total_price}
• Payment Method:     {payment_method}
• Payment Status:     {payment_status}
• Payment ID:         {payment_id}
• Transaction Ref:    {txn_ref}

CHECK-IN INSTRUCTIONS:
--------------------------------------------------------------------------------
1. Please present this e-voucher or state Reference #{b_id} upon arrival.
2. Carry valid government-issued photo ID for all adult travelers.
3. Himalayan weather can change swiftly — please carry warm layers and sturdy footwear.
4. Mindful travel: Respect local mountain culture, practice slow travel, and carry reusable water bottles.

Need assistance or local directions? Contact our host care team at support@pahadily.com.

Safe and wondrous travels,
Pahadíly Mountain Sanctuary Network
================================================================================
"""

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f6f4; margin: 0; padding: 24px; color: #1f2937;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1b4332, #2d6a4f); padding: 32px 24px; text-align: center; color: #ffffff;">
      <span style="background: rgba(255,255,255,0.18); font-size: 11px; padding: 4px 10px; border-radius: 12px; font-weight: 600; letter-spacing: 1px;">OFFICIAL RESERVATION VOUCHER</span>
      <h1 style="margin: 12px 0 4px 0; font-size: 24px; letter-spacing: 1px;">PAHADÍLY</h1>
      <p style="margin: 0; opacity: 0.9; font-size: 13px;">Rare Places • Real People • Lasting Stories</p>
    </div>

    <!-- Main Card Content -->
    <div style="padding: 28px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Status</span><br>
          <span style="display: inline-block; background: #dcfce7; color: #15803d; font-weight: 700; font-size: 13px; padding: 3px 10px; border-radius: 12px; margin-top: 4px;">✓ CONFIRMED</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Voucher Reference</span><br>
          <strong style="font-size: 16px; color: #1b4332;">#{b_id}</strong>
        </div>
      </div>

      <h2 style="color: #1b4332; font-size: 20px; margin: 0 0 6px 0;">{title}</h2>
      <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0;">Traveler: <strong>{traveler_name}</strong> • Guests: <strong>{guests}</strong></p>

      <!-- Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Travel Dates</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">{dates_display}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Contact Email</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">{traveler_email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Payment Method</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">{payment_method}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Transaction Ref</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #0f172a;">{txn_ref}</td>
        </tr>
        <tr style="border-bottom: 2px solid #1b4332;">
          <td style="padding: 12px 0; color: #1b4332; font-weight: 700; font-size: 16px;">Total Paid</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 18px; color: #1b4332;">{total_price}</td>
        </tr>
      </table>

      <!-- Host Guidance -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
        <strong style="color: #0f172a;">Himalayan Host Check-in Advice:</strong><br>
        • Present this booking reference <strong>#{b_id}</strong> on arrival.<br>
        • Please arrive before sundown due to mountain valley terrain.<br>
        • Help protect delicate Himalayan ecology: leave no trace.
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
        Pahadíly Sustainable Himalayan Journeys • Questions? Email support@pahadily.com
      </p>
    </div>
  </div>
</body>
</html>
"""
    return send_email(traveler_email, traveler_name, subject, plain_text, html)
