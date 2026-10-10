import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { createHostApplication, getMyHostSubmissions, getHostApplications } from "../lib/api";

const PRESET_IMAGES = [
  { label: "Tirthan River Chalet", url: "/images/destinations/tirthan-valley.jpg" },
  { label: "Pine Ridge Cottage", url: "/images/destinations/jibhi.jpg" },
  { label: "Spiti Mudhouse", url: "/images/destinations/spiti-valley.jpg" },
  { label: "Kinnaur Orchard Stay", url: "/images/destinations/kinnaur.jpg" },
  { label: "Alpine Meadow Lodge", url: "/images/experiences/forest-walk.jpg" },
];

const REGIONS = [
  { id: "tirthan", label: "Tirthan Valley" },
  { id: "jibhi", label: "Jibhi & Banjar" },
  { id: "kullu", label: "Kullu & Manali" },
  { id: "spiti", label: "Spiti Valley" },
  { id: "kinnaur", label: "Kinnaur Valley" },
  { id: "kangra", label: "Kangra & Dharamshala" },
  { id: "parvati", label: "Parvati Valley" },
  { id: "pangi", label: "Pangi Valley" },
];

const CATEGORIES = [
  "River Chalet",
  "Heritage Mudhouse",
  "Apple Orchard Homestay",
  "Pine Forest Cottage",
  "Alpine Glamping Tent",
  "Ancestral Stone Villa",
  "Mountain Farmstay",
];

function HostPortalPage() {
  const { user, isAuthenticated, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "my-listings"
  const [submitting, setSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);

  // Form State: Host Profile
  const [hostName, setHostName] = useState(user?.full_name || "");
  const [hostEmail, setHostEmail] = useState(user?.email || "");
  const [hostPhone, setHostPhone] = useState(user?.phone || "");
  const [hostRegion, setHostRegion] = useState("tirthan");
  const [hostLanguages, setHostLanguages] = useState("Hindi, Pahadi, English");
  const [hostBio, setHostBio] = useState("");
  const [hostAvatar, setHostAvatar] = useState("");

  // Form State: Property & Location Details
  const [propertyName, setPropertyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("River Chalet");
  const [price, setPrice] = useState("₹2,400");
  const [unit, setUnit] = useState("/night");
  const [altitude, setAltitude] = useState("1,850m");
  const [tags, setTags] = useState("Mountain Stream, Bonfire, Home Meals, High-speed Wi-Fi");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("/images/destinations/tirthan-valley.jpg");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Dynamic Nearby Locations
  const [nearbyLocations, setNearbyLocations] = useState([
    { name: "Chhoie Hidden Waterfall", distance: "1.2 km walk", image: "/images/destinations/tirthan-valley.jpg" },
    { name: "Tirthan River Confluence", distance: "400m walk", image: "/images/destinations/jibhi.jpg" },
  ]);

  // Dynamic Stay Options
  const [stayOptions, setStayOptions] = useState([
    { name: "Standard Mountain Room", price: "₹2,400/night", features: "Queen Bed, Forest View, Organic Breakfast" },
    { name: "Upper Timber Attic Suite", price: "₹3,200/night", features: "Balcony, River Sounds, Wooden Fireplace" },
  ]);

  // Update pre-filled info when user changes
  useEffect(() => {
    if (user) {
      if (!hostName) setHostName(user.full_name || "");
      if (!hostEmail) setHostEmail(user.email || "");
      if (!hostPhone && user.phone) setHostPhone(user.phone || "");
    }
  }, [user]);

  // Load submissions
  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      let data = [];
      if (isAuthenticated) {
        data = await getMyHostSubmissions();
      } else {
        data = await getHostApplications();
        // If not logged in, filter by email if entered
        if (hostEmail) {
          data = data.filter((d) => d.email?.toLowerCase() === hostEmail.toLowerCase());
        }
      }
      setMySubmissions(data);
    } catch (err) {
      console.warn("Could not load submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-listings") {
      loadSubmissions();
    }
  }, [activeTab, isAuthenticated, hostEmail]);

  // Add / Remove Nearby Spots
  const handleAddNearby = () => {
    setNearbyLocations([...nearbyLocations, { name: "", distance: "", image: coverImage }]);
  };

  const handleUpdateNearby = (idx, field, val) => {
    const next = [...nearbyLocations];
    next[idx][field] = val;
    setNearbyLocations(next);
  };

  const handleRemoveNearby = (idx) => {
    setNearbyLocations(nearbyLocations.filter((_, i) => i !== idx));
  };

  // Add / Remove Stay Options
  const handleAddOption = () => {
    setStayOptions([...stayOptions, { name: "", price: price + "/night", features: "" }]);
  };

  const handleUpdateOption = (idx, field, val) => {
    const next = [...stayOptions];
    next[idx][field] = val;
    setStayOptions(next);
  };

  const handleRemoveOption = (idx) => {
    setStayOptions(stayOptions.filter((_, i) => i !== idx));
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hostName.trim()) {
      showToast("Please enter host name", "error");
      return;
    }
    if (!propertyName.trim()) {
      showToast("Please enter property / sanctuary name", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: hostName.trim(),
        email: hostEmail.trim() || undefined,
        phone: hostPhone.trim() || undefined,
        region: hostRegion,
        skill: "Native Host",
        bio: hostBio.trim() || undefined,
        languages: hostLanguages.trim() || undefined,
        avatar: hostAvatar.trim() || undefined,
        user_id: user?.id || undefined,

        // Property details
        property_name: propertyName.trim(),
        tagline: tagline.trim() || `Authentic stay hosted by ${hostName}`,
        category,
        price: price.trim(),
        unit,
        altitude: altitude.trim(),
        tags: tags.trim(),
        image: coverImage.trim(),
        description: description.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        nearby_locations: nearbyLocations.filter((n) => n.name.trim()),
        stay_options: stayOptions.filter((s) => s.name.trim()),
      };

      const res = await createHostApplication(payload);
      showToast("Sanctuary submitted for administrator approval!", "success");
      setSubmittedSuccess(res.application || { property_name: propertyName, name: hostName, status: "pending" });
      loadSubmissions();
    } catch (err) {
      showToast(err.message || "Failed to submit host details", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedSuccess(null);
    setPropertyName("");
    setTagline("");
    setDescription("");
  };

  return (
    <div className="pahadily-app">
      <Navbar activePage="locals" />

      <main className="host-portal-page">
        {/* Top Hero Banner */}
        <section className="host-portal-hero">
          <div className="section-container">
            <div className="host-hero-badge">
              <span>🏡 Pahadíly Native Host Network</span>
            </div>
            <h1 className="host-hero-title">
              List Your Himalayan Sanctuary.<br />
              <span className="accent-gold">Direct to Conscious Travelers.</span>
            </h1>
            <p className="host-hero-subtitle">
              Join a community of native hosts across Himachal Pradesh. Share your ancestral stone cottage,
              riverside chalet, or apple orchard stay. Submit your details below; our administration team
              reviews and publishes your sanctuary live.
            </p>

            <div className="host-portal-nav-pills">
              <button
                type="button"
                className={`host-nav-pill${activeTab === "submit" ? " active" : ""}`}
                onClick={() => setActiveTab("submit")}
              >
                ✍️ Submit Stay & Location Details
              </button>
              <button
                type="button"
                className={`host-nav-pill${activeTab === "my-listings" ? " active" : ""}`}
                onClick={() => setActiveTab("my-listings")}
              >
                📋 My Submissions & Status ({mySubmissions.length})
              </button>
            </div>
          </div>
        </section>

        {/* Tab 1: Submit Form */}
        {activeTab === "submit" && (
          <section className="host-form-section section-container">
            {submittedSuccess ? (
              <div className="host-success-card">
                <div className="host-success-icon">🎉</div>
                <h2>Sanctuary Submitted Successfully!</h2>
                <p>
                  Thank you, <strong>{submittedSuccess.name}</strong>. Your listing for{" "}
                  <strong>"{submittedSuccess.property_name}"</strong> has been received by the Pahadíly
                  Operations team.
                </p>
                <div className="host-status-box">
                  <span className="status-label">Current Status:</span>
                  <span className="status-pill pending">⏳ PENDING ADMINISTRATOR REVIEW</span>
                </div>
                <p className="host-review-notice">
                  Our team verifies each mountain sanctuary for authenticity, water quality, and local heritage.
                  Once approved from the admin portal, your stay will immediately go live on the Book Stay and
                  Explore maps.
                </p>
                <div className="host-success-actions">
                  <button type="button" className="btn-host-primary" onClick={handleResetForm}>
                    + Submit Another Sanctuary
                  </button>
                  <button type="button" className="btn-host-secondary" onClick={() => setActiveTab("my-listings")}>
                    View All My Submissions →
                  </button>
                </div>
              </div>
            ) : (
              <div className="host-portal-grid">
                {/* Left: Interactive Form */}
                <form className="host-submission-form" onSubmit={handleSubmit}>
                  {/* STEP 1: Host Personal Profile */}
                  <div className="host-form-card">
                    <div className="form-card-header">
                      <span className="step-num">1</span>
                      <div>
                        <h3>Native Host Details</h3>
                        <p>Tell travelers who you are and where your mountain roots lie.</p>
                      </div>
                    </div>

                    <div className="host-fields-row">
                      <div className="host-field">
                        <label>Host Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Thakur"
                          value={hostName}
                          onChange={(e) => setHostName(e.target.value)}
                        />
                      </div>
                      <div className="host-field">
                        <label>Contact Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. ramesh@pahadily.com"
                          value={hostEmail}
                          onChange={(e) => setHostEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="host-fields-row">
                      <div className="host-field">
                        <label>Phone / WhatsApp Number</label>
                        <input
                          type="tel"
                          placeholder="+91 98160 XXXXX"
                          value={hostPhone}
                          onChange={(e) => setHostPhone(e.target.value)}
                        />
                      </div>
                      <div className="host-field">
                        <label>Native Valley / Region *</label>
                        <select value={hostRegion} onChange={(e) => setHostRegion(e.target.value)}>
                          {REGIONS.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="host-field">
                      <label>Languages Spoken</label>
                      <input
                        type="text"
                        placeholder="e.g. Hindi, Pahadi, English"
                        value={hostLanguages}
                        onChange={(e) => setHostLanguages(e.target.value)}
                      />
                    </div>

                    <div className="host-field">
                      <label>Host Story & Background (Bio)</label>
                      <textarea
                        rows={3}
                        placeholder="Share your lineage, connection to this valley, or what you love showing travelers..."
                        value={hostBio}
                        onChange={(e) => setHostBio(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* STEP 2: Sanctuary & Location Details */}
                  <div className="host-form-card">
                    <div className="form-card-header">
                      <span className="step-num">2</span>
                      <div>
                        <h3>Sanctuary & Location Details</h3>
                        <p>Describe the stay, setting, altitude, and amenities.</p>
                      </div>
                    </div>

                    <div className="host-field">
                      <label>Sanctuary / Property Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cedar Woods Riverside Chalet"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                      />
                    </div>

                    <div className="host-field">
                      <label>Catchy Tagline / Mood *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Handcrafted timber cabin over crystal clear trout waters"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                      />
                    </div>

                    <div className="host-fields-row">
                      <div className="host-field">
                        <label>Property Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="host-field">
                        <label>Price Per Night</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹2,400"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="host-fields-row">
                      <div className="host-field">
                        <label>Altitude Above Sea Level</label>
                        <input
                          type="text"
                          placeholder="e.g. 1,850m"
                          value={altitude}
                          onChange={(e) => setAltitude(e.target.value)}
                        />
                      </div>
                      <div className="host-field">
                        <label>Pricing Unit</label>
                        <input
                          type="text"
                          placeholder="e.g. /night"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="host-field">
                      <label>Tags & Key Highlights (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Riverside, Bonfire, Home Meals, Star Gazing, High-speed Wi-Fi"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="host-field">
                      <label>Detailed Stay & Surrounding Description</label>
                      <textarea
                        rows={4}
                        placeholder="Describe the architecture, views, how guests reach here, meals prepared from the kitchen garden..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Image Selector */}
                    <div className="host-field">
                      <label>Cover Photo URL *</label>
                      <input
                        type="text"
                        required
                        placeholder="/images/destinations/tirthan-valley.jpg"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                      />
                      <div className="preset-images-row">
                        <span className="preset-label">Quick Presets:</span>
                        {PRESET_IMAGES.map((img) => (
                          <button
                            key={img.url}
                            type="button"
                            className={`preset-btn${coverImage === img.url ? " active" : ""}`}
                            onClick={() => setCoverImage(img.url)}
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="host-fields-row">
                      <div className="host-field">
                        <label>Latitude (Optional)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 31.6425"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                        />
                      </div>
                      <div className="host-field">
                        <label>Longitude (Optional)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 77.3482"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Nearby Attractions (Slideshow items) */}
                  <div className="host-form-card">
                    <div className="form-card-header">
                      <span className="step-num">3</span>
                      <div>
                        <h3>Nearby Attractions & Secret Spots</h3>
                        <p>These appear in the interactive nearby slideshow modal for travelers.</p>
                      </div>
                    </div>

                    {nearbyLocations.map((item, idx) => (
                      <div key={idx} className="dynamic-item-card">
                        <div className="dynamic-item-header">
                          <strong>Spot #{idx + 1}</strong>
                          {nearbyLocations.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-sub"
                              onClick={() => handleRemoveNearby(idx)}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <div className="host-fields-row">
                          <div className="host-field">
                            <label>Spot Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Chhoie Waterfall"
                              value={item.name}
                              onChange={(e) => handleUpdateNearby(idx, "name", e.target.value)}
                            />
                          </div>
                          <div className="host-field">
                            <label>Distance / Time</label>
                            <input
                              type="text"
                              placeholder="e.g. 1.2 km walk"
                              value={item.distance}
                              onChange={(e) => handleUpdateNearby(idx, "distance", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button type="button" className="btn-add-dynamic" onClick={handleAddNearby}>
                      + Add Another Nearby Spot
                    </button>
                  </div>

                  {/* STEP 4: Stay & Room Tiers */}
                  <div className="host-form-card">
                    <div className="form-card-header">
                      <span className="step-num">4</span>
                      <div>
                        <h3>Room & Stay Options</h3>
                        <p>Allow travelers to choose which exact room or chalet tier they book.</p>
                      </div>
                    </div>

                    {stayOptions.map((opt, idx) => (
                      <div key={idx} className="dynamic-item-card">
                        <div className="dynamic-item-header">
                          <strong>Room Option #{idx + 1}</strong>
                          {stayOptions.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-sub"
                              onClick={() => handleRemoveOption(idx)}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <div className="host-fields-row">
                          <div className="host-field">
                            <label>Room / Tier Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Deluxe Timber Suite"
                              value={opt.name}
                              onChange={(e) => handleUpdateOption(idx, "name", e.target.value)}
                            />
                          </div>
                          <div className="host-field">
                            <label>Price</label>
                            <input
                              type="text"
                              placeholder="e.g. ₹2,800/night"
                              value={opt.price}
                              onChange={(e) => handleUpdateOption(idx, "price", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="host-field">
                          <label>Inclusions & Features</label>
                          <input
                            type="text"
                            placeholder="e.g. Balcony, King Bed, Breakfast, River view"
                            value={opt.features}
                            onChange={(e) => handleUpdateOption(idx, "features", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}

                    <button type="button" className="btn-add-dynamic" onClick={handleAddOption}>
                      + Add Another Room Option
                    </button>
                  </div>

                  {/* Submit CTA */}
                  <div className="host-submit-bar">
                    <button type="submit" disabled={submitting} className="btn-host-submit-live">
                      {submitting ? "Sending to Administration..." : "🚀 Submit Listing for Admin Approval"}
                    </button>
                    <p className="host-terms-note">
                      🔒 Submissions are thoroughly vetted. Upon approval, your stay is automatically published live
                      and your account granted Verified Host privileges.
                    </p>
                  </div>
                </form>

                {/* Right: Live Card Preview */}
                <aside className="host-preview-sidebar">
                  <div className="host-preview-sticky">
                    <div className="preview-badge-header">
                      <span>👁️ Live Traveler Card Preview</span>
                    </div>

                    <div className="preview-stay-card">
                      <div className="preview-card-image" style={{ backgroundImage: `url('${coverImage}')` }}>
                        <span className="preview-category-tag">{category}</span>
                        <span className="preview-rating-tag">★ 5.0 (New)</span>
                      </div>
                      <div className="preview-card-content">
                        <div className="preview-card-loc">
                          <span className="dot"></span>
                          <span>
                            {REGIONS.find((r) => r.id === hostRegion)?.label || "Himachal Pradesh"} · {altitude}
                          </span>
                        </div>
                        <h4 className="preview-card-title">{propertyName || "Your Sanctuary Name"}</h4>
                        <p className="preview-card-tagline">
                          {tagline || "Your mountain sanctuary tagline will display here."}
                        </p>

                        <div className="preview-host-row">
                          <div className="preview-host-avatar">
                            {hostName ? hostName.charAt(0).toUpperCase() : "H"}
                          </div>
                          <div className="preview-host-info">
                            <strong>Hosted by {hostName || "You"}</strong>
                            <span>{hostLanguages}</span>
                          </div>
                        </div>

                        <div className="preview-amenities-tags">
                          {(tags ? tags.split(",") : ["Mountain Stream", "Home Food"]).slice(0, 3).map((t, i) => (
                            <span key={i} className="mini-tag">
                              {t.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="preview-card-footer">
                          <div className="preview-price-col">
                            <span className="preview-price-val">{price}</span>
                            <span className="preview-price-unit">{unit}</span>
                          </div>
                          <button type="button" className="preview-book-btn" disabled>
                            Select & Book
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="preview-sub-stats">
                      <div className="sub-stat">
                        <strong>{nearbyLocations.length}</strong>
                        <span>Nearby Spots</span>
                      </div>
                      <div className="sub-stat">
                        <strong>{stayOptions.length}</strong>
                        <span>Room Tiers</span>
                      </div>
                      <div className="sub-stat">
                        <strong>24h</strong>
                        <span>Review Turnaround</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: My Submissions */}
        {activeTab === "my-listings" && (
          <section className="host-submissions-section section-container">
            <div className="submissions-header">
              <div>
                <h2>Your Submitted Sanctuaries</h2>
                <p>Track the real-time status of your location and sanctuary applications.</p>
              </div>
              <button type="button" className="btn-new-listing" onClick={() => setActiveTab("submit")}>
                + Submit New Sanctuary
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="host-loading">Loading your submissions...</div>
            ) : mySubmissions.length === 0 ? (
              <div className="host-empty-box">
                <div className="empty-icon">🏔️</div>
                <h3>No Submissions Found Yet</h3>
                <p>You haven't submitted any mountain sanctuaries yet. Ready to welcome travelers?</p>
                <button type="button" className="btn-host-primary" onClick={() => setActiveTab("submit")}>
                  Submit Your First Sanctuary
                </button>
              </div>
            ) : (
              <div className="host-submissions-grid">
                {mySubmissions.map((sub) => (
                  <div key={sub.id} className="host-submission-card">
                    <div className="sub-card-top">
                      <div className="sub-card-image" style={{ backgroundImage: `url('${sub.image || "/images/destinations/tirthan-valley.jpg"}')` }}>
                        <span className={`status-pill ${sub.status}`}>
                          {sub.status === "approved"
                            ? "✅ APPROVED & LIVE"
                            : sub.status === "rejected"
                            ? "❌ REJECTED"
                            : "⏳ PENDING REVIEW"}
                        </span>
                      </div>
                      <div className="sub-card-details">
                        <span className="sub-region">{sub.region?.toUpperCase()}</span>
                        <h3 className="sub-title">{sub.property_name || sub.name}</h3>
                        <p className="sub-tagline">{sub.tagline || sub.bio || "No description provided."}</p>

                        <div className="sub-meta-row">
                          <span>💰 {sub.price || "₹2,500"}</span>
                          <span>🏔️ {sub.altitude || "1,800m"}</span>
                          <span>👤 Host: {sub.name}</span>
                        </div>

                        {sub.published_place_id && (
                          <div className="published-banner">
                            ✨ Published live in catalog as <strong>Place #{sub.published_place_id}</strong>!
                            <a href="/explore" className="view-live-link">
                              View on Explore →
                            </a>
                          </div>
                        )}

                        {sub.admin_notes && (
                          <div className="admin-notes-banner">
                            <strong>Note from Administrator:</strong> {sub.admin_notes}
                          </div>
                        )}

                        <div className="sub-footer-row">
                          <small>Submitted on {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "Recently"}</small>
                          <span className="sub-app-id">Submission #{sub.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default HostPortalPage;
