import React, { useState } from "react";
import "./SignIn.css";
import { useNavigate } from "react-router-dom";
import { fetchLogin } from "../../store/authSlice";
import { useDispatch } from "react-redux";

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("formdata",formData);
    
    dispatch(fetchLogin(formData)).then((res) => {
      console.log("res.payload",res.payload);
      
      if (res.payload.data.token.roleId === 1) {
        navigate("/DashboardAdmin");
      } else if (res.payload.data.token.roleId === 2) {
        navigate("/DashboardManager");
      } else if (res.payload.data.token.roleId === 3) {
        navigate("/DashboardFranchise");
      } else if (res.payload.data.token.roleId === 4) {
        navigate("/DashboardCentral");
      } else if (res.payload.data.token.roleId === 5) {
        navigate("/DashboardSupplier");
        // setError("Login failed. Please check your credentials.");
      }
      
    });

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);

    setError("");

    // navigate("/Dashboard");
  };

  return (
    <div className="signin-page flex min-h-screen">
      {/* Left Section */}
      <div className="flex flex-col w-full lg:w-[45%] xl:w-[40%] px-8 md:px-16 lg:px-24 py-12 justify-between bg-white shadow-xl">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="p-3 logo-box rounded-xl text-white">
            <svg className="size-6" fill="none" viewBox="0 0 48 48">
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-[#121713] text-xl font-bold tracking-tight">
            Central Kitchen System
          </h2>
        </header>

        {/* Form */}
        <main className="max-w-105 w-full mx-auto my-12">
          <h1 className="text-[#121713] text-4xl font-extrabold mb-3">
            Welcome Back 👋
          </h1>
          <p className="text-[#658670] text-base mb-8">
            Sign in to manage your kitchen operations seamlessly.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-[#121713]">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full rounded-xl h-14 p-4 mt-2"
                placeholder="Enter your email"
                type="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-[#121713]">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input w-full rounded-xl h-14 p-4 pr-12"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#57c436] transition"
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </div>

              <p className="text-right mt-2">
                <span
                  onClick={() => navigate("/ForgotPassword")}
                  className="text-[#57c436] font-semibold cursor-pointer hover:underline"
                >
                  Forgot password?
                </span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            {/* Button */}
            <button
              className="primary-btn w-full h-14 rounded-xl text-black font-bold text-base"
              type="submit"
            >
              Sign In
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-[#658670] mt-8">
            Don’t have an account?
            <span
              onClick={() => navigate("/SignUp")}
              className="text-[#57c436] font-bold ml-1 cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        </main>

        <footer className="text-sm text-[#658670]">
          © 2026 Central Kitchen System
        </footer>
      </div>

      {/* Right Section */}
      <div className="lg:block lg:flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1556910103-1c02745aae4d")',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-tr from-black/70 to-transparent" />
        </div>

        <div className="absolute bottom-12 left-12 right-12 p-8 glass-card rounded-2xl text-white max-w-xl">
          <h3 className="text-2xl font-bold mb-3">
            Empowering 500+ franchise locations
          </h3>
          <p className="text-white/80 text-sm leading-relaxed">
            Integrated procurement, recipe control and inventory tracking system
            built for modern kitchen chains.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
