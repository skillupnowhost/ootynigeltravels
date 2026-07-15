"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TripDocumentActions() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href="/track"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-gold-700"
      >
        <ArrowLeft size={16} />
        Back to tracking
      </Link>
      <Button variant="gold" icon={false} onClick={() => window.print()}>
        <Printer size={16} className="mr-1.5" />
        Download / Print PDF
      </Button>
    </div>
  );
}
