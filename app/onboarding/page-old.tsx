"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Upload, Building2, MessageSquare, Check } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface OnboardingData {
  avatar_url: string | null;
  brokerage: string;
  phone: string;
  tones: string[];
  password: string;
  confirmPassword: string;
  preferences: {
    autoFollowUp: boolean;
    emailNotifications: boolean;
  };
}

const toneOptions = [
  "Professional", "Friendly", "Casual", "Formal", "Conversational",
  "Enthusiastic", "Empathetic", "Direct", "Warm", "Confident",
  "Consultative", "Educational", "Persuasive", "Supportive", "Authentic",
  "Trustworthy", "Approachable", "Respectful", "Engaging", "Articulate",
  "Patient", "Motivational", "Clear", "Concise", "Detailed",
  "Story-driven", "Data-driven", "Solution-focused", "Personable", "Diplomatic"
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [totalSteps, setTotalSteps] = useState(4); // Default for non-OAuth users
  
  const [formData, setFormData] = useState<OnboardingData>({
    avatar_url: null,
    brokerage: "",
    phone: "",
    tones: [],
    password: "",
    confirmPassword: "",
    preferences: {
      autoFollowUp: true,
      emailNotifications: true,
    },
  });

  // Check if user is OAuth user on component mount
  useEffect(() => {
    const checkAuthProvider = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user has a provider (OAuth user)
        const hasProvider = user.app_metadata?.providers && user.app_metadata.providers.length > 0;
        const isOAuth = hasProvider && !user.app_metadata.providers.includes('email');
        setIsOAuthUser(isOAuth);
        setTotalSteps(isOAuth ? 5 : 4); // 5 steps for OAuth (includes password), 4 for regular users
      }
    };
    checkAuthProvider();
  }, [supabase]);

  const getDefaultAvatar = (name: string) => {
    // Use the first letter of the user's name
    const initial = name.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=D4AF37&color=000&size=200`;
  };

  const skipAvatar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Try to get the user's name from metadata, fallback to email
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "U";
      const defaultAvatarUrl = getDefaultAvatar(userName);
      setFormData({ ...formData, avatar_url: defaultAvatarUrl });
      setAvatarPreview(defaultAvatarUrl);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update password in auth only for OAuth users
      if (isOAuthUser && formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (passwordError) throw passwordError;
      }

      // Prepare profile update data
      const profileData: any = {
        avatar_url: formData.avatar_url,
        brokerage: formData.brokerage,
        phone: formData.phone,
        tones: formData.tones,
        preferences: formData.preferences,
        onboarding_completed: true,
      };

      // Store password in database for non-OAuth users
      if (!isOAuthUser && formData.password) {
        profileData.password = formData.password;
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      // Redirect to dashboard
      router.push('/dashboard/lead-nurture');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate step 1 (password) - only for OAuth users
    if (isOAuthUser && currentStep === 1) {
      if (!formData.password || !formData.confirmPassword) {
        alert("Please enter a password");
        return;
      }
      if (formData.password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    // Validate tones (step 4 for OAuth, step 3 for non-OAuth)
    const tonesStep = isOAuthUser ? 4 : 3;
    if (currentStep === tonesStep && formData.tones.length < 5) {
      alert("Please select at least 5 communication tones");
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const toggleTone = (tone: string) => {
    if (formData.tones.includes(tone)) {
      setFormData({ ...formData, tones: formData.tones.filter(t => t !== tone) });
    } else {
      setFormData({ ...formData, tones: [...formData.tones, tone] });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-[var(--font-heading)] text-white">
              Welcome to RealtyGenie
            </h2>
            <span className="text-neutral-400 text-sm">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-soft)] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-neutral-800">
          {/* Step 1: Set Password (Only for OAuth users) */}
          {isOAuthUser && currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Check className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Set Your Password
                </h3>
                <p className="text-neutral-400">
                  Create a secure password for your account
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload Photo (or Step 1 for non-OAuth) */}
          {currentStep === (isOAuthUser ? 2 : 1) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Upload className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Upload Your Photo
                </h3>
                <p className="text-neutral-400">
                  Add a professional photo to personalize your profile
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {avatarPreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-gold)]">
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-700">
                    <Upload className="w-12 h-12 text-neutral-600" />
                  </div>
                )}

                <div className="flex gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <span className="px-6 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-medium rounded-lg transition-colors inline-block">
                      Choose Photo
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={skipAvatar}
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Brokerage Info (or Step 2 for non-OAuth) */}
          {currentStep === (isOAuthUser ? 3 : 2) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Building2 className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Business Information
                </h3>
                <p className="text-neutral-400">
                  Tell us about your real estate business
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">
                    Brokerage/Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.brokerage}
                    onChange={(e) =>
                      setFormData({ ...formData, brokerage: e.target.value })
                    }
                    placeholder="e.g., Coldwell Banker"
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Tone & Preferences (or Step 3 for non-OAuth) */}
          {currentStep === (isOAuthUser ? 4 : 3) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <MessageSquare className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  AI Communication Style
                </h3>
                <p className="text-neutral-400">
                  Choose how AI should communicate with your leads
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">
                    Communication Tones (Select at least 5)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    {formData.tones.length} tone{formData.tones.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {toneOptions.map((tone) => (
                      <motion.button
                        key={tone}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleTone(tone)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-xs ${
                          formData.tones.includes(tone)
                            ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-white"
                            : "border-neutral-800 bg-[#111111] text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        {tone}
                      </motion.button>
                    ))}
                  </div>
                  {formData.tones.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-2 bg-neutral-900/50 rounded-lg">
                      {formData.tones.map((tone) => (
                        <span
                          key={tone}
                          className="px-2 py-1 bg-[var(--color-gold)]/20 text-white rounded-md text-xs flex items-center gap-1 border border-[var(--color-gold)]/30"
                        >
                          {tone}
                          <button
                            type="button"
                            onClick={() => toggleTone(tone)}
                            className="hover:text-red-400 transition-colors ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete (or Step 4 for non-OAuth) */}
          {currentStep === totalSteps && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                All Set!
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                You're ready to start using RealtyGenie. Click finish to access your dashboard and begin nurturing your leads with AI.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={loading}
              className="px-8 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-gold)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Saving..."
              ) : currentStep === totalSteps ? (
                "Finish"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
