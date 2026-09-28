"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { Tier } from "@/lib/device-tier";

/**
 * Estudio de iluminación procedural (sin HDR externo): los Lightformers se
 * renderizan UNA vez a un mapa de entorno que da los reflejos al cromo y al cobre.
 */
export function Studio({ tier }: { tier: Tier }) {
  return (
    <>
      <Environment resolution={tier === "high" ? 256 : 128} frames={1}>
        <color attach="background" args={["#040a14"]} />
        <Lightformer form="rect" intensity={3.2} color="#eaf3ff" position={[0, 7, 1]} scale={[16, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#38bdf8" position={[-9, 1.5, 3]} scale={[10, 2.2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#1e90ff" position={[9, -1.5, 2]} scale={[10, 1.6, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, -1, 9]} scale={[14, 0.9, 1]} />
        <Lightformer form="ring" intensity={2.2} color="#bae6fd" position={[4, 4, 6]} scale={2.4} />
        <Lightformer form="rect" intensity={0.9} color="#f5d0b5" position={[0, -7, -3]} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={0.55} color="#9fb4cf" position={[0, 2.5, 9]} scale={[16, 3, 1]} />
      </Environment>
      <hemisphereLight args={["#bfe3ff", "#0a1628", 0.35]} />
      <directionalLight position={[3, 5, 6]} intensity={0.8} color="#e6f2ff" />
    </>
  );
}

/** Motas en suspensión: profundidad y sensación de espacio (solo versión completa) */
export function Dust({ tier }: { tier: Tier }) {
  const count = 420;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = 8 - Math.random() * 62;
      pos[i * 3 + 2] = -7 + Math.random() * 12;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uScale: { value: 400 } },
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uScale; attribute float aSeed; varying float vA;
          void main(){
            vec3 p = position;
            p.y += sin(uTime * 0.15 + aSeed * 40.0) * 0.4;
            p.x += cos(uTime * 0.11 + aSeed * 23.0) * 0.3;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (0.012 + aSeed * 0.02) * uScale / -mv.z;
            vA = 0.25 + aSeed * 0.45;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(0.6, 0.85, 1.0, (1.0 - d * 2.0) * vA); }`,
      }),
    [],
  );
  useFrame((state) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    material.uniforms.uTime.value = tier === "static" ? 0 : state.clock.elapsedTime;
    material.uniforms.uScale.value = state.size.height * state.viewport.dpr * 0.5 * cam.projectionMatrix.elements[5];
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
