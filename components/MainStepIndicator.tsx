"use client";

import { motion } from "framer-motion";
import { Check, Zap, Layers, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MainStepIndicatorProps {
    completedSteps: string[];
    isLoading: boolean;
}

export default function MainStepIndicator({ completedSteps, isLoading }: MainStepIndicatorProps) {
    const steps = [
        {
            name: "CREATE CAMPAIGN",
            stepKey: "create-batch",
            href: "/lead-nurture-tool/dashboard/batches",
            completed: completedSteps.includes("create-batch"),
            description: "Organize leads",
            icon: Layers
        },
        {
            name: "Import Leads",
            stepKey: "import-leads",
            href: "/lead-nurture-tool/dashboard/leads",
            completed: completedSteps.includes("import-leads"),
            description: "Add contacts",
            icon: Users
        },
        {
            name: "Setup Automations",
            stepKey: "setup-automations",
            href: "/lead-nurture-tool/dashboard/automations",
            completed: completedSteps.includes("setup-automations"),
            description: "Launch campaigns",
            icon: Zap
        }
    ];

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto h-24 bg-neutral-900/30 rounded-2xl animate-pulse mb-8 border border-neutral-800" />
        );
    }

    const currentStepIndex = steps.findIndex(step => !step.completed);
    const progress = steps.length > 0
        ? (steps.filter(s => s.completed).length / steps.length) * 100
        : 0;

    const allCompleted = steps.every(s => s.completed);

    return (
        <div className="w-full max-w-4xl mx-auto mb-10">
            {/* Glassmorphic Container */}
            <div className="relative bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">

                {/* Subtle Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent opacity-50 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-3">
                            Getting Started
                            {allCompleted && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold tracking-wide border border-green-500/20 uppercase"
                                >
                                    Completed
                                </motion.span>
                            )}
                        </h2>
                        <p className="text-neutral-500 text-xs mt-1 font-medium tracking-wide">
                            YOUR JOURNEY TO AUTOMATION
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-[var(--color-gold)] tabular-nums">
                            {Math.round(progress)}%
                        </div>
                    </div>
                </div>

                {/* Steps Visualization */}
                <div className="relative px-4 md:px-12">
                    {/* Progress Track (Background) */}
                    <div className="absolute top-6 left-4 right-4 md:left-12 md:right-12 h-[2px] bg-neutral-800 rounded-full" />

                    {/* Active Progress Track (Foreground) */}
                    <motion.div
                        className="absolute top-6 left-4 md:left-12 h-[2px] bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold)] to-amber-300 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `calc(${progress}% - 2rem)` }} // Approximate width calculation
                        style={{ maxWidth: 'calc(100% - 2rem)' }} // Prevent overflow
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // Custom bezier for "butter" smooth
                    />

                    {/* Steps */}
                    <div className="relative z-10 flex justify-between">
                        {steps.map((step, index) => {
                            const isCompleted = step.completed;
                            const isCurrent = index === currentStepIndex;
                            const isFuture = !isCompleted && !isCurrent;
                            const Icon = step.icon;

                            return (
                                <Link key={step.stepKey} href={step.href} className="group relative focus:outline-none">
                                    <div className="flex flex-col items-center cursor-pointer">

                                        {/* Step Circle */}
                                        <motion.div
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted
                                                ? "bg-[var(--color-gold)] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                                : isCurrent
                                                    ? "bg-[#0A0A0A] border-2 border-[var(--color-gold)] text-[var(--color-gold)] shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                                                    : "bg-[#0A0A0A] border-2 border-neutral-800 text-neutral-600 group-hover:border-neutral-700 group-hover:text-neutral-500"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                >
                                                    <Check size={18} strokeWidth={3} />
                                                </motion.div>
                                            ) : (
                                                <Icon size={18} strokeWidth={2} />
                                            )}

                                            {/* Current Step Ripple Effect */}
                                            {isCurrent && (
                                                <>
                                                    <span className="absolute inset-0 rounded-full border border-[var(--color-gold)] animate-ping opacity-20 duration-1000" />
                                                    <span className="absolute -inset-2 rounded-full border border-[var(--color-gold)]/20 animate-pulse duration-3000" />
                                                </>
                                            )}
                                        </motion.div>

                                        {/* Label & Description */}
                                        <div className="absolute top-16 w-32 text-center transition-all duration-300">
                                            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCompleted ? "text-[var(--color-gold)]" : isCurrent ? "text-white" : "text-neutral-600"
                                                }`}>
                                                {step.name}
                                            </div>
                                            <div className={`text-[10px] font-medium transition-colors duration-300 ${isCurrent ? "text-neutral-400" : "text-neutral-700 group-hover:text-neutral-600"
                                                }`}>
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Spacing to accommodate labels */}
                <div className="h-12" />
            </div>
        </div>
    );
}
