import { problems } from "@/config/site";
import { DropIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Problems() {
  return (
    <section id="problemas" data-stop className="relative py-24 md:py-32 cv-auto" aria-labelledby="problemas-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="problemas-title" eyebrow="Señales de una fuga" title={problems.title} intro={problems.intro} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.items.map((p, i) => (
            <li key={p.q} data-reveal style={{ ["--i" as string]: i }} className="panel p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky/10 text-sky">
                <DropIcon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-white">{p.q}</h3>
              <p className="mt-2 leading-relaxed text-mist">{p.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
