import Link from "next/link";
import { address, business, contact, hours, nav, ratings } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { callHref, landlineHref, whatsappHref } from "@/lib/links";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="cv-auto relative z-10 border-t border-white/10 bg-night pb-28 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-fog">
            Fontanero en Zaragoza especialista en detección y localización de fugas sin obras innecesarias. Reparación de tuberías, desatascos,
            calefacción, calderas, baños y piscinas para particulares, comunidades y locales.
          </p>
          <p className="mt-4 text-sm text-mist">
            {ratings.google.value.toString().replace(".", ",")}★ en Google · {ratings.trustlocal.value.toString().replace(".", ",")} en Trustlocal
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            <li>
              Móvil / WhatsApp:{" "}
              <a href={callHref} className="text-white underline decoration-white/30 underline-offset-4">
                {contact.mobile.display}
              </a>
            </li>
            <li>
              Fijo:{" "}
              <a href={landlineHref} className="text-white underline decoration-white/30 underline-offset-4">
                {contact.landline.display}
              </a>
            </li>
            <li>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
                Escribir por WhatsApp
              </a>
            </li>
            {business.email && (
              <li>
                <a href={`mailto:${business.email}`} className="text-white underline decoration-white/30 underline-offset-4">
                  {business.email}
                </a>
              </li>
            )}
            <li>
              {address.street}, {address.postalCode} {address.city}
            </li>
            <li>{hours.summary}</li>
            {hours.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">Navegación</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={`/${n.href}`} className="text-mist transition-colors duration-150 ease-[ease] hover-fine:text-white">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/#presupuesto" className="text-mist transition-colors duration-150 ease-[ease] hover-fine:text-white">
                Presupuesto gratuito
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-white/10 px-4 pt-6 text-xs text-fog sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {business.legalName} · {business.brand}
        </p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/aviso-legal" className="transition-colors duration-150 ease-[ease] hover-fine:text-white">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="transition-colors duration-150 ease-[ease] hover-fine:text-white">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="transition-colors duration-150 ease-[ease] hover-fine:text-white">
                Política de cookies
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
