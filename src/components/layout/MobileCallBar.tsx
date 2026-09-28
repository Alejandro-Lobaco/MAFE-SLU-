import { contact } from "@/config/site";
import { callHref, whatsappHref } from "@/lib/links";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";

/** Barra inferior fija en móvil. Siempre visible, sin animación. */
export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-night/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <div className="grid grid-cols-2 gap-2.5">
        <a href={callHref} className="btn btn-call min-h-13 text-base" aria-label={`Llamar al ${contact.mobile.display}`}>
          <PhoneIcon className="size-5" strokeWidth={2.2} />
          Llamar
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost min-h-13 text-base"
          aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
        >
          <WhatsAppIcon className="size-5 text-[#25D366]" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
