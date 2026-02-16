import React from "react";

function SignIn() {
  return (
    <>
      <style>
        {`
        .signin-page {
          font-family: 'Manrope', sans-serif;
          background: #f8faf8;
        }

        .signin-page .form-input {
          border: 1px solid #dce5df;
          transition: all 0.25s ease;
        }

        .signin-page .form-input:focus {
          border-color: #57c436;
          box-shadow: 0 0 0 4px rgba(87,196,54,0.15);
          outline: none;
        }

        .signin-page .primary-btn {
          background: #57c436;
          transition: all 0.25s ease;
        }

        .signin-page .primary-btn:hover {
          background: #4caf30;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(87,196,54,0.3);
        }

        .signin-page .primary-btn:active {
          transform: scale(0.98);
        }

        .signin-page .glass-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .signin-page .material-symbols-outlined {
          font-variation-settings: 
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
        }

        .signin-page .logo-box {
          background: #57c436;
          box-shadow: 0 8px 20px rgba(87,196,54,0.35);
        }
        `}
      </style>

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
          <main className="max-w-[420px] w-full mx-auto my-12">
            <h1 className="text-[#121713] text-4xl font-extrabold mb-3">
              Welcome Back 👋
            </h1>
            <p className="text-[#658670] text-base mb-8">
              Sign in to manage your kitchen operations seamlessly.
            </p>

            <form className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-[#121713]">
                  Email or Username
                </label>
                <input
                  className="form-input w-full rounded-xl h-14 p-4 mt-2"
                  placeholder="Enter your email"
                  type="text"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#121713]">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    className="form-input w-full rounded-xl h-14 p-4"
                    placeholder="Enter your password"
                    type="password"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#57c436] transition">
                    visibility
                  </span>
                </div>
              </div>

              <button
                className="primary-btn w-full h-14 rounded-xl text-black font-bold text-base"
                type="submit"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-[#658670] mt-8">
              Don’t have an account?
              <span className="text-[#57c436] font-bold ml-1 cursor-pointer hover:underline">
                Sign Up
              </span>
            </p>
          </main>

          <footer className="text-sm text-[#658670]">
            © 2024 Central Kitchen System
          </footer>
        </div>

        {/* Right Section */}
        <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1556910103-1c02745aae4d")',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent" />
          </div>

          <div className="absolute bottom-12 left-12 right-12 p-8 glass-card rounded-2xl text-white max-w-xl">
            <h3 className="text-2xl font-bold mb-3">
              Empowering 500+ franchise locations
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Integrated procurement, recipe control and inventory tracking
              system built for modern kitchen chains.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;