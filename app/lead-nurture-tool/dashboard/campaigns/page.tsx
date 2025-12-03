"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import campaignApi from "@/lib/campaign-api";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Pause,
  Play,
  Trash2,
  Edit,
  Copy,
  Eye,
  X,
  Calendar,
  Send,
  BarChart3,
  Zap,
  AlertCircle,
  ArrowRight,
  Loader,
} from "lucide-react";

interface Batch {
  id: string;
  name: string;
  lead_count: number;
  objective?: string;
  tone_override?: string[];
  created_at: string;
}

interface Campaign {
  id: string;
  batch_id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed" | "draft";
  emailsSent: number;
  emailsTotal: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  createdDate?: string;
  lastUpdated?: string;
  created_at?: string;
  updated_at?: string;
  template: string;
  tones: string[];
  objective: string;
}

const statusConfig = {
  active: { color: "bg-green-500/20 text-green-400", label: "Active", icon: "✓" },
  paused: { color: "bg-yellow-500/20 text-yellow-400", label: "Paused", icon: "⏸" },
  completed: { color: "bg-blue-500/20 text-blue-400", label: "Completed", icon: "✓" },
  draft: { color: "bg-gray-500/20 text-gray-400", label: "Draft", icon: "✎" },
};

// Campaign Card Component
const CampaignCard = ({
  campaign,
  onSelect,
  isSelected,
  onPauseResume,
  onDelete,
  isDeleting,
}: {
  campaign: Campaign;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onPauseResume?: (id: string, newStatus: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: string | null;
}) => {
  const statusConfig_ = statusConfig[campaign.status];
  const emailsSent = campaign.emailsSent || 0;
  const emailsTotal = campaign.emailsTotal || 0;
  const progress = emailsTotal > 0 ? (emailsSent / emailsTotal) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(campaign.id)}
      className={`
        backdrop-blur-md border rounded-xl p-6 transition-all duration-300 cursor-pointer
        hover:border-[var(--color-gold)]/50 group
        ${
          isSelected
            ? "bg-white/10 border-[var(--color-gold)]/70 shadow-lg shadow-[var(--color-gold)]/20"
            : "bg-white/5 border-white/10 hover:bg-white/10"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig_.color}`}>
              {statusConfig_.label}
            </span>
          </div>
          <p className="text-sm text-neutral-400">{campaign.description}</p>
        </div>
        <motion.button
          whileHover={{ rotate: 90 }}
          className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical size={18} />
        </motion.button>
      </div>

      {/* Metrics */}
      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
        <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300">
          <span className="font-semibold">Beta:</span> Campaign stats are currently under development and may not be fully accurate
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-y border-white/10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-[var(--color-gold)]">
            {((campaign.openRate ?? 0) || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-400">Open Rate</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-blue-400">
            {((campaign.clickRate ?? 0) || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-400">Click Rate</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-purple-400">
            {((campaign.responseRate ?? 0) || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-400">Response</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-neutral-400">
            {emailsSent} / {emailsTotal} sent
          </p>
          <p className="text-xs font-semibold text-[var(--color-gold)]">{progress.toFixed(0)}%</p>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/70"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex-1">
          <p className="text-md text-neutral-500">
            {campaign.created_at
              ? new Date(campaign.created_at).toLocaleDateString()
              : "Date unavailable"}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status !== "completed" && onPauseResume && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                const newStatus = campaign.status === "paused" ? "active" : "paused";
                onPauseResume(campaign.id, newStatus);
              }}
              className={`p-2 rounded-lg transition-all ${
                campaign.status === "paused"
                  ? "bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 text-green-400 hover:text-green-300"
                  : "bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-300"
              }`}
              title={campaign.status === "paused" ? "Resume Campaign" : "Pause Campaign"}
            >
              {campaign.status === "paused" ? (
                <Play size={16} />
              ) : (
                <Pause size={16} />
              )}
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(campaign.id);
              }}
              disabled={isDeleting === campaign.id}
              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting === campaign.id ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Batch Selection Modal
const BatchSelectionModal = ({
  isOpen,
  onClose,
  batches,
  isLoading,
  onSelectBatch,
}: {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  isLoading: boolean;
  onSelectBatch: (batch: Batch) => void;
}) => {
  const [search, setSearch] = useState("");

  const filteredBatches = batches.filter(
    (batch) =>
      (batch.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (batch.objective || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-[#0F0F0F]/95 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Select a Batch</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Choose which lead batch to create a campaign for
                  </p>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={24} className="text-neutral-400" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-neutral-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search batches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader size={32} className="text-[var(--color-gold)]" />
                    </motion.div>
                  </div>
                ) : filteredBatches.length > 0 ? (
                  <div className="space-y-3">
                    {filteredBatches.map((batch, index) => (
                      <motion.button
                        key={batch.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        onClick={() => onSelectBatch(batch)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-[var(--color-gold)]/50 transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{batch.name}</h3>
                          <ArrowRight size={20} className="text-neutral-600 group-hover:text-[var(--color-gold)]" />
                        </div>
                        <p className="text-sm text-neutral-400 mb-3">{batch.objective || "No objective set"}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Users size={16} />
                            <span className="text-sm">{batch.lead_count} leads</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Calendar size={16} />
                            <span className="text-sm">{new Date(batch.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Mail size={48} className="mx-auto text-neutral-600 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No batches found</h3>
                    <p className="text-neutral-400">
                      {search
                        ? "Try adjusting your search"
                        : "You haven't created any batches yet"}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Create Campaign Modal
const CreateCampaignModal = ({
  isOpen,
  onClose,
  batch,
  onCreateCampaign,
  isCreating,
}: {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onCreateCampaign: (data: any) => void;
  isCreating: boolean;
}) => {
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [tones, setTone] = useState(batch?.tone_override || "Professional");
  const [objective, setObjective] = useState(batch?.objective || "Lead Nurturing");
  const [selectedTemplate, setSelectedTemplate] = useState("standard");

  const handleClose = () => {
    setStep(1);
    setCampaignName("");
    setCampaignDesc("");
    setTone(batch?.tone_override || "Professional");
    setObjective(batch?.objective || "Lead Nurturing");
    setSelectedTemplate("standard");
    onClose();
  };

  const handleCreate = () => {
    onCreateCampaign({
      name: campaignName,
      description: campaignDesc,
      tones,
      objective,
      template: selectedTemplate,
    });
    handleClose();
  };

  if (!batch) return null;


  const templates = [
    { id: "standard", name: "Standard Template" },
    { id: "modern", name: "Modern Design" },
    { id: "minimal", name: "Minimal" },
    { id: "premium", name: "Premium" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-3xl bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-[#0F0F0F]/95 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Campaign</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    For batch: <span className="text-[var(--color-gold)]">{batch.name}</span> ({batch.lead_count}{" "}
                    leads)
                  </p>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  disabled={isCreating}
                  className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
                >
                  <X size={24} className="text-neutral-400" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 2) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold)]/70"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Campaign Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Spring Property Outreach"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Description</label>
                      <textarea
                        placeholder="What is this campaign about?"
                        value={campaignDesc}
                        onChange={(e) => setCampaignDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors resize-none h-24"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-white mb-3">Email Template</label>
                      <div className="grid grid-cols-2 gap-3">
                        {templates.map((tmpl) => (
                          <motion.button
                            key={tmpl.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTemplate(tmpl.id)}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                              selectedTemplate === tmpl.id
                                ? "bg-[var(--color-gold)] text-black border border-[var(--color-gold)]"
                                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {tmpl.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#0F0F0F]/95 backdrop-blur border-t border-white/10 p-6 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => step > 1 && setStep(step - 1)}
                  disabled={step === 1 || isCreating}
                  className="px-6 py-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </motion.button>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    disabled={isCreating}
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => (step < 2 ? setStep(step + 1) : handleCreate())}
                    disabled={
                      isCreating ||
                      (step === 1 && !campaignName)
                    }
                    className="px-6 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : step === 2 ? (
                      "Create Campaign"
                    ) : (
                      "Next"
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Page
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBatchSelectOpen, setIsBatchSelectOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Toast state
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const supabase = createClient();

  // Toast helper function
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Confirmation modal helper
  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
    });
  };

  // Fetch user and data on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          await Promise.all([fetchBatches(user.id), fetchCampaigns(user.id)]);
        }
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    initData();
  }, []);

  const fetchBatches = async (uid: string) => {
    try {
      setIsLoadingBatches(true);
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map batch_name to name for consistency with interface
      const mappedBatches = (data || []).map((batch: any) => ({
        id: batch.id,
        name: batch.batch_name,
        lead_count: batch.lead_count,
        objective: batch.objective,
        tone_override: batch.tone_override,
        created_at: batch.created_at,
      }));
      
      setBatches(mappedBatches);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const fetchCampaigns = async (uid: string) => {
    try {
      setIsLoadingCampaigns(true);
      const result = await campaignApi.getCampaigns(uid);
      if (result.success) {
        setCampaigns(result.campaigns || []);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    if (!userId || !selectedBatch) return;

    try {
      setIsCreating(true);
      const result = await campaignApi.createCampaign(userId, {
        batch_id: selectedBatch.id,
        name: campaignData.name,
        description: campaignData.description,
        email_template: campaignData.template,
        tones: selectedBatch.tone_override || ["Professional"],
        objective: selectedBatch.objective || "Lead Nurturing",
      });

      if (result.success) {
        // Refresh campaigns list
        await fetchCampaigns(userId);
        setIsCreateOpen(false);
        setSelectedBatch(null);
        // Show success toast
        showToast("Campaign created successfully!", "success");
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      showToast("Failed to create campaign", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    showConfirmation(
      "Delete Campaign",
      "Are you sure you want to delete this campaign? This action cannot be undone.",
      async () => {
        try {
          setDeleteLoading(campaignId);
          const result = await campaignApi.deleteCampaign(campaignId, userId);

          if (result.success) {
            await fetchCampaigns(userId);
            setSelectedCampaignId(null);
            showToast("Campaign deleted successfully", "success");
          } else {
            showToast(`Error: ${result.error}`, "error");
          }
        } catch (error) {
          console.error("Error deleting campaign:", error);
          showToast("Failed to delete campaign", "error");
        } finally {
          setDeleteLoading(null);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    );
  };

  const handlePauseResume = async (campaignId: string, newStatus: string) => {
    try {
      const result = await campaignApi.updateCampaign(campaignId, userId, {
        status: newStatus,
      });

      if (result.success) {
        await fetchCampaigns(userId);
        const statusText = newStatus === "paused" ? "paused" : "resumed";
        showToast(`Campaign ${statusText} successfully`, "success");
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      showToast("Failed to update campaign", "error");
    }
  };

  const handleDuplicateCampaign = async (campaignId: string) => {
    try {
      const result = await campaignApi.duplicateCampaign(campaignId, userId);

      if (result.success) {
        await fetchCampaigns(userId);
        showToast("Campaign duplicated successfully!", "success");
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      showToast("Failed to duplicate campaign", "error");
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      (campaign.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsBatchSelectOpen(false);
    setIsCreateOpen(true);
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => (
    <AnimatePresence>
      {confirmModal.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              confirmModal.onCancel?.();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4"
          >
            <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
              <p className="text-neutral-400 text-sm mb-6">{confirmModal.message}</p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                    confirmModal.onCancel?.();
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    confirmModal.onConfirm();
                  }}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all"
                >
                  Confirm
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Toast Component
  const Toast = () => (
    <div className="fixed bottom-4 right-4 z-[200] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-4 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 pointer-events-auto ${
              toast.type === "success"
                ? "bg-green-500/20 border border-green-500/50 text-green-300"
                : "bg-red-500/20 border border-red-500/50 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="px-4 sm:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Campaigns</h1>
            <p className="text-neutral-400 mt-2">
              Manage and track all your email campaigns in one place
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBatchSelectOpen(true)}
            className="px-6 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-[var(--color-gold)]/30 hover:shadow-[var(--color-gold)]/50 transition-all"
          >
            <Plus size={20} />
            New Campaign
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-neutral-500" size={20} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "paused", "completed", "draft"].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  statusFilter === status
                    ? "bg-[var(--color-gold)] text-black"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Cards */}
        <motion.div className="lg:col-span-2 space-y-4">
          {campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center"
            >
              <Mail size={48} className="mx-auto text-neutral-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3>
              <p className="text-neutral-400 mb-6">
                Create your first campaign to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBatchSelectOpen(true)}
                className="px-6 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black rounded-lg font-semibold transition-all"
              >
                Create Campaign
              </motion.button>
            </motion.div>
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSelect={(id) => {
                  setSelectedCampaignId(id);
                  setIsDetailsOpen(true);
                }}
                isSelected={selectedCampaignId === campaign.id}
                onPauseResume={handlePauseResume}
                onDelete={handleDeleteCampaign}
                isDeleting={deleteLoading}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center"
            >
              <Mail size={48} className="mx-auto text-neutral-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No campaigns found</h3>
              <p className="text-neutral-400 mb-6">
                Try adjusting your filters or create a new campaign
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBatchSelectOpen(true)}
                className="px-6 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black rounded-lg font-semibold transition-all"
              >
                Create Campaign
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Details Panel (Desktop) */}
        <div className="hidden lg:block">
          {selectedCampaign ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Quick Stats</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCampaignId(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Status", value: statusConfig[selectedCampaign.status].label },
                  { label: "Open Rate", value: `${((selectedCampaign.openRate ?? 0) || 0).toFixed(1)}%` },
                  { label: "Click Rate", value: `${((selectedCampaign.clickRate ?? 0) || 0).toFixed(1)}%` },
                  { label: "Response Rate", value: `${((selectedCampaign.responseRate ?? 0) || 0).toFixed(1)}%` },
                  { label: "Tone", value: selectedCampaign.tones },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-white/10 last:border-b-0">
                    <p className="text-neutral-400">{stat.label}</p>
                    <p className="font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDetailsOpen(true)}
                className="w-full mt-6 px-4 py-2 bg-[var(--color-gold)]/20 hover:bg-[var(--color-gold)]/30 text-[var(--color-gold)] border border-[var(--color-gold)]/30 rounded-lg font-semibold transition-all"
              >
                View Full Details
              </motion.button>
            </motion.div>
          ) : (
            <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-6 text-center">
              <p className="text-neutral-400">Select a campaign to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BatchSelectionModal
        isOpen={isBatchSelectOpen}
        onClose={() => setIsBatchSelectOpen(false)}
        batches={batches}
        isLoading={isLoadingBatches}
        onSelectBatch={handleSelectBatch}
      />
      
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        batch={selectedBatch}
        onCreateCampaign={handleCreateCampaign}
        isCreating={isCreating}
      />

      {/* Toast & Confirmation */}
      <Toast />
      <ConfirmationModal />
    </div>
  );
}
