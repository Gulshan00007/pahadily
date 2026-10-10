import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    requestRegistrationOtp,
    confirmRegistrationOtp,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("traveler");

  // OTP-based registration state
  const [otpStep, setOtpStep] = useState("input"); // "input" | "verify"
  const [otpCode, setOtpCode] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [otpNotice, setOtpNotice] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setOtpNotice("");
    setOtpStep("input");
    setOtpCode("");
    setOtpHint("");
  }, [authModalTab, authModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setAuthModalOpen(false);
    };
    if (authModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [authModalOpen, setAuthModalOpen]);

  if (!authModalOpen) return null;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (authModalTab === "login") {
        await login(email, password);
      } else if (otpStep === "input") {
        // Step 1 of Signup: Request OTP
        const res = await requestRegistrationOtp({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          role,
        });
        setOtpHint(res.otp_preview || "");
        setOtpNotice(res.message || `Verification code sent to ${email}`);
        setOtpStep("verify");
      } else if (otpStep === "verify") {
        // Step 2 of Signup: Verify OTP
        if (!otpCode || otpCode.trim().length < 4) {
          setError("Please enter the complete verification code.");
          setSubmitting(false);
          return;
        }
        await confirmRegistrationOtp({
          email: email.trim(),
          otp_code: otpCode.trim(),
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await requestRegistrationOtp({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        role,
      });
      setOtpHint(res.otp_preview || "");
      setOtpNotice("New verification code sent!");
    } catch (err) {
      setError(err.message || "Could not resend OTP code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pahadily-modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={() => setAuthModalOpen(false)}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Branding */}
        <div className="auth-modal-header">
          <div className="auth-badge">HIMALAYAN ACCESS</div>
          <h2 className="auth-title">
            {authModalTab === "login"
              ? "Welcome Back to Pahadíly"
              : otpStep === "verify"
              ? "Verify Your Email (OTP)"
              : "Begin Your Mountain Journey"}
          </h2>
          <p className="auth-subtitle">
            {authModalTab === "login"
              ? "Access your bookings, saved places, and conversations with local hosts."
              : otpStep === "verify"
              ? `We've sent a 6-digit secure code to ${email}. Enter it below to activate your account.`
              : "Connect with authentic mountain stays, local guides, and slow journeys."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === "login" ? "active" : ""}`}
            onClick={() => setAuthModalTab("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === "signup" ? "active" : ""}`}
            onClick={() => setAuthModalTab("signup")}
          >
            Create Account
          </button>
        </div>

        {/* Status Notice */}
        {otpNotice && (
          <div className="auth-info-banner" role="status">
            <span>📨 {otpNotice}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {authModalTab === "signup" && otpStep === "verify" ? (
            /* --- OTP VERIFICATION STEP --- */
            <div className="otp-verification-container">
              <div className="otp-icon-wrap">🔐</div>
              <label className="otp-input-label">Enter 6-Digit Verification Code</label>
              
              <div className="otp-input-box">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  className="auth-input otp-large-input"
                />
              </div>

              {otpHint && (
                <div className="otp-demo-hint">
                  <span>Verification Code: <strong>{otpHint}</strong></span>
                  <button
                    type="button"
                    className="btn-autofill-otp"
                    onClick={() => setOtpCode(otpHint)}
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={submitting}>
                {submitting ? "Verifying Code..." : "✓ Verify & Complete Registration"}
              </button>

              <div className="otp-sub-actions">
                <button
                  type="button"
                  className="btn-text-sub"
                  onClick={handleResendOtp}
                  disabled={submitting}
                >
                  🔄 Resend OTP Code
                </button>
                <button
                  type="button"
                  className="btn-text-sub"
                  onClick={() => {
                    setOtpStep("input");
                    setError("");
                  }}
                >
                  ← Edit Information
                </button>
              </div>
            </div>
          ) : (
            /* --- STANDARD INPUT FORM (LOGIN OR SIGNUP PHASE 1) --- */
            <>
              {authModalTab === "signup" && (
                <>
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Verma"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="auth-input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="auth-input"
                    />
                  </div>

                  <div className="form-field">
                    <label>I want to join as</label>
                    <div className="role-selector-row">
                      <label className={`role-pill-label ${role === "traveler" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="role"
                          value="traveler"
                          checked={role === "traveler"}
                          onChange={() => setRole("traveler")}
                        />
                        <span>🌿 Conscious Traveler</span>
                      </label>
                      <label className={`role-pill-label ${role === "host" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="role"
                          value="host"
                          checked={role === "host"}
                          onChange={() => setRole("host")}
                        />
                        <span>🏡 Mountain Host / Guide</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>

              <div className="form-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={submitting}>
                {submitting ? (
                  <span className="btn-spinner-wrap">
                    <span className="spinner-dot"></span>
                    Processing...
                  </span>
                ) : authModalTab === "login" ? (
                  "Log In to Pahadíly"
                ) : (
                  "Send Verification Code (OTP) →"
                )}
              </button>
            </>
          )}
        </form>

        <div className="auth-footer-note">
          <p>
            🛡️ 100% Secure & Privacy Focused. By continuing, you agree to Pahadíly&apos;s mindful travel code of ethics.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
