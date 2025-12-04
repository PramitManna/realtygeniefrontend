'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, Edit2, X, FileText, Target, Radio, Clock, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { batchesApi } from '@/lib/api';

const supabase = createClient();



interface Batch {
  id: string;
  batch_name: string;
  description?: string;
  status: string;
  lead_count: number;
  created_at: string;
  objective?: string;
  tone_override?: string | string[];
  schedule_cadence?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDescription, setNewBatchDescription] = useState('');
  const [newBatchObjective, setNewBatchObjective] = useState('');
  const [newBatchPersonas, setNewBatchPersonas] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const personaOptions = [
    { value: 'buyer', label: 'Buyer', description: 'Looking to purchase properties' },
    { value: 'seller', label: 'Seller', description: 'Looking to sell properties' },
    { value: 'investor', label: 'Investor', description: 'Investment opportunities' },
    { value: 'past_client', label: 'Past Client', description: 'Existing or past clients' },
    { value: 'referral', label: 'Referral', description: 'Referral sources' },
    { value: 'cold_prospect', label: 'Cold Prospect', description: 'New potential clients' },
  ];

  // Fetch batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Recalculate lead counts from actual leads in database
      if (data) {
        const batchesWithCounts = await Promise.all(
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

        setBatches(batchesWithCounts || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      addToast('Failed to load batches', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateBatch = async () => {
    if (!newBatchName.trim()) {
      addToast('Batch name is required', 'error');
      return;
    }

    if (!newBatchObjective) {
      addToast('Please select an objective', 'error');
      return;
    }



    if (newBatchPersonas.length === 0) {
      addToast('Please select a target persona', 'error');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const batchData = {
        user_id: user.id,
        batch_name: newBatchName,
        description: newBatchDescription,
        objective: newBatchObjective || null,
        persona: newBatchPersonas.length > 0 ? newBatchPersonas[0] : null,
        status: 'active',
        lead_count: 0
      };

      console.log('Creating batch with data:', batchData);

      const { data, error } = await supabase
        .from('batches')
        .insert([batchData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        const errorMessage = error.message || error.details || JSON.stringify(error) || 'Unknown error';
        throw new Error(errorMessage);
      }

      console.log('Batch created successfully:', data);

      setBatches([...(data || []), ...batches]);
      setNewBatchName('');
      setNewBatchDescription('');
      setNewBatchObjective('');
      setNewBatchPersonas([]);
      setShowCreateModal(false);
      addToast('Batch created successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error creating batch:', error);
      console.error('Error message:', errorMessage);
      addToast(`Error creating batch: ${errorMessage}`, 'error');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;

      setBatches(batches.filter(b => b.id !== batchId));
      setShowDeleteConfirmModal(false);
      setBatchToDelete(null);
      addToast('Batch deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting batch:', error);
      addToast('Failed to delete batch', 'error');
    }
  };

  const handleEditBatch = async () => {
    if (!editingBatch || !editingBatch.batch_name.trim()) {
      addToast('Batch name is required', 'error');
      return;
    }



    if (!(editingBatch as any).personas || (editingBatch as any).personas.length === 0) {
      addToast('Please select a target persona', 'error');
      return;
    }

    try {
      setEditLoading(true);
      const { error } = await supabase
        .from('batches')
        .update({
          batch_name: editingBatch.batch_name,
          description: editingBatch.description,
          objective: editingBatch.objective,
          persona: (editingBatch as any).personas || null,
          schedule_cadence: editingBatch.schedule_cadence,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBatch.id);

      if (error) throw error;

      setBatches(batches.map(b => b.id === editingBatch.id ? editingBatch : b));
      setShowEditModal(false);
      setEditingBatch(null);
      addToast('Batch updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating batch:', error);
      addToast('Failed to update batch', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleStatusToggle = async (batch: Batch) => {
    try {
      const newStatus = batch.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('batches')
        .update({ status: newStatus })
        .eq('id', batch.id);

      if (error) throw error;

      setBatches(batches.map(b => b.id === batch.id ? { ...b, status: newStatus } : b));
      addToast(`Batch ${newStatus === 'active' ? 'activated' : 'paused'}`, 'success');
    } catch (error) {
      console.error('Error toggling status:', error);
      addToast('Failed to update batch status', 'error');
    }
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
          <h2 className="text-2xl font-bold text-white">Batches</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Organize and manage your lead batches
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[var(--color-gold)]/30"
        >
          <Plus size={20} />
          <span>New Batch</span>
        </button>
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-400">Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-16 bg-[#0A0A0A]/50 rounded-lg border border-neutral-800">
          <p className="text-neutral-400 mb-4">No batches yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black px-4 py-2 rounded-lg transition-all font-semibold"
          >
            <Plus size={18} /> Create your first batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0A]/50 border border-neutral-800 rounded-lg p-6 hover:border-[var(--color-gold)]/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{batch.batch_name}</h3>
                  {batch.description && (
                    <p className="text-sm text-neutral-400 mb-2">{batch.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  batch.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {batch.status}
                </span>
              </div>

              {/* Lead count */}
              <div className="mb-4 p-3 bg-[#1A1A2E]/50 rounded-lg border border-neutral-800">
                <p className="text-sm text-neutral-400">Total Leads</p>
                <p className="text-2xl font-bold text-white">{batch.lead_count}</p>
              </div>

              {/* Created date */}
              <p className="text-xs text-neutral-500 mb-4">
                Created {new Date(batch.created_at).toLocaleDateString()}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBatch(batch);
                    setShowEditModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-[var(--color-gold)]/20 hover:text-[var(--color-gold)] text-white px-3 py-2 rounded transition-all"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleStatusToggle(batch)}
                  className={`flex-1 px-3 py-2 rounded transition-all text-sm font-semibold ${
                    batch.status === 'active'
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  }`}
                >
                  {batch.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => {
                    setBatchToDelete(batch.id);
                    setShowDeleteConfirmModal(true);
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0A] rounded-lg p-6 w-full max-w-md border border-neutral-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Create New Batch</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBatchName('');
                  setNewBatchDescription('');
                  setNewBatchObjective('');
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-200 mb-2">Batch Name *</label>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="e.g., January Campaign, Q4 Leads"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-200 mb-2">Objective *</label>
                <select
                  value={newBatchObjective}
                  onChange={(e) => setNewBatchObjective(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--color-gold)]/50"
                >
                  <option value="">Select an objective</option>
                  <option value="Schedule property showings">Schedule property showings</option>
                  <option value="Generate qualified leads">Generate qualified leads</option>
                  <option value="Increase property listings">Increase property listings</option>
                  <option value="Follow-up on property inquiries">Follow-up on property inquiries</option>
                  <option value="Re-engage inactive prospects">Re-engage inactive prospects</option>
                  <option value="Market new listings">Market new listings</option>
                  <option value="Promote open house events">Promote open house events</option>
                  <option value="Collect buyer preferences">Collect buyer preferences</option>
                  <option value="Nurture long-term prospects">Nurture long-term prospects</option>
                  <option value="Convert leads to clients">Convert leads to clients</option>
                  <option value="Request referrals from past clients">Request referrals from past clients</option>
                  <option value="Build email subscriber list">Build email subscriber list</option>
                  <option value="Announce price reductions">Announce price reductions</option>
                  <option value="Highlight investment properties">Highlight investment properties</option>
                  <option value="Reach out to expired listings">Reach out to expired listings</option>
                  <option value="Expand into new neighborhoods">Expand into new neighborhoods</option>
                  <option value="Promote new services">Promote new services</option>
                  <option value="Seasonal market updates">Seasonal market updates</option>
                  <option value="First-time homebuyer education">First-time homebuyer education</option>
                  <option value="Luxury property marketing">Luxury property marketing</option>
                  <option value="Commercial real estate outreach">Commercial real estate outreach</option>
                  <option value="Property valuation requests">Property valuation requests</option>
                  <option value="Short sale assistance">Short sale assistance</option>
                  <option value="Foreclosure prevention">Foreclosure prevention</option>
                  <option value="Relocation services">Relocation services</option>
                  <option value="Investment property consultation">Investment property consultation</option>
                  <option value="Build brand awareness">Build brand awareness</option>
                  <option value="Client retention">Client retention</option>
                  <option value="Generate mortgage referrals">Generate mortgage referrals</option>
                  <option value="Community engagement">Community engagement</option>
                </select>
              </div>



              <div>
                <label className="block text-sm font-semibold text-neutral-200 mb-2">Target Persona *</label>
                <select
                  value={newBatchPersonas[0] || ""}
                  onChange={(e) => setNewBatchPersonas(e.target.value ? [e.target.value] : [])}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--color-gold)]/50"
                >
                  <option value="">Select a persona...</option>
                  {personaOptions.map(persona => (
                    <option key={persona.value} value={persona.value}>
                      {persona.label} - {persona.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-200 mb-2">Description (optional)</label>
                <textarea
                  value={newBatchDescription}
                  onChange={(e) => setNewBatchDescription(e.target.value)}
                  placeholder="Add notes about this batch..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBatchName('');
                  setNewBatchDescription('');
                  setNewBatchObjective('');
                  setNewBatchPersonas([]);
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatch}
                className="flex-1 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black px-4 py-2 rounded font-semibold transition-all"
              >
                Create Batch
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Batch Modal - Improved */}
      {showEditModal && editingBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-b from-[#0A0A0A] to-[#111111] rounded-lg p-6 w-full max-w-2xl border border-neutral-800 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-gold)]/10 rounded-lg">
                  <Edit2 className="text-[var(--color-gold)]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Batch</h2>
                  <p className="text-sm text-neutral-400 mt-1">Update batch settings and configuration</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBatch(null);
                }}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-2 rounded transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Main Info */}
              <div className="space-y-4">
                {/* Batch Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-[var(--color-gold)]" />
                    Batch Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBatch.batch_name}
                    onChange={(e) => setEditingBatch({ ...editingBatch, batch_name: e.target.value })}
                    placeholder="e.g., January Campaign"
                    className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-600 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)] focus:bg-neutral-800/50 transition-all"
                  />
                  <p className="text-xs text-neutral-500 mt-1">{editingBatch.batch_name.length}/100 characters</p>
                </div>



                {/* Target Persona */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <Target size={16} className="text-[var(--color-gold)]" />
                    Target Persona *
                  </label>
                  <select
                    value={(editingBatch as any).personas || ""}
                    onChange={(e) => {
                      setEditingBatch({ ...editingBatch, personas: e.target.value || null } as any);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-gold)] focus:bg-neutral-800/50 transition-all"
                  >
                    <option value="">Select a persona...</option>
                    {personaOptions.map(persona => (
                      <option key={persona.value} value={persona.value}>
                        {persona.label} - {persona.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column - Descriptive Info */}
              <div className="space-y-4">
                {/* Objective */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <Target size={16} className="text-[var(--color-gold)]" />
                    Objective *
                  </label>
                  <select
                    value={editingBatch.objective || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, objective: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-gold)] focus:bg-neutral-800/50 transition-all"
                  >
                    <option value="">Select an objective</option>
                    <option value="Schedule property showings">Schedule property showings</option>
                    <option value="Generate qualified leads">Generate qualified leads</option>
                    <option value="Increase property listings">Increase property listings</option>
                    <option value="Follow-up on property inquiries">Follow-up on property inquiries</option>
                    <option value="Re-engage inactive prospects">Re-engage inactive prospects</option>
                    <option value="Market new listings">Market new listings</option>
                    <option value="Promote open house events">Promote open house events</option>
                    <option value="Collect buyer preferences">Collect buyer preferences</option>
                    <option value="Nurture long-term prospects">Nurture long-term prospects</option>
                    <option value="Convert leads to clients">Convert leads to clients</option>
                    <option value="Request referrals from past clients">Request referrals from past clients</option>
                    <option value="Build email subscriber list">Build email subscriber list</option>
                    <option value="Announce price reductions">Announce price reductions</option>
                    <option value="Highlight investment properties">Highlight investment properties</option>
                    <option value="Reach out to expired listings">Reach out to expired listings</option>
                    <option value="Expand into new neighborhoods">Expand into new neighborhoods</option>
                    <option value="Promote new services">Promote new services</option>
                    <option value="Seasonal market updates">Seasonal market updates</option>
                    <option value="First-time homebuyer education">First-time homebuyer education</option>
                    <option value="Luxury property marketing">Luxury property marketing</option>
                    <option value="Commercial real estate outreach">Commercial real estate outreach</option>
                    <option value="Property valuation requests">Property valuation requests</option>
                    <option value="Short sale assistance">Short sale assistance</option>
                    <option value="Foreclosure prevention">Foreclosure prevention</option>
                    <option value="Relocation services">Relocation services</option>
                    <option value="Investment property consultation">Investment property consultation</option>
                    <option value="Build brand awareness">Build brand awareness</option>
                    <option value="Client retention">Client retention</option>
                    <option value="Generate mortgage referrals">Generate mortgage referrals</option>
                    <option value="Community engagement">Community engagement</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-200 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-[var(--color-gold)]" />
                    Description
                  </label>
                  <textarea
                    value={editingBatch.description || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })}
                    placeholder="Additional notes about this batch..."
                    className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-600 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--color-gold)] focus:bg-neutral-800/50 transition-all resize-none h-24"
                  />
                  <p className="text-xs text-neutral-500 mt-1">{(editingBatch.description || '').length}/500 characters</p>
                </div>
              </div>
            </div>

            {/* Batch Info Summary */}
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-lg p-4 mb-6">
              <p className="text-xs font-semibold text-neutral-400 mb-2">BATCH INFORMATION</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Total Leads</p>
                  <p className="text-white font-semibold text-lg">{editingBatch.lead_count || 0}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Status</p>
                  <p className={`font-semibold ${editingBatch.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {editingBatch.status === 'active' ? '🟢 Active' : '🟡 Paused'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Created</p>
                  <p className="text-white font-semibold">{new Date(editingBatch.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBatch(null);
                }}
                disabled={editLoading}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleEditBatch}
                disabled={editLoading || !editingBatch.batch_name.trim()}
                className="flex-1 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0A] rounded-lg p-6 w-full max-w-sm border border-neutral-800"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Delete Batch?</h2>
            <p className="text-neutral-400 mb-6">
              Are you sure you want to delete this batch? All leads in this batch will be permanently deleted. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setBatchToDelete(null);
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (batchToDelete) {
                    handleDeleteBatch(batchToDelete);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-40 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-4 py-3 rounded-lg text-white pointer-events-auto flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-green-600'
                : toast.type === 'error'
                ? 'bg-red-600'
                : 'bg-[var(--color-gold)]'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white/70 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}