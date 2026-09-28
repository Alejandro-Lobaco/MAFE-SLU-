import { faq } from "@/config/site";
import { PlusIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqSchema } from "@/lib/schema";

/** Acordeón nativo (<details>): accesible, sin JS. La apertura se suaviza con CSS donde hay soporte. */
export function Faq() {
  return (
    <section id="faq" data-stop className="relative py-24 md:py-32 cv-auto" aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading id="faq-title" eyebrow="Dudas" title={faq.title} intro="Si no encuentras tu pregunta, llámanos: te respondemos al momento." />
        <div data-reveal className="divide-y divide-white/10 border-y border-white/10">
          {faq.items.map((item) => (
            <details key={item.q} className="faq-item group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-medium text-white">
                {item.q}
                <PlusIcon className="faq-chevron size-5 shrink-0 text-sky" />
              </summary>
              <p className="pb-6 pr-10 leading-relaxed text-mist">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
