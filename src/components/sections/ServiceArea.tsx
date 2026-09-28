import { address, serviceArea } from "@/config/site";
import { PinIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Posición aproximada (rumbo en grados, km desde el Arrabal) y lado de la etiqueta */
const MAP_POINTS: Record<string, [bearing: number, km: number, side: "l" | "r"]> = {
  Utebo: [288, 12, "l"],
  Casetas: [300, 16.5, "l"],
  Pinseque: [292, 22, "l"],
  Garrapinillos: [250, 12, "l"],
  "Cuarte de Huerva": [188, 8, "l"],
  Cadrete: [172, 11.5, "r"],
  "María de Huerva": [198, 17, "l"],
  "Villanueva de Gállego": [14, 14, "r"],
  "San Juan de Mozarrifar": [352, 7, "r"],
  "Villamayor de Gállego": [58, 10, "r"],
  Montañana: [30, 5.5, "l"],
  Movera: [82, 6, "r"],
  "La Puebla de Alfindén": [74, 13, "r"],
  Pastriz: [100, 14, "r"],
  Alfajarín: [86, 20, "r"],
  Zuera: [352, 25, "r"],
};

const C = 300;
const PX_PER_KM = 10.2;

function toXY(bearing: number, km: number) {
  const r = (bearing * Math.PI) / 180;
  return [C + Math.sin(r) * km * PX_PER_KM, C - Math.cos(r) * km * PX_PER_KM] as const;
}

export function ServiceArea() {
  const points = serviceArea.towns.filter((t) => MAP_POINTS[t]).map((t) => ({ name: t, xy: toXY(MAP_POINTS[t][0], MAP_POINTS[t][1]), side: MAP_POINTS[t][2] }));

  return (
    <section id="zona" data-stop className="relative py-24 md:py-32 cv-auto" aria-labelledby="zona-title">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading id="zona-title" eyebrow="Zaragoza y alrededores" title={serviceArea.title} intro={serviceArea.intro} />
          <div data-reveal className="mt-8">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-fog">Zaragoza capital</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {serviceArea.districts.map((d) => (
                <li key={d} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-mist">
                  {d}
                </li>
              ))}
            </ul>
            <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-[0.14em] text-fog">Municipios cercanos</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {serviceArea.towns.map((d) => (
                <li key={d} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-mist">
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-fog">{serviceArea.note}</p>
          </div>
        </div>

        <figure data-reveal className="panel overflow-hidden p-2">
          <svg viewBox="0 0 600 600" className="h-auto w-full" role="img" aria-label={`Mapa de la zona de servicio alrededor de ${address.district}, Zaragoza`}>
            <defs>
              <radialGradient id="za-bg">
                <stop offset="0" stopColor="#12264a" />
                <stop offset="1" stopColor="#0a1628" />
              </radialGradient>
              <radialGradient id="za-core">
                <stop offset="0" stopColor="#38bdf8" stopOpacity=".35" />
                <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="600" height="600" fill="url(#za-bg)" />
            {/* Ebro y Gállego (esquemáticos) */}
            <path d="M-10 250 C 90 270, 170 330, 250 318 S 330 292, 360 300 S 470 350, 610 330" fill="none" stroke="#1e90ff" strokeOpacity=".45" strokeWidth="7" strokeLinecap="round" />
            <path d="M378 -10 C 372 80, 400 160, 372 230 S 350 290, 360 300" fill="none" stroke="#1e90ff" strokeOpacity=".3" strokeWidth="4" strokeLinecap="round" />
            {/* Anillos de distancia */}
            {[5, 10, 20].map((km) => (
              <g key={km}>
                <circle cx={C} cy={C} r={km * PX_PER_KM} fill="none" stroke="#38bdf8" strokeOpacity={km === 20 ? 0.35 : 0.18} strokeDasharray={km === 20 ? "0" : "4 6"} />
                <text x={C + 6} y={C - km * PX_PER_KM - 6} fill="#94a3b8" fontSize="12">
                  {km} km
                </text>
              </g>
            ))}
            <circle cx={C} cy={C} r={20 * PX_PER_KM} fill="#38bdf8" fillOpacity=".05" />
            {points.map((p) => (
              <g key={p.name}>
                <circle cx={p.xy[0]} cy={p.xy[1]} r="4" fill="#cbd5e1" />
                <text
                  x={p.xy[0] + (p.side === "r" ? 9 : -9)}
                  y={p.xy[1] + 4}
                  textAnchor={p.side === "r" ? "start" : "end"}
                  fill="#cbd5e1"
                  fontSize="13"
                >
                  {p.name}
                </text>
              </g>
            ))}
            <circle cx={C} cy={C} r="46" fill="url(#za-core)" />
            <circle cx={C} cy={C} r="9" fill="#38bdf8" stroke="#0a1628" strokeWidth="3" />
            <text x={C} y={C + 30} textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="600">
              Zaragoza
            </text>
            <text x={C} y={C + 47} textAnchor="middle" fill="#7dd3fc" fontSize="12">
              MAFE · {address.district}
            </text>
          </svg>
          <figcaption className="flex items-center gap-2 px-4 py-3 text-sm text-fog">
            <PinIcon className="size-4 text-sky" /> {address.street}, {address.postalCode} {address.city}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
