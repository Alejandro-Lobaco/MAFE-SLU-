/**
 * Estado compartido entre el DOM (GSAP/ScrollTrigger) y la escena 3D (carga diferida).
 * Objetos mutables a propósito: se leen en cada fotograma sin provocar renders de React.
 */
export const sceneState = {
  /** Secuencia del hero (la escribe el timeline de GSAP ligado al scroll). 0 → 1 */
  hero: { leak: 0, scan: 0, lock: 0, pin: 0, dolly: 0 },
  /** Recorrido de la cámara por el resto de la página. 0 → 1 */
  journey: { target: 0 },
  /** Puntero normalizado (-1..1) para el parallax sutil (solo puntero fino) */
  pointer: { x: 0, y: 0 },
  /** ¿Debe renderizar? false cuando el canvas está oculto (formulario, mapa, pie) */
  active: true,
  /** ¿El hero está en pantalla? (animación continua de gota y partículas) */
  heroVisible: true,
  /** Marca de tiempo del último scroll, para renderizar solo mientras haya movimiento */
  lastScroll: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();

/** Aviso ligero para cambios que sí interesan a React (p. ej. el HUD del escáner). */
export const sceneEvents = {
  emit() {
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Registro de huecos para los iconos 3D de «Servicios» (los pinta un canvas diferido). */
export type IconSlot = {
  el: HTMLElement;
  icon: string;
  pointer: { x: number; y: number; hover: boolean };
};
export const iconSlots = new Map<string, IconSlot>();

/** Aviso cuando cambian los huecos (una tarjeta se monta de nuevo con otro nodo). */
const slotListeners = new Set<Listener>();
let slotsVersion = 0;
export const iconSlotEvents = {
  set(key: string, slot: IconSlot) {
    iconSlots.set(key, slot);
    slotsVersion++;
    slotListeners.forEach((l) => l());
  },
  delete(key: string, slot: IconSlot) {
    if (iconSlots.get(key) !== slot) return;
    iconSlots.delete(key);
    slotsVersion++;
    slotListeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    slotListeners.add(l);
    return () => {
      slotListeners.delete(l);
    };
  },
  version: () => slotsVersion,
};
