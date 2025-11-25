import { cn } from "@/lib/utils";
import { Building2, Users2, LineChart, MessageSquareText, Newspaper, BrainCircuit, Mail, Video } from "lucide-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Smart Property Matching",
      description:
        "AI-powered algorithms match properties with the perfect buyers based on preferences and market data.",
      icon: <Building2 className="w-12 h-12" />,
    },
    {
      title: "Lead Qualification",
      description:
        "Automatically qualify and score leads based on engagement, intent signals, and interests.",
      icon: <Users2 className="w-12 h-12" />,
    },
    {
      title: "Market Analytics",
      description:
        "Get real-time insights into market trends, property valuations, and buyer patterns.",
      icon: <LineChart className="w-12 h-12" />,
    },
    {
      title: "Automated Follow-ups",
      description:
        "Keep leads engaged with personalized, timely follow-ups across all channels.",
      icon: <MessageSquareText className="w-12 h-12" />,
    },
    {
      title: "Content Generation",
      description:
        "Create compelling property descriptions and marketing materials with AI assistance.",
      icon: <Newspaper className="w-12 h-12" />,
    },
    {
      title: "Smart Insights",
      description:
        "Get AI-powered recommendations for pricing, timing, and negotiation strategies.",
      icon: <BrainCircuit className="w-12 h-12" />,
    },
    {
      title: "Email Campaigns",
      description:
        "Create and manage targeted email campaigns with AI-optimized content and timing.",
      icon: <Mail className="w-12 h-12" />,
    },
    {
      title: "Virtual Tours",
      description:
        "Generate immersive virtual property tours with AI-enhanced visualization and narration.",
      icon: <Video className="w-12 h-12" />,
    }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-800 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-[var(--color-gold)] dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-[var(--color-gold-soft)] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-[var(--color-gold-soft)] dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-400 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
