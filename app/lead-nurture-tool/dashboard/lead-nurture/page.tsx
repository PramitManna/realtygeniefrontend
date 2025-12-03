"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Activity,
  Plus,
  Search,
  Filter,
  Download
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "new" | "contacted" | "interested" | "qualified" | "closed";
  source: string;
  lastContact?: string;
  notes?: string;
  createdAt: string;
}

export default function LeadNurturePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/lead-nurture-tool/dashboard/lead-nurture");
      return;
    }
    setUser(user);
    loadLeads();
  };

  const loadLeads = async () => {
    // Mock data for now - you can connect to your database later
    const mockLeads: Lead[] = [
      {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        phone: "+1 234 567 8900",
        status: "interested",
        source: "Website",
        lastContact: "2024-11-10",
        notes: "Looking for a 3-bedroom house",
        createdAt: "2024-11-01"
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1 234 567 8901",
        status: "qualified",
        source: "Referral",
        lastContact: "2024-11-09",
        notes: "Ready to buy, budget $500k",
        createdAt: "2024-10-28"
      },
      {
        id: "3",
        name: "Mike Davis",
        email: "mike@example.com",
        status: "new",
        source: "Social Media",
        createdAt: "2024-11-11"
      },
      {
        id: "4",
        name: "Emily Wilson",
        email: "emily@example.com",
        phone: "+1 234 567 8902",
        status: "contacted",
        source: "Email Campaign",
        lastContact: "2024-11-08",
        createdAt: "2024-10-25"
      }
    ];
    setLeads(mockLeads);
    setLoading(false);
  };

  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Contacted",
      value: leads.filter(l => l.status === "contacted" || l.status === "qualified").length,
      icon: Mail,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Qualified",
      value: leads.filter(l => l.status === "qualified").length,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Conversion Rate",
      value: "25%",
      icon: Activity,
      color: "from-[var(--color-gold)] to-[var(--color-gold-soft)]"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      interested: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      qualified: "bg-green-500/10 text-green-500 border-green-500/20",
      closed: "bg-gray-500/10 text-gray-500 border-gray-500/20"
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-[var(--font-heading)] text-white">
                Lead Nurture Dashboard
              </h1>
              <p className="text-neutral-400 mt-1">
                Manage and track your leads effectively
              </p>
            </div>
            <button className="px-6 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-[var(--color-gold)]/20">
              <Plus size={20} />
              Add New Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#1A1A1A] rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leads Table */}
        <div className="mt-8 bg-[#1A1A1A] rounded-xl border border-neutral-800">
          {/* Table Header */}
          <div className="p-6 border-b border-neutral-800">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-xl font-semibold">All Leads</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#111111] border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors w-full sm:w-64"
                  />
                </div>
                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-[#111111] border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-800">
                <tr>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Name</th>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Email</th>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Phone</th>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Status</th>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Source</th>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Last Contact</th>
                  <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-neutral-800 hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{lead.email}</td>
                    <td className="px-6 py-4 text-neutral-400">{lead.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{lead.source}</td>
                    <td className="px-6 py-4 text-neutral-400">{lead.lastContact || "—"}</td>
                    <td className="px-6 py-4">
                      <button className="text-[var(--color-gold)] hover:text-[var(--color-gold-soft)] transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center text-neutral-500">
              No leads found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
