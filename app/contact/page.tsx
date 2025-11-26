"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-6"
          >
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-[#D4AF37] font-medium">Under Construction</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[#E2C675] to-[#D4AF37] bg-clip-text text-transparent">
            COMING SOON
          </h1>
          
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            We're working hard to bring you an amazing contact experience. Stay tuned!
          </p>

          {/* Animated Golden Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto rounded-full"
          />
        </motion.div>

        {/* Contact Card */}
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all"
          >
            <div className="w-16 h-16 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-6 mx-auto">
              <Mail className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 text-center">Get in Touch</h3>
            <p className="text-neutral-400 text-base text-center">info@realtygenie.co</p>
          </motion.div>
        </div>

        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37] rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
