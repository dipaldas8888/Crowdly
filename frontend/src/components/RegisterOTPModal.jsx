import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, X, Loader2, RefreshCw } from "lucide-react";

export default function RegisterOTPModal({
  isOpen,
  onClose,
  registerData,
  onSuccess,
}) {
  const { setUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    let timer;
    if (isOpen && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;

    try {
      setLoading(true);
      setError("");

      const user = await apiRequest("/auth/verify-otp-register", {
        method: "POST",
        body: {
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          otp,
        },
      });

      toast.success("Registration successful! Welcome to Crowdly.");
      setUser(user);
      onSuccess();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError("");
      await apiRequest("/auth/send-otp", {
        method: "POST",
        body: { email: registerData.email },
      });
      toast.success("New OTP sent to your email!");
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200/80 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Verify Your Email</h3>
          <p className="text-xs text-slate-500 mt-1">
            We sent a 6-digit OTP code to{" "}
            <strong className="text-slate-800">{registerData.email}</strong>.
            Please enter it below to complete registration.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              6-Digit Verification Code *
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-slate-800 outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Didn't receive code?</span>
            {resendTimer > 0 ? (
              <span className="font-medium text-slate-400">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-teal-700/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Verify & Complete Sign Up</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
