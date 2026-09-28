import { services } from "@/config/site";
import { CheckIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "./ServiceCard";
import { ServiceIconsLoader } from "./ServiceIconsLoader";

export function Services() {
  return (
    <section id="servicios" data-stop className="relative py-24 md:py-32 cv-auto" aria-labelledby="servicios-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="servicios-title" eyebrow="Servicios" title={services.title} intro={services.intro} />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.items.map((item, i) => (
            <ServiceCard key={item.title} item={item} index={i} />
          ))}
          <div data-reveal style={{ ["--i" as string]: services.items.length }} className="panel flex flex-col justify-center p-6 sm:p-7 lg:col-span-2">
            <p className="eyebrow">{services.extras.title}</p>
            <ul className="mt-4 grid gap-2.5">
              {services.extras.items.map((x) => (
                <li key={x} className="flex items-center gap-2.5 text-white">
                  <CheckIcon className="size-4.5 shrink-0 text-sky" strokeWidth={2.4} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <ServiceIconsLoader sectionId="servicios" />
    </section>
  );
}
