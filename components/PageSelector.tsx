'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiInstagram, FiLoader } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

interface Page {
  pageId: string;
  pageName: string;
  category?: string;
  tasks?: string[];
  igBusinessId?: string;
  igUsername?: string;
  isActive: boolean;
}

interface PageSelectorProps {
  userId: string;
  onPageChange?: (pageId: string) => void;
}

export function PageSelector({ userId, onPageChange }: PageSelectorProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    fetchPages();
  }, [userId]);

  const fetchPages = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      console.log('🔄 Skipping duplicate PageSelector fetch');
      return;
    }
    
    fetchingRef.current = true;
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/autopost/user/pages?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      setPages(data.pages || []);
      setActivePageId(data.activePageId);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError('Failed to load pages');
    } finally {
      setLoading(false);
      // Reset flag after a short delay
      setTimeout(() => {
        fetchingRef.current = false;
      }, 500);
    }
  };

  const handlePageSelect = async (pageId: string) => {
    if (pageId === activePageId || switching) return;

    try {
      setSwitching(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/autopost/user/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch page');
      }

      const data = await response.json();
      setActivePageId(data.activePageId);
      setPages(pages.map(p => ({ ...p, isActive: p.pageId === pageId })));

      if (onPageChange) {
        onPageChange(pageId);
      }
    } catch (err) {
      console.error('Error switching page:', err);
      setError('Failed to switch page');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-zinc-900/30 backdrop-blur-sm rounded-lg border border-gold/20" style={{
        background: 'rgba(24, 24, 27, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}>
        <div className="flex items-center justify-center gap-3">
          <FiLoader className="animate-spin text-gold" />
          <span className="text-zinc-300 text-sm">Loading pages...</span>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return null; // Don't show if no pages
  }

  if (pages.length === 1) {
    // Show info card for single page
    const page = pages[0];
    return (
      <div className="p-4 bg-gold/5 border border-gold/30 rounded-lg backdrop-blur-sm" style={{
        background: 'rgba(212, 175, 55, 0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}>
        <div className="flex items-start gap-3">
          <FaFacebook className="text-gold text-xl mt-0.5" />
          <div className="flex-1">
            <h4 className="text-gold font-medium">{page.pageName}</h4>
            <p className="text-gold-soft text-sm mt-1">
              {page.category || 'Facebook Page'}
            </p>
            {page.igUsername && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gold-soft">
                <FiInstagram />
                <span>@{page.igUsername}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Select Page for Posting
        </h3>
        <p className="text-sm text-zinc-400">
          Choose which page you want to publish to
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-3">
        <AnimatePresence>
          {pages.map((page) => (
            <motion.button
              key={page.pageId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => handlePageSelect(page.pageId)}
              disabled={switching}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left backdrop-blur-sm
                ${
                  page.isActive
                    ? 'border-gold/50 bg-gold/10'
                    : 'border-zinc-700 bg-zinc-900/30 hover:border-gold/30'
                }
                ${switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                background: page.isActive ? 'rgba(212, 175, 55, 0.1)' : 'rgba(24, 24, 27, 0.3)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <FaFacebook className={`text-xl mt-0.5 ${page.isActive ? 'text-gold' : 'text-zinc-500'}`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${page.isActive ? 'text-gold' : 'text-white'}`}>
                      {page.pageName}
                    </h4>
                    <p className={`text-sm mt-1 ${page.isActive ? 'text-gold-soft' : 'text-zinc-400'}`}>
                      {page.category || 'Facebook Page'}
                    </p>
                    {page.igUsername && (
                      <div className={`flex items-center gap-2 mt-2 text-sm ${page.isActive ? 'text-gold-soft' : 'text-zinc-400'}`}>
                        <FiInstagram />
                        <span>@{page.igUsername}</span>
                      </div>
                    )}
                  </div>
                </div>
                {page.isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-gold text-black"
                  >
                    <FiCheck className="text-sm" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
