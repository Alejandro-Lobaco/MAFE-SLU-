import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { address, business, contact } from "@/config/site";

export const metadata: Metadata = { title: "Aviso legal", alternates: { canonical: "/aviso-legal" }, robots: { index: false, follow: true } };

export default function AvisoLegal() {
  return (
    <LegalPage title="Aviso legal" updated="septiembre de 2026">
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
        informa de que este sitio web es titularidad de:
      </p>
      <ul>
        <li>Titular: {business.legalName} (nombre comercial: {business.name} · {business.brand})</li>
        <li>CIF: {business.cif}</li>
        <li>
          Domicilio: {address.streetSchema}, {address.postalCode} {address.city} ({address.region})
        </li>
        <li>
          Teléfonos: {contact.mobile.display} · {contact.landline.display}
        </li>
        {business.email && <li>Email: {business.email}</li>}
        <li>Datos registrales: {business.registry}</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        Este sitio web informa sobre los servicios de fontanería, detección y localización de fugas, calefacción, calderas, sanitarios, piscinas,
        reformas y mantenimiento que presta el titular, y permite solicitar presupuesto.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso a este sitio es gratuito e implica la aceptación de este aviso legal. La persona usuaria se compromete a hacer un uso adecuado de
        los contenidos y a no emplearlos para actividades ilícitas o contrarias a la buena fe.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, diseños, gráficos, animaciones 3D, logotipos y código de este sitio son titularidad de {business.legalName} o de terceros que han
        autorizado su uso. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        El titular no se hace responsable de los daños derivados de interrupciones del servicio, virus o fallos técnicos ajenos a su control, ni del
        contenido de sitios web de terceros enlazados (Google Maps, WhatsApp, Trustlocal).
      </p>

      <h2>6. Precios y presupuestos</h2>
      <p>Los presupuestos son gratuitos y sin compromiso. El precio definitivo se indica por escrito antes de iniciar cualquier trabajo.</p>

      <h2>7. Legislación y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que
        correspondan conforme a la normativa de consumidores y usuarios.
      </p>
    </LegalPage>
  );
}
