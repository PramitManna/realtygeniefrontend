"use client"

import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useRef } from "react";

const Pricing = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

    const elements = sectionRef.current?.querySelectorAll(".scroll-fade-in");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      name: "Starter",
      icon: Sparkles,
      price: "49",
      description: "Perfect for new realtors getting started",
      features: [
        "50 AI-generated emails/month",
        "10 Auto-posts/month",
        "Basic strata insights",
        "Email support",
        "1 social media account",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      icon: Zap,
      price: "149",
      description: "For serious realtors scaling their business",
      features: [
        "Unlimited AI emails",
        "50 Auto-posts/month",
        "Advanced strata insights",
        "Priority support",
        "3 social media accounts",
        "Custom branding",
        "Analytics dashboard",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "349",
      description: "For teams and agencies dominating the market",
      features: [
        "Everything in Professional",
        "Unlimited auto-posts",
        "White-label solution",
        "Dedicated account manager",
        "Unlimited social accounts",
        "API access",
        "Custom integrations",
        "Team collaboration tools",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(0,0%,10%)] relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[hsl(43,74%,52%)]/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[hsl(43,50%,65%)]/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div ref={sectionRef} className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16 scroll-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading text-[hsl(45,30%,85%)] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-[hsl(45,15%,60%)] max-w-2xl mx-auto">
            Choose the perfect plan for your real estate business. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`scroll-fade-in relative p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular
                    ? "border-[hsl(43,74%,52%)] shadow-[0_0_40px_rgba(212,175,55,0.15)] bg-[hsl(0,0%,12%)]-[hsl(0,0%,12%)]"
                    : "bg-[hsl(0,0%,12%)]-[hsl(0,0%,12%)]"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[hsl(43,74%,52%)] to-[hsl(43,50%,65%)] text-[hsl(0,0%,10%)]-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${plan.popular ? 'bg-[hsl(43,74%,52%)]/10' : 'bg-[hsl(0,0%,20%)]'}`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-[hsl(43,74%,52%)]' : 'text-[hsl(45,15%,60%)]'}`} />
                  </div>
                  <h3 className="text-2xl font-heading text-[hsl(45,30%,85%)]">{plan.name}</h3>
                </div>

                <p className="text-[hsl(45,15%,60%)] mb-6 min-h-[48px]">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-[hsl(45,30%,85%)]">${plan.price}</span>
                  <span className="text-[hsl(45,15%,60%)]">/month</span>
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.popular
                      ? "bg-[hsl(43,74%,52%)] hover:bg-[hsl(43,50%,65%)] text-[hsl(0,0%,10%)]"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[hsl(43,74%,52%)] flex-shrink-0 mt-0.5" />
                      <span className="text-[hsl(45,30%,85%)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto scroll-fade-in">
          <h2 className="text-3xl font-heading text-center text-[hsl(45,30%,85%)] mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees. You only pay for your chosen plan, and you can cancel anytime.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
              },
            ].map((faq) => (
              <Card key={faq.q} className="p-6 bg-[hsl(0,0%,12%)]">
                <h3 className="text-lg font-semibold text-[hsl(45,30%,85%)] mb-2">{faq.q}</h3>
                <p className="text-[hsl(45,15%,60%)]">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 scroll-fade-in">
          <h2 className="text-3xl font-heading text-[hsl(45,30%,85%)] mb-4">
            Still have questions?
          </h2>
          <p className="text-[hsl(45,15%,60%)] mb-6">
            Our team is here to help you choose the right plan for your business.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;