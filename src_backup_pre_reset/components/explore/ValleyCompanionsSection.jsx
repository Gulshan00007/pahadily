import { useState } from "react";
import { Link } from "react-router-dom";
import { VERIFIED_LOCALS } from "../../data/localsData";
import LocalProfileModal from "../locals/LocalProfileModal";

function ValleyCompanionsSection({ destination }) {
  const [selectedLocal, setSelectedLocal] = useState(null);

  if (!destination) return null;

  const destRegion = (destination.region || destination.id || "").toLowerCase();

  // Filter companions matching this valley or district
  const matchedCompanions = VERIFIED_LOCALS.filter((l) => {
    const lRegion = (l.region || "").toLowerCase();
    const lLocation = (l.location || "").toLowerCase();
    return (
      lRegion === destRegion ||
      lLocation.includes(destRegion) ||
      (destRegion === "tirthan" && (lRegion === "tirthan" || lRegion === "jibhi")) ||
      (destRegion === "jibhi" && (lRegion === "jibhi" || lRegion === "tirthan")) ||
      (destRegion === "shangarh" && (lRegion === "kullu" || lRegion === "tirthan")) ||
      (destRegion === "naggar" && lRegion === "kullu") ||
      (destRegion === "lug-valley" && lRegion === "kullu")
    );
  });

  const displayList = matchedCompanions.length > 0 ? matchedCompanions.slice(0, 3) : VERIFIED_LOCALS.slice(0, 3);

  return (
    <section className="valley-companions-section" style={{ margin: "48px 0" }}>
      <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid var(--color-border-card)", padding: "36px 32px", boxShadow: "var(--shadow-sm)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "28px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "20px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(43, 112, 80, 0.1)", color: "var(--color-forest-medium)", padding: "3px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              <span>🤝 Native Valley Network</span>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--color-forest-dark)", margin: "0 0 6px" }}>
              Local Companions Serving {destination.name}
            </h3>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "14px", maxWidth: "600px" }}>
              Explore secret trails, ancient wooden temples, and cedar viewpoints with residents who know this valley intimately.
            </p>
          </div>

          <Link
            to={`/locals?region=${destRegion}`}
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
            <span>See All Companions</span>
            <span>→</span>
          </Link>
        </div>

        {/* Category guidance note */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", background: "var(--color-bg-ivory)", padding: "16px 20px", borderRadius: "12px", marginBottom: "28px" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-forest-medium)", display: "block" }}>
              🤝 Local Companion
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Friendly resident for village paths, culture, and nature walks.
            </span>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a5c9f", display: "block" }}>
              🎖️ Qualified Trek Guide
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Certified mountaineering escort for high-altitude passes.
            </span>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-terracotta-warm)", display: "block" }}>
              🍲 Food & Cultural Host
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Traditional Siddu cooking, woodfire lunches, and folklore.
            </span>
          </div>
        </div>

        {/* Companions cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {displayList.map((loc) => {
            const initials = loc.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
            return (
              <div
                key={loc.id}
                style={{
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "14px",
                  padding: "20px",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(10,37,27,0.03)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      {loc.image ? (
                        <img src={loc.image} alt={loc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: loc.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700 }}>
                          {initials}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", color: "var(--color-forest-dark)", margin: "0 0 2px" }}>
                        {loc.name}
                      </h4>
                      <span style={{ fontSize: "12px", color: "var(--color-forest-medium)", fontWeight: 700 }}>
                        {loc.role}
                      </span>
                      <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-faint)" }}>
                        {loc.location}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--color-text-body)", lineHeight: "1.5", marginBottom: "14px" }}>
                    {loc.bio}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--color-forest-dark)" }}>
                      {loc.price}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}> {loc.unit}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLocal(loc)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "6px",
                      background: "var(--color-forest-medium)",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Request Availability
                  </button>
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

export default ValleyCompanionsSection;
