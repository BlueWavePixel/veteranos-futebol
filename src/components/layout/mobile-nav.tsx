"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition-colors">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/equipas"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-primary transition-colors"
          >
            Equipas
          </Link>
          <Link
            href="/sugestoes"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-primary transition-colors"
          >
            Sugestões
          </Link>
          <Link
            href="/registar"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-primary transition-colors"
          >
            Registar Equipa
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-lg hover:text-primary transition-colors"
          >
            Aceder
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
