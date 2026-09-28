import { ImageResponse } from "next/og";
import { business, contact, hero, ratings } from "@/config/site";

export const alt = `${business.name} — Detección de fugas en Zaragoza`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 30%, #12264a 0%, #0a1628 60%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#0d1c33", border: "1px solid #1d3357", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="34" height="34" viewBox="0 0 40 40">
              <path d="M20 4s11 11.7 11 19.4a11 11 0 0 1-22 0C9 15.7 20 4 20 4Z" fill="#38bdf8" />
            </svg>
          </div>
          <span style={{ fontWeight: 700 }}>{business.name}</span>
          <span style={{ color: "#38bdf8" }}>· {business.tagline}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{hero.title}</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#38bdf8" }}>{hero.titleAccent}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <span style={{ color: "#cbd5e1" }}>
            Fontanero en Zaragoza · {ratings.google.value.toString().replace(".", ",")} de 5 en Google
          </span>
          <span style={{ background: "#ff6b35", color: "#0a1628", padding: "14px 28px", borderRadius: 999, fontWeight: 700 }}>
            {contact.mobile.display}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
