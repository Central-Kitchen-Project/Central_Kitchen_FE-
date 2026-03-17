import React, { useState } from "react";
import "../SignInPage/SignIn.css";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { extractApiErrorMessage, extractApiMessage } from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await authService.forgotPassword({ email });
      const message = extractApiMessage(
        res?.data,
        "Reset email sent. Please check your inbox."
      );
      setStatus(message);
    } catch (err) {
      const message = extractApiErrorMessage(
        err,
        "Failed to send reset email. Please try again."
      );
      setStatus(message);
    }
  };

  return (
    <div className="signin-page flex min-h-screen">
      <div className="flex flex-col w-full lg:w-[45%] xl:w-[40%] px-8 md:px-16 lg:px-24 py-12 justify-between bg-white shadow-xl">
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
          <h2 className="text-[#121713] text-xl font-bold tracking-tight">Central Kitchen System</h2>
        </header>

        <main className="max-w-[420px] w-full mx-auto my-12">
          <h1 className="text-[#121713] text-3xl font-extrabold mb-3">Forgot Password</h1>
          <p className="text-[#658670] text-base mb-8">Enter your account email and we'll send reset instructions.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-[#121713]">Email</label>
              <input
                className="form-input w-full rounded-xl h-14 p-4 mt-2"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button className="primary-btn w-full h-14 rounded-xl text-black font-bold text-base" type="submit">Send Reset Email</button>
          </form>

          {status && <p className="text-center text-sm text-[#658670] mt-4">{status}</p>}

          <p className="text-center text-sm text-[#658670] mt-8">
            Remembered your password?
            <span onClick={() => navigate("/SignIn")} className="text-[#57c436] font-bold ml-1 cursor-pointer hover:underline">Sign In</span>
          </p>
        </main>

        <footer className="text-sm text-[#658670]">© 2026 Central Kitchen System</footer>
      </div>

      <div className=" lg:block lg:flex-1 relative overflow">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1556910103-1c02745aae4d")'}}>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent" />
        </div>
      </div>
    </div>
  );    
}

export default ForgotPassword;
