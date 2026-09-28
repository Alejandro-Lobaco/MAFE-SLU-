"use client";

import { useEffect, useRef } from "react";
import type { IconKey } from "@/config/site";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ServiceIconSvg } from "@/components/ui/ServiceIconSvg";
import { iconSlots, type IconSlot } from "@/lib/scene-store";

type Item = { icon: IconKey; title: string; text: string; bullets: string[]; featured?: boolean };

/**
 * Inclinación 3D sutil al pasar el ratón.
 * Frecuencia: decenas de veces por visita → casi imperceptible (máx. 6°).
 * Propósito: feedback / sensación de objeto físico. Seguimiento del ratón decorativo → muelle.
 * Solo con puntero fino y sin movimiento reducido. Transform completo (acelerado por GPU).
 * Motion (vanilla) se carga en diferido al primer paso del ratón: no pesa en la carga inicial.
 */
const SPRING = { duration: 0.5, bounce: 0.2 }; // muelle "Apple" de la skill `animate`
const MAX_TILT = 6;

export function ServiceCard({ item, index }: { item: Item; index: number }) {
  const card = useRef<HTMLElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);
  const entry = useRef<IconSlot | null>(null);
  const tilt = useRef<{ set: (x: number, y: number) => void } | null>(null);
  const loading = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => (enabled.current = fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    if (slot.current) {
      entry.current = { el: slot.current, icon: item.icon, pointer: { x: 0, y: 0, hover: false } };
      iconSlots.set(item.icon, entry.current);
    }
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
      iconSlots.delete(item.icon);
    };
  }, [item.icon]);

  // Muelles de Motion ligados al transform del propio elemento (no a una variable CSS del padre)
  const ensureTilt = () => {
    if (tilt.current || loading.current || !card.current) return;
    loading.current = true;
    const el = card.current;
    import("motion").then(({ springValue }) => {
      const rx = springValue<number>(0, SPRING);
      const ry = springValue<number>(0, SPRING);
      const render = () => {
        el.style.transform = `perspective(900px) rotateX(${rx.get().toFixed(3)}deg) rotateY(${ry.get().toFixed(3)}deg)`;
      };
      rx.on("change", render);
      ry.on("change", render);
      tilt.current = {
        set: (x, y) => {
          rx.set(x);
          ry.set(y);
        },
      };
    });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!enabled.current || e.pointerType !== "mouse" || !card.current) return;
    ensureTilt();
    const r = card.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tilt.current?.set(-py * MAX_TILT * 2, px * MAX_TILT * 2);
    if (entry.current) Object.assign(entry.current.pointer, { x: px * 2, y: py * 2, hover: true });
  };
  const onLeave = () => {
    tilt.current?.set(0, 0);
    if (entry.current) entry.current.pointer.hover = false;
  };

  // La entrada (data-reveal) va en un envoltorio: así su transición CSS no interfiere con el muelle
  return (
    <div data-reveal style={{ ["--i" as string]: index }} className={item.featured ? "md:col-span-2" : ""}>
    <article
      ref={card}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group panel relative flex h-full flex-col p-6 transition-[border-color] duration-150 ease-[ease] hover-fine:border-sky/40 sm:p-7 ${
        item.featured ? "lg:flex-row lg:items-center lg:gap-8" : ""
      }`}
    >
      <div
        ref={slot}
        className={`relative shrink-0 ${item.featured ? "size-28 lg:size-40" : "size-20"}`}
        data-icon-slot={item.icon}
      >
        <ServiceIconSvg icon={item.icon} className="icon-fallback size-full transition-opacity duration-300 ease-out" />
      </div>
      <div className={item.featured ? "mt-5 lg:mt-0" : "mt-5"}>
        {item.featured && <p className="eyebrow mb-2">Nuestra especialidad</p>}
        <h3 className={`font-display font-semibold tracking-tight text-white ${item.featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>{item.title}</h3>
        <p className="mt-2.5 leading-relaxed text-mist">{item.text}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {item.bullets.map((b) => (
            <li key={b} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-mist">
              {b}
            </li>
          ))}
        </ul>
        <a href="#presupuesto" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sky">
          Pedir presupuesto
          <ArrowRightIcon className="size-4 transition-transform duration-150 ease-[ease] group-hover-fine:translate-x-0.5" />
        </a>
      </div>
    </article>
    </div>
  );
}
