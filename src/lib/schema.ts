import { address, business, contact, faq, hours, ratings, serviceArea, services } from "@/config/site";

/** schema.org Plumber (subtipo de LocalBusiness) para SEO local. */
export function plumberSchema() {
  const url = business.url.replace(/\/$/, "");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    "@id": `${url}/#negocio`,
    name: `${business.name} — ${business.tagline}`,
    legalName: business.legalName,
    alternateName: [business.brand, "Fontanería, Busca Fugas, MAFE SLU"],
    url,
    image: `${url}/opengraph-image`,
    logo: `${url}/icon.svg`,
    telephone: contact.mobile.e164,
    contactPoint: [
      { "@type": "ContactPoint", telephone: contact.mobile.e164, contactType: "customer service", availableLanguage: "es", areaServed: "ES" },
      { "@type": "ContactPoint", telephone: contact.landline.e164, contactType: "customer service", availableLanguage: "es", areaServed: "ES" },
    ],
    priceRange: business.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.streetSchema,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    areaServed: [
      { "@type": "City", name: "Zaragoza" },
      ...serviceArea.towns.map((name) => ({ "@type": "Place", name })),
    ],
    knowsAbout: ["detección de fugas", "localización de fugas de agua", "fontanería", "desatascos", "calefacción", "calderas"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de fontanería",
      itemListElement: services.items.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.text, areaServed: "Zaragoza" },
      })),
    },
    sameAs: [ratings.trustlocal.url],
  };

  if (business.email) data.email = business.email;
  if (business.foundedYear) data.foundingDate = String(business.foundedYear);
  if (address.geo) data.geo = { "@type": "GeoCoordinates", latitude: address.geo.lat, longitude: address.geo.lng };
  if (hours.schema.length) {
    data.openingHoursSpecification = hours.schema.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    }));
  }
  if (ratings.google.count) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratings.google.value,
      bestRating: ratings.google.best,
      worstRating: 1,
      ratingCount: ratings.google.count,
    };
  }
  return data;
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
