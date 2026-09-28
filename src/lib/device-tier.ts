/**
 * Decide qué versión del 3D recibe cada equipo.
 *  - "high":   escena completa (refracción real, iconos 3D en servicios, parallax con el ratón)
 *  - "low":    escena simplificada (móvil / GPU modesta): menos geometría y partículas, dpr 1
 *  - "static": movimiento reducido → se pinta UN fotograma final, sin movimiento
 *  - "none":   sin WebGL, renderizado por software o ahorro de datos → ilustración SVG
 *
 * Se puede forzar con ?tier=high|low|static|none (útil para demos y pruebas).
 */
export type Tier = "high" | "low" | "static" | "none";

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
const MODEST_GPU =
  /intel.*(hd|uhd) graphics ?[0-9]{3}\b|intel.*gma|mali-[4t][0-9]{2}|mali-g(3|5)[0-9]\b|adreno.*\b[2-5][0-9]{2}\b|powervr|videocore/i;

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function readRenderer(): { ok: boolean; renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, renderer: "" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, renderer };
  } catch {
    return { ok: false, renderer: "" };
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function canHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function detectTier(): Tier {
  if (typeof window === "undefined") return "none";

  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "high" || forced === "low" || forced === "static" || forced === "none") return forced;

  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return "none";

  const { ok, renderer } = readRenderer();
  if (!ok || SOFTWARE_RENDERER.test(renderer)) return "none";

  if (prefersReducedMotion()) return "static";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 820;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;

  if ((coarse && smallScreen) || fewCores || lowMemory || MODEST_GPU.test(renderer)) return "low";
  return "high";
}
