"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import type { IconKey } from "@/config/site";
import { iconSlotEvents, iconSlots, type IconSlot } from "@/lib/scene-store";
import { damp } from "./smooth";

/**
 * Iconos 3D low-poly de «Servicios». UN solo canvas fijo para los seis iconos
 * (drei <View> recorta con scissor cada hueco). Solo pinta con la sección en pantalla.
 */
export default function ServiceIcons3D({ active, onReady }: { active: boolean; onReady: () => void }) {
  // Se recalcula si una tarjeta se vuelve a montar con otro nodo (los huecos siguen al DOM real)
  const version = useSyncExternalStore(iconSlotEvents.subscribe, iconSlotEvents.version, iconSlotEvents.version);
  const slots = useMemo(() => (version >= 0 ? Array.from(iconSlots.values()) : []), [version]);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 40, visibility: active ? "visible" : "hidden" }}
      aria-hidden
    >
      <Clearer onReady={onReady} />
      {slots.map((slot, i) => (
        <View key={`${slot.icon}-${version}`} track={{ current: slot.el }} index={i + 2}>
          <PerspectiveCamera makeDefault position={[0, 0, 3.9]} fov={30} />
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#dbeafe", "#0a1628", 0.6]} />
          <directionalLight position={[2.5, 3.5, 4]} intensity={2.4} />
          <directionalLight position={[-3, -1, 2]} intensity={1.1} color="#38bdf8" />
          <IconModel slot={slot} />
        </View>
      ))}
    </Canvas>
  );
}

/** Limpia el lienzo completo antes de pintar las vistas (el canvas es fijo y el contenido se desplaza). */
function Clearer({ onReady }: { onReady: () => void }) {
  const ready = useRef(false);
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true);
    if (!ready.current) {
      ready.current = true;
      requestAnimationFrame(onReady);
    }
  }, 1);
  return null;
}

const BASE = { x: -0.32, y: 0.62 };

/** Gira hacia el ratón mientras se pasa por la tarjeta; en reposo, vista 3/4 quieta. */
function IconModel({ slot }: { slot: IconSlot }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = slot.pointer;
    g.rotation.y = damp(g.rotation.y, BASE.y + (p.hover ? p.x * 0.55 : 0), 6, dt);
    g.rotation.x = damp(g.rotation.x, BASE.x + (p.hover ? p.y * 0.35 : 0), 6, dt);
  });
  return (
    <group ref={group} rotation={[BASE.x, BASE.y, 0]}>
      <Model icon={slot.icon as IconKey} />
    </group>
  );
}

/* ── Materiales facetados ──────────────────────────────────────────────────── */
function useMats() {
  return useMemo(
    () => ({
      chrome: new THREE.MeshStandardMaterial({ color: "#dfe6ef", metalness: 0.45, roughness: 0.32, flatShading: true }),
      steel: new THREE.MeshStandardMaterial({ color: "#8fa0b6", metalness: 0.5, roughness: 0.4, flatShading: true }),
      white: new THREE.MeshStandardMaterial({ color: "#f1f5f9", metalness: 0.05, roughness: 0.45, flatShading: true }),
      copper: new THREE.MeshStandardMaterial({ color: "#d08257", metalness: 0.5, roughness: 0.4, flatShading: true }),
      water: new THREE.MeshStandardMaterial({ color: "#38bdf8", emissive: "#0b3b66", emissiveIntensity: 0.6, metalness: 0.1, roughness: 0.15, flatShading: true }),
      dark: new THREE.MeshStandardMaterial({ color: "#0b1424", metalness: 0.2, roughness: 0.6, flatShading: true }),
      glow: new THREE.MeshBasicMaterial({ color: "#7dd3fc", toneMapped: false }),
    }),
    [],
  );
}

function Model({ icon }: { icon: IconKey }) {
  const mats = useMats();
  const models: Record<IconKey, () => ReactNode> = {
    drop: () => <Drop mats={mats} />,
    wrench: () => <Wrench mats={mats} />,
    radiator: () => <Radiator mats={mats} />,
    boiler: () => <Boiler mats={mats} />,
    toilet: () => <Toilet mats={mats} />,
    pool: () => <Pool mats={mats} />,
  };
  return <>{models[icon]()}</>;
}

type M = { mats: ReturnType<typeof useMats> };

function Drop({ mats }: M) {
  const geo = useMemo(() => {
    const pts = [
      [0, -0.78], [0.36, -0.66], [0.56, -0.36], [0.58, -0.05], [0.46, 0.25], [0.26, 0.55], [0.08, 0.8], [0, 0.88],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 8);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group scale={1.05}>
      <mesh geometry={geo} material={mats.water} />
      <mesh position={[-0.2, 0.15, 0.42]} material={mats.glow} scale={[0.06, 0.12, 0.04]}>
        <icosahedronGeometry args={[1, 0]} />
      </mesh>
    </group>
  );
}

function Wrench({ mats }: M) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    // Mango + cabeza de boca abierta (contorno low-poly)
    s.moveTo(-0.11, -0.95);
    s.lineTo(0.11, -0.95);
    s.lineTo(0.13, 0.28);
    s.lineTo(0.36, 0.44);
    s.lineTo(0.38, 0.78);
    s.lineTo(0.16, 0.9);
    s.lineTo(0.12, 0.62);
    s.lineTo(-0.12, 0.62);
    s.lineTo(-0.16, 0.9);
    s.lineTo(-0.38, 0.78);
    s.lineTo(-0.36, 0.44);
    s.lineTo(-0.13, 0.28);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
    g.center();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group rotation={[0, 0, -Math.PI / 4]} scale={1.05}>
      <mesh geometry={geo} material={mats.chrome} />
      <mesh position={[0, -0.35, 0.1]} material={mats.water}>
        <boxGeometry args={[0.24, 0.1, 0.02]} />
      </mesh>
    </group>
  );
}

function Radiator({ mats }: M) {
  const fins = [-0.6, -0.3, 0, 0.3, 0.6];
  return (
    <group scale={0.95}>
      {fins.map((x) => (
        <mesh key={x} position={[x, 0, 0]} material={mats.white}>
          <boxGeometry args={[0.2, 1.15, 0.34]} />
        </mesh>
      ))}
      {[0.48, -0.48].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.chrome}>
          <cylinderGeometry args={[0.07, 0.07, 1.6, 6]} />
        </mesh>
      ))}
      <mesh position={[0.9, -0.48, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.copper}>
        <cylinderGeometry args={[0.1, 0.1, 0.22, 6]} />
      </mesh>
      <mesh position={[0.9, -0.36, 0]} material={mats.copper}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
      </mesh>
      {[-0.35, 0, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.82, 0]} material={mats.water} scale={[0.05, 0.12, 0.05]}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

function Boiler({ mats }: M) {
  return (
    <group scale={0.95}>
      <mesh material={mats.white}>
        <boxGeometry args={[1.05, 1.3, 0.6]} />
      </mesh>
      <mesh position={[0, 0.22, 0.305]} material={mats.dark}>
        <boxGeometry args={[0.62, 0.3, 0.02]} />
      </mesh>
      <mesh position={[-0.1, 0.22, 0.318]} material={mats.glow}>
        <boxGeometry args={[0.28, 0.05, 0.01]} />
      </mesh>
      <mesh position={[0.2, 0.22, 0.318]} material={mats.glow}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
      </mesh>
      <mesh position={[0, -0.22, 0.31]} rotation={[Math.PI / 2, 0, 0]} material={mats.water}>
        <coneGeometry args={[0.1, 0.02, 5]} />
      </mesh>
      {[
        [-0.3, mats.copper],
        [0, mats.copper],
        [0.3, mats.chrome],
      ].map(([x, mat], i) => (
        <mesh key={i} position={[x as number, -0.85, 0]} material={mat as THREE.Material}>
          <cylinderGeometry args={[0.055, 0.055, 0.42, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function Toilet({ mats }: M) {
  const bowl = useMemo(() => {
    const pts = [
      [0.2, -0.6], [0.26, -0.45], [0.3, -0.3], [0.46, -0.12], [0.52, 0.05], [0.5, 0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 8);
  }, []);
  useEffect(() => () => bowl.dispose(), [bowl]);
  return (
    <group scale={0.95} position={[0, 0.05, 0]}>
      <mesh position={[0, 0.5, -0.32]} material={mats.white}>
        <boxGeometry args={[0.85, 0.62, 0.26]} />
      </mesh>
      <mesh position={[0.22, 0.84, -0.32]} material={mats.chrome}>
        <boxGeometry args={[0.16, 0.04, 0.08]} />
      </mesh>
      <group position={[0, 0, 0.08]} scale={[1, 1, 1.15]}>
        <mesh geometry={bowl} material={mats.white} />
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.white}>
          <torusGeometry args={[0.45, 0.06, 5, 8]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.water}>
          <circleGeometry args={[0.36, 8]} />
        </mesh>
      </group>
    </group>
  );
}

function Pool({ mats }: M) {
  const water = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.44, 0.94, 5, 4);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, (Math.sin(i * 12.9898) * 43758.5453) % 1 * 0.035);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => water.dispose(), [water]);
  return (
    <group scale={0.9} rotation={[1, 0, 0]}>
      {/* vaso (inclinado hacia la cámara para ver la lámina de agua) */}
      <mesh position={[0, -0.25, 0]} material={mats.steel}>
        <boxGeometry args={[1.7, 0.36, 1.2]} />
      </mesh>
      {/* coronación */}
      {[
        [0, 0, 0.56, 1.7, 0.08],
        [0, 0, -0.56, 1.7, 0.08],
      ].map(([x, y, z, w, d], i) => (
        <mesh key={i} position={[x, y - 0.05, z]} material={mats.white}>
          <boxGeometry args={[w, 0.07, d]} />
        </mesh>
      ))}
      {[0.81, -0.81].map((x) => (
        <mesh key={x} position={[x, -0.05, 0]} material={mats.white}>
          <boxGeometry args={[0.08, 0.07, 1.2]} />
        </mesh>
      ))}
      <mesh geometry={water} position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.water} />
      {/* escalera */}
      {[0.45, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.12, -0.5]} rotation={[0, Math.PI / 2, 0]} material={mats.chrome}>
          <torusGeometry args={[0.14, 0.025, 4, 8, Math.PI]} />
        </mesh>
      ))}
    </group>
  );
}
