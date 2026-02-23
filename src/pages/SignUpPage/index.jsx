import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // map role -> roleId theo API
  const roleMap = {
    kitchen_manager: 4,
    franchise_owner: 3,
    logistics: 5,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.agree) {
      return setError("You must agree to the terms.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (!formData.role) {
      return setError("Please select your role.");
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://meinamfpt-001-site1.ltempurl.com/api/Auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.fullName,
            roleId: roleMap[formData.role],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Register failed");
      }
      alert("Register successful!");
      navigate("/SignIn");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      {/* Left Section */}
      <div className="signup-form-section">
        <div className="signup-logo">
          <div className="signup-logo-icon">
            <svg fill="none" viewBox="0 0 48 48">
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

        <div className="signup-header">
          <h1 className="signup-title">Create Your Account</h1>
          <p className="signup-subtitle">
            Join the food franchise management system
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="signup-field">
            <label className="signup-label">Full Name</label>
            <input
              className="signup-input"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              type="text"
              required
            />
          </div>

          {/* Email */}
          <div className="signup-field">
            <label className="signup-label">Email Address</label>
            <input
              className="signup-input"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="work@company.com"
              type="email"
              required
            />
          </div>

          {/* Role */}
          <div className="signup-field">
            <label className="signup-label">Organization Role</label>
            <select
              className="signup-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option disabled value="">
                Select your role
              </option>
              <option value="kitchen_manager">
                Central Kitchen Staff
              </option>
              <option value="franchise_owner">
                Franchise Store Staff
              </option>
              <option value="logistics">
                Supply Coordinator
              </option>
            </select>
          </div>

          {/* Password Grid */}
          <div className="signup-password-grid">
            <div className="signup-field">
              <label className="signup-label">Password</label>
              <input
                className="signup-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                type="password"
                required
              />
            </div>

            <div className="signup-field">
              <label className="signup-label">Confirm Password</label>
              <input
                className="signup-input"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className="signup-terms">
            <input
              className="signup-checkbox"
              id="terms"
              name="agree"
              type="checkbox"
              checked={formData.agree}
              onChange={handleChange}
            />
            <label
              className="signup-terms-label"
              htmlFor="terms"
            >
              I agree to the Terms of Service and Privacy Policy.
            </label>
          </div>

          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>
              {error}
            </p>
          )}

          <button
            className="signup-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
            <span className="material-symbols-outlined">
              arrow_forward
            </span>
          </button>

          <p className="signup-footer-text">
            Already have an account?{" "}
            <span
              className="signup-link"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/SignIn")}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>

      {/* Right Section (GIỮ NGUYÊN) */}
      <div className="signup-visual-section">
        <div className="signup-gradient-overlay" />
        <div
          className="signup-hero-image"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXlmxXHfWiRt3tKkmdl-zFZamJJPZT6vvU6I-UjMt763rxA2XzauXzesHsVDdJnDYS_PZpTSFoRE-xGyFJtvnNrXzF0PTO_e_a6WHwEKFA7RkDlKLa3RLdpUOhBE3HBDU2XXTrZ79Iyk31PwPd7EXeJH70ssLwdKYDDxdRD1Uf4LHmyGkCaCr7DA-DtKtO0dyBHV2bHFAQJoWdy80iA6fW3ugmZDQaB9mGkQzrSA-HObJfJdtR5lptoAR8l5mO-B9pUQBLzbFhT_M")`,
          }}
        />
      </div>
    </div>
  );
}