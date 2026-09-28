"use client";

import { useRef } from "react";
import { workProcess } from "@/config/site";
import { useExperience } from "@/components/providers/Providers";
import { CallButton } from "@/components/ui/CtaButtons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useGsapEffect } from "@/lib/use-gsap";

/**
 * Proceso en 4 pasos como una tubería que se llena de agua con el scroll.
 * Parte del "presupuesto de espectáculo". Scrub → lineal (el scroll es el reloj).
 * Solo transform (translateY del agua) y color en los nodos (200 ms ease).
 * Movimiento reducido: tubería llena y todos los pasos activos, sin movimiento.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useExperience();

  useGsapEffect(
    ({ gsap }) => {
      const track = root.current?.querySelector<HTMLElement>("[data-track]");
      const water = root.current?.querySelector<HTMLElement>("[data-water]");
      const steps = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-step]") ?? []);
      if (!track || !water) return;

      if (reducedMotion) {
        gsap.set(water, { y: 0, yPercent: 0 });
        steps.forEach((s) => s.setAttribute("data-active", ""));
        return;
      }

      // Umbral de cada paso = posición de su nodo dentro de la tubería
      let thresholds: number[] = [];
      const measure = () => {
        const top = track.getBoundingClientRect().top;
        const h = track.offsetHeight || 1;
        thresholds = steps.map((s) => {
          const node = s.querySelector<HTMLElement>("[data-node]") ?? s;
          const r = node.getBoundingClientRect();
          return (r.top + r.height / 2 - top) / h;
        });
      };

      gsap.fromTo(
        water,
        { y: 0, yPercent: -100 }, // y: 0 anula el translateY(-100%) inicial del CSS (GSAP lo leería en px)
        {
          y: 0,
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "top 72%",
            end: "bottom 58%",
            scrub: true,
            onRefresh: measure,
            onUpdate: (self) => steps.forEach((s, i) => s.toggleAttribute("data-active", self.progress >= thresholds[i] - 0.01)),
          },
        },
      );
    },
    [reducedMotion],
    root,
  );

  return (
    <section ref={root} id="proceso" data-stop className="relative py-24 md:py-32" aria-labelledby="proceso-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading id="proceso-title" eyebrow="Proceso" title={workProcess.title} intro={workProcess.intro} />
          <div data-reveal className="mt-8">
            <CallButton showNumber />
          </div>
        </div>

        <div data-track className="relative">
          {/* Tubería: carcasa cromada + canal + agua */}
          <div aria-hidden className="absolute top-2 bottom-2 left-[19px] w-[22px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#1b2536,#8e9bb0_22%,#eef2f7_42%,#56657b_75%,#1b2536)] p-[5px]">
            <div className="relative size-full overflow-hidden rounded-full bg-[#050c18]">
              <div data-water className="absolute inset-0 bg-[linear-gradient(180deg,#1e90ff,#38bdf8_85%,#bae6fd)] will-change-transform">
                <span className="absolute inset-x-0 bottom-0 h-3 bg-white/70 blur-[3px]" />
              </div>
            </div>
          </div>

          <ol className="relative space-y-10 sm:space-y-14">
            {workProcess.steps.map((step, i) => (
              <li key={step.title} data-step className="group/step relative grid grid-cols-[40px_1fr] gap-5 sm:gap-7">
                <span
                  data-node
                  className="relative z-10 flex size-10 items-center justify-center rounded-full border-2 border-line bg-night font-display text-sm font-semibold text-fog transition-[border-color,background-color,color] duration-200 ease-[ease] group-data-active/step:border-sky group-data-active/step:bg-[#0f2d52] group-data-active/step:text-white"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Entrada en el envoltorio; el color del borde (estado) en el panel: sin transiciones que se pisen */}
                <div data-reveal>
                  <div className="panel p-6 transition-[border-color] duration-200 ease-[ease] group-data-active/step:border-sky/35">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-white">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-mist">{step.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
