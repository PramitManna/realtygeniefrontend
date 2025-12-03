"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Copy,
  Check,
  AlertCircle,
  Type,
} from "lucide-react";

interface EmailEditorProps {
  subject: string;
  body: string;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  preview?: {
    name?: string;
    city?: string;
  };
}

export default function EmailEditor({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  preview,
}: EmailEditorProps) {
  const [view, setView] = useState<"visual" | "html">("visual");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const previewSubject = subject
    .replace(/\{\{name\}\}/g, preview?.name || "{{name}}")
    .replace(/\{\{city\}\}/g, preview?.city || "{{city}}")
    .replace(/\{\{company\}\}/g, "Acme Corp")
    .replace(/\{\{property_count\}\}/g, "5")
    .replace(/\{\{market_trend\}\}/g, "bullish")
    .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

  const previewBody = body
    .replace(/\{\{name\}\}/g, preview?.name || "{{name}}")
    .replace(/\{\{city\}\}/g, preview?.city || "{{city}}")
    .replace(/\{\{company\}\}/g, "Acme Corp")
    .replace(/\{\{property_count\}\}/g, "5")
    .replace(/\{\{market_trend\}\}/g, "bullish")
    .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());

  const copyPreviewToClipboard = () => {
    const content = `Subject: ${previewSubject}\n\n${body}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertFormatting = (before: string, after: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end) || "text";
    const newText =
      body.substring(0, start) +
      before +
      selectedText +
      after +
      body.substring(end);

    onBodyChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  const insertPlaceholder = (placeholder: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newText = body.substring(0, start) + placeholder + body.substring(start);

    onBodyChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + placeholder.length;
      textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  const wordCount = body.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = body.length;

  // Convert markdown/HTML formatting to rendered HTML for preview
  const renderPreviewBody = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/_(.*?)_/g, "<em>$1</em>") // Italic
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>") // Underline (already HTML)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #f59e0b; text-decoration: underline;">$1</a>') // Links
      .replace(/^- (.*?)$/gm, "<li>$1</li>") // Bullets
      .replace(/^1\. (.*?)$/gm, "<li>$1</li>") // Numbered lists
      .replace(/(?:\r\n|\r|\n)/g, "<br />"); // Line breaks
  };

  return (
    <div className="space-y-6">
      {/* Subject Line */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <Type size={16} />
          Email Subject Line
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="e.g., {{name}}, discover opportunities in {{city}}"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all"
        />
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <AlertCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300">Preview: {previewSubject || "Your subject line..."}</p>
        </div>
      </div>

      {/* Toolbar & Toggle */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView("visual")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                view === "visual"
                  ? "bg-[var(--color-gold)] text-black shadow-lg shadow-[var(--color-gold)]/20"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              <Eye size={16} />
              Visual
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView("html")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                view === "html"
                  ? "bg-[var(--color-gold)] text-black shadow-lg shadow-[var(--color-gold)]/20"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10"
              }`}
            >
              <Code size={16} />
              HTML
            </motion.button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {view === "visual" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1 p-3 bg-white/5 border border-white/10 rounded-lg"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => insertFormatting("**", "**")}
              title="Bold"
              className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <Bold size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => insertFormatting("_", "_")}
              title="Italic"
              className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <Italic size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => insertFormatting("<u>", "</u>")}
              title="Underline"
              className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <Underline size={18} />
            </motion.button>
            <div className="w-px bg-white/10" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => insertFormatting("[", "](url)")}
              title="Link"
              className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <Link2 size={18} />
            </motion.button>
            <div className="w-px bg-white/10" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => insertFormatting("- ")}
              title="Bullet List"
              className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <List size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => insertFormatting("1. ")}
              title="Numbered List"
              className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
            >
              <ListOrdered size={18} />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Main Editor */}
      <motion.div className="space-y-3" layout>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white">Email Body</label>
            <div className="flex gap-2 text-xs text-neutral-500">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Write your email body here. Use {{placeholders}} for dynamic content."
            className="w-full h-96 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all font-mono text-sm resize-none leading-relaxed"
          />

          {/* Placeholders Grid */}
        </motion.div>
    </div>
  );
}
