"use client";

import { useEffect, type DependencyList, type RefObject } from "react";

export type GsapKit = typeof import("./gsap");
type Ctx = ReturnType<GsapKit["gsap"]["context"]>;

let kit: Promise<GsapKit> | null = null;

/** GSAP + ScrollTrigger se cargan después de hidratar: fuera del JS crítico de la primera pintura. */
export const loadGsap = () => (kit ??= import("./gsap"));

/** Como useGSAP, pero con carga diferida. Todo lo creado dentro se revierte al desmontar. */
export function useGsapEffect(setup: (kit: GsapKit) => void | (() => void), deps: DependencyList, scope?: RefObject<Element | null>) {
  useEffect(() => {
    let cancelled = false;
    let ctx: Ctx | undefined;
    let cleanup: void | (() => void);
    loadGsap().then((k) => {
      if (cancelled) return;
      ctx = k.gsap.context(() => {
        cleanup = setup(k);
      }, scope?.current ?? undefined);
    });
    return () => {
      cancelled = true;
      cleanup?.();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
