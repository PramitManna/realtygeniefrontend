"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Upload, Building2, Check, MapPin, Home, X, Phone, Mail, Calendar, Sparkles } from "lucide-react";
import Image from "next/image";
import { searchCities } from "@/utils/cities";
import AddressAutocomplete from "@/components/AddressInput";

interface OnboardingData {
  phone: string;
  email: string;
  address: string;
  years_in_business: string;
  calendly_link: string;
  company_name: string;
  markets: string[];
  realtor_type: "solo" | "team" | "";
  brokerage_logo_url: string | null;
  brand_logo_url: string | null;
  brokerage_name: string;
}

// Canadian phone number validation
const CANADIAN_PHONE_REGEX = /^\d{10}$/;

const validateCanadianPhone = (phone: string): { valid: boolean; message: string } => {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: "Phone number is required" };
  }

  if (!CANADIAN_PHONE_REGEX.test(phone)) {
    return { valid: false, message: "Please enter exactly 10 digits" };
  }

  return { valid: true, message: "Valid phone number" };
};

export default function OnboardingPageV2() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [brokerageLogoPreview, setBrokerageLogoPreview] = useState<string | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const totalSteps = 4;
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [calendlyError, setCalendlyError] = useState("");
  const [calendlyValid, setCalendlyValid] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    phone: "",
    email: "",
    address: "",
    years_in_business: "0",
    calendly_link: "",
    company_name: "",
    markets: [],
    realtor_type: "",
    brokerage_logo_url: null,
    brand_logo_url: null,
    brokerage_name: "",
  });

  // Update filtered cities when search query changes
  useEffect(() => {
    setFilteredCities(searchCities(citySearchQuery));
  }, [citySearchQuery]);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
        }));
      }
    };
    loadUserData();
  }, [supabase]);

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "brokerage" | "brand"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "brokerage") {
        setBrokerageLogoPreview(reader.result as string);
      } else {
        setBrandLogoPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-logo-${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (type === "brokerage") {
        setFormData({ ...formData, brokerage_logo_url: publicUrl });
      } else {
        setFormData({ ...formData, brand_logo_url: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
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

      const profileData: any = {
        phone: formData.phone,
        address: formData.address,
        years_in_business: parseInt(formData.years_in_business) || 0,
        calendly_link: formData.calendly_link,
        company_name: formData.company_name,
        markets: formData.markets,
        realtor_type: formData.realtor_type,
        brokerage_logo_url: formData.brokerage_logo_url,
        brand_logo_url: formData.brand_logo_url,
        brokerage_name: formData.brokerage_name,
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

  const validateStep = () => {
    if (currentStep === 1) {
      if (!phoneValid) {
        alert("Please enter a valid Canadian phone number");
        return false;
      }
      if (!formData.email.trim()) {
        alert("Please enter your email");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address");
        return false;
      }
      // Check Calendly link if provided
      if (formData.calendly_link && !calendlyValid) {
        alert("Please enter a valid Calendly link or leave it empty");
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.company_name.trim()) {
        alert("Please enter your company name");
        return false;
      }
      if (formData.markets.length === 0) {
        alert("Please add at least one market/city");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.realtor_type) {
        alert("Please select whether you're a solo realtor or part of a team brand");
        return false;
      }
      if (formData.realtor_type === "solo" && !formData.brokerage_logo_url) {
        alert("Please upload your brokerage logo");
        return false;
      }
      if (formData.realtor_type === "team") {
        if (!formData.brand_logo_url) {
          alert("Please upload your brand logo");
          return false;
        }
        if (!formData.brokerage_name.trim()) {
          alert("Please enter your brokerage name");
          return false;
        }
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row relative">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_30%,rgba(212,175,55,0.02),transparent_10%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(212,175,55,0.01),transparent_10%)]" />
      
      {/* Left Side - Premium Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 sticky top-0 h-screen">
        {/* Animated Golden Waves */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-20 w-24 h-24 bg-[#D4AF37] rounded-full opacity-0.5 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-20 w-24 h-24 bg-[#D4AF37] rounded-full opacity-0.5 blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-black" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
                RealtyGenie
              </h1>
            </div>
            <h2 className="text-5xl font-serif font-bold text-white leading-tight">
              Elevate Your<br />Real Estate Business
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Join the elite platform trusted by top realtors. Automate your workflow, 
              nurture leads intelligently, and close deals faster with AI-powered precision.
            </p>
          </div>

          {/* Premium Features */}
          <div className="space-y-4 pt-8">
            {[
              "AI-Powered Lead Nurturing",
              "Automated Email Campaigns", 
              "Smart Analytics Dashboard",
              "Premium CRM Integration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] group-hover:scale-150 transition-transform" />
                <span className="text-neutral-300 group-hover:text-white transition-colors">{feature}</span>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 border border-[#D4AF37]/10 rounded-full" />
          <div className="absolute -top-20 -right-20 w-96 h-96 border border-[#D4AF37]/5 rounded-full" />
        </div>
      </div>

      {/* Right Side - Premium Form */}
      <div className="w-full lg:w-1/2 relative flex items-start justify-center p-4 lg:p-8 overflow-y-auto">
        {/* Glassmorphic Card */}
        <div className="w-full max-w-lg relative my-auto">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Step {currentStep} of {totalSteps}</p>
                <h3 className="text-xl font-serif font-semibold text-white">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Company & Markets"}
                  {currentStep === 3 && "Branding"}
                  {currentStep === 4 && "Review & Confirm"}
                </h3>
              </div>
            </div>
            
            {/* Stepped Progress */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                      : "bg-neutral-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Glassmorphic Form Card */}
          <div className="relative rounded-3xl p-6 lg:p-8 backdrop-blur-xl bg-white/[0.02] border border-white/10 shadow-2xl">
            {/* Golden Accent Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5 opacity-30 pointer-events-none" />
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity pointer-events-none" />
            
            {/* Content Wrapper */}
            <div className="relative z-10">
              {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        let newPhone = e.target.value;
                        
                        // Allow only digits
                        newPhone = newPhone.replace(/\D/g, '');
                        
                        // Limit to 10 digits
                        if (newPhone.length > 10) {
                          return;
                        }
                        
                        setFormData({ ...formData, phone: newPhone });
                        
                        if (newPhone.trim().length > 0) {
                          const validation = validateCanadianPhone(newPhone);
                          setPhoneValid(validation.valid);
                          setPhoneError(validation.valid ? "" : validation.message);
                        } else {
                          setPhoneValid(false);
                          setPhoneError("");
                        }
                      }}
                      maxLength={10}
                      className={`w-full px-3 py-2.5 bg-[#111111] border rounded-lg text-white text-sm placeholder:text-neutral-500 focus:outline-none transition-colors ${
                        formData.phone && !phoneValid
                          ? "border-red-500/50 focus:border-red-500/70"
                          : ""
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-400 mt-1">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">Professional Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@realestate.com"
                    className="w-full px-3 py-2.5 bg-[#111111] border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">Address</label>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={(value: string) =>
                      setFormData({ ...formData, address: value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">
                    Years in Business: <span className="text-[var(--color-gold)] font-semibold">{formData.years_in_business}</span> years
                  </label>
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

                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">Calendly Link (Optional)</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.calendly_link}
                      onChange={(e) => {
                        const newLink = e.target.value;
                        setFormData({ ...formData, calendly_link: newLink });
                        
                        if (newLink.trim().length > 0) {
                          // Check if it's a valid Calendly URL
                          const calendlyPattern = /^https?:\/\/(www\.)?calendly\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?$/;
                          if (calendlyPattern.test(newLink)) {
                            setCalendlyValid(true);
                            setCalendlyError("");
                          } else {
                            setCalendlyValid(false);
                            setCalendlyError("Please enter a valid Calendly link (e.g., https://calendly.com/your-name)");
                          }
                        } else {
                          setCalendlyValid(false);
                          setCalendlyError("");
                        }
                      }}
                      placeholder="https://calendly.com/your-link"
                      className={`w-full px-3 py-2.5 bg-[#111111] border rounded-lg text-white text-sm placeholder:text-neutral-500 focus:outline-none transition-colors ${
                        formData.calendly_link && !calendlyValid
                          ? "border-red-500/50 focus:border-red-500/70"
                          : ""
                      }`}
                    />
                  </div>
                  {calendlyError && (
                    <p className="text-xs text-red-400 mt-1">{calendlyError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company & Markets */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g., Smith Real Estate"
                    className="w-full px-3 py-2.5 bg-[#111111] border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  />
                </div>

                {/* City Search Dropdown */}
                <div className="relative">
                  <label className="block text-neutral-400 text-xs mb-1.5">Markets/Cities</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Type city name (e.g., Toronto, Vancouver)..."
                      className="w-full px-3 py-2.5 bg-[#111111] border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
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

          {/* Step 3: Realtor Type & Branding */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-4">
                {/* Realtor Type Selection */}
                <div>
                  <label className="block text-neutral-400 text-xs mb-1.5">Realtor Type</label>
                  <select
                    value={formData.realtor_type}
                    onChange={(e) => setFormData({ ...formData, realtor_type: e.target.value as "solo" | "team" | "" })}
                    className="w-full px-3 py-2.5 bg-[#111111] border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                  >
                    <option hidden selected value="">Select your type</option>
                    <option value="solo">Solo Realtor</option>
                    <option value="team">Team Brand</option>
                  </select>
                </div>

                {/* Conditional Content - Fixed Height Container */}
                <div className="min-h-[250px]">
                {/* Solo Realtor - Brokerage Logo */}
                {formData.realtor_type === "solo" && (
                  <div className="space-y-4 p-6 bg-[#111111] rounded-lg border border-neutral-700">
                    <label className="block text-neutral-400 text-sm mb-2">Upload Brokerage Logo</label>
                    
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, "brokerage")}
                        className="hidden"
                      />
                      {brokerageLogoPreview ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-[var(--color-gold)] bg-white flex items-center justify-center hover:opacity-90 transition-opacity">
                          <Image 
                            src={brokerageLogoPreview} 
                            alt="Brokerage logo preview" 
                            fill 
                            className="object-contain p-4"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-700 hover:border-[var(--color-gold)]/50 transition-colors">
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
                            <p className="text-neutral-500 text-sm">Click to upload your brokerage logo</p>
                          </div>
                        </div>
                      )}
                    </label>

                    <div>
                      <label className="block text-neutral-400 text-sm mb-2">Brokerage Name</label>
                      <input
                        type="text"
                        value={formData.brokerage_name}
                        disabled
                        placeholder="Not required for solo realtors"
                        className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 text-sm placeholder:text-neutral-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Team Brand - Brand Logo & Brokerage Name */}
                {formData.realtor_type === "team" && (
                  <div className="space-y-4">
                    <div className="p-6 bg-[#111111] rounded-lg border border-neutral-700">
                      <label className="block text-neutral-400 text-sm mb-2">Upload Brand Logo</label>
                      
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, "brand")}
                          className="hidden"
                        />
                        {brandLogoPreview ? (
                          <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-[var(--color-gold)] bg-white flex items-center justify-center hover:opacity-90 transition-opacity">
                            <Image 
                              src={brandLogoPreview} 
                              alt="Brand logo preview" 
                              fill 
                              className="object-contain p-4"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded-lg bg-neutral-800 flex items-center justify-center border-2 border-dashed border-neutral-700 hover:border-[var(--color-gold)]/50 transition-colors">
                            <div className="text-center">
                              <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
                              <p className="text-neutral-500 text-sm">Click to upload your brand logo</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-sm mb-2">Brokerage Name</label>
                      <input
                        type="text"
                        value={formData.brokerage_name}
                        onChange={(e) => setFormData({ ...formData, brokerage_name: e.target.value })}
                        placeholder="e.g., Coldwell Banker, Royal LePage"
                        className="w-full px-3 py-2.5 bg-[#111111] border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-3 bg-[#111111] rounded-lg p-4 border border-neutral-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Phone</p>
                    <p className="text-white font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Email</p>
                    <p className="text-white font-medium text-sm">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Years in Business</p>
                    <p className="text-white font-medium">{formData.years_in_business} years</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Address</p>
                  <p className="text-white font-medium">{formData.address}</p>
                </div>

                {formData.calendly_link && (
                  <div className="pt-4 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500 mb-1">Calendly Link</p>
                    <p className="text-white font-medium text-sm break-all">{formData.calendly_link}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Company Name</p>
                  <p className="text-white font-medium">{formData.company_name}</p>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-2">Markets ({formData.markets.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.markets.map((city: string) => (
                      <span 
                        key={city}
                        className="px-3 py-1 bg-[var(--color-gold)]/20 text-white rounded-lg text-sm border border-[var(--color-gold)]/30"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <p className="text-xs text-neutral-500 mb-1">Realtor Type</p>
                  <p className="text-white font-medium capitalize">
                    {formData.realtor_type === "solo" ? "Solo Realtor" : "Team Brand"}
                  </p>
                </div>

                {formData.realtor_type === "team" && (
                  <div className="pt-4 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500 mb-1">Brokerage Name</p>
                    <p className="text-white font-medium">{formData.brokerage_name}</p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Please make sure all information is correct before proceeding. 
                  You can update some details later in your profile settings.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
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
      </div>
    </div>
  );
}
