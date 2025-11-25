'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import AnimatedHouse from '@/components/ui/AnimatedHouse';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting');
  const [message, setMessage] = useState('Please check your email for a verification link.');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from localStorage
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('signupEmail') || '';
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    async function verifyEmail() {
      try {
        // Check if this is a redirect from email verification
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (token && type === 'signup') {
          setVerificationStatus('loading');
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });

          if (error) {
            setVerificationStatus('error');
            setMessage('Failed to verify email. Please try again or contact support.');
            return;
          }

          setVerificationStatus('success');
          setMessage('Email verified successfully! Redirecting to onboarding...');
          // Redirect to onboarding after 2 seconds
          setTimeout(() => router.push('/onboarding'), 2000);
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    }

    verifyEmail();
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-screen w-full bg-black antialiased flex items-center justify-center p-4">
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
                {verificationStatus === 'success' ? 'Email Verified!' : 'Almost There!'}
              </h1>
              <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
                {verificationStatus === 'success'
                  ? 'Your email has been verified. Get ready to start automating your real estate outreach.'
                  : 'Verify your email to complete your registration and start using RealtyGenie.'}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Verification UI */}
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
              {verificationStatus === 'success' ? 'Email Verified!' : 'Almost There!'}
            </h1>
            <p className="text-neutral-400 font-[var(--font-body)] leading-relaxed max-w-sm mx-auto">
              {verificationStatus === 'success'
                ? 'Your email has been verified.'
                : 'Verify your email to complete registration.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#1A1A1A] p-8 rounded-xl space-y-6"
          >
            {/* Status Icon */}
            <div className="flex justify-center">
              {verificationStatus === 'loading' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 border-4 border-[var(--color-gold)] border-t-transparent rounded-full"
                />
              )}
              {verificationStatus === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-[var(--color-gold)]" />
                </motion.div>
              )}
              {verificationStatus === 'error' && (
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
              {verificationStatus === 'waiting' && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center"
                >
                  <Mail className="w-10 h-10 text-[var(--color-gold)]" />
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">
                {verificationStatus === 'success' && 'Email Verified!'}
                {verificationStatus === 'loading' && 'Verifying Email...'}
                {verificationStatus === 'error' && 'Verification Failed'}
                {verificationStatus === 'waiting' && 'Verify Your Email'}
              </h2>
              <p className="text-gray-400">{message}</p>
              {(verificationStatus === 'waiting' || verificationStatus === 'error') && email && (
                <p className="text-[var(--color-gold)] font-medium break-all">{email}</p>
              )}
            </div>

            {/* Instructions */}
            {verificationStatus === 'waiting' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  What's next?
                </h3>
                <ol className="text-blue-400 text-sm space-y-2 ml-7">
                  <li className="list-decimal">Check your email inbox</li>
                  <li className="list-decimal">Click the verification link</li>
                  <li className="list-decimal">Complete your onboarding</li>
                </ol>
              </div>
            )}

            {/* Help text */}
            {verificationStatus === 'waiting' && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">
                  Didn't receive the email? Check your spam folder or try signing up again.
                </p>
              </div>
            )}

            {/* Buttons */}
            {verificationStatus === 'error' && (
              <div className="flex flex-col gap-4">
                <Link
                  href="/auth/signup"
                  className="w-full py-3 px-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-medium rounded-lg transition-colors"
                >
                  Try Again
                </Link>
                <Link
                  href="/auth/login"
                  className="text-gray-400 hover:text-[var(--color-gold)] transition-colors text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            )}

            {verificationStatus === 'waiting' && (
              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign Up
              </Link>
            )}

            {/* Sign in link */}
            {verificationStatus !== 'success' && (
              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-[var(--color-gold)] hover:text-[var(--color-gold-soft)] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
