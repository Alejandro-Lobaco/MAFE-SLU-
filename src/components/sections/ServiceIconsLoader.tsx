"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useExperience } from "@/components/providers/Providers";
import { canHover } from "@/lib/device-tier";

const ServiceIcons3D = dynamic(() => import("@/components/three/ServiceIcons3D"), { ssr: false });

/** Solo en la versión completa del 3D y con puntero fino; si no, se quedan los iconos SVG. */
export function ServiceIconsLoader({ sectionId }: { sectionId: string }) {
  const { tier } = useExperience();
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const eligible = tier === "high" && canHover();

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!eligible || !el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eligible, sectionId]);

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (el) el.dataset.icons3d = ready && active ? "ready" : "";
  }, [ready, active, sectionId]);

  if (!eligible || !near) return null;
  return <ServiceIcons3D active={active} onReady={() => setReady(true)} />;
}
