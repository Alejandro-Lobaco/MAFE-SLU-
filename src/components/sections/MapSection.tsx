"use client";

import { useState } from "react";
import { address, contact, hours } from "@/config/site";
import { CallButton } from "@/components/ui/CtaButtons";
import { ExternalIcon, PinIcon } from "@/components/ui/Icons";
import { mapsDirectionsHref, mapsEmbedSrc } from "@/lib/links";

/**
 * Mapa de Google embebido con "fachada": no se carga (ni instala cookies de Google)
 * hasta que el usuario lo pide. Mejor rendimiento y cumplimiento RGPD/LSSI.
 */
export function MapSection() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="ubicacion" className="relative bg-night pb-24 md:pb-32 cv-auto" aria-labelledby="ubicacion-title">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
        <div data-reveal className="panel flex flex-col justify-between gap-8 p-6 sm:p-8">
          <div>
            <p className="eyebrow">Dónde estamos</p>
            <h2 id="ubicacion-title" className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
              Barrio del {address.district}, Zaragoza
            </h2>
            <address className="mt-4 not-italic leading-relaxed text-mist">
              {address.street}
              <br />
              {address.postalCode} {address.city}
              <br />
              <a href={`tel:${contact.mobile.e164}`} className="text-white underline decoration-white/30 underline-offset-4">
                {contact.mobile.display}
              </a>{" "}
              ·{" "}
              <a href={`tel:${contact.landline.e164}`} className="text-white underline decoration-white/30 underline-offset-4">
                {contact.landline.display}
              </a>
            </address>
            <p className="mt-4 text-sm text-fog">{hours.summary}</p>
          </div>
          <div className="flex flex-col gap-3">
            <CallButton showNumber />
            <a href={mapsDirectionsHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Cómo llegar <ExternalIcon className="size-4" />
            </a>
          </div>
        </div>

        <div data-reveal className="panel relative min-h-[22rem] overflow-hidden sm:min-h-[26rem]">
          {loaded ? (
            <iframe
              title={`Mapa: ${address.street}, ${address.city}`}
              src={mapsEmbedSrc}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0">
              <MapPlaceholder />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-night/40 p-6 text-center">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-sky/15 text-sky">
                  <PinIcon className="size-7" />
                </span>
                <button type="button" onClick={() => setLoaded(true)} className="btn btn-aqua">
                  Ver mapa de Google
                </button>
                <p className="max-w-sm text-xs text-fog">
                  Al cargar el mapa, Google puede instalar cookies propias. Más información en la{" "}
                  <a href="/cookies" className="text-mist underline underline-offset-4">
                    política de cookies
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MapPlaceholder() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden>
      <rect width="800" height="450" fill="#0d1c33" />
      <path d="M-20 300 C 140 320, 300 380, 420 360 S 640 300, 820 330" fill="none" stroke="#1e90ff" strokeOpacity=".35" strokeWidth="26" />
      <g stroke="#1d3357" strokeWidth="10" fill="none">
        <path d="M0 120h800M0 210h800M140 0v450M330 0v450M520 0v450M690 0v450" />
        <path d="M0 40l800 260M60 450L700 0" strokeWidth="14" />
      </g>
      <g stroke="#152a4b" strokeWidth="4" fill="none">
        <path d="M0 80h800M0 165h800M0 255h800M60 0v450M240 0v450M430 0v450M610 0v450" />
      </g>
    </svg>
  );
}
