"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ratings, reviews } from "@/config/site";
import { ArrowLeftIcon, ArrowRightIcon, ExternalIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";

/**
 * Carrusel con scroll-snap nativo (la física del navegador supera a un muelle hecho a mano).
 * Botones: desplazamiento suave nativo; con movimiento reducido, salto directo.
 */
export function Reviews() {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>("[role=group]");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="opiniones" data-stop className="relative py-24 md:py-32 cv-auto" aria-labelledby="opiniones-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="opiniones-title" eyebrow="Opiniones" title={reviews.title} intro={reviews.intro} />
          <div data-reveal className="flex flex-wrap items-center gap-3">
            <a
              href={ratings.google.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel inline-flex items-center gap-3 !rounded-2xl px-4 py-3 transition-colors duration-150 ease-[ease] hover-fine:border-white/25"
            >
              <span className="font-display text-3xl font-semibold text-white">{ratings.google.value.toString().replace(".", ",")}</span>
              <span className="text-sm leading-tight text-fog">
                <Stars value={ratings.google.value} />
                <span className="mt-1 flex items-center gap-1">
                  Google <ExternalIcon className="size-3.5" />
                </span>
              </span>
            </a>
            <a
              href={ratings.trustlocal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="panel inline-flex items-center gap-3 !rounded-2xl px-4 py-3 transition-colors duration-150 ease-[ease] hover-fine:border-white/25"
            >
              <span className="font-display text-3xl font-semibold text-white">{ratings.trustlocal.value.toString().replace(".", ",")}</span>
              <span className="text-sm leading-tight text-fog">
                Trustlocal
                <span className="mt-1 block text-xs">{ratings.trustlocal.label}</span>
              </span>
            </a>
          </div>
        </div>

        <div className="relative mt-10" role="region" aria-roledescription="carrusel" aria-label="Opiniones de clientes">
          <div ref={track} className="snap-track -mx-4 flex scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6" data-lenis-prevent-horizontal>
            {reviews.items.map((r, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="opinión"
                aria-label={`${i + 1} de ${reviews.items.length}`}
                className="panel flex w-[85%] shrink-0 flex-col p-6 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  {r.placeholder && (
                    <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-amber-200">
                      Reseña de ejemplo
                    </span>
                  )}
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-white/90">“{r.text}”</blockquote>
                <p className="mt-5 text-sm">
                  <span className="font-semibold text-white">{r.author}</span>
                  <span className="text-fog"> · {r.place}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" className="btn btn-ghost size-12 p-0 disabled:opacity-40" onClick={() => go(-1)} disabled={edges.start} aria-label="Opinión anterior">
              <ArrowLeftIcon className="size-5" />
            </button>
            <button type="button" className="btn btn-ghost size-12 p-0 disabled:opacity-40" onClick={() => go(1)} disabled={edges.end} aria-label="Opinión siguiente">
              <ArrowRightIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
