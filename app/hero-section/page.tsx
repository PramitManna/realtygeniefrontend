"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Zap } from "lucide-react";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

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
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-soft/10 rounded-full blur-[100px] animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="scroll-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Real Estate Marketing</span>
            </div>

            <div className="scroll-fade-in space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1]">
                Close More
                <br />
                <span className="text-primary">Deals Faster</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-xl">
                RealtyGenie automates your lead nurturing, social media, and property research—so you can focus on what matters: closing deals.
              </p>
            </div>

            <div className="scroll-fade-in space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="text-base">Generate 3x more qualified leads with AI emails</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="text-base">Automate Instagram & Facebook with smart posts</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="text-base">Access instant property strata insights</p>
              </div>
            </div>

            <div className="scroll-fade-in flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="text-base px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-border/50 hover:bg-card/50">
                Watch Demo
              </Button>
            </div>

            <p className="scroll-fade-in text-sm text-muted-foreground pt-2">
              Free 14-day trial • No credit card required
            </p>
          </div>

          {/* Right Visual */}
          <div className="scroll-fade-in relative lg:pl-8">
            {/* Main Card */}
            <div className="relative">
              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -left-4 z-20 animate-float">
                <div className="bg-card/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">+247%</p>
                      <p className="text-xs text-muted-foreground">Lead Growth</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 z-20 animate-float-delayed">
                <div className="bg-card/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">18hrs</p>
                      <p className="text-xs text-muted-foreground">Time Saved/Week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Preview */}
              <div className="relative rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-soft/5" />
                
                <div className="relative space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">RG</span>
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
                      <p className="text-2xl font-bold text-primary">24</p>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-primary rounded-full" />
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Response Rate</p>
                      <p className="text-2xl font-bold text-primary">85%</p>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-5/6 bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 bg-background/30 rounded-lg p-3 border border-border/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
  );
};

export default HeroSection;