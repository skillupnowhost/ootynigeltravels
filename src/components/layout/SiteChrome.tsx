"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ChatWidget } from "@/components/layout/ChatWidget";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div id="main-content">{children}</div>;
  }

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <main id="main-content">
        <ViewTransition name="page-content">{children}</ViewTransition>
      </main>
      <div className="print:hidden">
        <Footer />
        <WhatsAppButton />
        <ChatWidget />
      </div>
    </>
  );
}
