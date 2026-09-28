import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { address, business, contact } from "@/config/site";

export const metadata: Metadata = { title: "Política de privacidad", alternates: { canonical: "/privacidad" }, robots: { index: false, follow: true } };

export default function Privacidad() {
  const canal = business.email ? `${business.email} o en el ${contact.mobile.display}` : `el teléfono ${contact.mobile.display}`;
  return (
    <LegalPage title="Política de privacidad" updated="septiembre de 2026">
      <p>
        Esta política explica cómo tratamos los datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección
        de Datos Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>{business.legalName} · CIF {business.cif}</li>
        <li>
          {address.streetSchema}, {address.postalCode} {address.city}
        </li>
        <li>Contacto: {canal}</li>
      </ul>

      <h2>2. Qué datos tratamos y para qué</h2>
      <ul>
        <li>
          <strong>Formulario de presupuesto:</strong> nombre, teléfono, tipo de problema, urgencia, mensaje y, si la adjuntas, una foto. Los usamos
          para contactarte, estudiar la avería y preparar el presupuesto.
        </li>
        <li>
          <strong>Llamadas y WhatsApp:</strong> los datos que nos facilites al llamarnos o escribirnos, con la misma finalidad. WhatsApp es un servicio
          de Meta con su propia política de privacidad.
        </li>
        <li>
          <strong>Clientes:</strong> si contratas un trabajo, los datos necesarios para prestarlo, facturarlo y atender la garantía.
        </li>
      </ul>

      <h2>3. Base legal</h2>
      <p>
        Tu consentimiento (art. 6.1.a RGPD) al enviar el formulario, la aplicación de medidas precontractuales a petición tuya (art. 6.1.b) y, en su
        caso, el cumplimiento de obligaciones legales como la facturación (art. 6.1.c).
      </p>

      <h2>4. Conservación</h2>
      <p>
        Las solicitudes que no terminan en contratación se conservan un máximo de 12 meses. Los datos de clientes, durante la relación y los plazos
        legales de conservación (fiscales y de garantía).
      </p>

      <h2>5. Destinatarios</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Utilizamos proveedores que actúan como encargados del tratamiento: alojamiento web
        (Vercel Inc.) y envío de correo (Resend). Algunos pueden tratar datos fuera del Espacio Económico Europeo con garantías adecuadas (Marco de
        Privacidad de Datos UE-EE. UU. o cláusulas contractuales tipo).
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar tu
        consentimiento en cualquier momento, escribiéndonos a {canal}. Si consideras que no hemos atendido correctamente tu solicitud, puedes
        reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).
      </p>

      <h2>7. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a pérdida, uso indebido o acceso no autorizado.</p>
    </LegalPage>
  );
}
