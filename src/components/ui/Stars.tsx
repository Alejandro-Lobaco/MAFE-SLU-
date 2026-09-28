import { useId } from "react";

const STAR = "m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z";

/** Un solo SVG por valoración (5 estrellas + recorte para medias estrellas). */
export function Stars({ value, className = "h-4" }: { value: number; className?: string }) {
  const id = useId();
  const pct = Math.max(0, Math.min(1, value / 5)) * 100;
  return (
    <svg viewBox="0 0 120 24" className={`${className} w-auto`} style={{ aspectRatio: "5 / 1" }} role="img" aria-label={`${value.toString().replace(".", ",")} de 5 estrellas`}>
      <defs>
        <clipPath id={id}>
          <rect width={`${pct}%`} height="24" />
        </clipPath>
        <g id={`${id}-s`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
          ))}
        </g>
      </defs>
      <use href={`#${id}-s`} fill="rgb(255 255 255 / 0.15)" />
      <use href={`#${id}-s`} fill="#fcd34d" clipPath={`url(#${id})`} />
    </svg>
  );
}
