'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiZap, FiCheckCircle, FiLoader, FiLogOut, FiArrowRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { Spotlight } from "@/components/ui/spotlight-new";

const apiurl = process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL

export default function ConnectPage() {
  const router = useRouter();
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasMetaTokens, setHasMetaTokens] = useState(false);

  // Check if user has Meta tokens
  useEffect(() => {
    if (user) {
      checkMetaTokens();
    }
  }, [user]);

  const checkMetaTokens = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${apiurl}/api/autopost/user/check-meta-tokens?user_id=${user.id}`);
      const data = await response.json();
      setHasMetaTokens(data.has_tokens || false);
    } catch (error) {
      console.error('Error checking Meta tokens:', error);
    }
  };

  // If not authenticated, will be redirected by AuthContext
  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FiLoader className="text-4xl animate-spin text-white" />
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FiLoader className="text-4xl animate-spin text-white" />
      </div>
    );
  }

  const handleMetaConnect = () => {
    if (!user?.id) {
      console.error('❌ No user ID available for Meta connection');
      return;
    }
    
    setLoading(true);
    
    // Store userId in cookie so callback can associate tokens with the right user
    document.cookie = `userId=${user.id}; path=/; max-age=3600`; // 1 hour expiry
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
      redirect_uri: process.env.NEXT_PUBLIC_META_REDIRECT_URI!,
      scope: [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'instagram_basic',
        'instagram_content_publish'
      ].join(','),
      response_type: 'code',
      state: user.id, // Include userId in state for additional verification
    });

    console.log('🚀 Initiating Meta OAuth for user:', user.id);
    window.location.href = `${process.env.NEXT_PUBLIC_META_OAUTH_URL}?${params.toString()}`;
  };


  // const handleLogout = async () => {
  //   try {
  //     await signOut();
  //     router.push('/auth/login');
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //   }
  // };

  return (
    <div className="min-h-screen text-white relative">
      {/* <Spotlight/> */}
      <div className="relative z-10">
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 py-4">
      {/* Logout button - top right */}
      {/* <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleLogout}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium z-20"
      >
        <FiLogOut className="w-4 h-4" />
        Logout
      </motion.button> */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-900 border border-gold text-gold mb-6"
          >
            <FiZap className="text-2xl" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-neutral-300 mb-4 tracking-tight"
          >
            Connect Meta
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 text-lg leading-relaxed font-light"
          >
            Connect your Meta (Facebook/Instagram) accounts to start posting
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-zinc-300 text-sm mt-3 font-medium"
          >
            Logged in as: <span className="font-semibold text-neutral-300">{user?.email}</span>
          </motion.p>
        </div>

        {/* Features Section */}
        <div className="space-y-4 mb-10">
          {[
            "Multi-platform posting",
            "Secure authentication",
            "One-click account linking"
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex items-center gap-4 group"
            >
              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-gold/30 flex items-center justify-center shrink-0 group-hover:border-gold transition-colors">
                <FiCheckCircle className="text-gold/60 group-hover:text-gold transition-colors text-sm" />
              </div>
              <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Meta Connection Status */}
        {hasMetaTokens && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 p-4 bg-gold/5 border border-gold/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-gold" />
              <div>
                <p className="text-gold font-medium">Meta Accounts Connected</p>
                <p className="text-gold-soft text-sm">You can now publish to Facebook and Instagram</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Meta Connection Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-4"
        >
          <button
            onClick={hasMetaTokens ? () => router.push('/autopost/dashboard') : handleMetaConnect}
            disabled={loading || !user?.id}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3 ${
              hasMetaTokens 
                ? 'bg-gold hover:bg-gold-soft text-black' 
                : 'bg-gold hover:bg-gold-soft text-black'
            } disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium shadow-[0_6px_28px_rgba(212,175,55,0.18)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)]`}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Connecting...
              </>
            ) : hasMetaTokens ? (
              <>
                <FiArrowRight className="w-5 h-5" />
                Go to Dashboard
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-2.457 1.429-3.8 3.779-3.8 1.059 0 1.971.078 2.236.112v2.594h-1.537c-1.203 0-1.435.572-1.435 1.41v1.844h2.879l-.375 3.667h-2.504v7.98H9.101Z" />
                </svg>
                Connect Meta Accounts
              </>
            )}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-zinc-600 font-medium uppercase tracking-widest"
        >
          Your data is secure
        </motion.p>
      </motion.div>
    </main>
    </div>
    </div>
  );
}
