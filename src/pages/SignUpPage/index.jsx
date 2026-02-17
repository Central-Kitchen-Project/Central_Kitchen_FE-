import { useNavigate } from "react-router-dom";
import "./SignUp.css";

export default function SignUp() {

  const navigate = useNavigate();


  return (
    <div className="signup-wrapper">
      {/* Left Section: Form */}
      <div className="signup-form-section">
        {/* Logo */}
        <div className="signup-logo">
          <div className="signup-logo-icon">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="signup-logo-text">Central Kitchen</h2>
        </div>

        {/* Header */}
        <div className="signup-header">
          <h1 className="signup-title">Create Your Account</h1>
          <p className="signup-subtitle">Join the food franchise management system</p>
        </div>

        {/* Form */}
        <form className="signup-form">
          {/* Full Name */}
          <div className="signup-field">
            <label className="signup-label">Full Name</label>
            <input
              className="signup-input"
              placeholder="Enter your full name"
              type="text"
            />
          </div>

          {/* Email */}
          <div className="signup-field">
            <label className="signup-label">Email Address</label>
            <input
              className="signup-input"
              placeholder="work@company.com"
              type="email"
            />
          </div>

          {/* Role Selection */}
          <div className="signup-field">
            <label className="signup-label">Organization Role</label>
            <select className="signup-select" defaultValue="">
              <option disabled value="">Select your role</option>
              <option value="kitchen_manager">Kitchen Manager</option>
              <option value="franchise_owner">Franchise Owner</option>
              <option value="store_staff">Store Staff</option>
              <option value="logistics">Logistics Coordinator</option>
            </select>
          </div>

          {/* Passwords Grid */}
          <div className="signup-password-grid">
            <div className="signup-field">
              <label className="signup-label">Password</label>
              <input
                className="signup-input"
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div className="signup-field">
              <label className="signup-label">Confirm Password</label>
              <input
                className="signup-input"
                placeholder="••••••••"
                type="password"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="signup-terms">
            <input
              className="signup-checkbox"
              id="terms"
              type="checkbox"
            />
            <label className="signup-terms-label" htmlFor="terms">
              I agree to the{" "}
              <a className="signup-link" href="#">Terms of Service</a>
              {" "}and{" "}
              <a className="signup-link" href="#">Privacy Policy</a>.
            </label>
          </div>

          {/* Submit Button */}
          <button
      className="signup-btn"
      type="button"
      onClick={() => navigate("/SignIn")}
    >
      <span>Sign Up</span>
      <span className="material-symbols-outlined">arrow_forward</span>
    </button>

          {/* Footer Link */}
          <p className="signup-footer-text">
            Already have an account?{" "}
            <a className="signup-link" href="/SignIn">Sign In</a>
          </p>
        </form>
      </div>

      {/* Right Section: Visual Content */}
      <div className="signup-visual-section">
        <div className="signup-gradient-overlay" />

        {/* Hero Image */}
        <div
          className="signup-hero-image"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXlmxXHfWiRt3tKkmdl-zFZamJJPZT6vvU6I-UjMt763rxA2XzauXzesHsVDdJnDYS_PZpTSFoRE-xGyFJtvnNrXzF0PTO_e_a6WHwEKFA7RkDlKLa3RLdpUOhBE3HBDU2XXTrZ79Iyk31PwPd7EXeJH70ssLwdKYDDxdRD1Uf4LHmyGkCaCr7DA-DtKtO0dyBHV2bHFAQJoWdy80iA6fW3ugmZDQaB9mGkQzrSA-HObJfJdtR5lptoAR8l5mO-B9pUQBLzbFhT_M")`,
          }}
        />

        {/* Content Overlay */}
        <div className="signup-visual-content">
          <div className="signup-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined signup-star">star</span>
            ))}
          </div>
          <blockquote className="signup-quote">
            "The transition to this system reduced our food waste by 30% across all 15 locations in the first quarter."
          </blockquote>
          <div className="signup-author">
            <div
              className="signup-author-avatar"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjkx1g2z7P1VbsUYI6NcF83A6LcN0M8ULtlkusN6u5ewk5yKDABl8FpwdMm7XXp-VeeBKrSj_XhSeG5C97Cb9hnnRr6DOQ7gTBo-2C85MMR3eVZ81N2PPszgWBwDKfP00vto8sCLlCe6G0raZwkgIeBGB31E8Wln4gY0YNPagPQjUcp3uqvvQ8HPNxj9znF0KDn_8D6r5ywdXVWuJRPHG3iY4MP2b0MQISUIhQJGARVMx24k_NQysgdOK8PkmozFMEnGU2SspAoPM')`,
              }}
            />
            <div>
              <p className="signup-author-name">Marco Rossi</p>
              <p className="signup-author-role">Executive Chef, Artisan Group</p>
            </div>
          </div>
        </div>

        {/* Live Inventory Badge */}
        <div className="signup-badge">
          <div className="signup-badge-icon">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <p className="signup-badge-label">Live Inventory</p>
            <p className="signup-badge-value">98.4% Efficiency</p>
          </div>
        </div>
      </div>
    </div>
  );
}