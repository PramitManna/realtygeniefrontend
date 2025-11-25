"use client";

import { usePathname } from "next/navigation";
import NavbarDemo from "@/app/Navbar/page";
import Footer from "@/components/Footer";
import { Spotlight } from "@/components/ui/spotlight-new";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages where we don't want navbar, footer, and spotlight
  const excludedPaths = ['/auth/login', '/auth/signup', '/auth/verify', '/auth/forgot-password', '/auth/otp', '/onboarding', '/dashboard'];
  const shouldShowLayout = !excludedPaths.some(path => pathname.startsWith(path));

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight />
      <div className="relative z-10">
        <div className="mx-4 my-2">
          <NavbarDemo />
        </div>
        <div className="relative z-10">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
