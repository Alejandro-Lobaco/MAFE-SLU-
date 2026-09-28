import { hero, ratings } from "@/config/site";
import { CallButton, WhatsAppButton } from "@/components/ui/CtaButtons";
import { CheckIcon } from "@/components/ui/Icons";
import { Stars } from "@/components/ui/Stars";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-svh overflow-hidden" aria-labelledby="hero-title">
      <HeroVisual />
      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col justify-start px-4 pt-24 pb-56 sm:px-6 sm:pt-28 md:justify-center md:pt-24 md:pb-24">
        <div className="max-w-xl lg:max-w-[40rem]">
          <p className="eyebrow">
            {hero.eyebrow}
            <span className="hidden sm:inline"> · {hero.eyebrowDetail}</span>
          </p>
          <h1 id="hero-title" className="mt-4 font-display text-[clamp(2.5rem,1.4rem+4.6vw,4.9rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white text-balance">
            {hero.title} <span className="block bg-gradient-to-r from-sky to-aqua bg-clip-text text-transparent">{hero.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-mist sm:text-lg">{hero.subtitle}</p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex">
            <CallButton size="lg" showNumber className="px-4 sm:px-6" />
            <WhatsAppButton size="lg" className="px-4 sm:px-6" />
          </div>

          <ul className="mt-6 hidden flex-wrap gap-x-5 gap-y-2 text-sm text-mist sm:flex">
            {hero.reassurance.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-4 text-sky" strokeWidth={2.4} />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8">
            <a
              href={ratings.google.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-night/75 py-2 pr-4 pl-3 text-sm transition-colors duration-150 ease-[ease] hover-fine:border-white/25"
            >
              <span className="font-display text-base font-semibold text-white">{ratings.google.value.toString().replace(".", ",")}</span>
              <Stars value={ratings.google.value} />
              <span className="text-fog">en Google</span>
            </a>
            <a
              href={ratings.trustlocal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-white/12 bg-night/75 px-4 py-2 text-sm transition-colors duration-150 ease-[ease] hover-fine:border-white/25 sm:inline-flex"
            >
              <span className="font-display text-base font-semibold text-white">{ratings.trustlocal.value.toString().replace(".", ",")}</span>
              <span className="text-fog">Trustlocal · {ratings.trustlocal.label}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
