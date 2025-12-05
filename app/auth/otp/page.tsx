"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedHouse from "@/components/ui/AnimatedHouse";

export default function OTPLogin() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (!user || userError) {
        setError("No account found with this email. Please sign up first.");
        setLoading(false);
        return;
      }

      // Send OTP via Supabase with specific configuration for OTP only
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: undefined,
        },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setSuccess("OTP sent to your email!");
        setStep("otp");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError) {
        setError("Invalid OTP. Please try again.");
      } else {
        setSuccess("Login successful! Redirecting...");
        // User is now authenticated, redirect based on onboarding status
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black antialiased flex items-center justify-center p-4">
      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Animation and Text */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <div className="w-[300px] h-[300px] mx-auto relative">
              <AnimatedHouse />
            </div>
            <div className="text-center mt-8">
              <h1 className="text-4xl md:text-5xl font-[var(--font-heading)] text-white mb-4 leading-tight">
                Secure Login
              </h1>
              <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
                Enter the OTP sent to your email to access your dashboard securely.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - OTP UI */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Welcome Text */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-4xl font-[var(--font-heading)] text-white mb-4 leading-tight">
              Secure Login
            </h1>
            <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
              Enter the OTP sent to your email to access your dashboard securely.
            </p>
          </div>

          <div className="bg-[#1A1A1A] p-8 rounded-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                <Mail className="w-8 h-8 text-[var(--color-gold)]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">OTP Login</h1>
              <p className="text-gray-400 text-sm">
                Secure login with one-time password
              </p>
            </div>

            {/* Email Step */}
            {step === "email" && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#111111] text-gray-500">Or</span>
                </div>
              </div>

              <Link
                href="/auth/login"
                className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Use Password Login
              </Link>
            </motion.form>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
                We've sent a 6-digit OTP to <strong>{email}</strong>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Enter OTP
                </label>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const newOtp = otp.split("");
                        newOtp[index] = e.target.value.replace(/\D/g, "");
                        setOtp(newOtp.join("").slice(0, 6));

                        // Auto-focus next input
                        if (e.target.value && index < 5) {
                          const nextInput = document.querySelector(
                            `input[data-otp-index="${index + 1}"]`
                          ) as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          const prevInput = document.querySelector(
                            `input[data-otp-index="${index - 1}"]`
                          ) as HTMLInputElement;
                          prevInput?.focus();
                        }
                      }}
                      data-otp-index={index}
                      className="w-12 h-14 text-center text-2xl font-bold bg-[#1a1a1a] border-2 border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)] transition-all duration-200 hover:border-neutral-600"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full px-4 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Email
              </button>
            </motion.form>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-[var(--color-gold)] hover:text-[var(--color-gold-soft)] transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
