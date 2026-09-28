import { sceneState } from "@/lib/scene-store";

/**
 * Valores del hero suavizados en cada fotograma. El timeline de GSAP escribe los
 * valores "crudos" ligados al scroll; aquí se amortiguan para que la escena
 * nunca salte aunque el scroll sea brusco.
 */
export const smoothHero = { leak: 0, scan: 0, lock: 0, pin: 0, dolly: 0 };

/** Amortiguación exponencial independiente del framerate */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export function stepSmoothHero(dt: number, instant: boolean) {
  const h = sceneState.hero;
  const k = (a: number, b: number) => (instant ? b : damp(a, b, 7, dt));
  smoothHero.leak = k(smoothHero.leak, h.leak);
  smoothHero.scan = k(smoothHero.scan, h.scan);
  smoothHero.lock = k(smoothHero.lock, h.lock);
  smoothHero.pin = k(smoothHero.pin, h.pin);
  smoothHero.dolly = k(smoothHero.dolly, h.dolly);
}
