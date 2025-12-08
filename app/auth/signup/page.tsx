"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import { PasswordInput } from "@/components/ui/password-input";
import AnimatedHouse from "@/components/ui/AnimatedHouse";
import { useRouter } from "next/navigation";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const { user, isLoading: authLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Name validation
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters long');
            return;
        }

        if (!/^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(name.trim())) {
            setError('Name can only contain letters and spaces, and must start with a letter');
            return;
        }

        const nameWords = name.trim().split(' ').filter(word => word.length > 0);
        if (nameWords.length < 2) {
            setError('Please enter your full name (first and last name)');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
                data: {
                    full_name: name,
                    email: email,
                    avatar_url: null
                }
            }
        });

        if (signupError) {
            // Check if error is due to email already existing
            if (signupError.message.toLowerCase().includes('already registered') || 
                signupError.message.toLowerCase().includes('user already exists') ||
                signupError.message.toLowerCase().includes('email already')) {
                setError('This account already exists. Please sign in with your email instead.');
            } else {
                setError(signupError.message);
            }
            setIsLoading(false);
            return;
        }

        // Check if signup was successful but user needs verification
        if (data.user && !data.user.confirmed_at) {
            // User created but not confirmed yet
            localStorage.setItem('signupEmail', email);
            router.push('/auth/verify');
        } else if (data.user && data.user.confirmed_at) {
            // User already existed - show error
            setError('This account already exists. Please sign in with your email instead.');
        }
        
        setIsLoading(false);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full bg-black antialiased flex items-center justify-center p-3">
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
                                Welcome to RealtyGenie
                            </h1>
                            <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
                                Join thousands of realtors who are automating their lead generation and closing more deals.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right side - Auth UI */}
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
                            Welcome to RealtyGenie
                        </h1>
                        <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
                            Join thousands of realtors who are automating their lead generation and closing more deals.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-[#1A1A1A] p-8 rounded-xl"
                    >
                        <form onSubmit={handleSignup} className="flex flex-col gap-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-[#737373] text-sm mb-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#111111] border border-[#2D2D2D] rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                                    required
                                    placeholder="John Doe"
                                    pattern="[a-zA-Z ]+"
                                    title="Please enter a valid full name (letters and spaces only)"
                                    minLength={2}
                                />
                                {error && error.includes('name') && (
                                    <p className="text-red-500 text-xs mt-1">{error}</p>
                                )}
                            </div>

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

                            <PasswordInput
                                id="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={error && error.includes('Password') ? error : undefined}
                            />

                            <PasswordInput
                                id="confirmPassword"
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                showToggle={false}
                                error={error && error.includes('match') ? error : undefined}
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 px-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-[#737373] hover:text-[var(--color-gold)] transition-colors text-sm"
                                >
                                    Already have an account? Sign in
                                </Link>
                            </div>

                            <div className="relative ">
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
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: "google",
                                        options: {
                                            redirectTo: `${location.origin}/auth/callback`,
                                        },
                                    });
                                    if (error) setError(error.message);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-neutral-100 text-black font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FcGoogle className="w-5 h-5" />
                                Continue with Google
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: "twitter",
                                        options: {
                                            redirectTo: `${location.origin}/auth/callback`,
                                        },
                                    });
                                    if (error) setError(error.message);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#1DA1F2]/30 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FaTwitter className="w-5 h-5" />
                                Continue with Twitter
                            </button>

                            {/* <button
                                type="button"
                                onClick={async () => {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: "facebook",
                                        options: {
                                            redirectTo: `${location.origin}/auth/callback`,
                                        },
                                    });
                                    if (error) setError(error.message);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#1877F2]/30 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FaFacebook className="w-5 h-5" />
                                Continue with Facebook
                            </button> */}
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </div>

    );
}
