"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import DraftReview from "@/components/DraftReview";
import EmailTriggerModal from "@/components/EmailTriggerModal";
import axios from "axios";
import { API_CONFIG } from "@/lib/api-config";
import {
  Plus,
  Search,
  Filter,
  Mail,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  Calendar,
  Users,
  Zap,
  Clock,
  ArrowRight,
  Loader,
} from "lucide-react";
import { StepCompletionButton } from "@/components/StepCompletionButton";

interface Batch {
  id: string;
  batch_name: string;
  description?: string;
  subject?: string;
  body?: string;
  status: "active" | "paused" | "draft" | "inactive" | "completed";
  persona: string;
  objective: string;
  created_at?: string;
  lead_count: number;
  emails_sent?: number;
  total_recipients?: number;
  tones: string[];
}

interface AutomationSetup {
  batchId: string;
  draftEmails: any[];
  step: 1 | 2 | 3;
}

export default function AutomationsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showDraftReview, setShowDraftReview] = useState(false);
  const [draftEmails, setDraftEmails] = useState<any[]>([]);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [isLaunchingCampaign, setIsLaunchingCampaign] = useState(false);
  const [isApprovingDrafts, setIsApprovingDrafts] = useState(false);
  const [automationStep, setAutomationStep] = useState(1);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [campaignStartDate, setCampaignStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });
  const [showEmailTriggerModal, setShowEmailTriggerModal] = useState(false);

  const supabase = createClient();

  // Toast helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Fetch campaigns on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          fetchBatches(user.id);
        }
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    initData();
  }, []);

  const fetchBatches = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      showToast("Failed to load batches", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const generateDraftEmails = async (batch: Batch) => {
    // Prevent generating drafts if batch already launched
    if (selectedBatch?.status === 'active') {
      showToast('Batch automation already launched. Cannot generate new drafts.', 'error');
      return;
    }

    setIsGeneratingDrafts(true);
    try {
      // Get batch ID
      const batchId = selectedBatch?.id || 'unknown';

      // Get user ID from auth session
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '';

      let agentName = 'Your Name';
      let companyName = 'Your Company';
      // Don't set a default target_city - let user choose or leave empty
      let target_city: string[] = [];


        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, company_name, markets')
          .eq('id', userId)
          .single();

        if (profileData) {
          agentName = profileData.full_name || agentName;
          companyName = profileData.company_name || companyName;
          // Don't automatically use profile markets - user should specify target city
          // target_city = profileData.markets || target_city;
        }

      console.log(selectedBatch)

      const response = await fetch('/api/campaigns/generate-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: batchId,
          campaign_name: selectedBatch?.batch_name || 'Batch Automation',
          target_city: target_city.length > 0 ? target_city : ["your market"],
          persona: selectedBatch?.persona || 'buyer',
          objective: selectedBatch?.objective || 'lead_nurturing',
          tones: selectedBatch?.tones,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error:", errText);
        throw new Error(errText);
      }

      const data = await response.json();

      // Fetch user profile data for placeholder replacement




      // Transform the API response to match the component's expected format
      const draftEmails = data.emails.map((email: any, index: number) => {
        // Replace placeholders in subject and body
        let subject = email.subject;
        let body = email.body;

        // Replace agent name placeholders
        subject = subject.replace(/\{\{agent_name\}\}/g, agentName);
        body = body.replace(/\{\{agent_name\}\}/g, agentName);

        // Replace company name placeholders
        subject = subject.replace(/\{\{company_name\}\}/g, companyName);
        body = body.replace(/\{\{company_name\}\}/g, companyName);

        return {
          id: email.category_id || `draft-${index}`,
          category_id: email.category_id,
          category_name: email.category_name || 'Email',
          subject: subject,
          body: body,
          send_day: email.send_day,
          order: email.order || index + 1,
          month_phase: email.month_phase || 'month_1',
          month_number: email.month_number || 1,
        };
      });

      setDraftEmails(draftEmails);
      setShowDraftReview(true);
      setAutomationStep(2);
      showToast(`Generated ${draftEmails.length} email drafts for Month 1`, 'success');
    } catch (error) {
      console.error("Error generating drafts:", error);
      showToast(
        error instanceof Error ? error.message : 'Failed to generate email drafts',
        'error'
      );
    } finally {
      setIsGeneratingDrafts(false);
    }
  };

  const handleDraftsApprove = async (finalDrafts: any[]) => {
    setIsApprovingDrafts(true);
    try {
      // Fetch user's signature block from profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast("User not authenticated", "error");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("signature_block")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        showToast("Could not load your signature", "error");
        return;
      }

      // Append signature block to each email body
      const signatureBlock = profile?.signature_block || "";
      const draftsWithSignature = finalDrafts.map((draft) => ({
        ...draft,
        body: signatureBlock
          ? `${draft.body}<br/><br/>---<br/><br/>${signatureBlock.replace(/\n/g, '<br/>')}`
          : draft.body,
      }));

      // Store drafts for next step (scheduling)
      setDraftEmails(draftsWithSignature);

      // Save approved drafts to campaign
      showToast("✅ Email drafts approved with your signature!", "success");
      setAutomationStep(3);
      setShowDraftReview(false);
    } catch (error) {
      console.error("Error approving drafts:", error);
      showToast("Failed to approve drafts", "error");
    } finally {
      setIsApprovingDrafts(false);
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      if (!selectedBatch) {
        showToast("Batch not selected", "error");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast("User not authenticated", "error");
        return;
      }

      setIsLaunchingCampaign(true);

      // Format emails for backend - ensure all fields are present
      const formattedEmails = draftEmails.map((email) => ({
        category_id: email.category_id || email.id || 'unknown',
        category_name: email.category_name || email.subject || 'Email',
        subject: email.subject,
        body: email.body,
        send_day: email.send_day || 0,
        order: email.order || 1,
        month_phase: email.month_phase || 'month_1',
        month_number: email.month_number || 1,
      }));


      // Call backend to save approved emails and queue them for sending
      const response = await fetch('/api/campaign-emails/save-approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: selectedBatch.id,
          user_id: user.id,
          emails: formattedEmails,
          campaign_start_date: new Date(campaignStartDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to launch campaign');
      }

      const data = await response.json();

      if (!data.success) {
        // Emails already exist for this campaign
        showToast(data.message || "Campaign already launched previously", "error");
        resetAutomation();
        return;
      }

      showToast("Campaign launched! Emails queued for sending.", "success");

      // Update the campaign status to 'active' in our local state
      setBatches(batches.map((c: Batch) =>
        c.id === selectedBatch.id
          ? { ...c, status: 'active' as const }
          : c
      ));

      // Reset and go back to campaign list
      resetAutomation();

    } catch (error) {
      console.error("Error launching campaign:", error);
      showToast(
        error instanceof Error ? error.message : 'Failed to launch campaign',
        'error'
      );
    } finally {
      setIsLaunchingCampaign(false);
    }
  };

  const handleStartAutomation = (batch: Batch) => {
    setSelectedBatch(batch);
    setAutomationStep(1);

    // If batch automation is active, fetch pending emails
    if (batch.status === 'active') {
      fetchPendingEmails(batch.id);
    }
  };

  const fetchPendingEmails = async (batchId: string) => {
    try {
      setIsLoadingStats(true);
      const fullUrl = `${API_CONFIG.BACKEND_URL}/api/batches/${batchId}/queue-stats`;

      const response = await axios.get(fullUrl);

      const data = response.data;

      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format");
      }

      // Format the pending emails for display
      const emailsList = data.pending_emails || [];

      const formattedEmails = emailsList.map((email: any, idx: number) => ({
        id: `pending-${idx}`,
        subject: email.subject,
        send_day: email.send_day,
        scheduled_for: email.scheduled_for,
        pending_count: email.pending_count,
        category_name: email.category_name || 'Email',
      }));
      setDraftEmails(formattedEmails);
    } catch (error) {
      console.error("Error fetching pending emails:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to load pending emails: ${errorMessage}`, "error");
    } finally {
      setIsLoadingStats(false);
    }
  };


  const resetAutomation = () => {
    setSelectedBatch(null);
    setDraftEmails([]);
    setShowDraftReview(false);
    setAutomationStep(1);
    setQueueStats(null);
  };

  const filteredBatches = batches.filter((batch) =>
    (batch.batch_name || batch.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
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
            className={`px-4 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 pointer-events-auto ${toast.type === "success"
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
            <h1 className="text-4xl font-bold text-white">Email Automations</h1>
            <p className="text-neutral-400 mt-2">
              Create and manage multi-touch email automations with AI-generated drafts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StepCompletionButton 
              stepName="setup-automations"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEmailTriggerModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Zap className="h-4 w-4" />
              <span>Mail Trigger</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {selectedBatch && showDraftReview ? (
          // Draft Review View
          <motion.div
            key="draft-review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <motion.button
                whileHover={!(isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts) ? { scale: 1.02 } : {}}
                whileTap={!(isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts) ? { scale: 0.98 } : {}}
                onClick={resetAutomation}
                disabled={isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  (isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts)
                    ? "bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 cursor-pointer"
                }`}
              >
                <X size={16} />
                Back to Campaigns
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-white/10 rounded-2xl p-6 sm:p-8 relative"
            >
              {/* Draft Approval Loading Overlay */}
              {isApprovingDrafts && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center"
                >
                  <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-sm mx-4">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full shrink-0"
                      />
                      <div>
                        <h3 className="text-white font-semibold">Approving Drafts</h3>
                        <p className="text-white/70 text-sm">Adding your signature and finalizing emails</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        Fetching your signature block
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        Appending signature to {draftEmails.length} emails
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        Preparing for campaign launch
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <DraftReview
                drafts={draftEmails}
                onDraftsApprove={handleDraftsApprove}
                isLoading={isApprovingDrafts}
              />
            </motion.div>
          </motion.div>
        ) : selectedBatch ? (
          // Automation Setup View
          <motion.div
            key="automation-setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <motion.button
                whileHover={!(isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts) ? { scale: 1.02 } : {}}
                whileTap={!(isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts) ? { scale: 0.98 } : {}}
                onClick={resetAutomation}
                disabled={isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  (isGeneratingDrafts || isLaunchingCampaign || isApprovingDrafts)
                    ? "bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 cursor-pointer"
                }`}
              >
                <X size={16} />
                Back to Campaigns
              </motion.button>
            </div>

            {/* Campaign Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedBatch.batch_name || selectedBatch.subject || "Batch Automation Setup"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Persona</p>
                  <p className="text-white font-semibold break-words text-sm capitalize">{selectedBatch.persona}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Objective</p>
                  <p className="text-white font-semibold break-words text-sm">{selectedBatch.objective}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Status</p>
                  <p className={`font-semibold ${selectedBatch.status === 'active'
                      ? 'text-green-400'
                      : selectedBatch.status === 'paused'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }`}>
                    {selectedBatch.status === 'active' ? 'Active' : selectedBatch.status === 'paused' ? 'Paused' : 'Draft'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Leads</p>
                  <p className="text-white font-semibold">{selectedBatch.lead_count || "—"}</p>
                </div>
              </div>
            </motion.div>

            {/* Pending Emails (if active) */}
            {selectedBatch.status === 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                  <Mail size={24} />
                  Scheduled Emails
                </h3>

                {isLoadingStats ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8 space-y-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full"
                    />
                    <div className="text-center">
                      <p className="text-green-300 font-medium">Loading Email Queue</p>
                      <p className="text-green-400/70 text-sm">Fetching scheduled emails and delivery status...</p>
                    </div>
                  </motion.div>
                ) : draftEmails.length > 0 ? (
                  <div className="space-y-2">
                    {draftEmails.map((email: any, idx) => {
                      const scheduledDate = new Date(email.scheduled_for);
                      const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });

                      return (
                        <motion.div
                          key={email.id || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
                        >
                          <span className="px-2 py-1 bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs font-semibold rounded whitespace-nowrap">
                            Day {email.send_day}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{email.subject}</p>
                            <p className="text-neutral-400 text-xs mt-0.5">
                              📅 {formattedDate} at {formattedTime}
                            </p>
                          </div>
                          <span className="text-neutral-400 text-xs whitespace-nowrap">
                            {email.pending_count} pending
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-400">No pending emails found for this campaign</p>
                )}
              </motion.div>
            )}

            {/* Steps (only show if campaign is not active) */}
            {selectedBatch.status !== 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {[
                  {
                    step: 1,
                    title: "Generate Email Drafts",
                    description: "AI creates 5 unique email variations tailored to your campaign persona and objective",
                    icon: Zap,
                    completed: automationStep > 1,
                  },
                  {
                    step: 2,
                    title: "Review & Approve",
                    description: "Review all drafts, edit as needed, and approve all before proceeding",
                    icon: CheckCircle,
                    completed: automationStep > 2,
                  },
                  {
                    step: 3,
                    title: "Launch Campaign",
                    description: "Your emails are queued and will be sent automatically according to the schedule",
                    icon: Mail,
                    completed: false,
                  },
                ].map((item: any, idx: number) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border transition-all ${automationStep === item.step
                          ? "bg-[var(--color-gold)]/20 border-[var(--color-gold)]/50"
                          : item.completed
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-white/5 border-white/10"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.completed
                              ? "bg-green-500/20 border border-green-500/50"
                              : automationStep === item.step
                                ? "bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/50"
                                : "bg-white/10 border border-white/20"
                            }`}
                        >
                          {item.completed ? (
                            <CheckCircle size={20} className="text-green-400" />
                          ) : (
                            <Icon size={20} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">Step {item.step}: {item.title}</h3>
                          <p className="text-neutral-400 text-sm">{item.description}</p>
                        </div>
                        {automationStep === item.step && (
                          <motion.div
                            initial={{ rotate: -90 }}
                            animate={{ rotate: 0 }}
                            className="flex-shrink-0"
                          >
                            <ChevronRight size={20} className="text-[var(--color-gold)]" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Action Button */}
            {automationStep === 1 && (
              <>
                {/* Generate Drafts Loading State */}
                {isGeneratingDrafts && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-4"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-3 border-yellow-500/30 border-t-yellow-500 rounded-full mt-1 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                          <Zap size={20} />
                          Generating Email Drafts
                        </h3>
                        <p className="text-yellow-200/80 text-sm mb-3">
                          Our AI is crafting personalized email content based on your campaign persona and objectives.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-yellow-300/70">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                            Analyzing campaign requirements
                          </div>
                          <div className="flex items-center gap-2 text-xs text-yellow-300/70">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            Creating personalized content for {selectedBatch?.persona || 'target audience'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-yellow-300/70">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            Generating 5 unique email variations
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={!isGeneratingDrafts && selectedBatch?.status !== 'active' ? { scale: 1.02 } : {}}
                  whileTap={!isGeneratingDrafts && selectedBatch?.status !== 'active' ? { scale: 0.98 } : {}}
                  onClick={() => generateDraftEmails(selectedBatch)}
                  disabled={automationStep > 1 || isGeneratingDrafts || selectedBatch?.status === 'active'}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${automationStep > 1 || isGeneratingDrafts || selectedBatch?.status === 'active'
                      ? "bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-50"
                      : "bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black"
                    }`}
                >
                  {isGeneratingDrafts ? (
                    "Processing..."
                  ) : selectedBatch?.status === 'active' ? (
                    <>
                      <CheckCircle size={20} />
                      ✅ Campaign Already Launched
                    </>
                  ) : automationStep > 1 ? (
                    <>
                      <CheckCircle size={20} />
                      Drafts Generated
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate Email Drafts
                    </>
                  )}
                </motion.button>
              </>
            )}

            {automationStep === 3 && (
              <>
                {/* Start Date Picker */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 mb-4"
                >
                  <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Calendar size={20} />
                    Schedule Campaign Start
                  </h3>
                  <p className="text-neutral-400 text-sm mb-4">
                    Choose when to begin sending emails. The first email will be sent on this date, and subsequent emails will follow the schedule.
                  </p>
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm text-neutral-300 font-medium">
                      Start Date & Time
                    </label>
                    <input
                      id="startDate"
                      type="datetime-local"
                      value={campaignStartDate}
                      onChange={(e) => setCampaignStartDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                    <p className="text-xs text-neutral-500">
                      First email sends on {new Date(campaignStartDate).toLocaleString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>

                {/* Campaign Launch Loading State */}
                {isLaunchingCampaign && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-4"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-3 border-green-500/30 border-t-green-500 rounded-full mt-1 shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-300 mb-2 flex items-center gap-2">
                          <Mail size={20} />
                          Launching Campaign
                        </h3>
                        <p className="text-green-200/80 text-sm mb-3">
                          Setting up your campaign and queuing emails for automated delivery according to your schedule.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-green-300/70">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            Saving approved email drafts
                          </div>
                          <div className="flex items-center gap-2 text-xs text-green-300/70">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            Scheduling delivery times for {draftEmails.length} emails
                          </div>
                          <div className="flex items-center gap-2 text-xs text-green-300/70">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            Adding to send queue
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={!isLaunchingCampaign ? { scale: 1.02 } : {}}
                  whileTap={!isLaunchingCampaign ? { scale: 0.98 } : {}}
                  onClick={handleLaunchCampaign}
                  disabled={isLaunchingCampaign}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${isLaunchingCampaign
                      ? "bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-50"
                      : "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                    }`}
                >
                  {isLaunchingCampaign ? (
                    "Processing..."
                  ) : (
                    <>
                      <Zap size={20} />
                      Launch Campaign & Queue Emails
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        ) : (
          // Campaign Selection View
          <motion.div key="campaign-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-neutral-500" size={20} />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>
            </div>

            {/* Campaign Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                  />
                  <div className="text-center">
                    <p className="text-white font-medium mb-1">Loading Your Batches</p>
                    <p className="text-neutral-400 text-sm">Fetching batch data and statistics...</p>
                  </div>
                </motion.div>
              </div>
            ) : filteredBatches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center"
              >
                <Mail size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No batches found</h3>
                <p className="text-neutral-400">
                  Create batches from the Batches page to set up automations
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBatches.map((batch, idx) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleStartAutomation(batch)}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-[var(--color-gold)]/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-gold)] transition-colors line-clamp-2">
                          {batch.batch_name || batch.subject || "Untitled Batch"}
                        </h3>
                        <p className="text-sm text-neutral-400 mt-1">{batch.objective}</p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: -45 }}
                        className="flex-shrink-0"
                      >
                        <ArrowRight size={20} className="text-neutral-500 group-hover:text-[var(--color-gold)] transition-colors" />
                      </motion.div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Zap size={16} />
                        <span className="capitalize">{batch.persona}</span>
                      </div>
                      {batch.lead_count > 0 && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <Users size={16} />
                          <span>{batch.lead_count} leads</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                      <div
                        className={`w-2 h-2 rounded-full ${batch.status === "active"
                            ? "bg-green-400"
                            : batch.status === "paused"
                              ? "bg-yellow-400"
                              : "bg-gray-400"
                          }`}
                      />
                      <span className="text-xs text-neutral-400 capitalize">{batch.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
      
      {/* Email Trigger Modal */}
      <EmailTriggerModal
        isOpen={showEmailTriggerModal}
        onClose={() => setShowEmailTriggerModal(false)}
        onSuccess={() => {
          // Success animation is handled within the modal
          // No toaster needed - modal will auto-close after animation
        }}
        onError={(error) => {
          showToast(error, "error");
        }}
      />
    </div>
  );
}

