import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import RegisterOTPModal from "../components/RegisterOTPModal";
import { apiRequest } from "../lib/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
  Sparkles,
  Layers,
  Activity,
  TrendingUp,
} from "lucide-react";

export default function LoginPage({ defaultAuthMode = "signin" }) {
  const [authMode, setAuthMode] = useState(defaultAuthMode); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterOTPModal, setShowRegisterOTPModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login({ email, password });
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpInit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setError("");
      // Send OTP to email first
      await apiRequest("/auth/send-otp", {
        method: "POST",
        body: { email },
      });

      setShowRegisterOTPModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans antialiased">
      {/* Outer Rounded Container Matching Screenshot Layout */}
      <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden max-w-5xl w-full border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Column: Form Section (7 Columns) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Crowdly
            </span>
          </div>

          {/* Center Form Container */}
          <div className="max-w-md w-full mx-auto space-y-5">
            {/* Header Text */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome to Crowdly
              </h2>
              <p className="text-xs text-slate-400">
                Start your experience with Crowdly by signing in or signing up.
              </p>
            </div>

            {/* Segmented Switcher Pill Bar */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            {authMode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-700">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-800 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-teal-700/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Sign In</span>
                </button>

                {/* Social Login Buttons */}
                <div className="pt-2 text-center space-y-3">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-slate-400">
                      Or continue with
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700 font-bold text-xs"
                      title="Google Login"
                    >
                      G
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700 font-bold text-xs"
                      title="Apple Login"
                    >
                      
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700 font-bold text-xs"
                      title="Facebook Login"
                    >
                      f
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-700 font-bold text-xs"
                      title="X Login"
                    >
                      𝕏
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUpInit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-800 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-teal-700/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Continue to Verification</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer Text */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
            Copyright : Crowdly, All Right Reserved |{" "}
            <a href="#" className="hover:underline text-slate-500">
              Term & Condition
            </a>{" "}
            |{" "}
            <a href="#" className="hover:underline text-slate-500">
              Privacy & Policy
            </a>
          </div>
        </div>

        {/* Right Column: Hero Showcase Container (5 Columns) */}
        <div className="md:col-span-5 bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Tech Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

          {/* Floating Glassmorphism Preview Cards */}
          <div className="relative z-10 space-y-3 pt-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-xl space-y-2 max-w-xs ml-auto">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-teal-200">Community Stats</span>
                <span className="text-teal-400">Live</span>
              </div>
              <div className="text-lg font-bold text-white">$17,366.00</div>
              <div className="text-[10px] text-teal-300/80">Active User Engagement +12.8%</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-xl space-y-2 max-w-xs mr-auto">
              <div className="flex items-center gap-2 text-xs">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Future Growth</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[82%]"></div>
              </div>
            </div>
          </div>

          {/* Center Bottom Brand & Text Content */}
          <div className="relative z-10 space-y-4 pt-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 backdrop-blur-md flex items-center justify-center text-teal-300 shadow-lg">
              <Layers className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                A Unified Hub for Smarter Social Connections
              </h3>
              <p className="text-xs text-teal-100/70 leading-relaxed">
                Crowdly empowers you with a unified social command center—delivering deep insights and a 360° view of your entire community.
              </p>
            </div>

            {/* Carousel Pagination Dots */}
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1.5 w-12 bg-white rounded-full"></div>
              <div className="h-1.5 w-3 bg-white/30 rounded-full"></div>
              <div className="h-1.5 w-3 bg-white/30 rounded-full"></div>
              <div className="h-1.5 w-3 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />

      {/* Registration Email OTP Verification Modal */}
      <RegisterOTPModal
        isOpen={showRegisterOTPModal}
        onClose={() => setShowRegisterOTPModal(false)}
        registerData={{ username, email, password }}
        onSuccess={() => {
          setShowRegisterOTPModal(false);
          navigate("/home");
        }}
      />
    </div>
  );
}
