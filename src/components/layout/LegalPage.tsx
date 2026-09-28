import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "./Footer";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-18 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-sky">
            ← Volver
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm text-fog">Última actualización: {updated}</p>
        <div className="legal mt-10 space-y-5 leading-relaxed text-mist">{children}</div>
      </main>
      <Footer />
    </>
  );
}
