"use client";

import { useEffect, useId, useRef, useState } from "react";
import { address, business, contact, hours, quoteForm } from "@/config/site";
import { CallButton, WhatsAppButton } from "@/components/ui/CtaButtons";
import { CameraIcon, ClockIcon, CloseIcon, PhoneIcon, PinIcon } from "@/components/ui/Icons";
import { landlineHref, whatsappHref } from "@/lib/links";

type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<"nombre" | "telefono" | "tipo" | "consentimiento" | "foto", string>>;

const PHONE_RE = /^(\+?34)?[6789]\d{8}$/;
const MAX_PHOTO_MB = 12;

/** Reduce la foto en el navegador (máx. 1600 px, JPEG 0,8): subida rápida y dentro del límite de Vercel. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.8));
    return blob ?? file;
  } catch {
    return file;
  }
}

export function QuoteForm() {
  const formId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setErrors((x) => ({ ...x, foto: "El archivo debe ser una imagen (JPG, PNG, HEIC…)." }));
      return;
    }
    if (file && file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setErrors((x) => ({ ...x, foto: `La foto no puede superar ${MAX_PHOTO_MB} MB.` }));
      return;
    }
    setErrors((x) => ({ ...x, foto: undefined }));
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get("nombre") ?? "").trim();
    const telefono = String(data.get("telefono") ?? "").replace(/[\s.-]/g, "");
    const tipo = String(data.get("tipo") ?? "");
    const urgencia = String(data.get("urgencia") ?? "");
    const mensaje = String(data.get("mensaje") ?? "").trim();

    const next: Errors = {};
    if (nombre.length < 2) next.nombre = "Escribe tu nombre.";
    if (!PHONE_RE.test(telefono)) next.telefono = "Revisa el teléfono (9 cifras, p. ej. 661 97 65 54).";
    if (!tipo) next.tipo = "Elige el tipo de problema.";
    if (!data.get("consentimiento")) next.consentimiento = "Necesitamos tu consentimiento para poder llamarte.";
    setErrors(next);
    const firstError = Object.keys(next)[0];
    if (firstError) {
      form.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }

    const urgencyLabel = quoteForm.urgency.find((u) => u.value === urgencia)?.label ?? "";
    const detalle = mensaje && !/[.!?]$/.test(mensaje) ? `${mensaje}.` : mensaje;
    setSummary(
      `Hola, soy ${nombre}. ${quoteForm.problemTypes.includes(tipo) ? `Tengo: ${tipo.toLowerCase()}.` : ""} Urgencia: ${urgencyLabel.toLowerCase()}. ${detalle} Mi teléfono: ${telefono}.`.replace(/\s+/g, " "),
    );

    setStatus("sending");
    data.set("telefono", telefono);
    data.delete("foto");
    if (photo) data.set("foto", await compressImage(photo), "foto.jpg");

    try {
      const res = await fetch("/api/presupuesto", { method: "POST", body: data });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
      clearPhoto();
    } catch {
      setStatus("error");
    }
  };

  const field =
    "mt-2 block w-full rounded-xl border border-white/12 bg-night/70 px-4 py-3 text-white placeholder:text-fog/70 transition-[border-color] duration-150 ease-[ease] hover-fine:border-white/25 focus:border-sky focus:outline-none aria-[invalid=true]:border-urgent";

  return (
    <section id="presupuesto" data-stop className="relative bg-night py-24 md:py-32" aria-labelledby="presupuesto-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div data-reveal>
          <p className="eyebrow">Presupuesto gratuito</p>
          <h2 id="presupuesto-title" className="section-title mt-3">
            {quoteForm.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-mist">{quoteForm.intro}</p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <PhoneIcon className="mt-0.5 size-5 shrink-0 text-sky" />
              <span>
                <span className="block text-sm text-fog">Móvil y WhatsApp</span>
                <a href={`tel:${contact.mobile.e164}`} className="font-display text-xl font-semibold text-white underline decoration-white/20 underline-offset-4">
                  {contact.mobile.display}
                </a>
                <span className="block text-sm text-fog">
                  Fijo:{" "}
                  <a href={landlineHref} className="text-white underline decoration-white/30 underline-offset-4">
                    {contact.landline.display}
                  </a>
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ClockIcon className="mt-0.5 size-5 shrink-0 text-sky" />
              <span>
                <span className="block text-white">{hours.summary}</span>
                {hours.lines.map((l) => (
                  <span key={l} className="block text-sm text-mist">
                    {l}
                  </span>
                ))}
                <span className="block text-sm text-fog">{hours.note}</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <PinIcon className="mt-0.5 size-5 shrink-0 text-sky" />
              <span className="text-mist">
                {address.street}, {address.postalCode} {address.city} ({address.district})
              </span>
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CallButton showNumber />
            <WhatsAppButton />
          </div>
        </div>

        <div data-reveal className="panel relative p-6 sm:p-8">
          {status === "success" ? (
            <div ref={successRef} tabIndex={-1} role="status" className="quote-success flex min-h-[28rem] flex-col items-center justify-center text-center outline-none">
              <svg viewBox="0 0 120 140" className="size-28" aria-hidden>
                <defs>
                  <clipPath id={`${formId}-drop`}>
                    <path d="M60 8C60 8 16 58 16 88a44 44 0 0 0 88 0C104 58 60 8 60 8Z" />
                  </clipPath>
                  <linearGradient id={`${formId}-water`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#1e90ff" />
                  </linearGradient>
                </defs>
                <g clipPath={`url(#${formId}-drop)`}>
                  <rect className="qs-fill" x="0" y="0" width="120" height="140" fill={`url(#${formId}-water)`} />
                </g>
                <path className="qs-outline" pathLength={1} d="M60 8C60 8 16 58 16 88a44 44 0 0 0 88 0C104 58 60 8 60 8Z" fill="none" stroke="#7dd3fc" strokeWidth="4" />
                <path className="qs-check" pathLength={1} d="M40 90l14 14 28-30" fill="none" stroke="#0a1628" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="qs-text mt-6 font-display text-2xl font-semibold text-white" style={{ ["--i" as string]: 0 }}>
                {quoteForm.success.title}
              </h3>
              <p className="qs-text mt-3 max-w-sm text-mist" style={{ ["--i" as string]: 1 }}>
                {quoteForm.success.text}
              </p>
              <div className="qs-text mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 2 }}>
                <CallButton />
                <button type="button" className="btn btn-ghost" onClick={() => setStatus("idle")}>
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-describedby={`${formId}-note`}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${formId}-nombre`} className="text-sm font-medium text-white">
                    Nombre
                  </label>
                  <input
                    id={`${formId}-nombre`}
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    enterKeyHint="next"
                    required
                    className={field}
                    placeholder="Tu nombre"
                    aria-invalid={!!errors.nombre}
                    aria-describedby={errors.nombre ? `${formId}-nombre-err` : undefined}
                  />
                  {errors.nombre && <p id={`${formId}-nombre-err`} className="mt-1.5 text-sm text-urgent">{errors.nombre}</p>}
                </div>
                <div>
                  <label htmlFor={`${formId}-telefono`} className="text-sm font-medium text-white">
                    Teléfono
                  </label>
                  <input
                    id={`${formId}-telefono`}
                    name="telefono"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    required
                    className={field}
                    placeholder="600 000 000"
                    aria-invalid={!!errors.telefono}
                    aria-describedby={errors.telefono ? `${formId}-telefono-err` : undefined}
                  />
                  {errors.telefono && <p id={`${formId}-telefono-err`} className="mt-1.5 text-sm text-urgent">{errors.telefono}</p>}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor={`${formId}-tipo`} className="text-sm font-medium text-white">
                  Tipo de problema
                </label>
                <select
                  id={`${formId}-tipo`}
                  name="tipo"
                  required
                  defaultValue=""
                  className={`${field} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2338bdf8%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-11`}
                  aria-invalid={!!errors.tipo}
                  aria-describedby={errors.tipo ? `${formId}-tipo-err` : undefined}
                >
                  <option value="" disabled>
                    Elige una opción
                  </option>
                  {quoteForm.problemTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.tipo && <p id={`${formId}-tipo-err`} className="mt-1.5 text-sm text-urgent">{errors.tipo}</p>}
              </div>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-white">¿Cuánta prisa tienes?</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {quoteForm.urgency.map((u, i) => (
                    <label
                      key={u.value}
                      className="cursor-pointer rounded-xl border border-white/12 bg-night/70 px-3 py-3 text-center transition-[border-color,background-color] duration-150 ease-[ease] hover-fine:border-white/25 has-[:checked]:border-sky has-[:checked]:bg-sky/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky"
                    >
                      <input type="radio" name="urgencia" value={u.value} defaultChecked={i === 0} className="sr-only" />
                      <span className="block font-display text-sm font-semibold text-white">{u.label}</span>
                      <span className="block text-xs text-fog">{u.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5">
                <label htmlFor={`${formId}-mensaje`} className="text-sm font-medium text-white">
                  Cuéntanos qué pasa <span className="font-normal text-fog">(opcional)</span>
                </label>
                <textarea id={`${formId}-mensaje`} name="mensaje" rows={3} maxLength={1000} className={`${field} resize-y`} placeholder="Ej.: mancha en el techo del baño que crece desde hace una semana" />
              </div>

              <div className="mt-5">
                <span className="text-sm font-medium text-white">
                  Foto <span className="font-normal text-fog">(opcional)</span>
                </span>
                {preview ? (
                  <div className="mt-2 flex items-center gap-4 rounded-xl border border-white/12 bg-night/70 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Vista previa de la foto adjunta" className="size-16 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-sm text-mist">{photo?.name}</span>
                    <button type="button" onClick={clearPhoto} className="btn btn-ghost size-10 min-h-10 p-0" aria-label="Quitar foto">
                      <CloseIcon className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={`${formId}-foto`}
                    className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-night/50 px-4 py-4 text-mist transition-[border-color] duration-150 ease-[ease] hover-fine:border-sky/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky"
                  >
                    <CameraIcon className="size-6 shrink-0 text-sky" />
                    <span className="text-sm">
                      <span className="font-semibold text-white">Añadir foto</span> de la mancha, fuga o avería
                    </span>
                    <input ref={fileRef} id={`${formId}-foto`} name="foto" type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
                  </label>
                )}
                {errors.foto && <p className="mt-1.5 text-sm text-urgent">{errors.foto}</p>}
              </div>

              {/* Anti-spam (campo trampa, invisible para personas) */}
              <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                <label>
                  Empresa
                  <input type="text" name="empresa" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="mt-5">
                <label className="flex items-start gap-3 text-sm text-mist">
                  <input
                    type="checkbox"
                    name="consentimiento"
                    required
                    className="mt-0.5 size-5 shrink-0 accent-sky"
                    aria-invalid={!!errors.consentimiento}
                    aria-describedby={errors.consentimiento ? `${formId}-consent-err` : undefined}
                  />
                  <span>
                    Acepto que {business.name} use mis datos para contactarme y preparar el presupuesto, según la{" "}
                    <a href="/privacidad" className="text-sky underline underline-offset-4">
                      política de privacidad
                    </a>
                    .
                  </span>
                </label>
                {errors.consentimiento && <p id={`${formId}-consent-err`} className="mt-1.5 text-sm text-urgent">{errors.consentimiento}</p>}
              </div>

              {status === "error" && (
                <div role="alert" className="mt-5 rounded-xl border border-urgent/40 bg-urgent/10 p-4 text-sm text-white">
                  <p className="font-semibold">No hemos podido enviar el formulario.</p>
                  <p className="mt-1 text-mist">Envíanos lo mismo por WhatsApp (puedes adjuntar la foto allí) o llámanos.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <WhatsAppButton message={summary} />
                    <CallButton />
                  </div>
                </div>
              )}

              <button type="submit" disabled={status === "sending"} className="btn btn-aqua mt-6 w-full min-h-14 text-lg disabled:cursor-progress disabled:opacity-70">
                {status === "sending" ? "Enviando…" : "Pedir presupuesto gratuito"}
              </button>
              <p id={`${formId}-note`} className="mt-3 text-center text-xs text-fog">
                Sin compromiso. Te llamamos para concretar. ¿Es urgente? Llama al{" "}
                <a href={`tel:${contact.mobile.e164}`} className="text-white underline underline-offset-4">
                  {contact.mobile.display}
                </a>
                {" o "}
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
                  escríbenos por WhatsApp
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
