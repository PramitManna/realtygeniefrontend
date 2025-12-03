'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInstagram, FiRefreshCw } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

interface ConnectionStatusProps {
  userId: string;
}

interface PageInfo {
  pageId: string;
  pageName: string;
  igBusinessId?: string;
  igUsername?: string;
}

export function ConnectionStatus({ userId }: ConnectionStatusProps) {
  const [activePage, setActivePage] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPages, setHasPages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fetchingRef = useRef(false);

  const fetchConnectionStatus = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      console.log('🔄 Skipping duplicate ConnectionStatus fetch');
      return;
    }
    
    fetchingRef.current = true;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/autopost/user/pages?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      if (response.ok) {
        const data = await response.json();
        console.log('Connection status data:', data); // Debug log
        
        if (data.pages && data.pages.length > 0) {
          setHasPages(true);
          // Find the active page
          const active = data.pages.find((p: PageInfo & { isActive?: boolean }) => p.isActive);
          setActivePage(active || data.pages[0] || null);
        } else {
          setHasPages(false);
          setActivePage(null);
        }
      } else {
        console.error('Failed to fetch pages:', response.status);
        setHasPages(false);
        setActivePage(null);
      }
    } catch (error) {
      console.error('Failed to fetch connection status:', error);
      setHasPages(false);
      setActivePage(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      // Reset flag after a short delay
      setTimeout(() => {
        fetchingRef.current = false;
      }, 500);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConnectionStatus();
    }
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConnectionStatus();
  };

  if (loading) {
    return null;
  }

  // If no pages at all, show connect Meta accounts message
  if (!hasPages || !activePage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 p-4 bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/30 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
        style={{
          background: 'rgba(24, 24, 27, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        <div className="flex items-start gap-3">
          <FiAlertCircle className="text-gold mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-white font-medium mb-1">No Facebook Page Connected</p>
            <p className="text-zinc-300 text-sm">Please connect your Meta accounts to start posting.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Check actual connection status
  const hasFacebook = !!activePage.pageId && !!activePage.pageName;
  const hasInstagram = !!activePage.igBusinessId && !!activePage.igUsername;
  const fullyConnected = hasFacebook && hasInstagram;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`mb-6 p-4 rounded-xl border border-zinc-700/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]`}
      style={{
        background: 'rgba(24, 24, 27, 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div className="flex items-start gap-3">
        {fullyConnected ? (
          <FiCheckCircle className="text-gold mt-0.5 shrink-0" />
        ) : (
          <FiAlertCircle className="text-gold mt-0.5 shrink-0" />
        )}
        <div className="flex-1">
          <p className="font-medium mb-2 text-white">
            {fullyConnected ? 'Fully Connected' : 'Partial Connection'}
          </p>
          
          <div className="space-y-2">
            {/* Facebook Status */}
            <div className="flex items-center gap-2">
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                  hasFacebook
                    ? 'border-blue-400/30 text-blue-300'
                    : 'border-zinc-700/50 text-zinc-400'
                }`}
                style={{
                  background: hasFacebook ? 'rgba(37, 99, 235, 0.15)' : 'rgba(39, 39, 42, 0.5)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <FaFacebook className="text-sm" />
                <span className="text-xs font-medium">
                  {hasFacebook ? activePage.pageName : 'Not Connected'}
                </span>
                {hasFacebook && <FiCheckCircle className="text-xs" />}
              </div>
            </div>

            {/* Instagram Status */}
            <div className="flex items-center gap-2">
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                  hasInstagram
                    ? 'border-pink-400/30 text-pink-300'
                    : 'border-zinc-700/50 text-zinc-400'
                }`}
                style={{
                  background: hasInstagram ? 'rgba(219, 39, 119, 0.15)' : 'rgba(39, 39, 42, 0.5)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <FiInstagram className="text-sm" />
                <span className="text-xs font-medium">
                  {hasInstagram ? `@${activePage.igUsername}` : 'Not Connected'}
                </span>
                {hasInstagram && <FiCheckCircle className="text-xs" />}
              </div>
            </div>
          </div>

          {!fullyConnected && hasFacebook && !hasInstagram && (
            <>
              <p className="text-zinc-300 text-xs mt-3 mb-2">
                Connect Instagram to your Facebook Page: Go to your Facebook Page settings → Instagram → Connect Account. Then reconnect below.
              </p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gold rounded-md hover:bg-gold/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 border border-gold/20"
                  style={{
                    background: 'rgba(39, 39, 42, 0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                >
                  <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Refreshing...' : 'Refresh Status'}
                </button>
                <a
                  href="/connect"
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-gold hover:bg-gold-soft text-black rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  Reconnect Meta
                </a>
              </div>
            </>
          )}
          {!fullyConnected && !hasFacebook && (
            <p className="text-zinc-300 text-xs mt-3">
              Connect a Facebook Page to continue.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
