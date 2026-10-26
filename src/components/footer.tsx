"use client";

import { useT } from "@/lib/lang";

export function Footer() {
  const rights = useT({ da: "Alle rettigheder forbeholdes.", en: "All rights reserved." });
  return (
    <footer className="border-t border-white/[0.04] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-600">
          &copy; {new Date().getFullYear()} Frolov FPV. {rights}
        </p>
      </div>
    </footer>
  );
}
