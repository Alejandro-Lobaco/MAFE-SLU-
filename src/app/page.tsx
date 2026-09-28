import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileCallBar } from "@/components/layout/MobileCallBar";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { MapSection } from "@/components/sections/MapSection";
import { Problems } from "@/components/sections/Problems";
import { Process } from "@/components/sections/Process";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Reviews } from "@/components/sections/Reviews";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { Services } from "@/components/sections/Services";
import { WhyMafe } from "@/components/sections/WhyMafe";
import { SceneLayer } from "@/components/three/SceneLayer";
import { Suspense } from "react";
import { ctaBands } from "@/config/site";

/*
 * Orden: Hero · Problemas · Servicios · [CTA] · Por qué MAFE · Proceso · [CTA] ·
 * Opiniones · Zona · [CTA] · FAQ · Presupuesto · Mapa · Pie
 */
export default function Home() {
  return (
    <>
      <a href="#presupuesto" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-sky focus:px-4 focus:py-2 focus:text-night">
        Saltar al formulario de presupuesto
      </a>
      <SceneLayer />
      <Header />
      {/* Cada <Suspense> es un punto donde React puede ceder el hilo al hidratar: menos bloqueo (TBT) */}
      <main className="relative z-10">
        <Hero />
        <Suspense>
          <Problems />
        </Suspense>
        <Suspense>
          <Services />
        </Suspense>
        <CtaBand {...ctaBands[0]} />
        <Suspense>
          <WhyMafe />
        </Suspense>
        <Suspense>
          <Process />
        </Suspense>
        <CtaBand {...ctaBands[1]} />
        <Suspense>
          <Reviews />
        </Suspense>
        <Suspense>
          <ServiceArea />
        </Suspense>
        <CtaBand {...ctaBands[2]} />
        <Suspense>
          <Faq />
        </Suspense>
        <Suspense>
          <QuoteForm />
        </Suspense>
        <Suspense>
          <MapSection />
        </Suspense>
      </main>
      <Suspense>
        <Footer />
      </Suspense>
      <MobileCallBar />
    </>
  );
}
