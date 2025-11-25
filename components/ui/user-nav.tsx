'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-black font-medium">
          {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
        </div>
        <span className="text-white">
          {user.user_metadata?.full_name || user.email}
        </span>
      </div>

      <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] rounded-lg shadow-lg py-1 border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
        <div className="px-4 py-2 border-b border-white/10">
          <p className="text-sm text-white font-medium truncate">
            {user.user_metadata?.full_name}
          </p>
          <p className="text-xs text-[#737373] truncate">{user.email}</p>
        </div>
        
        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
        >
          <User size={16} />
          Profile
        </Link>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-white/5 transition-colors w-full text-left"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}