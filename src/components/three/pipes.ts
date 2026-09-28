import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Vec3 = [number, number, number];
export type PipeKind = "chrome" | "copper";

export type PipeSpec = {
  points: Vec3[];
  radius: number;
  kind: PipeKind;
  /** Radio de curvatura de los codos */
  bend?: number;
  /** Solo en la versión completa */
  highOnly?: boolean;
};

/* ────────────────────────────────────────────────────────────────────────────
 * Mundo: la tubería principal cruza el hero en horizontal (donde está la fuga)
 * y después baja en zigzag. La cámara la sigue al hacer scroll.
 * ──────────────────────────────────────────────────────────────────────────── */
export const MAIN_Y = 0.9;
export const MAIN_R = 0.2;
export const LEAK_X = 1.55;
/** Normal hacia fuera de la grieta (arriba y hacia la cámara) */
export const LEAK_NORMAL = new THREE.Vector3(0.18, 0.82, 0.55).normalize();
export const LEAK_POINT = new THREE.Vector3(LEAK_X, MAIN_Y, 0).addScaledVector(LEAK_NORMAL, MAIN_R);
/** Donde empieza el recorrido de la gota y el escáner */
export const RUN_START_X = -1.9;

export const MAIN_PIPE: PipeSpec = {
  kind: "chrome",
  radius: MAIN_R,
  bend: 0.7,
  points: [
    [-18, MAIN_Y, 0],
    [3.6, MAIN_Y, 0],
    [3.6, -9, 0],
    [-3.6, -9, 0],
    [-3.6, -19, 0],
    [3.6, -19, 0],
    [3.6, -29, 0],
    [-3.6, -29, 0],
    [-3.6, -39, 0],
    [3.6, -39, 0],
    [3.6, -49, 0],
    [-18, -49, 0],
  ],
};

export const SECONDARY_PIPES: PipeSpec[] = [
  // Par de cobre bajo la principal, en el hero
  { kind: "copper", radius: 0.085, bend: 0.4, points: [[-18, -0.35, -1.6], [2.2, -0.35, -1.6], [2.2, -0.35, -5], [2.2, 6, -5]] },
  { kind: "copper", radius: 0.085, bend: 0.4, points: [[-18, -0.7, -1.9], [2.8, -0.7, -1.9], [2.8, -12, -1.9], [8, -12, -1.9]], highOnly: true },
  // Montantes verticales al fondo
  { kind: "chrome", radius: 0.16, bend: 0.5, points: [[6.6, 8, -4.5], [6.6, -52, -4.5]] },
  { kind: "copper", radius: 0.11, bend: 0.5, points: [[-6.2, 8, -3.2], [-6.2, -52, -3.2]] },
  { kind: "chrome", radius: 0.12, bend: 0.5, points: [[-9.5, 4, -7], [-9.5, -52, -7]], highOnly: true },
  // Derivaciones hacia los montantes
  { kind: "chrome", radius: 0.12, bend: 0.45, points: [[3.6, -5.5, 0], [5.2, -5.5, 0], [5.2, -5.5, -4.5], [6.6, -5.5, -4.5]] },
  { kind: "copper", radius: 0.09, bend: 0.4, points: [[-6.2, -14.5, -3.2], [-4.6, -14.5, -3.2], [-4.6, -14.5, 0], [-3.6, -14.5, 0]] },
  { kind: "chrome", radius: 0.12, bend: 0.45, points: [[3.6, -25.5, 0], [5.2, -25.5, 0], [5.2, -25.5, -4.5], [6.6, -25.5, -4.5]] },
  { kind: "copper", radius: 0.09, bend: 0.4, points: [[-6.2, -34.5, -3.2], [-4.6, -34.5, -3.2], [-4.6, -34.5, 0], [-3.6, -34.5, 0]] },
  { kind: "chrome", radius: 0.12, bend: 0.45, points: [[3.6, -44.5, 0], [5.2, -44.5, 0], [5.2, -44.5, -4.5], [6.6, -44.5, -4.5]], highOnly: true },
  // Tuberías cercanas a cámara: dan paralaje al bajar
  { kind: "copper", radius: 0.07, bend: 0.3, points: [[-14, -13.6, 3.2], [14, -13.6, 3.2]] },
  { kind: "chrome", radius: 0.09, bend: 0.3, points: [[-14, -33.8, 2.6], [14, -33.8, 2.6]] },
  { kind: "copper", radius: 0.07, bend: 0.3, points: [[-14, -23.4, -8], [14, -23.4, -8]], highOnly: true },
];

/** Válvulas de volante: posición + eje del volante */
export const VALVES: { pos: Vec3; axis: Vec3; scale?: number }[] = [
  { pos: [-3.2, MAIN_Y, 0], axis: [0, 1, 0] },
  { pos: [3.6, -3, 0], axis: [0, 0, 1] },
  { pos: [-3.6, -23.5, 0], axis: [0, 0, 1] },
  { pos: [3.6, -43, 0], axis: [0, 0, 1] },
];

/** Manómetros: montados sobre un pequeño ramal */
export const GAUGES: { base: Vec3; dir: Vec3 }[] = [
  { base: [-6.6, MAIN_Y, 0], dir: [0, 1, 0] },
  { base: [-3.6, -13, 0], dir: [1, 0, 0] },
  { base: [3.6, -33, 0], dir: [-1, 0, 0] },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Construcción de geometría
 * ──────────────────────────────────────────────────────────────────────────── */
const v = (p: Vec3) => new THREE.Vector3(p[0], p[1], p[2]);

/** Polilínea ortogonal → tramos rectos + codos (curvas cuadráticas) */
export function buildPipePath(points: Vec3[], bend = 0.5) {
  const pts = points.map(v);
  const path = new THREE.CurvePath<THREE.Vector3>();
  let prev = pts[0].clone();
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const dirIn = b.clone().sub(a).normalize();
    const dirOut = c.clone().sub(b).normalize();
    const r = Math.min(bend, b.distanceTo(a) / 2, c.distanceTo(b) / 2);
    const p1 = b.clone().addScaledVector(dirIn, -r);
    const p2 = b.clone().addScaledVector(dirOut, r);
    path.add(new THREE.LineCurve3(prev, p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2));
    prev = p2;
  }
  path.add(new THREE.LineCurve3(prev, pts[pts.length - 1].clone()));
  return path;
}

export type Coupling = { position: THREE.Vector3; tangent: THREE.Vector3; radius: number };

/** Tubo + posiciones de manguitos (en uniones y cada ~3 unidades en tramos largos) */
export function buildPipeGeometry(spec: PipeSpec, quality: "high" | "low") {
  const path = buildPipePath(spec.points, spec.bend);
  const radial = quality === "high" ? 22 : 12;
  const bendSegs = quality === "high" ? 12 : 6;
  const parts: THREE.BufferGeometry[] = [];
  const couplings: Coupling[] = [];

  for (const curve of path.curves) {
    const isLine = curve instanceof THREE.LineCurve3;
    parts.push(new THREE.TubeGeometry(curve, isLine ? 1 : bendSegs, spec.radius, radial, false));
    if (isLine) {
      const line = curve as THREE.LineCurve3;
      const len = line.v1.distanceTo(line.v2);
      const tangent = line.v2.clone().sub(line.v1).normalize();
      const n = Math.max(1, Math.floor(len / 3));
      for (let k = 0; k <= n; k++) {
        couplings.push({ position: line.v1.clone().lerp(line.v2, k / n), tangent, radius: spec.radius });
      }
    }
  }

  const geometry = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return { geometry, couplings, path };
}
