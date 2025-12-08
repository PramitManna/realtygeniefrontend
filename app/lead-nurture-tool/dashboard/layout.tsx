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
  ChevronRight,
  CheckCircle,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { StepCompletionService } from "@/lib/step-completion";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ size: number }>;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Overview", icon: Home, href: "/lead-nurture-tool/dashboard" },
  { name: "Batches", icon: Layers, href: "/lead-nurture-tool/dashboard/batches" },
  { name: "Leads", icon: Users, href: "/lead-nurture-tool/dashboard/leads" },
  { name: "Automations", icon: Zap, href: "/lead-nurture-tool/dashboard/automations" },
  { name: "Analytics", icon: BarChart3, href: "/lead-nurture-tool/dashboard/analytics" },
  { name: "Imports", icon: Upload, href: "/lead-nurture-tool/dashboard/imports" },
  { name: "Settings", icon: Settings, href: "/lead-nurture-tool/dashboard/settings" },
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
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const handleStepCompletionChange = (stepName: string, completed: boolean) => {
    if (completed) {
      setCompletedSteps(prev => [...prev.filter(s => s !== stepName), stepName]);
    } else {
      setCompletedSteps(prev => prev.filter(s => s !== stepName));
    }
  };

  // Update step data when pathname changes (user navigates)
  useEffect(() => {
    if (user) {
      fetchCompletedSteps();
    }
  }, [pathname, user]);

  const fetchCompletedSteps = async () => {
    try {
      setIsLoadingSteps(true);
      const completed = await StepCompletionService.getCompletedSteps();
      setCompletedSteps(completed);
    } catch (error) {
      console.error('Error fetching completed steps:', error);
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/lead-nurture-tool/dashboard");
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

  const StepIndicator = () => {
    const steps = [
      {
        name: "Create Batch",
        stepKey: "create-batch",
        href: "/lead-nurture-tool/dashboard/batches",
        completed: completedSteps.includes("create-batch"),
        description: "Create your first batch to organize leads"
      },
      {
        name: "Import Leads",
        stepKey: "import-leads",
        href: "/lead-nurture-tool/dashboard/leads",
        completed: completedSteps.includes("import-leads"),
        description: "Add leads to your batch"
      },
      {
        name: "Setup Automations",
        stepKey: "setup-automations",
        href: "/lead-nurture-tool/dashboard/automations",
        completed: completedSteps.includes("setup-automations"),
        description: "Create automated email campaigns"
      }
    ];

    if (isLoadingSteps) {
      return (
        <div className="bg-gradient-to-br from-[var(--color-gold)]/8 via-[var(--color-gold)]/5 to-transparent border border-[var(--color-gold)]/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-neutral-400">Loading progress...</span>
          </div>
        </div>
      );
    }

    const currentStepIndex = steps.findIndex(step => !step.completed);
    const allCompleted = currentStepIndex === -1;

    return (
      <div className="relative bg-gradient-to-br from-[var(--color-gold)]/8 via-[var(--color-gold)]/5 to-transparent border border-[var(--color-gold)]/30 rounded-xl p-6 mb-8 backdrop-blur-sm shadow-lg">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-gold)]/20 to-transparent rounded-full blur-2xl -z-10" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold)]/80 flex items-center justify-center">
              <Zap size={16} className="text-black" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-gold)] mb-0.5">Getting Started</h3>
              <p className="text-xs text-neutral-400">Complete these steps to start nurturing leads</p>
            </div>
          </div>
          {allCompleted && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs font-medium text-green-400">All Complete!</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCurrentStep = index === currentStepIndex;
            const isNextStep = !step.completed && !isCurrentStep && index > currentStepIndex;
            return (
              <Link key={step.name} href={step.href}>
                <motion.div 
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border ${
                    step.completed 
                      ? 'bg-green-500/10 border-green-500/30 shadow-sm hover:shadow-green-500/10' 
                      : isCurrentStep 
                        ? 'bg-gradient-to-r from-[var(--color-gold)]/15 to-[var(--color-gold)]/5 border-[var(--color-gold)]/40 shadow-lg hover:shadow-[var(--color-gold)]/20' 
                        : isNextStep
                          ? 'bg-neutral-900/30 border-neutral-700/50 hover:bg-neutral-800/40 hover:border-neutral-600/50'
                          : 'bg-neutral-900/50 border-neutral-700/30 hover:bg-neutral-800/50'
                  }`}>
                  <div className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                    step.completed 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                      : isCurrentStep 
                        ? 'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold)]/80 text-black shadow-lg shadow-[var(--color-gold)]/30' 
                        : 'bg-neutral-700/80 text-neutral-400 border border-neutral-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle size={14} className="animate-pulse" />
                    ) : isCurrentStep ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap size={14} />
                      </motion.div>
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                    
                    {isCurrentStep && (
                      <div className="absolute inset-0 rounded-full bg-[var(--color-gold)] animate-ping opacity-20" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold transition-colors ${
                      step.completed 
                        ? 'text-green-400 text-sm' 
                        : isCurrentStep 
                          ? 'text-[var(--color-gold)] text-base' 
                          : 'text-neutral-300 text-sm'
                    }`}>
                      {step.name}
                      {step.completed && <span className="ml-2 text-xs">✓</span>}
                      {isCurrentStep && <span className="ml-2 text-xs animate-pulse">← Current</span>}
                    </div>
                    <div className={`text-xs mt-0.5 ${
                      step.completed 
                        ? 'text-green-400/70' 
                        : isCurrentStep 
                          ? 'text-[var(--color-gold)]/80' 
                          : 'text-neutral-500'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {step.completed && (
                      <span className="text-xs text-green-400 font-medium">Done</span>
                    )}
                    {isCurrentStep && (
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight size={16} className="text-[var(--color-gold)]" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        {!allCompleted && (
          <div className="mt-6 pt-4 border-t border-neutral-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-300">
                  Progress: {steps.filter(s => s.completed).length} of {steps.length}
                </span>
                <div className="text-xs text-neutral-500">
                  Step {currentStepIndex + 1} active
                </div>
              </div>
              <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`w-3 h-1.5 rounded-full transition-all duration-300 ${
                      step.completed 
                        ? 'bg-green-500' 
                        : index === currentStepIndex 
                          ? 'bg-[var(--color-gold)] animate-pulse' 
                          : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[var(--color-gold)] to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-neutral-300 relative overflow-hidden">
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
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg flex-shrink-0"
          />
          <motion.div
            animate={{ opacity: sidebarHovered ? 1 : 0, width: sidebarHovered ? "auto" : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-3"
          >
            <div className="text-sm  text-[var(--color-gold)] whitespace-nowrap">
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
                      : "text-neutral-400 hover:text-neutral-300"
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
                    <span className="ml-auto bg-red-500 text-neutral-300 text-xs px-2 py-0.5 rounded-full">
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
              <p className="text-xs text-neutral-500"></p>
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
                          : "text-neutral-400 hover:text-neutral-300"
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
            <h1 className="text-xl font-bold text-neutral-300">Dashboard</h1>
            <p className="text-neutral-400 text-xs -mt-1">
              Welcome back,{" "}
              <span className="text-[var(--color-gold)]">
                {user?.user_metadata?.full_name || "User"}
              </span>
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-900 rounded-lg transition-colors group">
              <Bell size={20} className="text-neutral-400 group-hover:text-neutral-300" />
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
        <div className="pt-20 lg:pt-6 p-6">
          <StepIndicator />
          {children}
        </div>
      </div>
      </div>
    </div>
  );
}
