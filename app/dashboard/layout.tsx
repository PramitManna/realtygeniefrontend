"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight-new";
import {
  Users,
  Mail,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Upload,
  Zap,
  Menu,
  X,
  Bell,
  Search,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ size: number }>;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Overview", icon: Home, href: "/dashboard" },
  { name: "Leads", icon: Users, href: "/dashboard/leads" },
  { name: "Batches", icon: Layers, href: "/dashboard/batches" },
  { name: "Campaigns", icon: Mail, href: "/dashboard/campaigns" },
  { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { name: "Automations", icon: Zap, href: "/dashboard/automations" },
  { name: "Imports", icon: Upload, href: "/dashboard/imports" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/dashboard");
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Spotlight
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)"
      />
      <div className="relative z-10">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A] border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="text-[var(--color-gold)] font-bold">RealtyGenie</div>
        <div className="w-8" />
      </div>

      {/* Sidebar - Fixed with hover expand/collapse, no page shift */}
      <motion.div
        initial={false}
        animate={{ width: sidebarHovered ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onHoverStart={() => setSidebarHovered(true)}
        onHoverEnd={() => setSidebarHovered(false)}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-[#0A0A0A] border-r border-neutral-800 flex-col overflow-hidden z-50"
      >
        {/* Logo Section */}
        <Link href={'/'} className="h-20 flex items-center justify-center px-4 border-b border-neutral-800">
          <img
            src="https://assets.aceternity.com/logo-dark.png"
            alt="logo"
            width={30}
            height={30}
            className="flex-shrink-0"
          />
          <motion.div
            animate={{ opacity: sidebarHovered ? 1 : 0, width: sidebarHovered ? "auto" : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-3"
          >
            <div className="text-sm font-bold text-[var(--color-gold)] whitespace-nowrap">
              RealtyGenie
            </div>
          </motion.div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all group cursor-pointer ${
                    active
                      ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <motion.span
                    animate={{
                      opacity: sidebarHovered ? 1 : 0,
                      width: sidebarHovered ? "auto" : 0,
                    }}
                    transition={{ duration: 0.1 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>

                  {item.badge && sidebarHovered && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 w-1 h-6 bg-[var(--color-gold)] rounded-l-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-neutral-800 p-4 space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-soft)] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold">
                {(user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)).toUpperCase()}
              </span>
            </div>
            <motion.div
              animate={{
                opacity: sidebarHovered ? 1 : 0,
                width: sidebarHovered ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex-1"
            >
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-neutral-500">Pro Plan</p>
            </motion.div>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ backgroundColor: "rgba(212, 175, 55, 0.1)" }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-red-400 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} />
            <motion.span
              animate={{
                opacity: sidebarHovered ? 1 : 0,
                width: sidebarHovered ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              Logout
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* Blur Overlay - Removed since content shifts with sidebar */}

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed inset-0 z-30 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div className="relative w-64 h-full bg-[#0A0A0A] border-r border-neutral-800 flex flex-col pt-20">
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                        active
                          ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-neutral-800 p-4">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-red-400 rounded-lg transition-colors text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Blur Overlay - Only visible when sidebar is hovered */}
      <motion.div
        initial={false}
        animate={{
          opacity: sidebarHovered ? 1 : 0,
          pointerEvents: sidebarHovered ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        onClick={() => setSidebarHovered(false)}
        className="hidden lg:block fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />

      {/* Main Content - Sticks to sidebar at 80px margin */}
      <div className="lg:ml-20">
        {/* Top Bar - Unified header with search */}
        <div className="hidden lg:flex h-20 bg-[#0A0A0A] border-b border-neutral-800 items-center justify-between px-8 gap-8 sticky top-0 z-20">
          {/* Left: Title & Welcome */}
          <div className="flex-shrink-0 min-w-max">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-neutral-400 text-xs -mt-1">
              Welcome back,{" "}
              <span className="text-[var(--color-gold)]">
                {user?.user_metadata?.full_name || "User"}
              </span>
            </p>
          </div>

          {/* Middle: Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
              />
              <input
                type="text"
                placeholder="Search leads, campaigns..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-900 rounded-lg transition-colors group">
              <Bell size={20} className="text-neutral-400 group-hover:text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Avatar */}
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-soft)] flex items-center justify-center hover:shadow-lg hover:shadow-[var(--color-gold)]/30 transition-all">
              <span className="text-black text-sm font-bold">
                {(user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)).toUpperCase()}
              </span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-20 lg:pt-0">
          {children}
        </div>
      </div>
      </div>
    </div>
  );
}
