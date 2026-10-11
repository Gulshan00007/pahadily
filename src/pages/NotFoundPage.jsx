import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/common/SEO";
import { EXPLORE_DESTINATIONS } from "../data/exploreDestinationsData";

function NotFoundPage() {
  return (
    <div className="pahadily-app">
      <SEO
        title="404 — Trail Not Found"
        description="The page you requested could not be found. Explore verified Himalayan sanctuaries, homestays, and local guides across Himachal Pradesh."
        noindex={true}
        nofollow={false}
      />
      <Navbar activePage="" />

      <main className="section-container" style={{ padding: "80px 0 100px", minHeight: "70vh" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: "56px", display: "block", marginBottom: "16px" }}>🏔️</span>
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              backgroundColor: "rgba(200, 109, 81, 0.12)",
              color: "#c86d51",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            404 — OFF THE TRAIL
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif, 'Playfair Display', serif)",
              fontSize: "38px",
              lineHeight: 1.25,
              color: "var(--color-forest-dark, #0a251b)",
              marginBottom: "16px",
            }}
          >
            This Himalayan Sanctuary Path Does Not Exist
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--color-text-body, #1e362c)",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            The ridge or sanctuary URL you requested may have moved, or the trail has vanished into the cedar pine mist.
            Use the verified links below to find authentic places to explore and stay.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                backgroundColor: "#205540",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Return Home
            </a>
            <a
              href="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                backgroundColor: "rgba(10, 37, 27, 0.08)",
                color: "#0a251b",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Explore 8 Valleys →
            </a>
            <a
              href="/stays"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                backgroundColor: "rgba(10, 37, 27, 0.08)",
                color: "#0a251b",
                borderRadius: "8px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Verified Homestays →
            </a>
          </div>

          {/* Quick Destination Navigation */}
          <div
            style={{
              padding: "28px",
              backgroundColor: "var(--color-bg-card, #f3efe6)",
              borderRadius: "16px",
              border: "1px solid var(--color-border-card, rgba(10, 37, 27, 0.12))",
              textAlign: "left",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--color-forest-dark, #0a251b)",
                marginBottom: "16px",
              }}
            >
              Popular Himalayan Sanctuaries in Himachal Pradesh
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              {EXPLORE_DESTINATIONS.map((dest) => (
                <a
                  key={dest.id}
                  href={`/destinations/${dest.slug || dest.id}`}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--color-text-main, #0c2017)",
                    border: "1px solid rgba(10, 37, 27, 0.06)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "14px" }}>{dest.name}</strong>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted, #536b5e)" }}>
                    {dest.subValley || "Kullu District"} • {dest.elevation}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFoundPage;
