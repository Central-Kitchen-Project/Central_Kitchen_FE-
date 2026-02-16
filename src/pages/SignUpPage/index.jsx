import React from 'react'
import "./SignUp.css"
function SignUp() {
  return (
    <>
    
   <div className="signup-page flex flex-col lg:flex-row min-h-screen w-full">
  {/* Left Section: Form */}
  <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 xl:p-24 bg-white  z-10">
    {/* Logo */}
    <div className="flex items-center gap-3 mb-12">
      <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="text-[#131712]  text-xl font-bold leading-tight tracking-tight">
        Central Kitchen
      </h2>
    </div>
    {/* Header */}
    <div className="mb-10">
      <h1 className="text-[#131712]  text-4xl font-extrabold tracking-tight mb-3">
        Create Your Account
      </h1>
      <p className="text-[#6e8268]  text-lg">
        Join the food franchise management system
      </p>
    </div>
    {/* Form */}
    <form className="space-y-5 max-w-md">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-[#131712] text-sm font-semibold">
          Full Name
        </label>
        <div className="relative">
          <input
            className="w-full rounded-xl border-[#dfe4dd]  bg-white  h-14 px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="Enter your full name"
            type="text"
          />
        </div>
      </div>
      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-[#131712]  text-sm font-semibold">
          Email Address
        </label>
        <div className="relative">
          <input
            className="w-full rounded-xl border-[#dfe4dd]  bg-white  h-14 px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="work@company.com"
            type="email"
          />
        </div>
      </div>
      {/* Role Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[#131712]  text-sm font-semibold">
          Organization Role
        </label>
        <select className="w-full rounded-xl border-[#dfe4dd]  bg-white  h-14 px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer">
          <option disabled="" selected="" value="">
            Select your role
          </option>
          <option value="kitchen_manager">Kitchen Manager</option>
          <option value="franchise_owner">Franchise Owner</option>
          <option value="store_staff">Store Staff</option>
          <option value="logistics">Logistics Coordinator</option>
        </select>
      </div>
      {/* Passwords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[#131712]  text-sm font-semibold">
            Password
          </label>
          <input
            className="w-full rounded-xl border-[#dfe4dd]  bg-white  h-14 px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="••••••••"
            type="password"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[#131712]  text-sm font-semibold">
            Confirm Password
          </label>
          <input
            className="w-full rounded-xl border-[#dfe4dd] bg-white h-14 px-4 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="••••••••"
            type="password"
          />
        </div>
      </div>
      {/* Terms */}
      <div className="flex items-start gap-3 py-2">
        <input
          className="mt-1 rounded border-[#dfe4dd] text-primary focus:ring-primary size-5"
          id="terms"
          type="checkbox"
        />
        <label
          className="text-sm text-[#6e8268]  leading-relaxed"
          htmlFor="terms"
        >
          I agree to the{" "}
          <a className="text-primary font-bold hover:underline" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-primary font-bold hover:underline" href="#">
            Privacy Policy
          </a>
          .
        </label>
      </div>
      {/* Action Button */}
      <button
        className="w-full bg-primary hover:bg-[#4ab42d] text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
        type="submit"
      >
        <span>Sign Up</span>
        <span className="material-symbols-outlined text-xl">arrow_forward</span>
      </button>
      {/* Footer Link */}
      <p className="text-center text-[#6e8268]  mt-8 text-sm">
        Already have an account?
        <a className="text-primary font-bold hover:underline ml-1" href="#">
          Sign In
        </a>
      </p>
    </form>
  </div>
  {/* Right Section: Visual Content */}
  <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#fafaf9]">
    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    {/* Hero Image Background */}
    <div
      className="absolute inset-0 w-full h-full bg-center bg-cover transition-transform duration-[20s] hover:scale-110"
      data-alt="Professional chefs plating gourmet dishes in a high-end commercial kitchen"
      style={{
        backgroundImage:
          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXlmxXHfWiRt3tKkmdl-zFZamJJPZT6vvU6I-UjMt763rxA2XzauXzesHsVDdJnDYS_PZpTSFoRE-xGyFJtvnNrXzF0PTO_e_a6WHwEKFA7RkDlKLa3RLdpUOhBE3HBDU2XXTrZ79Iyk31PwPd7EXeJH70ssLwdKYDDxdRD1Uf4LHmyGkCaCr7DA-DtKtO0dyBHV2bHFAQJoWdy80iA6fW3ugmZDQaB9mGkQzrSA-HObJfJdtR5lptoAR8l5mO-B9pUQBLzbFhT_M")'
      }}
    ></div>
    {/* Content Overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-16 z-20 text-white">
      <div className="max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            <span className="material-symbols-outlined text-primary text-2xl">
              star
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">
              star
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">
              star
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">
              star
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">
              star
            </span>
          </div>
        </div>
        <blockquote className="text-2xl font-medium leading-tight mb-6 italic">
          "The transition to this system reduced our food waste by 30% across
          all 15 locations in the first quarter."
        </blockquote>
        <div className="flex items-center gap-4">
          <div
            className="size-12 rounded-full border-2 border-white/20 bg-cover bg-center"
            data-alt="Portrait of a professional kitchen manager"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAjkx1g2z7P1VbsUYI6NcF83A6LcN0M8ULtlkusN6u5ewk5yKDABl8FpwdMm7XXp-VeeBKrSj_XhSeG5C97Cb9hnnRr6DOQ7gTBo-2C85MMR3eVZ81N2PPszgWBwDKfP00vto8sCLlCe6G0raZwkgIeBGB31E8Wln4gY0YNPagPQjUcp3uqvvQ8HPNxj9znF0KDn_8D6r5ywdXVWuJRPHG3iY4MP2b0MQISUIhQJGARVMx24k_NQysgdOK8PkmozFMEnGU2SspAoPM")'
            }}
          />
          <div>
            <p className="font-bold text-lg">Marco Rossi</p>
            <p className="text-white/70 text-sm">
              Executive Chef, Artisan Group
            </p>
          </div>
        </div>
      </div>
    </div>
    {/* Decorative Elements */}
    <div className="absolute top-8 right-8 z-20">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 shadow-2xl">
        <div className="bg-primary/20 p-2 rounded-lg">
          <span className="material-symbols-outlined text-primary">
            analytics
          </span>
        </div>
        <div>
          <p className="text-white text-xs font-semibold uppercase tracking-wider">
            Live Inventory
          </p>
          <p className="text-white text-sm font-bold">98.4% Efficiency</p>
        </div>
      </div>
    </div>
  </div>
</div>
</>
  )
}

export default SignUp