"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { API_CONFIG } from "@/lib/api-config";
import { X, Mail, Users, MessageCircle, Send, Loader } from "lucide-react";



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





export default function EmailTriggerModal({
  isOpen,
  onClose,
  onSuccess,
  onError
}: EmailTriggerModalProps) {
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const personaOptions = [
    { value: 'buyer', label: 'Buyer', description: 'Looking to purchase properties' },
    { value: 'seller', label: 'Seller', description: 'Looking to sell properties' },
    { value: 'investor', label: 'Investor', description: 'Investment opportunities' },
    { value: 'past_client', label: 'Past Client', description: 'Existing or past clients' },
    { value: 'referral', label: 'Referral', description: 'Referral sources' },
    { value: 'cold_prospect', label: 'Cold Prospect', description: 'New potential clients' },
  ];
  const [shortDescription, setShortDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal closes
      setSelectedPurpose("");
      setSelectedPersona("");
      setShortDescription("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const isFormValid = useMemo(() => {
    return selectedPurpose && selectedPersona;
  }, [selectedPurpose, selectedPersona]);

  const validateForm = useCallback(() => {
    if (!selectedPurpose) {
      onError("Please select a purpose for the email");
      return false;
    }
    if (!selectedPersona) {
      onError("Please select a persona for the email");
      return false;
    }
    return true;
  }, [selectedPurpose, selectedPersona, onError]);

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
        purpose: selectedPurpose,
        persona: selectedPersona,
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
        
        // Show success animation instead of calling onSuccess
        setShowSuccess(true);
        
        // Auto-close after animation
        setTimeout(() => {
          handleClose();
        }, 2500);
        
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
    setSelectedPurpose("");
    setSelectedPersona("");
    setShortDescription("");
    setShowSuccess(false);
    onClose();
  };



  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
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
                  Send personalized emails to all your leads
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
              {/* Purpose Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Email *
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Select a purpose...</option>
                  {EMAIL_PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose} className="text-gray-900 bg-white">
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>

              {/* Persona Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Persona *
                </label>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="" className="text-gray-500">Select target persona...</option>
                  {personaOptions.map((persona) => (
                    <option key={persona.value} value={persona.value} className="text-gray-900 bg-white">
                      {persona.label} - {persona.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The email tone will be automatically optimized for this persona
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
              {(selectedPurpose || selectedPersona) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Email Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• Target: All leads</p>
                    <p>• Purpose: {selectedPurpose || "Not selected"}</p>
                    <p>• Persona: {personaOptions.find(p => p.value === selectedPersona)?.label || "None selected"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>



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

          {/* Success Animation Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [0, 0, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: "backOut"
                  }}
                  className="text-center"
                >
                  {/* Animated Checkmark */}
                  <motion.div
                    className="w-24 h-24 mx-auto mb-6 relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <motion.div 
                      className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.5, ease: "backOut" }}
                    >
                      {/* Checkmark SVG with draw animation */}
                      <motion.svg 
                        width="48" 
                        height="48" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        className="text-white"
                      >
                        <motion.path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        />
                      </motion.svg>
                    </motion.div>
                    
                    {/* Success ripple effect */}
                    <motion.div
                      className="absolute inset-0 bg-green-500/20 rounded-full"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.5, 2],
                        opacity: [0, 0.6, 0]
                      }}
                      transition={{ 
                        delay: 0.3,
                        duration: 1.2,
                        repeat: 2,
                        repeatDelay: 0.3
                      }}
                    />
                  </motion.div>
                  
                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Emails Sent Successfully! 
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Your personalized emails have been generated and sent to all leads. 
                      They should receive them shortly.
                    </p>
                  </motion.div>

                  {/* Confetti-like particles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                        y: [0, -20, 20]
                      }}
                      transition={{
                        delay: 0.8 + Math.random() * 0.4,
                        duration: 1.5,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}