"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { detectTier, type Tier } from "@/lib/device-tier";
import { loadGsap } from "@/lib/use-gsap";
import { sceneState } from "@/lib/scene-store";

type Experience = { tier: Tier | null; reducedMotion: boolean };
const ExperienceContext = createContext<Experience>({ tier: null, reducedMotion: false });

export const useExperience = () => useContext(ExperienceContext);

export function Providers({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Experience>({ tier: null, reducedMotion: false });

  // Nivel de 3D + preferencia de movimiento (y reaccionar si el usuario la cambia)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setState({ tier: detectTier(), reducedMotion: mq.matches });
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Smooth scroll (Lenis) sincronizado con ScrollTrigger. Solo con ratón/trackpad (en táctil
  // Lenis no suaviza nada) y nunca con movimiento reducido. Se carga en diferido.
  useEffect(() => {
    if (state.reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;
    Promise.all([import("lenis"), loadGsap()]).then(([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const lenis = new Lenis({ autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      teardown = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [state.reducedMotion]);

  // Las alturas cambian (content-visibility, fuentes, FAQ abierta…): recalcular ScrollTrigger
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || !("ResizeObserver" in window)) return;
    let timer: number | undefined;
    let last = main.offsetHeight;
    const ro = new ResizeObserver(() => {
      if (Math.abs(main.offsetHeight - last) < 2) return;
      last = main.offsetHeight;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => loadGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh()), 150);
    });
    ro.observe(main);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Señales baratas para la escena 3D: último scroll y puntero normalizado
  useEffect(() => {
    const onScroll = () => {
      sceneState.lastScroll = performance.now();
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onPointer = (e: PointerEvent) => {
      if (!fine.matches) return;
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      sceneState.lastScroll = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // Entradas de sección: un único IntersectionObserver para todo [data-reveal]
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <ExperienceContext.Provider value={state}>{children}</ExperienceContext.Provider>;
}
