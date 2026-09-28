"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import type { Tier } from "@/lib/device-tier";
import { smoothHero } from "./smooth";
import { LEAK_NORMAL, LEAK_POINT, LEAK_X, MAIN_R, MAIN_Y, RUN_START_X } from "./pipes";
import { createGlowTexture, createSprayMaterial, createWaterMaterial } from "./water";

const SKY = new THREE.Color("#38bdf8");
const DROP_PERIOD = 2.8; // s — movimiento constante (lineal)
const FROZEN_TIME = 2.35; // instante que se congela con movimiento reducido

function useGlow() {
  return useMemo(() => createGlowTexture(), []);
}

/* ── Gota que recorre la tubería ───────────────────────────────────────────── */
function WaterDrop({ tier, glow }: { tier: Tier; glow: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const lowMat = useMemo(() => createWaterMaterial(), []);
  const frozen = tier === "static";

  useFrame((state) => {
    if (!group.current || !body.current) return;
    const time = frozen ? FROZEN_TIME : state.clock.elapsedTime;
    const u = (time % DROP_PERIOD) / DROP_PERIOD;
    const x = THREE.MathUtils.lerp(RUN_START_X, LEAK_X - 0.05, u);
    // Aparece al principio del tramo y "entra" en la grieta al final
    const env = THREE.MathUtils.smoothstep(u, 0, 0.08) * (1 - THREE.MathUtils.smoothstep(u, 0.88, 1));
    group.current.position.set(x, MAIN_Y + MAIN_R + 0.055, 0.05);
    const wobble = frozen ? 0 : Math.sin(time * 14) * 0.06;
    body.current.scale.set(0.16 * env * (1 + wobble), 0.085 * env * (1 - wobble), 0.1 * env);
    if (halo.current) (halo.current.material as THREE.SpriteMaterial).opacity = 0.55 * env;
  });

  return (
    <group ref={group}>
      <mesh ref={body}>
        <sphereGeometry args={[1, tier === "high" ? 48 : 24, tier === "high" ? 32 : 16]} />
        {tier === "high" ? (
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            transmission={1}
            thickness={0.35}
            ior={1.33}
            roughness={0}
            chromaticAberration={0.06}
            anisotropicBlur={0.1}
            distortion={0.15}
            distortionScale={0.3}
            temporalDistortion={0.05}
            color="#d4f1ff"
            backside={false}
          />
        ) : (
          <primitive object={lowMat} attach="material" />
        )}
      </mesh>
      <sprite ref={halo} scale={0.55}>
        <spriteMaterial map={glow} color={SKY} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
}

/* ── Chorro de la fuga (partículas en GPU) ─────────────────────────────────── */
function LeakSpray({ tier, glow }: { tier: Tier; glow: THREE.Texture }) {
  const count = tier === "high" ? 720 : 280;
  const material = useMemo(() => {
    const m = createSprayMaterial();
    m.uniforms.uOrigin.value.copy(LEAK_POINT);
    m.uniforms.uDir.value.copy(LEAK_NORMAL);
    return m;
  }, []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count);
    const rand = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds[i] = (i + 0.5) / count; // reparto uniforme: la intensidad enciende partículas de forma gradual
      rand[i * 3] = Math.random();
      rand[i * 3 + 1] = Math.random();
      rand[i * 3 + 2] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    return g;
  }, [count]);
  const mist = useRef<THREE.Sprite>(null);
  const frozen = tier === "static";

  useFrame((state) => {
    const s = smoothHero;
    const cam = state.camera as THREE.PerspectiveCamera;
    material.uniforms.uTime.value = frozen ? FROZEN_TIME : state.clock.elapsedTime;
    material.uniforms.uIntensity.value = s.leak;
    material.uniforms.uScale.value = state.size.height * state.viewport.dpr * 0.5 * cam.projectionMatrix.elements[5];
    if (mist.current) {
      const pulse = frozen ? 0 : Math.sin(state.clock.elapsedTime * 9) * 0.06;
      mist.current.scale.setScalar(0.5 + s.leak * 0.35 + pulse);
      (mist.current.material as THREE.SpriteMaterial).opacity = s.leak * 0.75;
    }
  });

  return (
    <group>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <sprite ref={mist} position={LEAK_POINT}>
        <spriteMaterial map={glow} color={SKY} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
}

/* ── Anillo escáner ────────────────────────────────────────────────────────── */
function Scanner({ tier }: { tier: Tier }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ping = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const frozen = tier === "static";
  const R = MAIN_R * 2.1;

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: SKY, transparent: true, toneMapped: false }), []);
  const pingMat = useMemo(() => new THREE.MeshBasicMaterial({ color: SKY, transparent: true, toneMapped: false, depthWrite: false }), []);
  // Banda de luz que "abraza" la tubería: alfa máximo en el centro
  const bandMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: SKY.clone() }, uOpacity: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
          void main(){ float a = pow(1.0 - abs(vUv.y * 2.0 - 1.0), 2.0); gl_FragColor = vec4(uColor * 1.4, a * uOpacity); }`,
      }),
    [],
  );

  useFrame((state) => {
    const s = smoothHero;
    const g = group.current;
    if (!g) return;
    const time = frozen ? FROZEN_TIME : state.clock.elapsedTime;
    const x = THREE.MathUtils.lerp(RUN_START_X - 0.6, LEAK_X, s.scan);
    g.position.set(x, MAIN_Y, 0);
    const visible = Math.min(1, s.scan * 8);
    ringMat.opacity = visible;
    bandMat.uniforms.uOpacity.value = visible * (0.7 + s.lock * 0.3);
    if (ring.current) {
      const pulse = frozen ? 0 : Math.sin(time * 7) * 0.06 * s.lock;
      ring.current.scale.setScalar(1 + pulse);
    }
    if (ping.current) {
      const p = frozen ? 0.45 : (time % 1.3) / 1.3; // radar: movimiento constante → lineal
      ping.current.scale.setScalar(1 + p * 1.4);
      pingMat.opacity = (1 - p) * s.lock * 0.8;
    }
    if (light.current) light.current.intensity = 2.5 * visible + s.lock * 1.5;
  });

  return (
    <group ref={group}>
      <group rotation={[0, Math.PI / 2 - 0.42, 0.18]}>
        <mesh ref={ring} material={ringMat}>
          <torusGeometry args={[R, 0.017, 10, 96]} />
        </mesh>
        <mesh ref={ping} material={pingMat}>
          <torusGeometry args={[R, 0.01, 8, 96]} />
        </mesh>
      </group>
      <mesh material={bandMat} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[MAIN_R * 1.05, MAIN_R * 1.05, 0.34, 40, 1, true]} />
      </mesh>
      <pointLight ref={light} color={SKY} intensity={0} distance={3.2} decay={2} position={[0, 0.35, 0.5]} />
    </group>
  );
}

/* ── Pin de localización ───────────────────────────────────────────────────── */
function LeakPin({ tier, glow }: { tier: Tier; glow: THREE.Texture }) {
  const pin = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const ping = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const frozen = tier === "static";

  const geometry = useMemo(() => {
    // Perfil de marcador (punta abajo) → torno
    const pts = [
      [0, 0],
      [0.06, 0.12],
      [0.14, 0.3],
      [0.19, 0.44],
      [0.2, 0.54],
      [0.17, 0.64],
      [0.1, 0.71],
      [0, 0.735],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, tier === "high" ? 40 : 20);
  }, [tier]);
  const pinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#7dd3fc", emissive: SKY, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.25, transparent: true }),
    [],
  );
  const pingMat = useMemo(() => new THREE.MeshBasicMaterial({ color: SKY, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }), []);
  const pingQ = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), LEAK_NORMAL), []);

  useFrame((state) => {
    const s = smoothHero;
    const time = frozen ? FROZEN_TIME : state.clock.elapsedTime;
    const bob = frozen ? 0 : Math.sin(time * 2.2) * 0.04 * s.pin;
    if (pin.current) {
      pin.current.position.set(LEAK_POINT.x, LEAK_POINT.y + (1 - s.pin) * 1.6 + bob + 0.02, LEAK_POINT.z);
      pin.current.scale.setScalar(0.92 + 0.08 * s.pin);
    }
    pinMat.opacity = s.pin;
    pinMat.visible = s.pin > 0.01;
    if (halo.current) (halo.current.material as THREE.SpriteMaterial).opacity = s.pin * 0.9;
    if (ping.current) {
      const p = frozen ? 0.5 : (time % 1.5) / 1.5; // constante → lineal
      ping.current.scale.setScalar(0.12 + p * 0.55);
      pingMat.opacity = (1 - p) * s.pin * 0.9;
    }
    if (light.current) light.current.intensity = 3 * s.pin;
  });

  return (
    <group>
      <group ref={pin}>
        <mesh geometry={geometry} material={pinMat} />
        <mesh position={[0, 0.54, 0.12]}>
          <sphereGeometry args={[0.065, 16, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <sprite ref={halo} position={[0, 0.54, 0]} scale={1.3}>
          <spriteMaterial map={glow} color={SKY} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
        <pointLight ref={light} color={SKY} intensity={0} distance={3} decay={2} position={[0, 0.6, 0.3]} />
      </group>
      <mesh ref={ping} position={LEAK_POINT} quaternion={pingQ} material={pingMat}>
        <ringGeometry args={[0.9, 1, 48]} />
      </mesh>
    </group>
  );
}

export function LeakSequence({ tier }: { tier: Tier }) {
  const glow = useGlow();
  return (
    <group>
      <WaterDrop tier={tier} glow={glow} />
      <LeakSpray tier={tier} glow={glow} />
      <Scanner tier={tier} />
      <LeakPin tier={tier} glow={glow} />
    </group>
  );
}
