import { business, quoteForm } from "@/config/site";

export const runtime = "nodejs";

const PHONE_RE = /^(\+?34)?[6789]\d{8}$/;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // límite de cuerpo en Vercel: 4,5 MB (la foto llega comprimida)

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Recibe el formulario de presupuesto.
 * Si hay RESEND_API_KEY + QUOTE_TO_EMAIL, lo envía por email (con la foto adjunta).
 * Si no está configurado, responde 503 y la web ofrece enviarlo por WhatsApp.
 */
export async function POST(request: Request) {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Campo trampa: si viene relleno, es un bot. Respondemos OK sin hacer nada.
  if (String(data.get("empresa") ?? "").trim()) return Response.json({ ok: true });

  const nombre = String(data.get("nombre") ?? "").trim().slice(0, 80);
  const telefono = String(data.get("telefono") ?? "").replace(/[\s.-]/g, "");
  const tipo = String(data.get("tipo") ?? "");
  const urgencia = String(data.get("urgencia") ?? "");
  const mensaje = String(data.get("mensaje") ?? "").trim().slice(0, 1000);
  const consentimiento = data.get("consentimiento");
  const foto = data.get("foto");

  const urgency = quoteForm.urgency.find((u) => u.value === urgencia);
  if (nombre.length < 2 || !PHONE_RE.test(telefono) || !quoteForm.problemTypes.includes(tipo) || !urgency || !consentimiento) {
    return Response.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const photo = foto instanceof File && foto.size > 0 ? foto : null;
  if (photo && (photo.size > MAX_PHOTO_BYTES || !photo.type.startsWith("image/"))) {
    return Response.json({ ok: false, error: "photo" }, { status: 413 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from = process.env.QUOTE_FROM_EMAIL || `Web ${business.name} <onboarding@resend.dev>`;
  if (!apiKey || !to) {
    console.warn("[presupuesto] Envío no configurado (faltan RESEND_API_KEY / QUOTE_TO_EMAIL). Solicitud:", { nombre, telefono, tipo, urgencia });
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const rows: [string, string][] = [
    ["Nombre", nombre],
    ["Teléfono", telefono],
    ["Problema", tipo],
    ["Urgencia", `${urgency.label} (${urgency.hint})`],
    ["Mensaje", mensaje || "—"],
    ["Foto", photo ? "Adjunta" : "No"],
  ];
  const html = `<h2>Nueva solicitud de presupuesto</h2><table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escape(v)}</td></tr>`)
    .join("")}</table><p><a href="tel:${telefono}">Llamar a ${escape(nombre)}</a></p>`;

  const attachments = photo ? [{ filename: "foto.jpg", content: Buffer.from(await photo.arrayBuffer()).toString("base64") }] : undefined;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject: `${urgency.value === "hoy" ? "URGENTE · " : ""}Presupuesto: ${tipo} — ${nombre}`,
      html,
      attachments,
    }),
  });

  if (!res.ok) {
    console.error("[presupuesto] Error de Resend", res.status, await res.text().catch(() => ""));
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
