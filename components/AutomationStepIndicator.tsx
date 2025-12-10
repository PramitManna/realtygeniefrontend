"use client";

import { motion } from "framer-motion";
import { Check, Zap, Mail, Send } from "lucide-react";

interface AutomationStepIndicatorProps {
    currentStep: number;
    steps: {
        id: number;
        label: string;
        icon: React.ElementType;
    }[];
}

export function AutomationStepIndicator({ currentStep, steps }: AutomationStepIndicatorProps) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="relative flex items-center justify-between">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full -z-10" />

                {/* Active Line */}
                <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full -z-10"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative group">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isCompleted || isCurrent ? "#171717" : "#0a0a0a",
                                    borderColor: isCompleted
                                        ? "rgba(34, 197, 94, 0.5)" // Green for completed
                                        : isCurrent
                                            ? "rgba(59, 130, 246, 0.5)" // Blue for current
                                            : "rgba(255, 255, 255, 0.1)", // Neutral for upcoming
                                }}
                                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-300 relative z-10 ${isCompleted || isCurrent ? "shadow-[0_0_15px_rgba(59,130,246,0.3)]" : ""
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6 text-green-400" />
                                ) : (
                                    <Icon
                                        className={`w-5 h-5 ${isCurrent ? "text-blue-400" : "text-neutral-500"
                                            }`}
                                    />
                                )}

                                {/* Pulse effect for current step */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-blue-500/20"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>

                            <div className="absolute top-14 flex flex-col items-center w-32 text-center">
                                <motion.span
                                    animate={{
                                        color: isCompleted
                                            ? "#4ade80" // green-400
                                            : isCurrent
                                                ? "#60a5fa" // blue-400
                                                : "#737373", // neutral-500
                                        fontWeight: isCurrent ? 600 : 500,
                                    }}
                                    className="text-sm"
                                >
                                    {step.label}
                                </motion.span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
