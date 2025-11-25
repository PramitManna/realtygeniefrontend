"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Mail,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
} from "lucide-react";
import { h1 } from "motion/react-client";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Stats data with trend
  const stats = [
    {
      title: "Total Leads",
      value: "1,234",
      change: "+12%",
      positive: true,
      icon: Users,
      bgGradient: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Emails Sent",
      value: "8,492",
      change: "+23%",
      positive: true,
      icon: Mail,
      bgGradient: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-500",
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-1.2%",
      positive: false,
      icon: TrendingUp,
      bgGradient: "from-green-500/10 to-green-600/10",
      iconColor: "text-green-500",
    },
    {
      title: "Active Campaigns",
      value: "12",
      change: "+2",
      positive: true,
      icon: Activity,
      bgGradient: "from-amber-500/10 to-amber-600/10",
      iconColor: "text-amber-500",
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

  // return (
  //   <div className="bg-black">
  //     Main Content - No separate header, using layout's top bar
  //     <div className="px-4 sm:px-8 py-4">
  //       {/* Stats Grid */}
  //       <motion.div
  //         variants={containerVariants}
  //         initial="hidden"
  //         animate="visible"
  //         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
  //       >
  //         {stats.map((stat, index) => {
  //           const Icon = stat.icon;
  //           return (
  //             <motion.div
  //               key={index}
  //               variants={itemVariants}
  //               className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all hover:shadow-lg group cursor-pointer`}
  //             >
  //               <div className="flex items-start justify-between mb-4">
  //                 <div className={`p-3 rounded-lg bg-neutral-900 ${stat.iconColor}`}>
  //                   <Icon size={24} />
  //                 </div>
  //                 <div
  //                   className={`flex items-center gap-1 text-sm font-medium ${
  //                     stat.positive ? "text-green-500" : "text-red-500"
  //                   }`}
  //                 >
  //                   {stat.positive ? (
  //                     <ArrowUpRight size={16} />
  //                   ) : (
  //                     <ArrowDownRight size={16} />
  //                   )}
  //                   {stat.change}
  //                 </div>
  //               </div>
  //               <p className="text-neutral-400 text-sm mb-2">{stat.title}</p>
  //               <p className="text-3xl font-bold text-white">{stat.value}</p>
  //             </motion.div>
  //           );
  //         })}
  //       </motion.div>

  //       {/* Charts Section */}
  //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
  //         {/* Main Chart */}
  //         <motion.div
  //           variants={itemVariants}
  //           initial="hidden"
  //           animate="visible"
  //           transition={{ delay: 0.4 }}
  //           className="lg:col-span-2 bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6"
  //         >
  //           <div className="flex items-center justify-between mb-4">
  //             <div>
  //               <h2 className="text-lg font-semibold text-white">Email Performance</h2>
  //               <p className="text-sm text-neutral-400">Last 30 days</p>
  //             </div>
  //             <button className="text-neutral-400 hover:text-white transition-colors">
  //               <Calendar size={20} />
  //             </button>
  //           </div>

  //           {/* Placeholder Chart */}
  //           <div className="h-48 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg flex items-center justify-center border border-neutral-700">
  //             <div className="text-center">
  //               <BarChart3 size={40} className="text-neutral-600 mx-auto mb-4" />
  //               <p className="text-neutral-500">Chart data coming soon</p>
  //             </div>
  //           </div>
  //         </motion.div>

  //         {/* Recent Activity */}
  //         <motion.div
  //           variants={itemVariants}
  //           initial="hidden"
  //           animate="visible"
  //           transition={{ delay: 0.5 }}
  //           className="bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6"
  //         >
  //           <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>

  //           <div className="space-y-2">
  //             {[
  //               { label: "Emails sent", value: "248", time: "2h ago" },
  //               { label: "New leads", value: "12", time: "4h ago" },
  //               { label: "Campaigns", value: "3 updated", time: "1d ago" },
  //               { label: "Team members", value: "+2 invited", time: "2d ago" },
  //             ].map((activity, idx) => (
  //               <div key={idx} className="flex items-start gap-3 p-3 hover:bg-neutral-900/50 rounded-lg transition-colors">
  //                 <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] mt-1.5 flex-shrink-0" />
  //                 <div className="flex-1 min-w-0">
  //               <p className="text-sm text-white font-medium truncate">
  //                 {activity.label}
  //               </p>
  //               <p className="text-xs text-neutral-500">{activity.time}</p>
  //                 </div>
  //                 <p className="text-sm font-medium text-[var(--color-gold)] flex-shrink-0">
  //                   {activity.value}
  //                 </p>
  //               </div>
  //             ))}
  //           </div>
  //         </motion.div>
  //       </div>

  //       {/* Quick Actions */}
  //       <motion.div
  //         variants={itemVariants}
  //         initial="hidden"
  //         animate="visible"
  //         transition={{ delay: 0.6 }}
  //         className="bg-gradient-to-r from-[var(--color-gold)]/10 to-[var(--color-gold-soft)]/10 border border-[var(--color-gold)]/20 rounded-xl p-6 text-center"
  //       >
  //         <h2 className="text-xl font-bold text-white mb-2">Ready to grow?</h2>
  //         <p className="text-neutral-400 mb-4 max-w-md mx-auto text-sm">
  //           Start a new campaign, import leads, or set up your first automation
  //         </p>
  //         <div className="flex flex-col sm:flex-row gap-3 justify-center">
  //           <button className="px-6 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30">
  //             Create Campaign
  //           </button>
  //           <button className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-all">
  //             Import Leads
  //           </button>
  //         </div>
  //       </motion.div>
  //     </div>
  //   </div>
  // );

  return (
    <h1> COMING SOON </h1>
  )
}
