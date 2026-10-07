import sqlite3
import sys

# Ensure UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

conn = sqlite3.connect("pahadily.db")
c = conn.cursor()

# Keep ONLY genuine accounts: gulshany0001@gmail.com
c.execute("DELETE FROM users WHERE email != 'gulshany0001@gmail.com'")
c.execute("DELETE FROM bookings WHERE traveler_email != 'gulshany0001@gmail.com'")
c.execute("DELETE FROM email_notifications WHERE recipient_email != 'gulshany0001@gmail.com'")

conn.commit()

print("Clean Real Users in Database:")
for row in c.execute("SELECT id, email, full_name, role FROM users").fetchall():
    print(" -", row)

print("Remaining Bookings Count:", c.execute("SELECT COUNT(*) FROM bookings").fetchone()[0])
print("Remaining Email Notifications Count:", c.execute("SELECT COUNT(*) FROM email_notifications").fetchone()[0])
conn.close()
