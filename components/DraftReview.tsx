"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Calendar,
    ChevronRight,
    CheckCircle,
    Edit2,
    Eye,
    Clock,
    Send,
    User,
    MoreHorizontal,
    Paperclip,
    CornerUpLeft,
    X
} from "lucide-react";
import EmailEditor from "./EmailEditor";

interface Draft {
    id: string;
    category_id?: string;
    category_name: string;
    subject: string;
    body: string;
    send_day: number;
    order: number;
    month_phase: string;
    month_number: number;
    scheduled_for?: string;
}

interface DraftReviewProps {
    drafts: Draft[];
    onDraftsApprove: (drafts: Draft[]) => void;
    isLoading: boolean;
}

export default function DraftReview({
    drafts: initialDrafts,
    onDraftsApprove,
    isLoading,
}: DraftReviewProps) {
    const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
    const [selectedDraftId, setSelectedDraftId] = useState<string>(
        initialDrafts[0]?.id || ""
    );
    const [isEditing, setIsEditing] = useState(false);

    // Update local state if props change
    useEffect(() => {
        setDrafts(initialDrafts);
        if (initialDrafts.length > 0 && !selectedDraftId) {
            setSelectedDraftId(initialDrafts[0].id);
        }
    }, [initialDrafts]);

    const selectedDraft = drafts.find((d) => d.id === selectedDraftId);

    const handleUpdateDraft = (field: "subject" | "body", value: string) => {
        if (!selectedDraft) return;

        setDrafts((prev) =>
            prev.map((d) =>
                d.id === selectedDraftId ? { ...d, [field]: value } : d
            )
        );
    };

    const handleApproveAll = () => {
        onDraftsApprove(drafts);
    };

    // Helper to strip HTML for preview snippet in sidebar
    const getPreviewSnippet = (html: string) => {
        return html.replace(/<[^>]*>?/gm, "").substring(0, 60) + "...";
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Draft List */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-neutral-900/80 backdrop-blur-sm">
                    <div className="p-4 border-b border-white/10 bg-neutral-900/50">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Mail size={18} className="text-blue-400" />
                            Draft Emails
                            <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-neutral-400">
                                {drafts.length}
                            </span>
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {drafts.map((draft, idx) => (
                            <motion.button
                                key={draft.id}
                                onClick={() => {
                                    setSelectedDraftId(draft.id);
                                    setIsEditing(false);
                                }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`w-full text-left p-3 rounded-xl transition-all border ${selectedDraftId === draft.id
                                    ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${selectedDraftId === draft.id
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-white/10 text-neutral-400"
                                        }`}>
                                        Day {draft.send_day}
                                    </span>
                                    {selectedDraftId === draft.id && (
                                        <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    )}
                                </div>
                                <h4 className={`text-sm font-medium truncate mb-1 ${selectedDraftId === draft.id ? "text-white" : "text-neutral-300"
                                    }`}>
                                    {draft.subject || "(No Subject)"}
                                </h4>
                                <p className="text-xs text-neutral-500 truncate">
                                    {getPreviewSnippet(draft.body)}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Main Content - Preview/Edit */}
                <div className="flex-1 flex flex-col bg-neutral-950 relative">
                    {selectedDraft ? (
                        <>
                            {/* Email Header */}
                            <div className="px-8 py-6 border-b border-white/5 bg-neutral-900/30">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={selectedDraft.subject}
                                                        onChange={(e) => handleUpdateDraft("subject", e.target.value)}
                                                        className="bg-transparent border-b border-white/20 focus:border-blue-500 outline-none w-full min-w-[300px]"
                                                        placeholder="Subject Line"
                                                    />
                                                ) : (
                                                    selectedDraft.subject
                                                )}
                                                {!isEditing && (
                                                    <span className="text-xs font-normal text-neutral-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                        Inbox
                                                    </span>
                                                )}
                                            </h2>
                                            <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                                                <span className="text-blue-400 font-medium">You</span>
                                                <span>to</span>
                                                <span className="text-neutral-300">Lead Name</span>
                                                <div className="w-1 h-1 rounded-full bg-neutral-600" />
                                                <span>{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`p-2 rounded-lg transition-colors ${isEditing
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                                                }`}
                                            title={isEditing ? "View Preview" : "Edit Email"}
                                        >
                                            {isEditing ? <Eye size={18} /> : <Edit2 size={18} />}
                                        </button>
                                        <div className="h-6 w-px bg-white/10 mx-1" />
                                        <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                                            <CornerUpLeft size={18} />
                                        </button>
                                        <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Meta Info Bar */}
                                <div className="flex items-center gap-6 text-xs text-neutral-500 bg-white/5 rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-neutral-400" />
                                        <span>Scheduled for Day {selectedDraft.send_day}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-neutral-400" />
                                        <span>Sends at 10:00 AM (Local)</span>
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <Paperclip size={14} className="text-neutral-400" />
                                        <span>No attachments</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email Body */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {isEditing ? (
                                        <motion.div
                                            key="editor"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="h-full"
                                        >
                                            <EmailEditor
                                                subject={selectedDraft.subject}
                                                body={selectedDraft.body}
                                                onSubjectChange={(val) => handleUpdateDraft("subject", val)}
                                                onBodyChange={(val) => handleUpdateDraft("body", val)}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="preview"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="prose prose-invert max-w-none"
                                        >
                                            <div
                                                className="email-content text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans"
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedDraft.body
                                                        .replace(/\n/g, '<br/>') // Ensure line breaks are respected in preview
                                                }}
                                            />

                                            {/* Signature Placeholder */}
                                            <div className="mt-12 pt-8 border-t border-white/10 text-neutral-500 text-sm">
                                                <p className="italic">[Your Signature Will Be Added Here]</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                            <Mail size={48} className="mb-4 opacity-20" />
                            <p>Select a draft to preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-neutral-900/80 backdrop-blur-sm flex justify-between items-center">
                <div className="text-sm text-neutral-400">
                    <span className="text-white font-medium">{drafts.length}</span> drafts ready for review
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApproveAll}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isLoading
                        ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25"
                        }`}
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Approving...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={18} />
                            Approve All Drafts
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
