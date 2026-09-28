import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, CustomEase);
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Curvas de la skill `animate`, las mismas que en globals.css (--ease-out, --ease-in-out).
 * Para lo ligado al scroll (scrub) se usa "none": el scroll ya es el reloj.
 */
export const EASE_OUT = CustomEase.create("mafe-out", "0.23,1,0.32,1");
export const EASE_IN_OUT = CustomEase.create("mafe-in-out", "0.77,0,0.175,1");

export { gsap, ScrollTrigger };
