"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { fetchDashboardOverview, DashboardOverview } from "@/lib/api-client";
import {
  TrendingUp,
  Users,
  Mail,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
        if (user?.email) {
          await fetchOverviewData(user.email);
        }
      } catch (err) {
        console.error("Error getting user:", err);
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const fetchOverviewData = async (userEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardOverview(userEmail);
      setOverviewData(data);
    } catch (error) {
      console.error("Error fetching overview:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Leads",
      value: (overviewData?.total_leads || 0).toLocaleString(),
      positive: true,
      icon: Users,
    },
    {
      title: "Active Campaigns",
      value: overviewData?.active_campaigns || "0",
      positive: true,
      icon: Zap,
    },
    {
      title: "Response Rate",
      value: `${overviewData?.response_rate || 0}%`,
      positive: true,
      icon: Mail,
    },
    {
      title: "Conversion Rate",
      value: `${overviewData?.conversion_rate || 0}%`,
      positive: true,
      icon: BarChart3,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin text-[var(--color-gold)] mx-auto mb-4" />
          <p className="text-neutral-400">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-2"
        >
          Dashboard Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-neutral-400"
        >
          Welcome back, {user?.user_metadata?.full_name || user?.email}!
        </motion.p>
      </div>

      {/* StatsGrid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/30 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all hover:shadow-lg group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-neutral-900 text-neutral-400`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Campaign Performance</h2>
              <p className="text-sm text-neutral-400">Last 30 days</p>
            </div>
            <button className="text-neutral-400 hover:text-white transition-colors">
              <Calendar size={20} />
            </button>
          </div>

          {/* Placeholder Chart */}
          <div className="h-48 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg flex items-center justify-center border border-neutral-700">
            <div className="text-center">
              <BarChart3 size={40} className="text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500">Chart data coming soon</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        {/* <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>

          <div className="space-y-2">
            {overviewData?.recent_activities?.slice(0, 4).map((activity: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 hover:bg-neutral-900/50 rounded-lg transition-colors">
                <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-neutral-500">{activity.description}</p>
                </div>
                <div className="text-xs font-medium text-[var(--color-gold)] flex-shrink-0">
                  <span className={`px-2 py-1 rounded ${activity.status === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-sm text-neutral-500 text-center py-4">No activities yet</p>
            )}
          </div>
        </motion.div> */}
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[var(--color-gold)]/10 to-[var(--color-gold-soft)]/10 border border-[var(--color-gold)]/20 rounded-xl p-6 text-center"
      >
        <h2 className="text-xl font-bold text-white mb-2">Ready to grow?</h2>
        <p className="text-neutral-400 mb-4 max-w-md mx-auto text-sm">
          Start a new campaign, import leads, or set up your first automation
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => router.push('/lead-nurture-tool/dashboard/campaigns')}
            className="px-6 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30"
          >
            Create Campaign
          </button>
          <button 
            onClick={() => router.push('/lead-nurture-tool/dashboard/leads')}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-all"
          >
            Import Leads
          </button>
        </div>
      </motion.div>
    </div>
  );
}
