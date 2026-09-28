"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Tier } from "@/lib/device-tier";
import { sceneState } from "@/lib/scene-store";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildPipeGeometry, GAUGES, MAIN_PIPE, SECONDARY_PIPES, VALVES, type Coupling, type PipeKind } from "./pipes";

/* Materiales: cromo pulido y cobre. Sin mapas: todo el brillo sale del entorno (Lightformers). */
export function usePipeMaterials() {
  return useMemo(
    () => ({
      chrome: new THREE.MeshStandardMaterial({ color: "#e3e9f0", metalness: 1, roughness: 0.13, envMapIntensity: 1.15 }),
      copper: new THREE.MeshStandardMaterial({ color: "#d08257", metalness: 1, roughness: 0.28, envMapIntensity: 1 }),
      dark: new THREE.MeshStandardMaterial({ color: "#1b2536", metalness: 0.7, roughness: 0.35 }),
    }),
    [],
  );
}

type Mats = ReturnType<typeof usePipeMaterials>;

/** Manguitos como InstancedMesh: una sola llamada de dibujo por material. */
function Couplings({ items, material, quality }: { items: Coupling[]; material: THREE.Material; quality: "high" | "low" }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, quality === "high" ? 22 : 12), [quality]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    items.forEach((c, i) => {
      q.setFromUnitVectors(up, c.tangent);
      m.compose(c.position, q, new THREE.Vector3(c.radius * 1.24, c.radius * 0.9, c.radius * 1.24));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />;
}

function Valve({ pos, axis, mats }: { pos: [number, number, number]; axis: [number, number, number]; mats: Mats }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...axis)), [axis]);
  return (
    <group position={pos} quaternion={q}>
      {/* cuerpo */}
      <mesh material={mats.chrome} scale={[0.34, 0.3, 0.34]}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {/* vástago */}
      <mesh material={mats.chrome} position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
      </mesh>
      {/* volante de cobre */}
      <group position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={mats.copper}>
          <torusGeometry args={[0.36, 0.045, 12, 40]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={mats.copper} rotation={[0, 0, (i * Math.PI) / 3]}>
            <boxGeometry args={[0.72, 0.035, 0.035]} />
          </mesh>
        ))}
        <mesh material={mats.chrome} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        </mesh>
      </group>
    </group>
  );
}

/** Esfera del manómetro dibujada una vez en un canvas 2D */
function useGaugeTexture() {
  return useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0b1424";
    g.fillRect(0, 0, size, size);
    g.translate(size / 2, size / 2);
    g.strokeStyle = "#38bdf8";
    g.lineWidth = 10;
    g.beginPath();
    g.arc(0, 0, 96, Math.PI * 0.75, Math.PI * 2.25);
    g.globalAlpha = 0.35;
    g.stroke();
    g.globalAlpha = 1;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
      g.strokeStyle = i > 7 ? "#7dd3fc" : "#cbd5e1";
      g.lineWidth = i % 5 === 0 ? 6 : 3;
      g.beginPath();
      g.moveTo(Math.cos(a) * 78, Math.sin(a) * 78);
      g.lineTo(Math.cos(a) * (i % 5 === 0 ? 58 : 66), Math.sin(a) * (i % 5 === 0 ? 58 : 66));
      g.stroke();
    }
    g.fillStyle = "#94a3b8";
    g.font = "600 26px sans-serif";
    g.textAlign = "center";
    g.fillText("bar", 0, 62);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

function Gauge({ base, dir, mats, face, reactive }: { base: [number, number, number]; dir: [number, number, number]; mats: Mats; face: THREE.Texture; reactive: boolean }) {
  const needle = useRef<THREE.Group>(null);
  const d = new THREE.Vector3(...dir);
  const top = new THREE.Vector3(...base).addScaledVector(d, 0.62);
  const stemQ = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir)), [dir]);
  const faceMat = useMemo(() => new THREE.MeshStandardMaterial({ map: face, roughness: 0.55, metalness: 0 }), [face]);

  // En el hero, la aguja cae al crecer la fuga: «¿Baja la presión?»
  useFrame(() => {
    if (!needle.current) return;
    const drop = reactive ? sceneState.hero.leak : 0;
    needle.current.rotation.z = THREE.MathUtils.lerp(-0.55, 0.95, drop);
  });

  return (
    <group>
      <mesh material={mats.chrome} position={new THREE.Vector3(...base).addScaledVector(d, 0.3)} quaternion={stemQ}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
      </mesh>
      <group position={top}>
        <mesh material={mats.chrome} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.14, 32]} />
        </mesh>
        <mesh material={faceMat} position={[0, 0, 0.072]}>
          <circleGeometry args={[0.31, 40]} />
        </mesh>
        <group ref={needle} position={[0, 0, 0.08]}>
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[0.018, 0.24, 0.01]} />
            <meshBasicMaterial color="#7dd3fc" toneMapped={false} />
          </mesh>
        </group>
        <mesh material={mats.chrome} position={[0, 0, 0.09]}>
          <sphereGeometry args={[0.03, 12, 8]} />
        </mesh>
      </group>
    </group>
  );
}

export function PipeNetwork({ tier }: { tier: Tier }) {
  const quality = tier === "high" ? "high" : "low";
  const mats = usePipeMaterials();
  const face = useGaugeTexture();

  // Todas las tuberías de un mismo material en una sola geometría → 2 llamadas de dibujo
  const built = useMemo(() => {
    const pipes = [MAIN_PIPE, ...SECONDARY_PIPES.filter((p) => quality === "high" || !p.highOnly)];
    const out = {} as Record<PipeKind, { geometry: THREE.BufferGeometry; couplings: Coupling[] }>;
    for (const kind of ["chrome", "copper"] as const) {
      const parts = pipes.filter((p) => p.kind === kind).map((p) => buildPipeGeometry(p, quality));
      out[kind] = {
        geometry: mergeGeometries(parts.map((p) => p.geometry), false)!,
        couplings: parts.flatMap((p) => p.couplings),
      };
      parts.forEach((p) => p.geometry.dispose());
    }
    return out;
  }, [quality]);

  useEffect(
    () => () => {
      built.chrome.geometry.dispose();
      built.copper.geometry.dispose();
    },
    [built],
  );

  return (
    <group>
      <mesh geometry={built.chrome.geometry} material={mats.chrome} />
      <mesh geometry={built.copper.geometry} material={mats.copper} />
      <Couplings items={built.chrome.couplings} material={mats.chrome} quality={quality} />
      <Couplings items={built.copper.couplings} material={mats.copper} quality={quality} />
      {VALVES.map((v, i) => (
        <Valve key={i} pos={v.pos} axis={v.axis} mats={mats} />
      ))}
      {GAUGES.map((g, i) => (
        <Gauge key={i} base={g.base} dir={g.dir} mats={mats} face={face} reactive={i === 0} />
      ))}
    </group>
  );
}
