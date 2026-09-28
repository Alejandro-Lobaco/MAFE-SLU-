"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Tier } from "@/lib/device-tier";
import { sceneState } from "@/lib/scene-store";
import { Dust, Studio } from "./Atmosphere";
import { CameraRig, settling } from "./CameraRig";
import { LeakSequence } from "./LeakSequence";
import { PipeNetwork } from "./PipeNetwork";

type Props = { tier: Exclude<Tier, "none">; onReady: () => void };

/**
 * Canvas fijo de fondo. frameloop="demand": solo se pinta cuando hace falta
 * (hero visible, scroll reciente o cámara aún en movimiento). Fuera de pantalla
 * (formulario, mapa, pie) no se pinta nada.
 */
export default function Experience({ tier: initialTier, onReady }: Props) {
  const [tier, setTier] = useState(initialTier);
  const [dpr, setDpr] = useState(() => (initialTier === "high" ? Math.min(window.devicePixelRatio || 1, 1.75) : 1));

  // Degradado progresivo si el equipo no llega: menos resolución → escena simplificada → fotograma fijo
  const onSlow = useCallback(() => {
    if (tier === "high" && dpr > 1) setDpr(1);
    else if (tier === "high") setTier("low");
    else if (tier === "low") setTier("static");
  }, [tier, dpr]);

  return (
    <Canvas
      dpr={dpr}
      frameloop="demand"
      gl={{ antialias: tier === "high", alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 35, near: 0.1, far: 60, position: [0.7, 0.75, 9.2] }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#0a1628"]} />
      <fog attach="fog" args={["#0a1628", 8, 26]} />
      <Suspense fallback={null}>
        <Studio tier={tier} />
        <PipeNetwork tier={tier} />
        <LeakSequence tier={tier} />
        {tier === "high" && <Dust tier={tier} />}
        <CameraRig tier={tier} />
        <ReadySignal onReady={onReady} />
      </Suspense>
      <FrameDriver tier={tier} onSlow={onSlow} />
    </Canvas>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady());
  });
  return null;
}

function FrameDriver({ tier, onSlow }: { tier: Tier; onSlow: () => void }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let raf = 0;

    // Movimiento reducido: unos pocos fotogramas para asentar entorno y cámara, y quieto.
    if (tier === "static") {
      let n = 0;
      const settle = () => {
        invalidate();
        if (++n < 6) raf = requestAnimationFrame(settle);
      };
      raf = requestAnimationFrame(settle);
      return () => cancelAnimationFrame(raf);
    }

    let last = performance.now();
    let acc = 0;
    let frames = 0;
    let strikes = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = now - last;
      last = now;
      if (document.hidden || !sceneState.active) return;
      const running = sceneState.heroVisible || now - sceneState.lastScroll < 900 || settling.value;
      if (!running) {
        acc = frames = 0;
        return;
      }
      invalidate();
      // Monitor de rendimiento solo mientras se pinta de forma continua
      if (dt < 250) {
        acc += dt;
        frames++;
      }
      if (frames >= 120) {
        strikes = acc / frames > 30 ? strikes + 1 : 0; // < ~33 fps sostenido
        if (strikes >= 2) {
          strikes = 0;
          onSlow();
        }
        acc = frames = 0;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tier, invalidate, onSlow]);

  return null;
}
