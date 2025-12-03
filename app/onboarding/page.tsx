"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Upload, Building2, MessageSquare, Check, Mail, Trash2, MapPin, Home, X, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { searchCities, CANADIAN_CITIES } from "@/utils/cities";
import AddressAutocomplete from "@/components/AddressInput";

interface OnboardingData {
  avatar_url: string | null;
  brokerage: string;
  phone: string;
  email: string;
  address: string;
  years_in_business: string;
  signature_block: string | null;
  signature_image_url: string | null;
  markets: string[];
  property_types: string[];
  description: string;
  password: string;
  confirmPassword: string;
}

const propertyTypes = ["Residential", "Commercial", "Industrial", "Mixed-Use", "Vacant Land", "Multi-Family"];

// Canadian phone number validation - accepts all common formats
// Format: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXXXXXXXXX, +1-XXX-XXX-XXXX, +1 (XXX) XXX-XXXX, etc.
const CANADIAN_PHONE_REGEX = /^(\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?([2-9]\d{2})[-.\s]?(\d{4})$/;

const validateCanadianPhone = (phone: string): { valid: boolean; message: string } => {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: "Phone number is required" };
  }

  if (!CANADIAN_PHONE_REGEX.test(phone)) {
    return { valid: false, message: "Invalid phone format. Use: (XXX) XXX-XXXX or XXX-XXX-XXXX" };
  }

  return { valid: true, message: "Valid phone number" };
};

export default function OnboardingPageV2() {
  const router = useRouter();
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [signatureImagePreview, setSignatureImagePreview] = useState<string | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [totalSteps, setTotalSteps] = useState(8);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    avatar_url: null,
    brokerage: "",
    phone: "",
    email: "",
    address: "",
    years_in_business: "0",
    signature_block: null,
    signature_image_url: null,
    markets: [],
    property_types: [],
    description: "",
    password: "",
    confirmPassword: "",
  });

  // Update filtered cities when search query changes
  useEffect(() => {
    setFilteredCities(searchCities(citySearchQuery));
  }, [citySearchQuery]);

  useEffect(() => {
    const checkAuthProvider = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const hasProvider = user.app_metadata?.providers && user.app_metadata.providers.length > 0;
        const isOAuth = hasProvider && !user.app_metadata.providers.includes('email');
        setIsOAuthUser(isOAuth);
        setTotalSteps(isOAuth ? 8 : 7);

        // Set default avatar with initials
        const userName = user.user_metadata?.full_name || user.email || "U";
        const initial = userName.charAt(0).toUpperCase();
        const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=D4AF37&color=000&size=200&font-size=0.4`;

        setAvatarPreview(defaultAvatar);
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          avatar_url: defaultAvatar
        }));
      }
    };
    checkAuthProvider();
  }, [supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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

  const handleAddCity = (city: string) => {
    if (!formData.markets.includes(city)) {
      setFormData({ ...formData, markets: [...formData.markets, city] });
    }
    setCitySearchQuery("");
    setShowCityDropdown(false);
  };

  const handleRemoveCity = (city: string) => {
    setFormData({ ...formData, markets: formData.markets.filter(m => m !== city) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (isOAuthUser && formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (passwordError) throw passwordError;
      }

      const profileData: any = {
        password: formData.password,
        avatar_url: formData.avatar_url,
        brokerage: formData.brokerage,
        phone: formData.phone,
        address: formData.address,
        years_in_business: parseInt(formData.years_in_business) || 0,
        signature_block: formData.signature_block,
        signature_image_url: formData.signature_image_url,
        markets: formData.markets,
        property_types: formData.property_types,
        description: formData.description,
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      console.log('Onboarding complete, redirecting to dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Error completing onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
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

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const togglePropertyType = (type: string) => {
    if (formData.property_types.includes(type)) {
      setFormData({ ...formData, property_types: formData.property_types.filter(p => p !== type) });
    } else {
      setFormData({ ...formData, property_types: [...formData.property_types, type] });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepNumber = (baseStep: number) => isOAuthUser ? baseStep : baseStep - 1;

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
        <div className="bg-[#1A1A1A] rounded-xl p-8 border border-neutral-800 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Password (OAuth only) */}
          {isOAuthUser && currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Check className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Set Your Password</h3>
                <p className="text-neutral-400">Create a secure password for your account</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter a strong password"
                      className="w-full px-4 py-3 pr-12 bg-[#111111] border border-neutral-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Confirm Password</label>
                  <input
                    type="text"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Avatar */}
          {currentStep === getStepNumber(2) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Upload className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Upload Your Photo</h3>
                <p className="text-neutral-400">Add a professional photo to personalize your profile</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {avatarPreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-gold)]">
                    <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-700">
                    <Upload className="w-12 h-12 text-neutral-600" />
                  </div>
                )}

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
              </div>
            </div>
          )}

          {/* Step 3: Email Signature */}
          {currentStep === getStepNumber(3) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Mail className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Email Signature</h3>
                <p className="text-neutral-400">Add a professional email signature (text and/or image)</p>
              </div>

              <div className="space-y-6">
                {/* Text Signature */}
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Signature Block (optional)</label>
                  <textarea
                    value={formData.signature_block || ""}
                    onChange={(e) => setFormData({ ...formData, signature_block: e.target.value })}
                    placeholder="e.g., John Smith&#10;Real Estate Agent&#10;Coldwell Banker&#10;Phone: (555) 123-4567&#10;Email: john@example.com&#10;Website: www.johnsmith.ca"
                    rows={5}
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    This signature will be added to automated emails sent to your leads
                  </p>
                </div>

                {formData.signature_block && (
                  <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
                    <p className="text-xs text-neutral-400 mb-2">Text Preview:</p>
                    <div className="text-sm text-neutral-300 whitespace-pre-wrap font-mono">
                      {formData.signature_block}
                    </div>
                  </div>
                )}

                {/* Image Signature */}
                <div className="pt-4 border-t border-neutral-700">
                  <label className="block text-neutral-400 text-sm mb-2">Signature Image (optional)</label>
                  <div className="flex flex-col gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSignatureImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);

                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) return;

                          const fileExt = file.name.split('.').pop();
                          const fileName = `signature-${user.id}-${Math.random()}.${fileExt}`;
                          const filePath = `signatures/${fileName}`;

                          const { error: uploadError } = await supabase.storage
                            .from('signatures')
                            .upload(filePath, file);

                          if (uploadError) throw uploadError;

                          const { data: { publicUrl } } = supabase.storage
                            .from('signatures')
                            .getPublicUrl(filePath);

                          setFormData({ ...formData, signature_image_url: publicUrl });
                        } catch (error) {
                          console.error('Error uploading signature image:', error);
                        }
                      }}
                      className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-gold)] file:text-black hover:file:opacity-80 cursor-pointer"
                    />
                    <p className="text-xs text-neutral-500">
                      Upload a PNG or JPG image of your signature (recommended: transparent background, max 2MB)
                    </p>
                  </div>

                  {signatureImagePreview && (
                    <div className="mt-4 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
                      <p className="text-xs text-neutral-400 mb-3">Image Preview:</p>
                      <div className="flex justify-center">
                        <img 
                          src={signatureImagePreview} 
                          alt="Signature preview" 
                          className="max-h-32 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Business Info */}
          {currentStep === getStepNumber(4) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Building2 className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Business Information</h3>
                <p className="text-neutral-400">Tell us about your real estate business</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Brokerage/Company Name</label>
                  <input
                    type="text"
                    value={formData.brokerage}
                    onChange={(e) => setFormData({ ...formData, brokerage: e.target.value })}
                    placeholder="e.g., Coldwell Banker"
                    className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const newPhone = e.target.value;
                        setFormData({ ...formData, phone: newPhone });
                        
                        // Validate in real-time
                        if (newPhone.trim().length > 0) {
                          const validation = validateCanadianPhone(newPhone);
                          setPhoneValid(validation.valid);
                          setPhoneError(validation.valid ? "" : validation.message);
                        } else {
                          setPhoneValid(false);
                          setPhoneError("");
                        }
                      }}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 bg-[#111111] border rounded-lg text-white placeholder:text-neutral-500 focus:outline-none transition-colors ${
                        formData.phone && !phoneValid
                          ? "border-red-500/50 focus:border-red-500/70"
                          : formData.phone && phoneValid
                          ? "border-green-500/50 focus:border-green-500/70"
                          : "border-neutral-800 focus:border-[var(--color-gold)]/50"
                      }`}
                    />
                    {formData.phone && (
                      <div className="absolute right-3 top-3">
                        {phoneValid ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-400 mt-1">{phoneError}</p>
                  )}
                  {phoneValid && (
                    <p className="text-xs text-green-400 mt-1">✓ Valid Canadian phone number</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    Format: (XXX) XXX-XXXX, XXX-XXX-XXXX, or +1-XXX-XXX-XXXX
                  </p>
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Address</label>

                  <AddressAutocomplete
                    value={formData.address}
                    onChange={(value: string) =>
                      setFormData({ ...formData, address: value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">Years in Business: <span className="text-[var(--color-gold)] font-semibold">{formData.years_in_business}</span> years</label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={formData.years_in_business}
                    onChange={(e) => setFormData({ ...formData, years_in_business: e.target.value })}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-gold)]"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>0</span>
                    <span>40</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Property Types */}
          {currentStep === getStepNumber(5) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <Home className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Property Types</h3>
                <p className="text-neutral-400">What types of properties do you specialize in?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {propertyTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${formData.property_types.includes(type)
                        ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-white"
                        : "border-neutral-700 bg-[#111111] text-neutral-400 hover:border-neutral-600"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Markets/Cities with Searchable Dropdown */}
          {currentStep === getStepNumber(6) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <MapPin className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Markets/Cities</h3>
                <p className="text-neutral-400">Which Canadian cities do you operate in?</p>
              </div>

              <div className="space-y-4">
                {/* City Search Dropdown */}
                <div className="relative">
                  <label className="block text-neutral-400 text-sm mb-2">Search & Add Cities</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Type city name (e.g., Toronto, Vancouver)..."
                      className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                    />

                    {/* Dropdown List */}
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-neutral-700 rounded-lg max-h-64 overflow-y-auto z-50">
                        {filteredCities.map((city: string) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleAddCity(city)}
                            className="w-full text-left px-4 py-2 hover:bg-[var(--color-gold)]/10 text-white transition-colors text-sm"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}

                    {showCityDropdown && citySearchQuery && filteredCities.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-neutral-700 rounded-lg p-4 z-50">
                        <p className="text-neutral-500 text-sm">No cities found. Try another search.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Cities */}
                {formData.markets.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-neutral-400 text-sm">Selected Cities ({formData.markets.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.markets.map((city: string) => (
                        <div
                          key={city}
                          className="px-3 py-1 bg-[var(--color-gold)]/20 text-white rounded-lg text-sm border border-[var(--color-gold)]/30 flex items-center gap-2"
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => handleRemoveCity(city)}
                            className="hover:text-red-400 transition-colors ml-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Description */}
          {currentStep === getStepNumber(7) && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-gold)]/10 mb-4">
                  <MessageSquare className="w-8 h-8 text-[var(--color-gold)]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">About You</h3>
                <p className="text-neutral-400">Tell us about yourself (max 500 characters)</p>
              </div>

              <div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                  placeholder="Describe your expertise, achievements, and what makes you unique..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[#111111] border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors resize-none"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 8/9: Complete */}
          {currentStep === totalSteps && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">All Set!</h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                You're ready to start using RealtyGenie. Click finish to access your dashboard.
              </p>
            </div>
          )}

          {/* Navigation */}
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
              className="px-8 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-black font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : currentStep === totalSteps ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
