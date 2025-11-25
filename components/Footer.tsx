"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Home, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaFacebookF } from "react-icons/fa6";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const currentYear = 2025; // Static year to avoid hydration issues

  useEffect(() => {
    setMounted(true);
  }, []);

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Automations", href: "/dashboard/automations" },
      { name: "Lead Management", href: "/dashboard/leads" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Community", href: "/community" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { icon: FaXTwitter, href: "https://twitter.com/realtygenie", label: "Twitter" },
    { icon: FaLinkedinIn, href: "https://linkedin.com/company/realtygenie/", label: "LinkedIn" },
    { icon: FaInstagram, href: "https://instagram.com/realtygenie", label: "Instagram" },
    { icon: FaFacebookF, href: "https://facebook.com/realtygenie", label: "Facebook" },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Agents" },
    { icon: Mail, value: "1M+", label: "Emails Sent" },
    { icon: TrendingUp, value: "92%", label: "Response Rate" },
    { icon: Zap, value: "24/7", label: "Automation" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#0A0A0A] via-[#0B0B0B] to-black border-t border-white/5">
      {/* Golden divider line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="py-12 border-b border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E2C675]/20 group-hover:from-[#D4AF37]/30 group-hover:to-[#E2C675]/30 transition-all"
                >
                  <stat.icon className="w-6 h-6 text-[#D4AF37]" />
                </motion.div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#E2C675] flex items-center justify-center"
              >
                <Home className="w-5 h-5 text-black" />
              </motion.div>
              <span className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                Realty Genie
              </span>
            </Link>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Transform your real estate business with AI-powered email automation. 
              Close more deals, nurture more leads, and grow faster than ever before.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <p className="text-white font-semibold text-sm">Stay Updated</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/50 transition-all text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#E2C675] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (categoryIndex * 0.1) + (linkIndex * 0.05) }}
                  >
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-[#D4AF37] group-hover:w-4 transition-all" />
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="py-8 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.a
              href="mailto:info@realtygenie.co"
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-all">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Email Us</div>
                <div className="text-sm text-white font-medium">info@realtygenie.co</div>
              </div>
            </motion.a>

            <motion.a
              href="tel:+177879222220"
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-all">
                <Phone className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Call Us</div>
                <div className="text-sm text-white font-medium">+1 (778) 792-2220</div>
              </div>
            </motion.a>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-all">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Visit Us</div>
                <div className="text-sm text-white font-medium">Toronto, Canada</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm text-center md:text-left">
              © {currentYear} Realty Genie. All rights reserved. Built with{" "}
              <span className="text-[#D4AF37]">✨</span> for real estate professionals.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/sitemap"
                className="text-neutral-500 hover:text-[#D4AF37] text-sm transition-colors"
              >
                Sitemap
              </Link>
              <Link
                href="/accessibility"
                className="text-neutral-500 hover:text-[#D4AF37] text-sm transition-colors"
              >
                Accessibility
              </Link>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
    </footer>
  );
}
