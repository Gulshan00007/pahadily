import { useState } from "react";

function LocalsJoinCTA() {
  const [joined, setJoined] = useState(false);
  const [hostName, setHostName] = useState("");
  const [hostRegion, setHostRegion] = useState("Kullu Valley");
  const [hostSkill, setHostSkill] = useState("Local Companion");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hostName.trim()) {
      setJoined(true);
    }
  };

  return (
    <section className="locals-join-section">
      <div className="section-container">
        <div className="locals-join-card">
          <div className="locals-join-bg-pattern" aria-hidden="true" />
          <div className="locals-join-grid">
            <div className="locals-join-content">
              <span className="locals-join-eyebrow">COMMUNITY & HOSTS</span>
              <h2 className="locals-join-title">
                Are You a Himachali Local?<br />
                <span>Share Your Mountains With The World.</span>
              </h2>
              <p className="locals-join-desc">
                Whether you know secret pine forest trails, cook traditional Siddu and Dham, drive safe mountain passes, or capture Himalayan light — join Pahadíly’s community of 150+ verified locals.
              </p>

              <div className="locals-join-perks">
                <div className="join-perk">
                  <span className="join-perk-icon">💰</span>
                  <div>
                    <strong>100% Direct Payouts</strong>
                    <p>Keep the full earnings with zero middleman deductions.</p>
                  </div>
                </div>
                <div className="join-perk">
                  <span className="join-perk-icon">⏱️</span>
                  <div>
                    <strong>Total Flexibility</strong>
                    <p>Choose your own schedule, guests, and custom pricing.</p>
                  </div>
                </div>
                <div className="join-perk">
                  <span className="join-perk-icon">🌿</span>
                  <div>
                    <strong>Heritage Preservation</strong>
                    <p>Help travelers appreciate authentic Himachali traditions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="locals-join-form-wrapper">
              {joined ? (
                <div className="join-success-card">
                  <div className="join-success-icon">🏔️</div>
                  <h3>Dhanyavaad, {hostName}!</h3>
                  <p>
                    Our community team in Himachal will reach out to you within 24 hours to verify and set up your local host profile.
                  </p>
                  <button
                    className="join-another-btn"
                    onClick={() => {
                      setJoined(false);
                      setHostName("");
                    }}
                  >
                    Submit another host
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="locals-join-form">
                  <h3 className="join-form-title">Apply to Become a Host</h3>
                  <p className="join-form-subtitle">Takes less than 2 minutes to get started</p>

                  <div className="join-form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Negi"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      required
                      className="join-input"
                    />
                  </div>

                  <div className="join-form-field">
                    <label>Your Region / Valley</label>
                    <select
                      value={hostRegion}
                      onChange={(e) => setHostRegion(e.target.value)}
                      className="join-input"
                    >
                      <option value="Tirthan Valley">Tirthan Valley</option>
                      <option value="Jibhi & Banjar">Jibhi & Banjar</option>
                      <option value="Kullu Valley">Kullu Valley</option>
                      <option value="Manali & Solang">Manali & Solang</option>
                      <option value="Kasol & Parvati">Kasol & Parvati</option>
                      <option value="Spiti Valley">Spiti Valley</option>
                      <option value="Pangi & Sach">Pangi Valley</option>
                      <option value="Kinnaur">Kinnaur</option>
                    </select>
                  </div>

                  <div className="join-form-field">
                    <label>What would you like to host?</label>
                    <select
                      value={hostSkill}
                      onChange={(e) => setHostSkill(e.target.value)}
                      className="join-input"
                    >
                      <option value="Local Companion">Local Companion (Village Walks & Lore)</option>
                      <option value="Trek Guide">Trek & Mountain Guide</option>
                      <option value="Food Host">Food Host (Himachali Home Meals / Cooking)</option>
                      <option value="Mountain Driver">Driver & Transport</option>
                      <option value="Storyteller">Storyteller & Folk Musician</option>
                      <option value="Photographer">Photographer & Filmer</option>
                    </select>
                  </div>

                  <button type="submit" className="join-submit-btn">
                    <span>Register as Local Host</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                  <span className="join-note">We verify all hosts in person to maintain high standards.</span>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocalsJoinCTA;
