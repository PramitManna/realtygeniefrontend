"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
    AutomatedCampaignsIcon,
    LeadManagementIcon,
    AIPersonalizationIcon,
    AnalyticsIcon,
} from "@/components/ui/feature-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { 
    ArrowRight, 
    Zap, 
    Mail, 
    Camera, 
    FileText, 
    Clock, 
    TrendingUp, 
    Shield, 
    Sparkles,
    Star,
    ChevronDown,
    Crown,
    CheckCircle2
} from "lucide-react";

// Animated Components
const AnimatedCheckmark = () => (
    <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <motion.path
            d="M20 6L9 17l-5-5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
        />
    </motion.svg>
);

// Glass Card Component
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        className={`
            backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl 
            hover:bg-white/10 hover:border-white/20 transition-all duration-500
            shadow-lg shadow-gold/5 hover:shadow-gold/15
            group relative overflow-hidden
            ${className}
        `}
    >
        <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:to-transparent pointer-events-none -z-10"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        />
        {children}
    </motion.div>
);

// Hero Section
const HeroSection = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-32 overflow-hidden"
    >
        <div className="text-center space-y-6 relative z-10 max-w-5xl mx-auto">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="inline-block cursor-pointer"
            >
                <span className="px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-semibold hover:bg-gold/20 hover:border-gold/50 transition-all duration-300">
                    ✨ Powered by AI & Automation
                </span>
            </motion.div>

            <motion.h1 
                className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
            >
                The Future of
                <motion.span 
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-soft"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Real Estate Outreach
                </motion.span>
            </motion.h1>

            <motion.p 
                className="text-xl md:text-2xl text-neutral-300 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                Harness the power of intelligent automation and AI personalization to transform your lead nurturing into a revenue-generating machine.
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-6 pt-8"
            >
                <Link href="/auth/signup">
                    <Button 
                        size="lg" 
                        className="bg-gold hover:bg-gold-soft text-black px-12 h-12 shadow-[0_6px_28px_rgba(212,175,55,0.18)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)] transition-all group"
                    >
                        Start Free Trial
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-gold text-gold hover:bg-gold/10 px-12 h-12"
                >
                    Watch Demo
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto"
            >
                {[
                    { icon: Mail, label: "AI Emails" },
                    { icon: Camera, label: "Auto-Posts" },
                    { icon: FileText, label: "Strata Insights" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <item.icon className="w-6 h-6 text-gold" />
                        <span className="text-sm text-neutral-300">{item.label}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    </motion.div>
);

// Lead Nurturing Feature
const LeadNurturingSection = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            className="py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
                className="space-y-6"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Lead Nurturing — Humanized AI Email Sequences</h2>
                <p className="text-lg text-neutral-300 leading-relaxed">
                    Automate follow-ups that feel personal — increase reply rates without extra work.
                </p>

                <div className="space-y-4 pt-4">
                    {[
                        { title: "Personalized intros & smart subject lines", desc: "Tailored by property & prospect" },
                        { title: "Multi-step follow-ups triggered by engagement", desc: "Automated sequences with reply detection" },
                        { title: "Intent detection & call-ready alerts", desc: "Real-time A/B variants to maximize replies" }
                    ].map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-3"
                        >
                            <div className="text-gold mt-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{benefit.title}</p>
                                <p className="text-sm text-neutral-400">{benefit.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
            >
                <GlassCard className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400">Subject Line</label>
                        <div className="bg-background/50 p-3 rounded border border-gold/20">
                            <p className="text-sm text-white">Quick question about <span className="text-gold">[Property]</span> — 2 min?</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400">Preview Text</label>
                        <div className="bg-background/50 p-3 rounded border border-white/10">
                            <p className="text-sm text-neutral-300">Hi <span className="text-gold">[FirstName]</span>, noticed your interest in...</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="inline-flex items-center gap-2 text-xs bg-gold/10 text-gold px-3 py-1 rounded-full">
                            <Mail className="w-3 h-3" />
                            Sent
                        </span>
                        <span className="text-xs text-neutral-400">Reply rate: 32%</span>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};

// Smart Lead Management with Card Grid
interface CardGridFeature {
    icon: React.ReactNode;
    title: string;
    features: { name: string; description: string }[];
}

const CardGridSection = ({ icon, title, features }: CardGridFeature) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            className="py-20 md:py-28"
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: -30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className="text-center mb-16"
            >
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    {icon}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
                <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                    Comprehensive suite of tools designed to maximize your efficiency and ROI
                </p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.12,
                        },
                    },
                }}
            >
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, y: 40, scale: 0.9 },
                            visible: { opacity: 1, y: 0, scale: 1 },
                        }}
                        whileHover={{ y: -12, transition: { duration: 0.3 } }}
                    >
                        <GlassCard className="p-8 h-full group hover:border-gold/50 cursor-pointer">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center group-hover:bg-gold/40 transition-all duration-300">
                                    <Zap className="w-6 h-6 text-gold" />
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">{feature.name}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">{feature.description}</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

// Autopost & Strata Sections (Split Layout)
const AutopostSection = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            className="py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
                className="order-2 lg:order-1"
            >
                <GlassCard className="p-6 space-y-4">
                    <div className="aspect-[4/5] bg-background/50 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-sm text-white font-semibold mb-2">Stunning 3BR in Downtown 🏙️</p>
                            <p className="text-xs text-neutral-300">Open house this Saturday! DM for details.</p>
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {["#luxuryrealestate", "#downtown", "#openhouse"].map((tag) => (
                                    <span key={tag} className="text-xs text-gold bg-gold/10 px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            <motion.div
                variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
                className="space-y-6 order-1 lg:order-2"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                    Autopost — Publish stunning property posts automatically
                </h2>
                <p className="text-lg text-neutral-300 leading-relaxed">
                    From image enhancement to trending captions — publish with one click.
                </p>
                
                <div className="space-y-4 pt-4">
                    {[
                        { title: "AI-enhanced property photos", desc: "Composition presets ready for Instagram" },
                        { title: "Auto-generated captions & trending hashtags", desc: "Localized for maximum reach" },
                        { title: "Schedule & post to Instagram + Facebook", desc: "OAuth integration with smart scheduler" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-3"
                        >
                            <div className="text-gold mt-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{item.title}</p>
                                <p className="text-sm text-neutral-400">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

const StrataInsightSection = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            className="py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
                className="space-y-6"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                    Strata Insight — Instant due-diligence
                </h2>
                <p className="text-lg text-neutral-300 leading-relaxed">
                    Ownership, bylaws, fees & neighborhood score — all in one place.
                </p>
                
                <div className="space-y-4 pt-4">
                    {[
                        { title: "Ownership history & title summary", desc: "Extracts key facts automatically" },
                        { title: "Strata bylaws & restriction highlights", desc: "Readable summary of complex rules" },
                        { title: "Exportable due-diligence pack (PDF)", desc: "Professional reports for clients" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-3"
                        >
                            <div className="text-gold mt-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{item.title}</p>
                                <p className="text-sm text-neutral-400">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
                }}
                className="space-y-4"
            >
                <GlassCard className="p-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                            <span className="text-xs text-neutral-400">Property Details</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Owner</span>
                                <span className="text-white">ABC Holdings Ltd.</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Last Sale</span>
                                <span className="text-white">$1.2M (2021)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Strata Fee</span>
                                <span className="text-gold">$420/mo</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Restrictions</span>
                                <span className="text-green-400">None</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
                <div className="bg-white/5 border border-gold/20 p-4 rounded-lg">
                    <p className="text-sm text-white">
                        <span className="text-gold font-semibold">Quick insight:</span> Low strata fees (avg $420/mo) • No short-term rental restrictions
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Testimonials & FAQ
const TestimonialsSection = () => {
    const testimonials = [
        { quote: "RealtyGenie cut our outreach time in half and doubled quality replies.", name: "Priya K.", title: "Senior Agent", rating: 5 },
        { quote: "Autopost made our listings look premium with one click.", name: "Arjun S.", title: "Broker", rating: 5 },
        { quote: "Strata insights saved us from a risky deal — essential.", name: "Meera R.", title: "Property Manager", rating: 5 }
    ];

    return (
        <section className="py-20">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white">Trusted by top realtors</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {testimonials.map((testimonial, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard className="p-6 hover:border-gold/20 transition-all h-full">
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                                ))}
                            </div>
                            <p className="text-white mb-4 italic">"{testimonial.quote}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                    <span className="text-gold font-semibold">{testimonial.name[0]}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                                    <p className="text-xs text-neutral-400">{testimonial.title}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const FAQSection = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    
    const faqs = [
        { q: "Does RealtyGenie support CSV imports?", a: "Yes — bulk lead import with column mapping and dedup checks." },
        { q: "How do replies get routed?", a: "Replies are captured via authenticated inbound mail routing; you can view and tag replies in the Campaigns view." },
        { q: "Can I control the tone of emails?", a: "Yes — choose brand voice presets (Formal, Casual, Persuasive) or create a custom voice." },
        { q: "How does RealtyGenie personalize emails?", a: "Our AI analyzes prospect data and property details to craft personalized subject lines, opening lines, and CTAs tailored to each recipient." },
        { q: "Which social platforms are supported?", a: "Currently Instagram and Facebook, with direct OAuth integration for seamless posting and scheduling." },
        { q: "How secure is my data?", a: "We use enterprise-grade encryption, SOC 2 compliance, and never share your data with third parties." }
    ];

    return (
        <section className="py-20">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <Card className="bg-white/5 border-white/10 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 text-left flex justify-between items-start gap-4 hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                                    <ChevronDown 
                                        className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${
                                            openFaq === i ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 pt-0">
                                        <p className="text-sm text-neutral-400">{faq.a}</p>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Final CTA
const FinalCTA = () => (
    <section className="py-20 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-8">
                Join thousands of realtors using RealtyGenie to close more deals faster.
            </p>
            <Link href="/auth/signup">
                <Button 
                    size="lg" 
                    className="bg-gold hover:bg-gold-soft text-black px-16 h-14 text-lg shadow-[0_8px_32px_rgba(212,175,55,0.2)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.3)] transition-all group"
                >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
        </motion.div>
    </section>
);

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#0B0B0B] text-white antialiased">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <HeroSection />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <LeadNurturingSection />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <CardGridSection
                    icon={<LeadManagementIcon />}
                    title="Smart Lead Management"
                    features={[
                        { name: "Multi-Source Import", description: "Import from CSV, Google Sheets, manual entry, or API integrations with automatic data validation" },
                        { name: "Intelligent Batching", description: "Automatically organize leads into targeted segments based on criteria you define" },
                        { name: "Pipeline Tracking", description: "Visual dashboard showing lead status, conversion rates, and pipeline health in real-time" },
                        { name: "Data Enrichment", description: "Automatically enhance leads with additional contact info and property data" },
                        { name: "Duplicate Detection", description: "Smart algorithms prevent duplicate entries and keep your database clean" },
                        { name: "Custom Fields", description: "Define unlimited custom fields to track exactly what matters to your business" },
                    ]}
                />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <AutopostSection />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <StrataInsightSection />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <TestimonialsSection />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <FAQSection />
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />
                
                <FinalCTA />
            </div>
        </div>
    );
}