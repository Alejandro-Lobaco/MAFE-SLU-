"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/use-gsap";

type Props = { value: number; decimals?: number; prefix?: string; suffix?: string };

const format = (n: number, decimals: number) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

/**
 * Contador que sube al entrar en pantalla.
 * Frecuencia: una vez por visita → se permite algo de "deleite".
 * 1,2 s (tramo marketing), ease-out fuerte. Con movimiento reducido: valor final directo.
 * El HTML del servidor ya trae el valor final (SEO y sin JS).
 */
export function Counter({ value, decimals = 0, prefix = "", suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const render = (n: number) => (el.textContent = `${prefix}${format(n, decimals)}${suffix}`);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // ya visible: no reiniciar a 0
    render(0);
    let tween: { kill: () => void } | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        loadGsap().then(({ gsap, EASE_OUT }) => {
          if (cancelled) return;
          const o = { v: 0 };
          tween = gsap.to(o, { v: value, duration: 1.2, ease: EASE_OUT, onUpdate: () => render(o.v) });
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      tween?.kill();
      render(value);
    };
  }, [value, decimals, prefix, suffix]);

  return (
    <>
      <span ref={ref} aria-hidden className="tabular-nums">
        {`${prefix}${format(value, decimals)}${suffix}`}
      </span>
      <span className="sr-only">{`${prefix}${format(value, decimals)}${suffix}`}</span>
    </>
  );
}
