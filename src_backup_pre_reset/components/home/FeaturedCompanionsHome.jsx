import { useState } from "react";
import { Link } from "react-router-dom";
import LocalProfileModal from "../locals/LocalProfileModal";

const FEATURED_PILOT_LOCALS = [
  {
    id: 1,
    category: "companions",
    region: "jibhi",
    name: "Rahul Thakur",
    location: "Shoja / Jibhi Pine Ridge",
    role: "Local Companion",
    lang: "Hindi, English, Pahadi",
    rating: "4.8",
    reviews: "82",
    price: "₹500",
    unit: "/day",
    tags: ["Village Walks", "Cedar Forests", "Jalori Pass Secrets"],
    image: "/images/locals/rahul.jpg",
    verified: true,
    certified: false,
    gradient: "linear-gradient(135deg,#2b7050,#78caa0)",
    bio: "Born in Shoja near Jalori Pass, Rahul has been walking ancient cedar paths and waterfall alcoves for over 7 years. He helps mindful travelers explore without hurry.",
  },
  {
    id: 2,
    category: "companions",
    region: "tirthan",
    name: "Sonia Negi",
    location: "Tirthan Valley & Gushaini",
    role: "Local Companion",
    lang: "Hindi, English, Pahadi",
    rating: "4.9",
    reviews: "48",
    price: "₹450",
    unit: "/day",
    tags: ["Organic Farming", "Riverside Trails", "Kath-Kuni Craft"],
    image: "/images/locals/sonia.jpg",
    verified: true,
    certified: false,
    gradient: "linear-gradient(135deg,#8b34a3,#d08be0)",
    bio: "Sonia loves introducing travelers to organic farming, glacial trout stream walks, and centuries-old Kath-Kuni wooden architecture in Gushaini.",
  },
  {
    id: 9,
    category: "food-hosts",
    region: "jibhi",
    name: "Meena Devi",
    location: "Jibhi Valley",
    role: "Food & Cultural Host",
    lang: "Hindi, Pahadi",
    rating: "4.9",
    reviews: "68",
    price: "₹350",
    unit: "/person",
    tags: ["Hot Steamed Siddu", "Pahadi Thali", "Woodfire Cooking"],
    image: null,
    verified: true,
    certified: false,
    gradient: "linear-gradient(135deg,#b03060,#e07090)",
    bio: "Meena opens her heritage wooden kitchen to guests, serving hot steamed Siddu stuffed with walnuts and wild poppy seeds, cooked with local cow ghee.",
  },
];

function FeaturedCompanionsHome() {
  const [selectedLocal, setSelectedLocal] = useState(null);

  return (
    <section className="featured-locals-home-section" style={{ padding: "72px 0", background: "var(--color-bg-ivory)" }}>
      <div className="section-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "40px" }}>
          <div>
            <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, color: "var(--color-forest-medium)", display: "block", marginBottom: "8px" }}>
              PILOT COMMUNITY IN KULLU DISTRICT
            </span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", color: "var(--color-forest-dark)", fontWeight: 700, margin: 0 }}>
              Meet Verified Local Companions
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "15px", marginTop: "8px", maxWidth: "600px" }}>
              Native residents who help you discover secret trails, traditional woodfire kitchens, and mountain lore.
            </p>
          </div>

          <Link
            to="/locals"
            style={{
              color: "var(--color-forest-medium)",
              fontWeight: 700,
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            }}
          >
            <span>View All Kullu Companions</span>
            <span>→</span>
          </Link>
        </div>

        {/* Companions Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {FEATURED_PILOT_LOCALS.map((loc) => {
            const initials = loc.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
            return (
              <div
                key={loc.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid var(--color-border-card)",
                  boxShadow: "var(--shadow-sm)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "58px", height: "58px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                      {loc.image ? (
                        <img src={loc.image} alt={loc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: loc.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "18px" }}>
                          {initials}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "19px", color: "var(--color-forest-dark)", margin: 0 }}>
                          {loc.name}
                        </h3>
                        {loc.verified && (
                          <span title="Verified Local Resident" style={{ color: "var(--color-forest-medium)", fontSize: "14px" }}>
                            ✓
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--color-forest-medium)", fontWeight: 700, display: "block" }}>
                        {loc.role}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        📍 {loc.location}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: "var(--color-text-body)", fontSize: "13.5px", lineHeight: "1.55", marginBottom: "16px", flex: 1 }}>
                    {loc.bio}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                    {loc.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          background: "var(--color-bg-card)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--color-text-body)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        • {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-forest-dark)" }}>
                        {loc.price}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}> {loc.unit}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedLocal(loc)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "var(--color-forest-medium)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "13px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Request a Day
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLocal && (
        <LocalProfileModal
          local={selectedLocal}
          onClose={() => setSelectedLocal(null)}
        />
      )}
    </section>
  );
}

export default FeaturedCompanionsHome;
