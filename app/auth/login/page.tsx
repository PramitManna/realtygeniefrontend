"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AnimatedHouse from "@/components/ui/AnimatedHouse";
import { createClient } from "@/utils/supabase/client";
import { Twitter, Facebook, ChevronLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaTwitter, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";



function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { user, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            const redirectTo = searchParams.get('redirect') || '/';
            router.push(redirectTo);
        }
    }, [user, authLoading, searchParams, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError(loginError.message);
            setIsLoading(false);
            return;
        }

        // Redirect to the original page or dashboard
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
        router.refresh();
    };

    return (
        <div className="min-h-screen w-full bg-black antialiased flex items-center justify-center p-4">
            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-900/50 rounded-lg transition-all duration-200"
            >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>

            <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8 items-center">
                {/* Left side - Animation and Text */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex flex-col items-center justify-center"
                >
                    <div className="w-full max-w-md">
                        <div className="w-[300px] h-[300px] mx-auto relative">
                            <AnimatedHouse />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center mt-8"
                        >
                            <h1 className="text-4xl md:text-5xl font-[var(--font-heading)] text-white mb-4 leading-tight">
                                Welcome Back
                            </h1>
                            <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
                                Sign in to access your dashboard and continue automating your realtor outreach.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right side - Login UI */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Mobile Welcome Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center mb-8 lg:hidden"
                    >
                        <h1 className="text-4xl font-[var(--font-heading)] text-white mb-4 leading-tight">
                            Welcome Back
                        </h1>
                        <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
                            Sign in to access your dashboard and continue automating your realtor outreach.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-[#1A1A1A] p-8 rounded-xl"
                    >
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-[#737373] text-sm mb-1"
                                >
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#111111] border border-[#2D2D2D] rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-[#737373] text-sm mb-1"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#111111] border border-[#2D2D2D] rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                                    required
                                    placeholder="••••••••"
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 px-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </button>

                            <div className="flex items-center justify-between text-sm mt-2">
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-[#737373] hover:text-[var(--color-gold)] transition-colors"
                                >
                                    Forgot password?
                                </Link>

                                <Link
                                    href="/auth/signup"
                                    className="text-[var(--color-gold)] hover:text-[var(--color-gold-soft)] transition-colors"
                                >
                                    Create account
                                </Link>
                            </div>

                            <Link
                                href="/auth/otp"
                                className="w-full text-center py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors text-sm mt-3"
                            >
                                Use OTP Login Instead
                            </Link>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#2D2D2D]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#1A1A1A] px-2 text-[#737373]">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                const redirectTo = searchParams.get('redirect') || '/';
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: "google",
                                    options: {
                                        redirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
                                    },
                                });
                                if (error) setError(error.message);
                            }}
                            className="w-full my-2 flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-neutral-100 text-black font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FcGoogle className="w-5 h-5" />
                            Continue with Google
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                const redirectTo = searchParams.get('redirect') || '/';
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: "twitter",
                                    options: {
                                        redirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
                                    },
                                });
                                if (error) setError(error.message);
                            }}
                            className="w-full my-2 flex items-center justify-center gap-2 py-2 px-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#1DA1F2]/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaTwitter className="w-5 h-5" />
                            Continue with Twitter
                        </button>

                        {/* <button
                            type="button"
                            onClick={async () => {
                                const redirectTo = searchParams.get('redirect') || '/';
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: "facebook",
                                    options: {
                                        redirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
                                    },
                                });
                                if (error) setError(error.message);
                            }}
                            className="w-full my-2 flex items-center justify-center gap-2 py-2 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#1877F2]/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaFacebook className="w-5 h-5" />
                            Continue with Facebook
                        </button> */}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full bg-black flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
