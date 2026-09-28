import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { business } from "@/config/site";

export const metadata: Metadata = { title: "Política de cookies", alternates: { canonical: "/cookies" }, robots: { index: false, follow: true } };

export default function Cookies() {
  return (
    <LegalPage title="Política de cookies" updated="septiembre de 2026">
      <p>
        Conforme al artículo 22.2 de la LSSI-CE y a la Guía sobre el uso de las cookies de la AEPD, te informamos de las cookies y tecnologías
        similares que utiliza este sitio.
      </p>

      <h2>1. Cookies propias</h2>
      <p>
        Este sitio web de {business.name} <strong>no utiliza cookies propias</strong> de análisis, publicidad ni personalización. Las tipografías se
        sirven desde nuestro propio servidor, sin conexión con terceros.
      </p>

      <h2>2. Cookies de terceros</h2>
      <ul>
        <li>
          <strong>Google Maps:</strong> el mapa solo se carga si pulsas «Ver mapa de Google». A partir de ese momento Google puede instalar cookies
          propias (por ejemplo, NID) para su funcionamiento y para recordar preferencias. Más información en policies.google.com/technologies/cookies.
        </li>
        <li>
          <strong>WhatsApp, Google y Trustlocal:</strong> los enlaces te llevan a sus sitios web, que aplican sus propias políticas de cookies.
        </li>
      </ul>

      <h2>3. Cómo gestionar las cookies</h2>
      <p>
        Puedes bloquear o eliminar las cookies desde la configuración de tu navegador (Chrome, Safari, Firefox, Edge). Si no cargas el mapa, este
        sitio no instala ninguna cookie.
      </p>
    </LegalPage>
  );
}
