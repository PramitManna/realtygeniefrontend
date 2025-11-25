"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import DraftReview from "@/components/DraftReview";
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

interface Campaign {
  id: string;
  batch_id: string;
  name?: string;
  subject?: string;
  body?: string;
  status: "active" | "paused" | "draft";
  tones: string[];
  objective: string;
  created_at?: string;
  emailsSent?: number;
  emailsTotal?: number;
}

interface AutomationSetup {
  campaignId: string;
  draftEmails: any[];
  step: 1 | 2 | 3;
}

export default function AutomationsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignTones, setCampaignTones] = useState<string[]>([]);
  const [showDraftReview, setShowDraftReview] = useState(false);
  const [draftEmails, setDraftEmails] = useState<any[]>([]);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [automationStep, setAutomationStep] = useState(1);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
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
          fetchCampaigns(user.id);
        }
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    initData();
  }, []);

  const fetchCampaigns = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
      console.log(data)
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      showToast("Failed to load campaigns", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const generateDraftEmails = async (campaign: Campaign) => {
    // Prevent generating drafts if campaign already launched
    if (selectedCampaign?.status === 'active') {
      showToast('❌ Campaign already launched. Cannot generate new drafts.', 'error');
      return;
    }

    setIsGeneratingDrafts(true);
    try {
      // Get campaign ID - use name as fallback if ID not available
      const campaignId = selectedCampaign?.id || selectedCampaign?.name || 'unknown';

      // Get user ID from auth session
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '';

      let agentName = 'Your Name';
      let companyName = 'Your Company';
      let target_city = "your city"

      console.log(selectedCampaign)

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, brokerage, markets')
          .eq('id', user.id)
          .single();

        if (profileData) {
          agentName = profileData.full_name || agentName;
          companyName = profileData.brokerage || companyName;
          target_city = profileData.markets || target_city;
        }
      }

      console.log("CAMPAIGN TONES " + campaignTones)

      const response = await fetch('/api/campaigns/generate-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          campaign_name: selectedCampaign?.name || 'Campaign',
          target_city: Array.isArray(target_city) ? target_city : ["Canadian City"],
          tones: campaignTones.length > 0 ? campaignTones : ['Professional'],
          objective: selectedCampaign?.objective || 'lead_nurturing',
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Backend error:", errText);
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
      showToast(`✨ Generated ${draftEmails.length} email drafts for Month 1`, 'success');
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
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      if (!selectedCampaign) {
        showToast("Campaign not selected", "error");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast("User not authenticated", "error");
        return;
      }

      setIsGeneratingDrafts(true); // Reuse loading state for launch

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

      console.log('📧 Launching campaign with emails:', formattedEmails);

      // Call backend to save approved emails and queue them for sending
      const response = await fetch('/api/campaign-emails/save-approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: selectedCampaign.id,
          user_id: user.id,
          emails: formattedEmails,
          campaign_start_date: new Date().toISOString(),
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

      showToast("🚀 Campaign launched! Emails queued for sending.", "success");

      // Update the campaign status to 'active' in our local state
      setCampaigns(campaigns.map(c =>
        c.id === selectedCampaign.id
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
      setIsGeneratingDrafts(false);
    }
  };

  const handleStartAutomation = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignTones(campaign.tones || []);
    setAutomationStep(1);

    // If campaign is active, fetch pending emails
    if (campaign.status === 'active') {
      fetchPendingEmails(campaign.id);
    }
  };

  const fetchPendingEmails = async (campaignId: string) => {
    try {
      setIsLoadingStats(true);
      console.log(`[DEBUG] Fetching pending emails for campaign ID: "${campaignId}"`);
      const fullUrl = `${API_CONFIG.BACKEND_URL}/api/campaigns/queue-stats/${campaignId}`;

      const response = await axios.get(fullUrl);

      const data = response.data;

      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format");
      }

      // Format the pending emails for display
      const emailsList = data.pending_emails || [];
      console.log(`Found ${emailsList.length} pending email types`);

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
    setSelectedCampaign(null);
    setCampaignTones([]);
    setDraftEmails([]);
    setShowDraftReview(false);
    setAutomationStep(1);
    setQueueStats(null);
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    (campaign.name || campaign.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
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
              Create and manage multi-touch email campaigns with AI-generated drafts
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {selectedCampaign && showDraftReview ? (
          // Draft Review View
          <motion.div
            key="draft-review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetAutomation}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <X size={16} />
                Back to Campaigns
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <DraftReview
                drafts={draftEmails}
                onDraftsApprove={handleDraftsApprove}
                isLoading={false}
              />
            </motion.div>
          </motion.div>
        ) : selectedCampaign ? (
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetAutomation}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-lg font-semibold transition-all flex items-center gap-2"
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
                {selectedCampaign.name || selectedCampaign.subject || "Campaign Setup"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">tones</p>
                  <p className="text-white font-semibold break-words text-sm">{selectedCampaign.tones}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Objective</p>
                  <p className="text-white font-semibold break-words text-sm">{selectedCampaign.objective}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Status</p>
                  <p className={`font-semibold ${selectedCampaign.status === 'active'
                      ? 'text-green-400'
                      : selectedCampaign.status === 'paused'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }`}>
                    {selectedCampaign.status === 'active' ? '🚀 Active' : selectedCampaign.status === 'paused' ? '⏸️ Paused' : '📝 Draft'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-1">Recipients</p>
                  <p className="text-white font-semibold">{selectedCampaign.emailsTotal || "—"}</p>
                </div>
              </div>
            </motion.div>

            {/* Pending Emails (if active) */}
            {selectedCampaign.status === 'active' && (
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
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader size={24} className="text-green-400" />
                    </motion.div>
                    <span className="ml-3 text-neutral-300">Loading scheduled emails...</span>
                  </div>
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
            {selectedCampaign.status !== 'active' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {[
                  {
                    step: 1,
                    title: "Generate Email Drafts",
                    description: "AI creates 5 unique email variations tailored to your campaign tones and objective",
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
              <motion.button
                whileHover={!isGeneratingDrafts && selectedCampaign?.status !== 'active' ? { scale: 1.02 } : {}}
                whileTap={!isGeneratingDrafts && selectedCampaign?.status !== 'active' ? { scale: 0.98 } : {}}
                onClick={() => generateDraftEmails(selectedCampaign)}
                disabled={automationStep > 1 || isGeneratingDrafts || selectedCampaign?.status === 'active'}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${automationStep > 1 || isGeneratingDrafts || selectedCampaign?.status === 'active'
                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-50"
                    : "bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black"
                  }`}
              >
                {isGeneratingDrafts ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader size={20} />
                    </motion.div>
                    Generating Drafts...
                  </>
                ) : selectedCampaign?.status === 'active' ? (
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
            )}

            {automationStep === 3 && (
              <motion.button
                whileHover={!isGeneratingDrafts ? { scale: 1.02 } : {}}
                whileTap={!isGeneratingDrafts ? { scale: 0.98 } : {}}
                onClick={handleLaunchCampaign}
                disabled={isGeneratingDrafts}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${isGeneratingDrafts
                    ? "bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-50"
                    : "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                  }`}
              >
                {isGeneratingDrafts ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader size={20} />
                    </motion.div>
                    Launching Campaign...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    🚀 Launch Campaign & Queue Emails
                  </>
                )}
              </motion.button>
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
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>
            </div>

            {/* Campaign Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-neutral-400">Loading campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-dashed border-white/20 rounded-xl p-12 text-center"
              >
                <Mail size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No campaigns found</h3>
                <p className="text-neutral-400">
                  Create campaigns from the Campaigns page to set up automations
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map((campaign, idx) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleStartAutomation(campaign)}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-[var(--color-gold)]/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-gold)] transition-colors line-clamp-2">
                          {campaign.name || campaign.subject || "Untitled Campaign"}
                        </h3>
                        <p className="text-sm text-neutral-400 mt-1">{campaign.objective}</p>
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
                        <span>{campaign.tones}</span>
                      </div>
                      {campaign.emailsTotal && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <Users size={16} />
                          <span>{campaign.emailsTotal} recipients</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                      <div
                        className={`w-2 h-2 rounded-full ${campaign.status === "active"
                            ? "bg-green-400"
                            : campaign.status === "paused"
                              ? "bg-yellow-400"
                              : "bg-gray-400"
                          }`}
                      />
                      <span className="text-xs text-neutral-400 capitalize">{campaign.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  );
}
