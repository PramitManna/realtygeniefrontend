"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { API_CONFIG } from "@/lib/api-config";
import { X, Mail, Users, MessageCircle, Send, Loader } from "lucide-react";

interface Batch {
  id: string;
  name: string;
  lead_count: number;
}

interface EmailTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

const EMAIL_PURPOSES = [
  "Realtor received an award",
  "Realtor featured in newspaper or magazine", 
  "Market updates",
  "New property listings",
  "Seasonal greetings or appreciation",
  "Client success story",
  "Industry recognition",
  "Community involvement",
  "Expert advice sharing",
  "Thank you message"
];

const EMAIL_TONES = [
  "professional",
  "friendly", 
  "inspirational",
  "humorous",
  "persuasive",
  "informative",
  "warm",
  "confident",
  "celebratory",
  "grateful"
];

// Memoized batch item component to prevent unnecessary re-renders
const BatchItem = memo(({ 
  batch, 
  isSelected, 
  onToggle 
}: { 
  batch: Batch; 
  isSelected: boolean; 
  onToggle: (id: string) => void; 
}) => (
  <div
    onClick={() => onToggle(batch.id)}
    className={`
      p-4 border rounded-xl cursor-pointer transition-all
      ${isSelected
        ? "border-blue-500 bg-blue-50" 
        : "border-gray-200 hover:border-gray-300"
      }
    `}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-gray-900">{batch.name}</h3>
        <p className="text-sm text-gray-500">
          {batch.lead_count} leads
        </p>
      </div>
      <div className={`
        w-5 h-5 rounded border-2 flex items-center justify-center
        ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}
      `}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  </div>
));

BatchItem.displayName = 'BatchItem';

export default function EmailTriggerModal({
  isOpen,
  onClose,
  onSuccess,
  onError
}: EmailTriggerModalProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [shortDescription, setShortDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
    } else {
      // Reset form state when modal closes
      setSelectedBatches([]);
      setSelectedPurpose("");
      setSelectedTones([]);
      setShortDescription("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const fetchBatches = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isLoadingBatches) return;
    
    try {
      setIsLoadingBatches(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        onError("User not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("batches")
        .select("id, name, lead_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      onError("Failed to load lead batches");
    } finally {
      setIsLoadingBatches(false);
    }
  }, [isLoadingBatches, supabase, onError]);

  const handleBatchToggle = useCallback((batchId: string) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  }, []);

  const handleToneToggle = useCallback((tone: string) => {
    setSelectedTones(prev => {
      if (prev.includes(tone)) {
        return prev.filter(t => t !== tone);
      } else if (prev.length < 5) {
        return [...prev, tone];
      }
      return prev; // Don't add if already at max (5)
    });
  }, []);

  const isFormValid = useMemo(() => {
    return selectedBatches.length > 0 && selectedPurpose && selectedTones.length > 0;
  }, [selectedBatches.length, selectedPurpose, selectedTones.length]);

  // Memoize batches rendering to prevent unnecessary re-renders
  const renderedBatches = useMemo(() => {
    if (isLoadingBatches) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      );
    }
    
    if (batches.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No lead batches found</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {batches.map((batch) => (
          <BatchItem
            key={batch.id}
            batch={batch}
            isSelected={selectedBatches.includes(batch.id)}
            onToggle={handleBatchToggle}
          />
        ))}
      </div>
    );
  }, [batches, selectedBatches, isLoadingBatches, handleBatchToggle]);

  const validateForm = useCallback(() => {
    if (selectedBatches.length === 0) {
      onError("Please select at least one lead batch");
      return false;
    }
    if (!selectedPurpose) {
      onError("Please select a purpose for the email");
      return false;
    }
    if (selectedTones.length === 0) {
      onError("Please select at least one tone");
      return false;
    }
    return true;
  }, [selectedBatches.length, selectedPurpose, selectedTones.length, onError]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Prevent multiple simultaneous submissions and debounce rapid clicks
    const now = Date.now();
    if (isLoading || (now - lastSubmitTime < 2000)) {
      return;
    }
    
    setLastSubmitTime(now);
    
    try {
      setIsLoading(true);
      setProgressMessage("Authenticating user...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        onError("User not authenticated");
        return;
      }

      const requestData = {
        batch_ids: selectedBatches,
        purpose: selectedPurpose,
        tones: selectedTones,
        short_description: shortDescription || null,
        user_id: user.id
      };

      // Add timeout to prevent infinite loading
      setProgressMessage("Generating and sending emails...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/lead-nurture/trigger-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        onSuccess(result.message || "Emails triggered successfully!");
        handleClose();
        
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          onError("Request timed out. The emails may still be processing in the background. Please check your campaign status.");
        } else {
          throw fetchError;
        }
      }
      
    } catch (error) {
      console.error("Error triggering emails:", error);
      onError(error instanceof Error ? error.message : "Failed to trigger emails");
    } finally {
      setIsLoading(false);
      setProgressMessage("");
    }
  };

  const handleClose = () => {
    setSelectedBatches([]);
    setSelectedPurpose("");
    setSelectedTones([]);
    setShortDescription("");
    onClose();
  };

  const getTotalLeads = () => {
    return selectedBatches.reduce((total, batchId) => {
      const batch = batches.find(b => b.id === batchId);
      return total + (batch?.lead_count || 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Trigger Email Campaign
                </h2>
                <p className="text-sm text-gray-500">
                  Send personalized emails to your lead batches
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Lead Batches Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Batches *
                </label>
                {renderedBatches}
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Email *
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a purpose...</option>
                  {EMAIL_PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Tone * (1-5 selections)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {EMAIL_TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => handleToneToggle(tone)}
                      disabled={!selectedTones.includes(tone) && selectedTones.length >= 5}
                      className={`
                        p-3 text-sm rounded-xl border transition-all capitalize
                        ${selectedTones.includes(tone)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }
                        ${!selectedTones.includes(tone) && selectedTones.length >= 5
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                        }
                      `}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedTones.length}/5
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Provide any additional context or details for the email content..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Summary */}
              {selectedBatches.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Email Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• Batches selected: {selectedBatches.length}</p>
                    <p>• Total leads: {getTotalLeads()}</p>
                    <p>• Purpose: {selectedPurpose || "Not selected"}</p>
                    <p>• Tones: {selectedTones.join(", ") || "None selected"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warning message */}
          {selectedBatches.length > 0 && getTotalLeads() > 10 && (
            <div className="px-6 py-3 bg-yellow-50 border-y border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ Sending emails to {getTotalLeads()} leads may take several minutes. Please be patient.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className={`
                px-8 py-2 bg-blue-600 text-white rounded-xl font-medium
                flex items-center space-x-2 transition-colors
                ${isLoading || !isFormValid
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{progressMessage || "Processing..."}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Generate & Send Emails</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}