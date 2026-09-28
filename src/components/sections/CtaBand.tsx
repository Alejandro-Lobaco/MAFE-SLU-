import { contact } from "@/config/site";
import { CallButton, WhatsAppButton } from "@/components/ui/CtaButtons";
import { landlineHref } from "@/lib/links";

/** CTA intermedia (una cada dos secciones). Sin animación propia: el contenido manda. */
export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <aside className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6" aria-label="Contacto rápido">
      <div
        data-reveal
        className="flex flex-col gap-6 overflow-hidden rounded-3xl border border-sky/20 bg-[linear-gradient(120deg,rgba(30,144,255,0.16),rgba(13,28,51,0.92)_55%)] p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="max-w-xl">
          <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</p>
          <p className="mt-2 text-mist">{text}</p>
          <p className="mt-3 text-sm text-fog">
            Fijo:{" "}
            <a href={landlineHref} className="font-semibold text-white underline decoration-white/30 underline-offset-4">
              {contact.landline.display}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CallButton size="lg" showNumber />
          <WhatsAppButton size="lg" />
        </div>
      </div>
    </aside>
  );
}
