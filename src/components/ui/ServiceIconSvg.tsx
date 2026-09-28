import type { IconKey } from "@/config/site";

/**
 * Iconos low-poly en SVG (facetas planas). Son la versión ligera de los iconos 3D:
 * se muestran en móvil / GPU modesta / movimiento reducido y mientras carga el 3D.
 */
export function ServiceIconSvg({ icon, className = "size-16" }: { icon: IconKey; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {ICONS[icon]}
    </svg>
  );
}

const CHROME_L = "#eef2f7";
const CHROME_M = "#c3cedb";
const CHROME_D = "#8595aa";
const COPPER_L = "#e0a07a";
const COPPER_D = "#a8603a";

const ICONS: Record<IconKey, React.ReactNode> = {
  drop: (
    <g>
      <polygon points="32,5 22,24 32,32" fill="#bae6fd" />
      <polygon points="32,5 42,24 32,32" fill="#7dd3fc" />
      <polygon points="22,24 15,40 32,32" fill="#7dd3fc" />
      <polygon points="42,24 49,40 32,32" fill="#38bdf8" />
      <polygon points="15,40 32,32 32,46" fill="#38bdf8" />
      <polygon points="15,40 22,54 32,46" fill="#1e90ff" />
      <polygon points="49,40 32,32 32,46" fill="#1e90ff" />
      <polygon points="49,40 42,54 32,46" fill="#1570d8" />
      <polygon points="22,54 32,59 32,46" fill="#1570d8" />
      <polygon points="42,54 32,59 32,46" fill="#0f5bb5" />
      <polygon points="24,26 28,19 27,29" fill="#fff" opacity=".7" />
    </g>
  ),
  wrench: (
    <g transform="rotate(-45 32 32) translate(0 2)">
      <polygon points="19,10 25,2 29,2 29,12 32,12 32,22 23,22" fill={CHROME_L} />
      <polygon points="32,12 35,12 35,2 39,2 45,10 41,22 32,22" fill={CHROME_D} />
      <polygon points="27,22 32,22 32,60 28,60 27,58" fill={CHROME_M} />
      <polygon points="32,22 37,22 37,58 36,60 32,60" fill={CHROME_D} />
      <circle cx="32" cy="54" r="2.2" fill="#0a1628" />
      <rect x="27" y="30" width="10" height="3" fill="#38bdf8" />
    </g>
  ),
  radiator: (
    <g>
      <path d="M22 8c1.5 2-1.5 3 0 5M32 6c1.5 2-1.5 3 0 5M42 8c1.5 2-1.5 3 0 5" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="8" y="20" width="48" height="4" rx="2" fill={CHROME_M} />
      <rect x="8" y="48" width="48" height="4" rx="2" fill={CHROME_D} />
      {[10, 21, 32, 43].map((x) => (
        <g key={x}>
          <polygon points={`${x},18 ${x + 5.5},16 ${x + 5.5},54 ${x},54`} fill={CHROME_L} />
          <polygon points={`${x + 5.5},16 ${x + 11},18 ${x + 11},54 ${x + 5.5},54`} fill={CHROME_D} />
        </g>
      ))}
      <rect x="54" y="48" width="6" height="5" rx="1" fill={COPPER_L} />
      <rect x="57" y="53" width="3" height="7" fill={COPPER_D} />
    </g>
  ),
  boiler: (
    <g>
      <polygon points="14,12 22,7 50,7 42,12" fill="#f8fafc" />
      <polygon points="14,12 42,12 42,48 14,48" fill={CHROME_L} />
      <polygon points="42,12 50,7 50,43 42,48" fill={CHROME_D} />
      <rect x="19" y="18" width="18" height="9" rx="1.5" fill="#0a1628" />
      <path d="M22 22.5h6" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="33" cy="22.5" r="1.6" fill="#38bdf8" />
      <path d="M28 34c-3 3.5-2 8 0 9 2-1 3-5.5 0-9Z" fill="#38bdf8" />
      <rect x="18" y="48" width="4" height="11" fill={COPPER_L} />
      <rect x="26" y="48" width="4" height="11" fill={COPPER_D} />
      <rect x="34" y="48" width="4" height="11" fill={CHROME_M} />
    </g>
  ),
  toilet: (
    <g>
      <polygon points="18,8 24,4 46,4 40,8" fill="#f8fafc" />
      <polygon points="18,8 40,8 40,27 18,27" fill={CHROME_L} />
      <polygon points="40,8 46,4 46,23 40,27" fill={CHROME_D} />
      <rect x="23" y="12" width="6" height="2.5" rx="1" fill="#38bdf8" />
      <polygon points="12,33 32,33 32,50 24,55 18,46" fill={CHROME_L} />
      <polygon points="32,33 52,33 46,46 40,55 32,50" fill={CHROME_D} />
      <ellipse cx="32" cy="33" rx="20" ry="6" fill="#f8fafc" />
      <ellipse cx="32" cy="33" rx="13" ry="3.6" fill="#38bdf8" />
      <polygon points="24,55 40,55 42,60 22,60" fill={CHROME_M} />
    </g>
  ),
  pool: (
    <g>
      <polygon points="6,30 32,44 32,54 6,40" fill={CHROME_M} />
      <polygon points="32,44 58,30 58,40 32,54" fill={CHROME_D} />
      <polygon points="32,16 58,30 32,44 6,30" fill="#e2e8f0" />
      <polygon points="32,19.5 52,30 32,40.5 12,30" fill="#38bdf8" />
      <polygon points="32,19.5 52,30 32,30" fill="#7dd3fc" />
      <polygon points="12,30 32,30 32,40.5" fill="#1e90ff" />
      <path d="M20 29.5l6 3M34 24l6 3" stroke="#e0f2fe" strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
      <path d="M44 27V16a3 3 0 0 1 6 0M49 30V19a3 3 0 0 1 6 0" stroke={CHROME_L} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
};
