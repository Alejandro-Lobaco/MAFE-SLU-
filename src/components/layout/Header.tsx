"use client";

import { useEffect, useState } from "react";
import { contact, nav } from "@/config/site";
import { callHref } from "@/lib/links";
import { CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";

/**
 * Cabecera fija. El fondo aparece al dejar el hero (indicación de estado, 200 ms ease).
 * El menú móvil se abre y cierra SIN animación: es una acción repetitiva.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-200 ease-[ease] ${
        solid ? "border-white/10 bg-night/92" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="#inicio" className="shrink-0 rounded-lg" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav aria-label="Principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-mist transition-colors duration-150 ease-[ease] hover-fine:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <a
            href={callHref}
            className="hidden text-right leading-tight xl:block"
          >
            <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-fog">Llámanos</span>
            <span className="block font-display text-base font-semibold tabular-nums text-white">{contact.mobile.display}</span>
          </a>
          <a href={callHref} className="btn btn-call size-11 min-h-11 p-0 text-sm sm:w-auto sm:px-5" aria-label={`Llamar ahora al ${contact.mobile.display}`}>
            <PhoneIcon className="size-4.5" strokeWidth={2.2} />
            <span className="hidden sm:inline">Llamar ahora</span>
          </a>
          <button
            type="button"
            className="btn btn-ghost size-11 min-h-11 p-0 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movil" aria-label="Menú móvil" className="border-t border-white/10 bg-night lg:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3.5 font-display text-lg text-white active:bg-white/5"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#presupuesto" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3.5 font-display text-lg text-sky active:bg-white/5">
                Presupuesto gratuito
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
