"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { Tier } from "@/lib/device-tier";
import { sceneState } from "@/lib/scene-store";
import { damp, smoothHero, stepSmoothHero } from "./smooth";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Plano general del hero → plano cercano sobre la fuga (dolly) */
const HERO_POS = V(0.7, 0.75, 9.2);
const HERO_LOOK = V(0.9, 0.2, 0);
const LEAK_POS = V(2.3, 1.55, 5.4);
const LEAK_LOOK = V(1.5, 0.75, 0);

/** Recorrido que sigue la tubería hacia abajo, sección a sección */
const JOURNEY_POS = [LEAK_POS, V(2.4, -3.6, 8.2), V(0.4, -9.4, 8.8), V(-1.8, -14, 8.2), V(0.2, -19.4, 8.8), V(1.9, -24, 8.2), V(0.2, -29.4, 8.8), V(-1.8, -34, 8.2), V(0.2, -39.4, 8.8), V(1.6, -44.5, 8.4)];
const JOURNEY_LOOK = [LEAK_LOOK, V(2.8, -4.8, 0), V(0, -10, 0), V(-2.6, -15, 0), V(0, -20, 0), V(2.6, -25, 0), V(0, -30, 0), V(-2.6, -35, 0), V(0, -40, 0), V(2.2, -45.5, 0)];

export function CameraRig({ tier }: { tier: Tier }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const posCurve = useMemo(() => new THREE.CatmullRomCurve3(JOURNEY_POS, false, "centripetal"), []);
  const lookCurve = useMemo(() => new THREE.CatmullRomCurve3(JOURNEY_LOOK, false, "centripetal"), []);
  const state = useRef({ t: 0, px: 0, py: 0, offX: 0, offY: 0, init: false });
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const frozen = tier === "static";
  const parallax = tier === "high";

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const st = state.current;
    const instant = frozen || !st.init;
    stepSmoothHero(dt, frozen);

    // 1) Objetivo de cámara: hero (con dolly) o recorrido por la tubería
    st.t = instant ? sceneState.journey.target : damp(st.t, sceneState.journey.target, 4, dt);
    if (st.t <= 0.0001) {
      tmpPos.lerpVectors(HERO_POS, LEAK_POS, smoothHero.dolly);
      tmpLook.lerpVectors(HERO_LOOK, LEAK_LOOK, smoothHero.dolly);
    } else {
      posCurve.getPoint(st.t, tmpPos);
      lookCurve.getPoint(st.t, tmpLook);
    }

    // En vertical (móvil) la cámara se aleja: mismo encuadre con menos ancho disponible
    const aspect = size.width / size.height;
    if (aspect < 1) {
      const k = 1 + (1 - aspect) * 1.1;
      tmpPos.sub(tmpLook).multiplyScalar(k).add(tmpLook);
    }

    // 2) Parallax sutil con el ratón (solo puntero fino y escena completa)
    if (parallax) {
      st.px = damp(st.px, sceneState.pointer.x, 3, dt);
      st.py = damp(st.py, sceneState.pointer.y, 3, dt);
      tmpPos.x += st.px * 0.35;
      tmpPos.y += st.py * 0.2;
    }

    if (instant) {
      camera.position.copy(tmpPos);
      look.copy(tmpLook);
    } else {
      camera.position.set(damp(camera.position.x, tmpPos.x, 6, dt), damp(camera.position.y, tmpPos.y, 6, dt), damp(camera.position.z, tmpPos.z, 6, dt));
      look.set(damp(look.x, tmpLook.x, 6, dt), damp(look.y, tmpLook.y, 6, dt), damp(look.z, tmpLook.z, 6, dt));
    }
    camera.lookAt(look);
    st.init = true;

    // 3) Encuadre: en escritorio el sujeto va a la derecha (el texto ocupa la izquierda);
    //    en vertical, más abajo. Se relaja al salir del hero.
    const w = size.width;
    const h = size.height;
    const landscape = w / h > 1.05;
    const leave = THREE.MathUtils.smoothstep(st.t, 0, 0.12);
    const targetX = landscape ? -w * THREE.MathUtils.lerp(0.2, 0.1, leave) : 0;
    const targetY = landscape ? 0 : -h * THREE.MathUtils.lerp(0.27, 0, leave);
    st.offX = instant ? targetX : damp(st.offX, targetX, 6, dt);
    st.offY = instant ? targetY : damp(st.offY, targetY, 6, dt);
    camera.setViewOffset(w, h, st.offX, st.offY, w, h);

    // ¿Sigue moviéndose? (el controlador de fotogramas lo usa para dormir la escena)
    settling.value = camera.position.distanceToSquared(tmpPos) > 1e-5 || Math.abs(st.t - sceneState.journey.target) > 1e-4;
  }, -1); // prioridad negativa: corre antes que el resto (suaviza los valores que leen los demás)

  return null;
}

export const settling = { value: true };
