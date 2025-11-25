"use client";
// import React, { useEffect, useState } from "react";
// import { createClient } from "@/utils/supabase/client";
// import { useRouter } from "next/navigation";
// import FeaturesSection from "@/components/features-section";
// import { ContainerTextFlip } from "@/components/ui/container-text-flip";
// import { motion } from "motion/react";
// import { cn } from "@/lib/utils";

// export default function HomePage() {
//   const [user, setUser] = useState<any>(null);
//   const router = useRouter();
//   const supabase = createClient();
//   const words = ["Transform","Elevate","Upgrade","Reinvent","Modernize","Empower","Accelerate","Maximize","Amplify","Supercharge","Scale","Revolutionize","Redefine","Reimagine","Evolve","Innovate","Optimize","Enhance","Streamline","Refine"]

//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//     });

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => subscription.unsubscribe();
//   }, []);
//   return (
//     <div className="min-h-screen w-full">
//       {/* Hero Section */}
//       <div className="h-[calc(100vh-64px)] relative">
//         <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-32">
//           <motion.h1 initial={{opacity: 0}} whileInView={{opacity: 1}} className={cn("text-4xl md:text-6xl font-bold text-center text-white font-[var(--font-heading)] leading-normal tracking-tight")} layout>
//             <div className="inline-block">
//               <ContainerTextFlip words={words} /> Your Real Estate <br /> Business with AI
//             </div>
//           </motion.h1>
//           <p className="mt-6 text-lg text-white/80 max-w-2xl text-center mx-auto font-[var(--font-body)] leading-snug">
//             RealtyGenie helps realtors generate high-quality leads and close more deals using advanced AI technology. Turn prospects into clients, automatically.
//           </p>
//           <div className="mt-8 flex flex-col items-center gap-4">
//             <div className="flex justify-center gap-4">
//               <button className="relative px-8 py-3 bg-[var(--color-gold)] text-black rounded-lg font-[var(--font-body)] font-semibold hover:bg-[var(--color-gold-soft)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-[var(--color-gold)] before:opacity-0 hover:before:opacity-20 before:transition-opacity before:-z-10 before:blur-xl">
//                 Get Started
//               </button>
//               <button className="relative px-8 py-3 border-2 border-[var(--color-gold)] text-white rounded-lg font-[var(--font-body)] font-semibold hover:border-[var(--color-gold-soft)] hover:text-[var(--color-gold-soft)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-[var(--color-gold)] before:opacity-0 hover:before:opacity-5 before:transition-opacity before:-z-10 before:blur-xl">
//                 Book Demo
//               </button>
//             </div>
//             <button 
//               onClick={() => {
//                 if (user) {
//                   router.push('/dashboard/lead-nurture');
//                 } else {
//                   router.push('/auth/login?redirect=/dashboard/lead-nurture');
//                 }
//               }}
//               className="group relative inline-flex items-center gap-2 px-8 py-3 bg-black/30 text-[var(--color-gold)] rounded-lg font-[var(--font-body)] font-semibold border border-[var(--color-gold)]/30 hover:border-[var(--color-gold)]/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] before:absolute before:inset-0 before:rounded-lg before:bg-[var(--color-gold)] before:opacity-0 hover:before:opacity-5 before:transition-opacity before:-z-10 before:blur-xl"
//             >
//               Try Lead Nurture Tool
//               <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Features Section */}
//       <FeaturesSection />
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import FeaturesSection from "@/components/features-section";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Zap } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const sectionRef = useRef<HTMLElement>(null);
  const words = ["Transform","Elevate","Upgrade","Reinvent","Modernize","Empower","Accelerate","Maximize","Amplify","Supercharge","Scale","Revolutionize","Redefine","Reimagine","Evolve","Innovate","Optimize","Enhance","Streamline","Refine"]

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-fade-in");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full">
      {/* Original Hero Section */}
      <div className="h-[calc(100vh-64px)] relative">
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-32">
          <motion.h1 initial={{opacity: 0}} whileInView={{opacity: 1}} className={cn("text-4xl md:text-6xl font-bold text-center text-white font-[var(--font-heading)] leading-normal tracking-tight")} layout>
            <div className="inline-block">
              <ContainerTextFlip words={words} /> Your Real Estate <br /> Business with AI
            </div>
          </motion.h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl text-center mx-auto font-[var(--font-body)] leading-snug">
            RealtyGenie helps realtors generate high-quality leads and close more deals using advanced AI technology. Turn prospects into clients, automatically.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  if (user) {
                    router.push('/dashboard');
                  } else {
                    router.push('/auth/signup');
                  }
                }}
                className="relative px-8 py-3 bg-[var(--color-gold)] text-black rounded-lg font-[var(--font-body)] font-semibold hover:bg-[var(--color-gold-soft)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] before:absolute before:inset-0 before:rounded-lg before:bg-[var(--color-gold)] before:opacity-0 hover:before:opacity-20 before:transition-opacity before:-z-10 before:blur-xl">
                Get Started
              </button>
              <button className="relative px-8 py-3 border-2 border-[var(--color-gold)] text-white rounded-lg font-[var(--font-body)] font-semibold hover:border-[var(--color-gold-soft)] hover:text-[var(--color-gold-soft)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-[var(--color-gold)] before:opacity-0 hover:before:opacity-5 before:transition-opacity before:-z-10 before:blur-xl">
                Book Demo
              </button>
            </div> */}
            <button 
              onClick={() => {
                if (user) {
                  router.push('/dashboard/lead-nurture');
                } else {
                  router.push('/auth/login?redirect=/dashboard/lead-nurture');
                }
              }}
              className="group relative inline-flex items-center gap-2 px-8 py-3 bg-black/30 text-[var(--color-gold)] rounded-lg font-[var(--font-body)] font-semibold border border-[var(--color-gold)]/30 hover:border-[var(--color-gold)]/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] before:absolute before:inset-0 before:rounded-lg before:bg-[var(--color-gold)] before:opacity-0 hover:before:opacity-5 before:transition-opacity before:-z-10 before:blur-xl"
            >
              Try Lead Nurture Tool
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* New Hero Section with Dashboard Preview */}
      <section ref={sectionRef} className="relative min-h-screen flex items-center -mt-16">
        {/* Sophisticated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px] animate-pulse" 
               style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-soft/10 rounded-full blur-[100px] animate-pulse" 
               style={{ animationDuration: '10s', animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="scroll-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
                <Zap className="w-4 h-4 text-gold" />
                <span className="text-sm text-neutral-200 font-medium">AI-Powered Real Estate Marketing</span>
              </div>

              <div className="scroll-fade-in space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-300 leading-[1.1]">
                  Close More
                  <br />
                  <span className="text-gold">Deals Faster</span>
                </h1>
                <p className="text-lg md:text-xl text-foreground/70 text-neutral-400 leading-relaxed max-w-xl">
                  RealtyGenie automates your lead nurturing, social media, and property research—so you can focus on what matters: closing deals.
                </p>
              </div>

              <div className="scroll-fade-in space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-base text-neutral-400">Generate 3x more qualified leads with AI emails</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-base text-neutral-400">Automate Instagram & Facebook with smart posts</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <p className="text-base text-neutral-400">Access instant property strata insights</p>
                </div>
              </div>

              <div className="scroll-fade-in flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="text-base px-8 bg-gold text-black hover:bg-gold-soft shadow-lg transition-all group"
                  onClick={() => {
                    if (user) {
                      router.push('/dashboard');
                    } else {
                      router.push('/auth/signup');
                    }
                  }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 border-border/50 hover:bg-card/50"
                  onClick={() => {
                    if (user) {
                      router.push('/dashboard/lead-nurture');
                    } else {
                      router.push('/auth/login?redirect=/dashboard/lead-nurture');
                    }
                  }}
                >
                  Watch Demo
                </Button>
              </div>

              <p className="scroll-fade-in text-sm text-muted-foreground pt-2">
                Best In Business. Guaranteed Success.
              </p>
            </div>

            {/* Right Visual */}
            <div className="scroll-fade-in relative lg:pl-8">
              {/* Main Card */}
              <div className="relative">
                {/* Floating Stats Cards */}
                <div className="absolute -top-4 -left-4 z-20 animate-float">
                  <div className="bg-card/90 backdrop-blur-xl border border-gold/30 rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gold">+247%</p>
                        <p className="text-xs text-muted-foreground">Lead Growth</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-4 z-20 animate-float-delayed">
                  <div className="bg-card/90 backdrop-blur-xl border border-gold/30 rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gold">18hrs</p>
                        <p className="text-xs text-muted-foreground">Time Saved/Week</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Preview */}
                <div className="relative rounded-3xl border-2 border-gold/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold-soft/5" />
                  
                  <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                          <span className="text-gold font-bold text-lg">RG</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">RealtyGenie</h3>
                          <p className="text-xs text-muted-foreground">Marketing Dashboard</p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Active Campaigns</p>
                        <p className="text-2xl font-bold text-gold">24</p>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gold rounded-full" />
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Response Rate</p>
                        <p className="text-2xl font-bold text-gold">85%</p>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-5/6 bg-gold rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Activity List */}
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 bg-background/30 rounded-lg p-3 border border-border/20">
                          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-muted/50 rounded w-3/4" />
                            <div className="h-2 bg-muted/30 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}
