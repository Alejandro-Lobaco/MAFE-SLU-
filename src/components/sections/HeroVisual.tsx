"use client";

import { useEffect, useRef, useState } from "react";
import { hero } from "@/config/site";
import { useExperience } from "@/components/providers/Providers";
import { useGsapEffect } from "@/lib/use-gsap";
import { sceneEvents, sceneState } from "@/lib/scene-store";

type Phase = "idle" | "scanning" | "found";

/**
 * Parte cliente del hero:
 *  - Timeline de GSAP ligado al scroll (hero fijado): fuga → escáner → detección → pin.
 *    Es el "presupuesto de espectáculo" de la página; el scroll es el reloj (scrub, lineal).
 *  - Lectura del escáner (HUD) sincronizada con el timeline.
 *  - Ilustración SVG: primera pintura, versión sin WebGL y fallback de movimiento reducido.
 */
export function HeroVisual() {
  const { tier } = useExperience();
  const anchor = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => sceneEvents.subscribe(() => setSceneReady(document.documentElement.dataset.scene === "ready")), []);

  // Sin animación (movimiento reducido / sin WebGL): estado final, quieto
  useEffect(() => {
    if (tier !== "static" && tier !== "none") return;
    Object.assign(sceneState.hero, { leak: 1, scan: 1, lock: 1, pin: 1, dolly: 0.55 });
    setPhase("found");
    if (bar.current) bar.current.style.transform = "scaleX(1)";
  }, [tier]);

  useGsapEffect(
    ({ gsap, ScrollTrigger, EASE_IN_OUT, EASE_OUT }) => {
      const section = anchor.current?.closest("section");
      const h = sceneState.hero;
      if (!section || (tier !== "high" && tier !== "low")) return;

      const updateHud = (p: number) => {
        setPhase(p < 0.2 ? "idle" : p < 0.68 ? "scanning" : "found");
        if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, (p - 0.2) / 0.48)).toFixed(3)})`;
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "hero-pin",
          trigger: section,
          start: "top top",
          end: "+=85%",
          pin: true,
          scrub: true,
          onUpdate: (self) => updateHud(self.progress),
        },
      });
      tl.to(h, { leak: 1, duration: 0.34 }, 0.02)
        .to(h, { scan: 1, duration: 0.48, ease: EASE_IN_OUT }, 0.2) // se desplaza en pantalla → ease-in-out
        .to(h, { lock: 1, duration: 0.1, ease: EASE_OUT }, 0.66)
        .to(h, { pin: 1, duration: 0.2, ease: EASE_OUT }, 0.7) // entra → ease-out
        .to(h, { dolly: 1, duration: 0.45, ease: EASE_IN_OUT }, 0.55);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      updateHud(tl.scrollTrigger?.progress ?? 0);
    },
    [tier],
  );

  const label = phase === "found" ? hero.hud.found : phase === "scanning" ? hero.hud.scanning : hero.hud.idle;

  return (
    <div ref={anchor} aria-hidden className="pointer-events-none absolute inset-0">
      {/* Ilustración: se retira cuando el 3D está listo (500 ms ease-out) */}
      <div
        className="absolute inset-x-0 bottom-[7%] h-[34%] opacity-90 transition-opacity duration-500 ease-out [mask-image:linear-gradient(180deg,transparent,black_35%)] motion-reduce:transition-none md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[60%] md:opacity-100 md:[mask-image:linear-gradient(90deg,transparent,black_38%)]"
        style={sceneReady ? { opacity: 0 } : undefined}
      >
        <HeroIllustration />
      </div>

      {/* Lectura del escáner */}
      <div className="absolute bottom-24 left-4 sm:inset-x-6 md:bottom-10 md:left-auto md:right-8 md:w-80">
        <div className="panel !rounded-full px-4 py-2.5 sm:!rounded-[1.25rem] sm:py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative inline-flex size-2.5">
              {phase !== "found" && <span className="live-ping absolute inset-0 rounded-full bg-sky" />}
              <span className={`relative inline-block size-2.5 rounded-full ${phase === "found" ? "bg-white" : "bg-sky"}`} />
            </span>
            <span className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">{label}</span>
          </div>
          <span className="mt-3 hidden h-1 overflow-hidden rounded-full bg-white/10 sm:block">
            <span ref={bar} className="block h-full origin-left rounded-full bg-gradient-to-r from-aqua to-sky" style={{ transform: "scaleX(0)" }} />
          </span>
          <p className="mt-2.5 hidden text-xs text-fog sm:block">{hero.hud.detail}</p>
        </div>
      </div>
    </div>
  );
}

/** Versión ilustrada de la escena: misma composición que el 3D, en su estado final. */
function HeroIllustration() {
  const drops = [
    [392, 176, 3.2], [402, 160, 2.6], [414, 146, 2.2], [426, 138, 2], [438, 136, 1.7], [449, 140, 1.6],
    [398, 166, 2], [409, 152, 1.8], [420, 144, 1.6], [431, 142, 1.4], [458, 150, 1.5], [466, 164, 1.4],
    [472, 180, 1.3], [476, 198, 1.2], [386, 170, 2.4], [394, 150, 1.4], [404, 140, 1.2],
  ];
  return (
    <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id="hv-chrome-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4a5e" />
          <stop offset=".22" stopColor="#f1f5f9" />
          <stop offset=".45" stopColor="#aab6c6" />
          <stop offset=".78" stopColor="#4a5a70" />
          <stop offset="1" stopColor="#1b2536" />
        </linearGradient>
        <linearGradient id="hv-chrome-v" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b2536" />
          <stop offset=".25" stopColor="#aab6c6" />
          <stop offset=".45" stopColor="#f1f5f9" />
          <stop offset=".8" stopColor="#4a5a70" />
          <stop offset="1" stopColor="#1b2536" />
        </linearGradient>
        <radialGradient id="hv-elbow" cx="430" cy="250" r="57" gradientUnits="userSpaceOnUse">
          <stop offset=".62" stopColor="#1b2536" />
          <stop offset=".72" stopColor="#aab6c6" />
          <stop offset=".8" stopColor="#f1f5f9" />
          <stop offset=".92" stopColor="#4a5a70" />
          <stop offset="1" stopColor="#1b2536" />
        </radialGradient>
        <linearGradient id="hv-copper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3a22" />
          <stop offset=".3" stopColor="#f1b48d" />
          <stop offset=".6" stopColor="#c07047" />
          <stop offset="1" stopColor="#4a2515" />
        </linearGradient>
        <linearGradient id="hv-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#1e90ff" />
        </linearGradient>
        <radialGradient id="hv-glow">
          <stop offset="0" stopColor="#38bdf8" stopOpacity=".55" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fondo: montantes lejanos */}
      <g opacity=".28">
        <rect x="540" y="-10" width="14" height="540" fill="url(#hv-chrome-v)" />
        <rect x="18" y="-10" width="10" height="540" fill="url(#hv-chrome-v)" />
      </g>

      {/* Cobre bajo la principal */}
      <rect x="-20" y="262" width="420" height="12" fill="url(#hv-copper)" />
      <rect x="-20" y="290" width="470" height="12" fill="url(#hv-copper)" />

      {/* Tubería principal + codo + bajada */}
      <rect x="-20" y="193" width="450" height="34" fill="url(#hv-chrome-h)" />
      <path d="M430 193 A57 57 0 0 1 487 250 L453 250 A23 23 0 0 0 430 227 Z" fill="url(#hv-elbow)" />
      <rect x="453" y="250" width="34" height="290" fill="url(#hv-chrome-v)" />
      {[40, 200, 330].map((x) => (
        <rect key={x} x={x} y="188" width="14" height="44" rx="2" fill="url(#hv-chrome-h)" />
      ))}
      <rect x="448" y="330" width="44" height="14" rx="2" fill="url(#hv-chrome-v)" />

      {/* Manómetro */}
      <rect x="112" y="150" width="10" height="44" fill="url(#hv-chrome-v)" />
      <circle cx="117" cy="130" r="30" fill="url(#hv-chrome-h)" />
      <circle cx="117" cy="130" r="24" fill="#0b1424" />
      <path d="M100 145 A22 22 0 1 1 134 145" fill="none" stroke="#38bdf8" strokeOpacity=".4" strokeWidth="3" />
      <path d="M117 130 L128 118" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />

      {/* Válvula */}
      <rect x="248" y="156" width="8" height="40" fill="url(#hv-chrome-v)" />
      <ellipse cx="252" cy="210" rx="26" ry="24" fill="url(#hv-chrome-h)" />
      <ellipse cx="252" cy="152" rx="36" ry="10" fill="none" stroke="#d08257" strokeWidth="6" />
      <path d="M216 152h72M252 142v20" stroke="#d08257" strokeWidth="4" />

      {/* Fuga: niebla + gotas */}
      <circle cx="392" cy="186" r="60" fill="url(#hv-glow)" />
      {drops.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#7dd3fc" fillOpacity={0.55 + (i % 3) * 0.15} />
      ))}

      {/* Anillo escáner */}
      <ellipse cx="392" cy="210" rx="13" ry="40" fill="none" stroke="#38bdf8" strokeWidth="3" />
      <ellipse cx="392" cy="210" rx="22" ry="56" fill="none" stroke="#38bdf8" strokeOpacity=".35" strokeWidth="1.5" />
      <rect x="382" y="193" width="20" height="34" fill="#38bdf8" fillOpacity=".25" />

      {/* Pin */}
      <circle cx="392" cy="120" r="46" fill="url(#hv-glow)" />
      <path d="M392 188c-4-14-26-38-26-58a26 26 0 0 1 52 0c0 20-22 44-26 58Z" fill="url(#hv-pin)" />
      <circle cx="392" cy="128" r="9" fill="#fff" />

    </svg>
  );
}
