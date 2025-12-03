"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { FileUpload } from "@/components/ui/file-upload";
import { leadsApi } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Upload,
  Link2,
  Check,
  X,
  AlertCircle,
  Edit2,
  Camera,
} from "lucide-react";

interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  batch_id: string;
  created_at: string;
  status?: "active" | "inactive" | "converted";
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface Batch {
  id: string;
  batch_name: string;
  lead_count: number;
  status: string;
}

export default function LeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState({ email: "", name: "", phone: "", address: "" });
  const [importMethod, setImportMethod] = useState<"manual" | "file" | "url" | "photo">("manual");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savingLeads, setSavingLeads] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [importBatchId, setImportBatchId] = useState<string>("");
  const [filterBatchId, setFilterBatchId] = useState<string>(""); // All batches by default

  

  const addToast = (message: string, type: "success" | "error" | "info" = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchLeads();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('batches')
        .select('id, batch_name, lead_count, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Recalculate lead counts from actual leads in database
      if (data) {
        const updatedBatches = await Promise.all(
          data.map(async (batch) => {
            const { count, error: countError } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('batch_id', batch.id)
              .eq('user_id', user.id);

            if (!countError) {
              return {
                ...batch,
                lead_count: count || 0,
              };
            }
            return batch;
          })
        );

        setBatches(updatedBatches || []);

        // Auto-select first batch if available
        if (updatedBatches && updatedBatches.length > 0) {
          setSelectedBatchId(updatedBatches[0].id);
          setImportBatchId(updatedBatches[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async () => {
    if (!newLead.email) {
      addToast("Email is required", "error");
      return;
    }

    if (!selectedBatchId) {
      addToast("Please select a batch", "error");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use backend to add lead
      const result = await leadsApi.addSingleLead(
        newLead.email,
        selectedBatchId,
        user.id,
        newLead.name || undefined,
        newLead.phone || undefined,
        newLead.address || undefined
      );

      // Add the newly created lead to local state
      if (result.lead) {
        const createdLead: Lead = {
          id: result.lead.id,
          email: result.lead.email,
          name: result.lead.name,
          phone: result.lead.phone,
          address: result.lead.address,
          batch_id: result.lead.batch_id,
          created_at: result.lead.created_at,
          status: result.lead.status,
        };
        setLeads([createdLead, ...leads]);
      }

      setNewLead({ email: "", name: "", phone: "", address: "" });
      setShowNewLeadModal(false);
      addToast("Lead added to batch successfully!", "success");
      fetchBatches(); // Refresh batch lead counts
    } catch (error) {
      console.error("Error adding lead:", error);
      addToast("Failed to add lead", "error");
    }
  };

  const handleEditLead = async () => {
    if (!editingLead) return;
    if (!editingLead.email) {
      addToast("Email is required", "error");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast("You must be logged in", "error");
        return;
      }

      // Check if this is a temporary lead (local only) or a real Supabase lead
      const isLocalLead = editingLead.id.startsWith("temp-");

      // Always try to update via backend if it's not a temporary lead
      if (!isLocalLead) {
        await leadsApi.updateLead(editingLead.id, user.id, {
          email: editingLead.email,
          name: editingLead.name || undefined,
          phone: editingLead.phone || undefined,
          address: editingLead.address || undefined,
        });
      }

      // Update local state
      setLeads(leads.map(lead => lead.id === editingLead.id ? editingLead : lead));
      
      setEditingLead(null);
      setShowEditModal(false);
      addToast("Lead updated successfully!", "success");
    } catch (error) {
      console.error("Error updating lead:", error);
      addToast("Failed to update lead", "error");
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast("You must be logged in", "error");
        return;
      }

      // Check if this is a temporary lead (local only)
      const isLocalLead = id.startsWith("temp-");

      // Only delete via backend if it's a real lead
      if (!isLocalLead) {
        await leadsApi.deleteLead(id, user.id);
      }
      
      // Update local state
      setLeads(leads.filter(lead => lead.id !== id));
      addToast("Lead deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting lead:", error);
      addToast("Failed to delete lead", "error");
    }
  };

  const handleImportLeads = async () => {
    if (importMethod === "file" && !importFile) {
      addToast("Please select a file", "error");
      return;
    }

    if (importMethod === "url" && !googleSheetUrl) {
      addToast("Please enter a Google Sheets URL", "error");
      return;
    }

    if (!importBatchId) {
      addToast("Please select a batch", "error");
      return;
    }

    try {
      setImporting(true);

      if (importMethod === "file" && importFile) {
        // Call backend to clean the leads
        const cleanedData = await leadsApi.cleanLeads(importFile, importBatchId);

        // Show preview with backend-cleaned data
        setPreviewData({
          cleaned_leads: cleanedData.cleaned_leads,
          total_records: cleanedData.original_count,
          invalid_rows: cleanedData.invalid_emails,
          duplicates_removed: cleanedData.duplicates_removed,
        });
        setShowPreview(true);
        setShowImportModal(false);
      } else if (importMethod === "url" && googleSheetUrl) {
        // Import from Google Sheets
        addToast("Importing from Google Sheets...", "info", 0);
        
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Get user token
        const { data: { session } } = await createClient().auth.getSession();
        const userToken = session?.access_token;

        const result = await leadsApi.importFromGoogleSheets(
          googleSheetUrl,
          importBatchId,
          user.id,
          userToken
        );

        // Refresh leads
        fetchLeads();
        
        // Show success toast
        addToast(
          `Successfully imported ${result.stats.inserted} leads from Google Sheets!`,
          "success"
        );

        setShowImportModal(false);
        setGoogleSheetUrl("");
        setImportBatchId("");
      } else if (importMethod === "photo" && importFile) {
        // Import from AI Photo Scanner
        addToast("Processing image with AI...", "info", 0);
        
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Get user token
        const { data: { session } } = await createClient().auth.getSession();
        const userToken = session?.access_token;

        const result = await leadsApi.importFromPhoto(
          importFile,
          importBatchId,
          user.id,
          userToken
        );

        // Refresh leads
        fetchLeads();
        
        // Show success toast
        addToast(
          `Successfully extracted ${result.stats.inserted} leads from photo!`,
          "success"
        );

        setShowImportModal(false);
        setImportFile(null);
        setImportBatchId("");
      }
    } catch (error) {
      console.error("Error importing leads:", error);
      addToast(error instanceof Error ? error.message : "Failed to process import", "error");
    } finally {
      setImporting(false);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      (filterBatchId === "" || lead.batch_id === filterBatchId) &&
      (lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log("LEADS STATE:", leads);
  console.log("FILTERED LEADS:", filteredLeads);
  console.log("LEADS COUNT:", leads.length);

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

  return (
    <div className="px-4 sm:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Leads</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Manage and track all your leads in one place
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold rounded-lg transition-all"
          >
            <Upload size={20} />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30"
          >
            <Plus size={20} />
            <span>Add Lead</span>
          </button>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-6 flex-wrap"
      >
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
            />
          </div>
        </div>

        {/* Batch Filter */}
        <select
          value={filterBatchId}
          onChange={(e) => setFilterBatchId(e.target.value)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-400 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
        >
          <option value="">All Batches</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.batch_name} ({batch.lead_count} leads)
            </option>
          ))}
        </select>

        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors text-sm">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#1A1A1A] border border-neutral-800 rounded-xl overflow-hidden"
      >
        {/* DEBUG: Show leads count */}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-neutral-400">Loading leads...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="py-12 text-center"
          >
            <div className="text-neutral-500 mb-4">
              <Mail size={48} className="mx-auto opacity-50 mb-4" />
              <p className="text-lg font-medium">No leads yet</p>
              <p className="text-sm mt-1">Start by adding your first lead or importing leads from a file</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-6 py-4 bg-[#0A0A0A] border-b border-neutral-800 grid grid-cols-12 gap-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              <div className="col-span-2">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Number</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-neutral-800">
              {filteredLeads.map((lead, index) => {
                console.log("Rendering lead:", lead);
                return (
                  <div
                    key={lead.id}
                    className="px-6 py-4 hover:bg-neutral-900/50 transition-colors group grid grid-cols-12 gap-4 items-center"
                  >
                    {/* Name */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-soft)] flex items-center justify-center flex-shrink-0">
                        <span className="text-black text-xs font-bold">
                          {(lead.name || lead.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-white truncate">
                        {lead.name || "-"}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="col-span-3">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[var(--color-gold)] hover:underline text-sm truncate block"
                      >
                        {lead.email}
                      </a>
                    </div>

                    {/* City */}
                    <div className="col-span-2 text-sm text-neutral-400 truncate">
                      {lead.address || "-"}
                    </div>

                    {/* Number (Phone) */}
                    <div className="col-span-2 text-sm text-neutral-400 truncate">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="hover:text-white transition-colors">
                          {lead.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setShowEditModal(true);
                        }}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg transition-all text-neutral-400"
                        title="Edit lead"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-neutral-400"
                        title="Delete lead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-neutral-800">
          {filteredLeads.map((lead) => (
            <motion.div
              key={lead.id}
              variants={itemVariants}
              className="px-4 py-4 hover:bg-neutral-900/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-soft)] flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-xs font-bold">
                      {lead.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{lead.name || lead.email}</p>
                    <p className="text-xs text-[var(--color-gold)] truncate">{lead.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLead(lead.id)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-neutral-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {lead.phone && (
                <p className="text-xs text-neutral-400 mb-1 flex items-center gap-2">
                  <Phone size={14} /> {lead.phone}
                </p>
              )}
              {lead.address && (
                <p className="text-xs text-neutral-400 flex items-center gap-2">
                  <MapPin size={14} /> {lead.address}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data Preview Modal */}
      {showPreview && previewData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPreview(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] border border-neutral-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-neutral-800 px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Preview Imported Data</h2>
                  <p className="text-neutral-400 text-sm mt-1">
                    {previewData.cleaned_leads?.length || 0} leads ready to be imported
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-neutral-900 rounded-lg p-3">
                  <p className="text-xs text-neutral-400 mb-1">Total Records</p>
                  <p className="text-xl font-bold text-white">{previewData.total_records || 0}</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <p className="text-xs text-neutral-400 mb-1">Valid Leads</p>
                  <p className="text-xl font-bold text-green-400">{previewData.cleaned_leads?.length || 0}</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                  <p className="text-xs text-neutral-400 mb-1">Duplicates Removed</p>
                  <p className="text-xl font-bold text-yellow-400">{previewData.duplicates_removed || 0}</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                  <p className="text-xs text-neutral-400 mb-1">Invalid Rows</p>
                  <p className="text-xl font-bold text-red-400">{previewData.invalid_rows || 0}</p>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Phone</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Address</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.cleaned_leads?.slice(0, 10).map((lead: any, idx: number) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-neutral-800 hover:bg-neutral-900/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-soft)] flex items-center justify-center flex-shrink-0">
                              <span className="text-black text-xs font-bold">
                                {lead.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <a href={`mailto:${lead.email}`} className="text-[var(--color-gold)] hover:underline text-sm truncate">
                              {lead.email}
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-white">{lead.name || "-"}</td>
                        <td className="py-4 px-4 text-sm text-neutral-400">{lead.phone || "-"}</td>
                        <td className="py-4 px-4 text-sm text-neutral-400 max-w-xs truncate">{lead.address || "-"}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            Valid
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewData.cleaned_leads?.length > 10 && (
                <div className="text-center mt-6 text-neutral-400 text-sm">
                  + {previewData.cleaned_leads.length - 10} more leads
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#0A0A0A] border-t border-neutral-800 px-8 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    // Call backend to save leads to Supabase
                    (async () => {
                      try {
                        setSavingLeads(true);
                        
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          addToast("You must be logged in", "error");
                          return;
                        }

                        if (!importFile) {
                          addToast("No file selected", "error");
                          return;
                        }

                        // Get JWT token from session for authenticated operations
                        const { data: { session } } = await supabase.auth.getSession();
                        const userToken = session?.access_token;

                        // Call backend import-and-save endpoint using axios
                        const result = await leadsApi.importAndSaveLeads(
                          importFile,
                          importBatchId,
                          user.id,
                          userToken  // Pass JWT token for authenticated insert
                        );
                        
                        // Small delay to ensure database updates are committed
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // Refresh leads from database
                        await fetchLeads();
                        await fetchBatches();

                        // Close modal and reset
                        setShowPreview(false);
                        setPreviewData(null);
                        setImportFile(null);
                        setGoogleSheetUrl("");
                        
                        addToast(`✅ Successfully imported ${result.stats.inserted} leads!`, "success");
                      } catch (error) {
                        console.error("Error saving leads:", error);
                        addToast(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
                      } finally {
                        setSavingLeads(false);
                      }
                    })();
                  } catch (error) {
                    console.error("Error importing leads:", error);
                    addToast("Failed to import leads", "error");
                  }
                }}
                disabled={savingLeads}
                className="px-6 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30 flex items-center justify-center gap-2 min-w-[160px]"
              >
                {savingLeads ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  `Import ${previewData.cleaned_leads?.length || 0} Leads`
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Import Leads Modal */}
      {showImportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowImportModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Import Leads</h3>

            {/* Batch Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Import to Batch *
              </label>
              <select
                value={importBatchId}
                onChange={(e) => setImportBatchId(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
              >
                <option value="">Choose a batch...</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_name} ({batch.lead_count} leads)
                  </option>
                ))}
              </select>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { id: "file", label: "File (CSV/Excel)", icon: Upload },
                { id: "url", label: "Google Sheets", icon: Link2 },
                { id: "photo", label: "AI Photo Scanner", icon: Camera },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setImportMethod(id as any)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    importMethod === id
                      ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)]"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium text-center">{label}</span>
                </button>
              ))}
            </div>

            {/* File Upload using Aceternity Component */}
            {importMethod === "file" && (
              <div className="mb-6">
                {/* <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span><strong>Required columns:</strong> Email and Name</span>
                  </p>
                </div> */}
                <FileUpload
                  onChange={(files) => {
                    if (files.length > 0) {
                      setImportFile(files[0]);
                    }
                  }}
                />
              </div>
            )}

            {/* Google Sheets URL */}
            {importMethod === "url" && (
              <div className="mb-6">
                {/* <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span><strong>Required columns:</strong> Email and Name</span>
                  </p>
                </div> */}
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Google Sheets URL
                </label>
                <input
                  type="url"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Make sure the sheet is publicly accessible
                </p>
              </div>
            )}

            {/* AI Photo Scanner */}
            {importMethod === "photo" && (
              <div className="mb-6">
                <div className="mb-3 p-3 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 rounded-lg">
                  <p className="text-xs text-[var(--color-gold)] flex items-center gap-2">
                    <Camera size={14} />
                    <span><strong>AI-Powered:</strong> Upload photos of business cards, flyers, or documents with contact information</span>
                  </p>
                </div>
                <FileUpload
                  onChange={(files) => {
                    if (files.length > 0) {
                      setImportFile(files[0]);
                    }
                  }}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Supported formats: JPG, PNG, PDF • AI will extract contact details automatically
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportLeads}
                disabled={importing || (importMethod === "file" && !importFile) || (importMethod === "url" && !googleSheetUrl) || (importMethod === "photo" && !importFile)}
                className="flex-1 px-4 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-all"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Lead Modal */}
      {showNewLeadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowNewLeadModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Lead</h3>

            <div className="space-y-4 mb-6">
              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Select Batch *
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                >
                  <option value="">Choose a batch...</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_name} ({batch.lead_count} leads)
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="lead@example.com"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Address
                </label>
                <textarea
                  value={newLead.address}
                  onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  rows={3}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLead}
                className="flex-1 px-4 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30"
              >
                Add Lead
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowEditModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] border border-neutral-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Edit Lead</h3>

            <div className="space-y-4 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editingLead.name || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  placeholder="lead@example.com"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingLead.phone || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                />
              </div>

              {/* City/Address */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  City
                </label>
                <textarea
                  value={editingLead.address || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, address: e.target.value })}
                  placeholder="City name"
                  rows={2}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditLead}
                className="flex-1 px-4 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm pointer-events-auto ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : toast.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}
          >
            {toast.type === "success" && <Check size={18} />}
            {toast.type === "error" && <AlertCircle size={18} />}
            {toast.type === "info" && <AlertCircle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

