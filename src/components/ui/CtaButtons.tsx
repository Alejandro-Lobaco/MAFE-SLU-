import { contact, hero } from "@/config/site";
import { callHref, whatsappHref } from "@/lib/links";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

type Props = { className?: string; size?: "md" | "lg"; callLabel?: string; showNumber?: boolean };

/** Botón de llamada: el único elemento con el naranja de urgencia. */
export function CallButton({ className = "", size = "md", callLabel = hero.callLabel, showNumber = false }: Props) {
  return (
    <a
      href={callHref}
      className={`btn btn-call ${size === "lg" ? "min-h-14 px-6 text-lg" : ""} ${className}`}
      aria-label={`${callLabel} ${contact.mobile.display}`}
    >
      <PhoneIcon className="size-5 shrink-0" strokeWidth={2.2} />
      <span>{callLabel}</span>
      {/* espacio real para el nombre accesible ("Llamar ahora 661…"); en flex no ocupa sitio */}
      {showNumber && " "}
      {showNumber && <span className="hidden font-medium opacity-80 tabular-nums sm:inline">{contact.mobile.display}</span>}
    </a>
  );
}

export function WhatsAppButton({ className = "", size = "md", message }: Props & { message?: string }) {
  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-ghost ${size === "lg" ? "min-h-14 px-6 text-lg" : ""} ${className}`}
      aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
    >
      <WhatsAppIcon className="size-5 shrink-0 text-[#25D366]" />
      <span>{hero.whatsappLabel}</span>
    </a>
  );
}
