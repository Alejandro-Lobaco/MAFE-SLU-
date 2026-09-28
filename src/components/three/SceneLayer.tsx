"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/providers/Providers";
import { useGsapEffect } from "@/lib/use-gsap";
import { sceneEvents, sceneState } from "@/lib/scene-store";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Capa fija detrás del contenido. Carga three.js en diferido:
 *  - escena completa / fotograma fijo: al primer gesto del usuario o tras 2,5 s de reposo
 *  - escena simplificada (móvil): solo al primer gesto (toque, scroll, tecla)
 * Mientras tanto se ve la ilustración SVG del hero.
 */
export function SceneLayer() {
  const { tier } = useExperience();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tier || tier === "none") return;
    let done = false;
    let timer: number | undefined;
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    const go = () => {
      if (done) return;
      done = true;
      events.forEach((e) => window.removeEventListener(e, go));
      window.clearTimeout(timer);
      setLoad(true);
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true }));
    if (tier === "high" || tier === "static") {
      const arm = () => (timer = window.setTimeout(go, 2500));
      if (document.readyState === "complete") arm();
      else window.addEventListener("load", arm, { once: true });
    }
    return () => {
      done = true;
      events.forEach((e) => window.removeEventListener(e, go));
      window.clearTimeout(timer);
    };
  }, [tier]);

  // Scroll → opacidad de la capa, escena activa, hero visible y avance del recorrido
  useGsapEffect(
    ({ ScrollTrigger }) => {
      if (!tier || tier === "none") return;
      let heroEnd = 0;
      let formTop = Infinity;
      let stops: { s: number; t: number }[] = [];

      const compute = () => {
        const vh = window.innerHeight;
        const pin = ScrollTrigger.getById("hero-pin");
        const heroEl = document.getElementById("inicio");
        heroEnd = pin ? pin.end : (heroEl?.offsetHeight ?? vh) * 0.35;
        const form = document.getElementById("presupuesto");
        formTop = form ? form.getBoundingClientRect().top + window.scrollY : Infinity;
        const els = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
        stops = [{ s: heroEnd, t: 0 }];
        els.forEach((el, i) => {
          const s = el.getBoundingClientRect().top + window.scrollY - vh * 0.5;
          const prev = stops[stops.length - 1].s;
          stops.push({ s: Math.max(s, prev + 1), t: (i + 1) / els.length });
        });
      };

      const journeyAt = (scroll: number) => {
        if (tier === "static" || scroll <= stops[0].s) return 0;
        for (let i = 0; i < stops.length - 1; i++) {
          const a = stops[i];
          const b = stops[i + 1];
          if (scroll < b.s) return a.t + (b.t - a.t) * ((scroll - a.s) / (b.s - a.s));
        }
        return 1;
      };

      const apply = (scroll: number) => {
        const vh = window.innerHeight;
        const dim = 1 - 0.58 * clamp01((scroll - heroEnd) / (vh * 0.6));
        const fade = 1 - clamp01((scroll - (formTop - vh * 1.1)) / (vh * 0.6));
        const opacity = dim * fade;
        if (outer.current) {
          outer.current.style.opacity = opacity.toFixed(3);
          outer.current.style.visibility = opacity < 0.005 ? "hidden" : "visible";
        }
        sceneState.active = opacity >= 0.005;
        sceneState.heroVisible = scroll < heroEnd + vh * 0.9;
        sceneState.journey.target = journeyAt(scroll);
      };

      const onRefresh = () => {
        compute();
        apply(window.scrollY);
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);
      onRefresh();
      const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => apply(self.scroll()) });
      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        st.kill();
      };
    },
    [tier],
  );

  const onReady = useCallback(() => {
    setReady(true);
    document.documentElement.dataset.scene = "ready";
    sceneEvents.emit();
  }, []);

  if (!tier || tier === "none") return null;

  return (
    <div ref={outer} aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* Entrada del canvas: evita un cambio brusco al sustituir la ilustración (500 ms, ease-out) */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {load && <Experience tier={tier} onReady={onReady} />}
      </div>
      {/* Viñeta: asegura el contraste del texto sobre la escena */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_40%,transparent_35%,rgba(10,22,40,0.75)_100%)]" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(10,22,40,0.94)_0%,rgba(10,22,40,0.78)_32%,rgba(10,22,40,0)_56%)] md:block" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,22,40,0.92)_0%,rgba(10,22,40,0.7)_48%,rgba(10,22,40,0)_72%)] md:hidden" />
    </div>
  );
}
