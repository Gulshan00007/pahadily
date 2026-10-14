import { Link } from "react-router-dom";

const WORK_STEPS = [
  {
    step: "01",
    title: "Discover Rare Places",
    desc: "Explore lesser-known villages, cedar pine ridges, and glacier streams across the Kullu valley pilot.",
    badge: "Valley Discovery",
    icon: "🏔️",
  },
  {
    step: "02",
    title: "Meet Native Locals",
    desc: "Choose between friendly local walking companions, certified trek guides, or traditional home food hosts.",
    badge: "Real People",
    icon: "🤝",
  },
  {
    step: "03",
    title: "Request Availability",
    desc: "Select a date and time slot with zero upfront payment. Your host reviews their schedule and confirms directly.",
    badge: "No Upfront Charge",
    icon: "📅",
  },
  {
    step: "04",
    title: "Support Mountain Families",
    desc: "Explore respectfully and remunerate your host directly. Every journey helps preserve native Himalayan traditions.",
    badge: "Direct Community Earning",
    icon: "🌱",
  },
];

function HowPahadilyWorks() {
  return (
    <section className="how-pahadily-works-section" style={{ padding: "72px 0", background: "var(--color-bg-card)", borderTop: "1px solid var(--color-border-subtle)", borderBottom: "1px solid var(--color-border-subtle)" }}>
      <div className="section-container">
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 48px" }}>
          <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, color: "var(--color-forest-medium)", display: "block", marginBottom: "8px" }}>
            THE COMMUNITY BLUEPRINT
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "34px", color: "var(--color-forest-dark)", fontWeight: 700, lineHeight: 1.2, marginBottom: "14px" }}>
            How Pahadíly Works
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "16px", lineHeight: "1.6" }}>
            A slow, community-first marketplace connecting travelers with native residents who share their time, knowledge, and hospitality.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {WORK_STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                background: "#ffffff",
                padding: "32px 24px",
                borderRadius: "16px",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--color-border-card)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ fontSize: "28px" }}>{s.icon}</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 800, color: "var(--color-border-hover)" }}>
                  {s.step}
                </span>
              </div>

              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-forest-medium)", letterSpacing: "0.06em", marginBottom: "6px" }}>
                {s.badge}
              </span>

              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-forest-dark)", marginBottom: "10px", lineHeight: 1.3 }}>
                {s.title}
              </h3>

              <p style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Banner with CTAs */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px 36px", border: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-forest-dark)", margin: "0 0 6px" }}>
              Are you a native resident of Kullu or Himachal Pradesh?
            </h4>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "14px" }}>
              Share your local knowledge as a walking companion, trek guide, food host, or driver.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/become-a-local"
              style={{
                padding: "11px 22px",
                borderRadius: "9999px",
                background: "var(--color-forest-medium)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Become a Local Partner →
            </Link>
            <Link
              to="/locals"
              style={{
                padding: "11px 20px",
                borderRadius: "9999px",
                border: "1.5px solid var(--color-forest-dark)",
                color: "var(--color-forest-dark)",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Meet Companions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowPahadilyWorks;
