"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Eye, Mail, ChevronDown, AlertCircle, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Email {
  id: string;
  subject: string;
  body: string;
  preview?: string;
}

interface DraftReviewProps {
  drafts: Email[];
  onDraftsApprove: (drafts: Email[]) => void;
  isLoading?: boolean;
}

// Use actual user data instead of hardcoded samples
const getCurrentYear = () => new Date().getFullYear().toString();

// Utility functions for text/HTML conversion
const stripHTML = (html: string): string => {
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const convertTextToHTML = (text: string): string => {
  // Convert plain text to HTML with proper line breaks and paragraphs
  return text
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
};

// Render HTML email safely
const renderEmailHTML = (htmlContent: string): React.ReactNode => {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      className="text-neutral-300 break-words leading-relaxed text-base"
    />
  );
};

// Parse markdown formatting and return JSX - NO LONGER NEEDED (using HTML instead)
// Kept for backward compatibility but not used

export default function DraftReview({
  drafts,
  onDraftsApprove,
  isLoading = false,
}: DraftReviewProps) {
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(drafts[0]?.id || null);
  const [reviewStatus, setReviewStatus] = useState<Record<string, "pending" | "approved">>({});
  const [editingDraft, setEditingDraft] = useState<Record<string, Partial<Email>>>({});
  const [showPreview, setShowPreview] = useState(true); // Always show preview by default
  const [editingField, setEditingField] = useState<{draftId: string, field: 'subject' | 'body'} | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signatureBlock, setSignatureBlock] = useState<string>("");
  const supabase = createClient();

  // Fetch user's signature on mount
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("signature_block")
            .eq("id", user.id)
            .single();

          if (profile?.signature_block) {
            setSignatureBlock(profile.signature_block);
          }
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };

    fetchSignature();
  }, []);

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId);
  const allReviewed = drafts.every((d) => reviewStatus[d.id] === "approved");

  // Simple placeholder replacement without customization
  const replacePlaceholdersWithValues = (text: string, includeSignature: boolean = false): string => {
    let replaced = text;
    
    // Replace common placeholders with placeholder text to show structure
    const placeholders = {
      'recipient_name': '[Recipient Name]',
      'first_name': '[First Name]', 
      'city': '[City]',
      'company': '[Company Name]',
      'property_count': '[Property Count]',
      'market_trend': '[Market Trend]',
      'year': getCurrentYear()
    };
    
    Object.entries(placeholders).forEach(([key, value]) => {
      // Try double braces first {{first_name}}
      const doubleBracePattern = new RegExp(`{{${key}}}`, "g");
      replaced = replaced.replace(doubleBracePattern, value);
      // Fallback to single braces {first_name}
      const singleBracePattern = new RegExp(`{${key}}`, "g");
      replaced = replaced.replace(singleBracePattern, value);
    });
    
    // Append signature block ONLY if includeSignature is true and signature exists
    if (includeSignature && signatureBlock) {
      replaced = `${replaced}<br/><br/>---<br/><br/>${signatureBlock.replace(/\n/g, '<br/>')}`;
    }
    
    return replaced;
  };

  const handleApproveDraft = (draftId: string) => {
    setReviewStatus((prev) => ({
      ...prev,
      [draftId]: "approved",
    }));
  };

  const handleEditDraft = (draftId: string, field: "subject" | "body", value: string) => {
    setEditingDraft((prev) => ({
      ...prev,
      [draftId]: {
        ...prev[draftId],
        [field]: value,
      },
    }));
  };

  const handleApproveAll = () => {
    const finalDrafts = drafts.map((draft) => ({
      ...draft,
      ...editingDraft[draft.id],
    }));
    onDraftsApprove(finalDrafts);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Review & Approve Drafts</h2>
        <p className="text-neutral-400">
          Approve all <span className="text-[var(--color-gold)] font-semibold">{drafts.length}</span> drafts to launch your campaign
        </p>
      </div>

      {/* Top Bar - Dropdown & Controls */}
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-4">
        {/* Dropdown Selector */}
        <div className="relative flex-1">
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-400">DRAFT</span>
              <span className="text-white font-semibold">
                {selectedDraft?.subject.slice(0, 40)}
                {selectedDraft?.subject.length! > 40 ? "..." : ""}
              </span>
              {reviewStatus[selectedDraft?.id || ""] === "approved" && (
                <CheckCircle size={16} className="text-green-400" />
              )}
            </div>
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-neutral-400" />
            </motion.div>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-xl z-50 max-h-80 overflow-y-auto"
              >
                {drafts.map((draft, index) => (
                  <motion.button
                    key={draft.id}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    onClick={() => {
                      setSelectedDraftId(draft.id);
                      setShowPreview(false);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5 last:border-b-0 ${
                      selectedDraftId === draft.id ? "bg-[var(--color-gold)]/20" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-400 mb-1">Draft {index + 1}</p>
                      <p className="text-sm text-white truncate">{draft.subject}</p>
                    </div>
                    {reviewStatus[draft.id] === "approved" && (
                      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>



        {/* Approve Button */}
        {selectedDraft && (
          <>
            {reviewStatus[selectedDraft.id] !== "approved" ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleApproveDraft(selectedDraft.id)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300"
              >
                <CheckCircle size={18} />
                Approve
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300">
                <CheckCircle size={18} />
                <span className="font-semibold">Approved</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content - Full Screen Editor OR Preview */}
      {selectedDraft ? (
        /* Editable Preview */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-8 min-h-[600px] overflow-y-auto space-y-8"
        >
          {/* Subject */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Subject Line
              </p>
              <button
                onClick={() => setEditingField(
                  editingField?.draftId === selectedDraft.id && editingField?.field === 'subject' 
                    ? null 
                    : {draftId: selectedDraft.id, field: 'subject'}
                )}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20"
              >
                {editingField?.draftId === selectedDraft.id && editingField?.field === 'subject' ? 'Save' : 'Edit'}
              </button>
            </div>
            
            {editingField?.draftId === selectedDraft.id && editingField?.field === 'subject' ? (
              <input
                type="text"
                value={editingDraft[selectedDraft.id]?.subject || selectedDraft.subject}
                onChange={(e) => handleEditDraft(selectedDraft.id, "subject", e.target.value)}
                className="w-full text-3xl font-bold bg-transparent border border-yellow-500/50 rounded-lg p-3 text-[var(--color-gold)] focus:outline-none focus:border-yellow-500"
                autoFocus
              />
            ) : (
              <p className="text-3xl font-bold text-[var(--color-gold)] cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors"
                onClick={() => setEditingField({draftId: selectedDraft.id, field: 'subject'})}>
                {replacePlaceholdersWithValues(editingDraft[selectedDraft.id]?.subject || selectedDraft.subject, false)}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Body */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                ✉️ Email Body
              </p>
              <button
                onClick={() => setEditingField(
                  editingField?.draftId === selectedDraft.id && editingField?.field === 'body' 
                    ? null 
                    : {draftId: selectedDraft.id, field: 'body'}
                )}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20"
              >
                {editingField?.draftId === selectedDraft.id && editingField?.field === 'body' ? 'Save' : 'Edit'}
              </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              {editingField?.draftId === selectedDraft.id && editingField?.field === 'body' ? (
                <textarea
                  value={stripHTML(editingDraft[selectedDraft.id]?.body || selectedDraft.body)}
                  onChange={(e) => handleEditDraft(selectedDraft.id, "body", convertTextToHTML(e.target.value))}
                  className="w-full min-h-[400px] bg-transparent border border-yellow-500/50 rounded-lg p-4 text-neutral-300 focus:outline-none focus:border-yellow-500 resize-none"
                  placeholder="Enter your email content here..."
                  autoFocus
                />
              ) : (
                <div 
                  className="cursor-pointer hover:bg-white/5 p-2 rounded transition-colors min-h-[200px]"
                  onClick={() => setEditingField({draftId: selectedDraft.id, field: 'body'})}
                >
                  {renderEmailHTML(replacePlaceholdersWithValues(editingDraft[selectedDraft.id]?.body || selectedDraft.body, true))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="h-96 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg">
          <p className="text-neutral-400">Select a draft to get started</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="space-y-3">
        {!allReviewed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3 items-start"
          >
            <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-200">
                {drafts.length - Object.values(reviewStatus).filter((s) => s === "approved").length} Draft{drafts.length - Object.values(reviewStatus).filter((s) => s === "approved").length !== 1 ? "s" : ""} Remaining
              </p>
              <p className="text-xs text-yellow-200/70 mt-1">
                Approve all drafts to launch your campaign
              </p>
            </div>
          </motion.div>
        )}

        {/* Approve All Button */}
        <motion.button
          whileHover={allReviewed ? { scale: 1.02 } : {}}
          whileTap={allReviewed ? { scale: 0.98 } : {}}
          onClick={handleApproveAll}
          disabled={!allReviewed || isLoading}
          className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            allReviewed
              ? "bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black cursor-pointer shadow-lg shadow-[var(--color-gold)]/30"
              : "bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-50"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap size={20} />
              Launch Campaign with All Drafts
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
