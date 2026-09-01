import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import RegisterOTPModal from "../components/RegisterOTPModal";
import { apiRequest } from "../lib/api";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Heart,
  Clock,
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
      toast.success("Welcome back to Crowdly!");
      navigate("/home");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to sign in");
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
      await apiRequest("/auth/send-otp", {
        method: "POST",
        body: { email },
      });

      toast.success("Verification OTP sent to your email!");
      setShowRegisterOTPModal(true);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* ── Left Side: Brand & Interactive Visual Showcase (7 cols) ── */}
        <div className="lg:col-span-7 bg-slate-50/60 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 px-3 bg-[#0b1b2d] rounded-2xl flex items-center justify-center border border-slate-800/20 shadow-sm transition-all hover:scale-105">
              <img
                src="/logo.png"
                alt="Crowdly"
                className="h-7 w-auto object-contain"
              />
            </div>
          </div>

          {/* Center Graphic Showcase Collage */}
          <div className="my-10 lg:my-auto relative w-full max-w-lg mx-auto h-[380px] sm:h-[420px] flex items-center justify-center">
            {/* Floating Laughing Reaction Badge */}
            <div className="absolute top-4 left-8 sm:left-14 w-12 h-12 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center z-30 animate-bounce [animation-duration:3s]">
              <span className="text-2xl">😄</span>
            </div>

            {/* Floating Heart Reaction Badge */}
            <div className="absolute bottom-12 right-6 sm:right-12 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xl flex items-center justify-center z-30 animate-pulse">
              <Heart className="w-7 h-7 fill-white" />
            </div>

            {/* Back Photo Card */}
            <div className="absolute top-8 left-12 w-52 sm:w-60 h-64 sm:h-72 rounded-3xl overflow-hidden shadow-xl border-4 border-white transform -rotate-6 transition-transform hover:rotate-0 duration-300">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                alt="Feed photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md p-1.5 rounded-xl">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* Center Story Video Mockup Card */}
            <div className="absolute top-0 right-10 sm:right-16 w-56 sm:w-64 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10 transform rotate-3 transition-transform hover:rotate-0 duration-300">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
                alt="Story video"
                className="w-full h-full object-cover"
              />
              {/* Progress indicator */}
              <div className="absolute top-3 inset-x-3 flex gap-1">
                <div className="h-1 flex-1 bg-white rounded-full"></div>
                <div className="h-1 flex-1 bg-white/40 rounded-full"></div>
              </div>
              {/* Time Badge */}
              <div className="absolute top-6 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>16:45</span>
              </div>
            </div>

            {/* Foreground Post Ticket Card */}
            <div className="absolute bottom-4 left-16 sm:left-24 w-52 sm:w-60 h-52 sm:h-60 rounded-3xl bg-white p-3 shadow-2xl border border-slate-100 z-20 transform -rotate-3">
              <div className="w-full h-36 rounded-2xl overflow-hidden mb-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                  alt="Post preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5">
                <div className="h-2 w-3/4 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
              </div>
            </div>

            {/* Circular Overlapping Avatar Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-blue-500 p-1 shadow-2xl z-30 bg-white">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="User badge"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Bottom Bold Headline */}
          <div className="z-10 pt-4">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight">
              Explore <br />
              the <br />
              things <br />
              <span className="text-blue-600">you love.</span>
            </h1>
          </div>
        </div>

        {/* ── Right Side: Auth Form Panel (5 cols) ── */}
        <div className="lg:col-span-5 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-200/80">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {authMode === "signin" ? "Log in to Crowdly" : "Create a new account"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === "signin"
                  ? "Enter your credentials to access your account"
                  : "It's quick and easy to join the Crowdly community"}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            {authMode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email address or username
                  </label>
                  <input
                    type="email"
                    placeholder="Email address or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder-slate-400"
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

                {/* Primary Log in Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-full transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Log in</span>
                </button>

                {/* Forgotten Password Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Forgotten password?
                  </button>
                </div>

                {/* Divider Line */}
                <div className="my-6 border-t border-slate-200"></div>

                {/* Create New Account Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setError("");
                    }}
                    className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-full text-sm transition-all cursor-pointer"
                  >
                    Create new account
                  </button>
                </div>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUpInit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email address *
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    New password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password (min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder-slate-400"
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

                {/* Primary Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-full transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Sign Up & Send OTP</span>
                </button>

                {/* Divider Line */}
                <div className="my-6 border-t border-slate-200"></div>

                {/* Back to Login Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setError("");
                    }}
                    className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-full text-sm transition-all cursor-pointer"
                  >
                    Already have an account? Log in
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Meta Branding */}
            <div className="pt-6 text-center text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Crowdly</span>
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
