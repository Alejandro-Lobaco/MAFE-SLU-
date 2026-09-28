import { stats, whyUs } from "@/config/site";
import { Counter } from "@/components/ui/Counter";
import { BoltIcon, HandIcon, ScanIcon, TagIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS = [ScanIcon, BoltIcon, HandIcon, TagIcon];

export function WhyMafe() {
  return (
    <section id="por-que" data-stop className="relative py-24 md:py-32 cv-auto" aria-labelledby="porque-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="porque-title" eyebrow="Por qué MAFE" title={whyUs.title} intro={whyUs.intro} />

        <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} data-reveal style={{ ["--i" as string]: i }} className="panel flex flex-col p-5 sm:p-6">
              <dt className="order-2 mt-1 text-sm text-fog">{s.label}</dt>
              <dd className="order-1 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                <Counter value={s.value} decimals={s.decimals} prefix={"prefix" in s ? s.prefix : ""} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={item.title} data-reveal style={{ ["--i" as string]: i }} className="panel p-6">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky/10 text-sky">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-mist">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
