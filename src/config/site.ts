/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL NEGOCIO — Fontanería MAFE SLU · Busca Fugas (Mafe Espacios)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Edita aquí teléfonos, horario, textos, servicios, reseñas y datos legales.
 *  No hace falta tocar ningún componente: toda la web lee de este archivo.
 *
 *  Busca «PENDIENTE» para ver los datos que faltan por confirmar con el cliente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type IconKey = "drop" | "wrench" | "radiator" | "boiler" | "toilet" | "pool";

// ─── Identidad ───────────────────────────────────────────────────────────────
export const business = {
  name: "Fontanería MAFE",
  legalName: "Fontanería MAFE SLU", // PENDIENTE: razón social exacta tal y como figura en el Registro Mercantil
  tagline: "Busca Fugas",
  brand: "Mafe Espacios",
  // URL pública. Se puede sobrescribir con la variable NEXT_PUBLIC_SITE_URL en Vercel.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mafeespacios.com",
  email: "", // PENDIENTE: email de contacto (se muestra en el pie y en los textos legales si se rellena)
  cif: "[PENDIENTE: CIF]",
  registry: "[PENDIENTE: datos de inscripción en el Registro Mercantil de Zaragoza]",
  foundedYear: null as number | null, // PENDIENTE: año de fundación (opcional, se usa en schema.org)
  priceRange: "€€",
};

// ─── Contacto ────────────────────────────────────────────────────────────────
export const contact = {
  mobile: { display: "661 97 65 54", e164: "+34661976554" },
  landline: { display: "976 20 54 58", e164: "+34976205458" },
  // Número de WhatsApp en formato internacional sin «+» ni espacios
  whatsappNumber: "34661976554",
  whatsappMessage: "Hola, tengo una fuga/avería y necesito presupuesto",
};

export const address = {
  street: "C. de Nicolás Funes, 2",
  streetSchema: "Calle de Nicolás Funes, 2",
  postalCode: "50014",
  city: "Zaragoza",
  district: "Arrabal",
  region: "Aragón",
  country: "ES",
  // Coordenadas para schema.org. PENDIENTE: copia las exactas desde Google Maps
  // (clic derecho sobre el local → primeras cifras). Déjalo en null para no publicarlas.
  geo: null as { lat: number; lng: number } | null,
  // Consulta que usa el mapa embebido y el enlace «Cómo llegar»
  mapsQuery: "Fontanería, Busca Fugas, MAFE SLU, C. de Nicolás Funes, 2, 50014 Zaragoza",
};

// ─── Horario ─────────────────────────────────────────────────────────────────
export type OpeningHours = {
  days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[];
  opens: string; // "08:00"
  closes: string; // "20:00"
};

export const hours = {
  // PENDIENTE: horario real. Este texto se muestra tal cual en la web.
  summary: "Horario pendiente de confirmar",
  // Líneas opcionales para el pie y la sección de contacto. Ej.: ["Lunes a viernes: 8:00–20:00", "Sábados: 9:00–14:00"]
  lines: [] as string[],
  note: "Urgencias: llámanos y te decimos al momento cuándo podemos ir.",
  // Para Google (schema.org). Déjalo vacío hasta tener el horario real.
  // Ej.: [{ days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "20:00" }]
  schema: [] as OpeningHours[],
};

// ─── Valoraciones y cifras ───────────────────────────────────────────────────
export const ratings = {
  google: {
    value: 4.8,
    best: 5,
    // Nº de reseñas en Google. Directorios públicos indicaban 57 en sep-2026.
    // PENDIENTE: comprobar en el perfil de Google. Si pones null, schema.org no publica la valoración.
    count: 57 as number | null,
    url: "https://www.google.com/maps/search/?api=1&query=Fontaner%C3%ADa%2C+Busca+Fugas%2C+MAFE+SLU+Zaragoza",
  },
  trustlocal: {
    value: 8.9,
    best: 10,
    label: "Top 10 fontaneros de Zaragoza",
    url: "https://trustlocal.es/zaragoza/zaragoza/fontanero/fontaneria-busca-fugas-mafe-slu/",
  },
};

/** Contadores animados de «Por qué MAFE». */
export const stats = [
  { value: 4.8, decimals: 1, suffix: "★", label: "Valoración en Google" },
  { value: 15, decimals: 0, prefix: "+", suffix: "", label: "Años reparando en Zaragoza" }, // PENDIENTE: confirmar
  { value: 2500, decimals: 0, prefix: "+", suffix: "", label: "Trabajos realizados" }, // PENDIENTE: confirmar
  { value: 8.9, decimals: 1, suffix: "/10", label: "Nota en Trustlocal" },
] as const;

// ─── Textos de la portada ────────────────────────────────────────────────────
export const hero = {
  eyebrow: "Fontanero en Zaragoza",
  eyebrowDetail: "Especialistas en detección de fugas",
  title: "Encontramos tu fuga.",
  titleAccent: "Sin romper media casa.",
  subtitle:
    "Localizamos fugas ocultas en Zaragoza con equipos de precisión y abrimos solo donde está el problema. 4,8★ en Google y presupuesto gratuito.",
  callLabel: "Llamar ahora",
  whatsappLabel: "WhatsApp",
  reassurance: ["Presupuesto gratuito", "Precios claros", "Particulares, comunidades y locales"],
  // Lectura del escáner que acompaña a la animación 3D
  hud: {
    idle: "Revisando la instalación",
    scanning: "Escaneando tubería",
    found: "Fuga localizada",
    detail: "Precisión de centímetros · sin obras innecesarias",
  },
};

// ─── Problemas frecuentes ────────────────────────────────────────────────────
export const problems = {
  title: "¿Te suena alguno de estos síntomas?",
  intro: "Casi siempre hay una fuga oculta detrás. Cuanto antes se localiza, menos se rompe y menos cuesta.",
  items: [
    { q: "¿Mancha de humedad?", a: "En techo, pared o suelo, y crece aunque la seques. Suele ser una tubería que pierde agua por dentro." },
    { q: "¿Factura de agua disparada?", a: "Pagas más sin gastar más. Si el contador gira con los grifos cerrados, hay una fuga." },
    { q: "¿Baja la presión?", a: "El agua sale con menos fuerza en duchas y grifos. Puede ser una pérdida en la red o un atasco." },
    { q: "¿Ruido de agua con todo cerrado?", a: "Un siseo o goteo que no sabes de dónde viene. El agua se está escapando por algún sitio." },
    { q: "¿Olor a humedad o moho?", a: "En armarios, rodapiés o baños. La humedad constante daña muebles, pintura y salud." },
    { q: "¿Te avisa el vecino de abajo?", a: "Si le aparece una mancha, la fuga puede estar en tu casa. Te damos informe para el seguro." },
  ],
};

// ─── Servicios ───────────────────────────────────────────────────────────────
export const services = {
  title: "Servicios de fontanería en Zaragoza",
  intro: "Especialistas en fugas y todo lo que rodea al agua de tu casa, comunidad o local.",
  items: [
    {
      icon: "drop" as IconKey,
      title: "Detección y localización de fugas",
      text: "Localizamos la fuga sin obras innecesarias y reparamos solo el punto exacto. Informe con fotos para tu seguro.",
      bullets: ["Detección acústica", "Cámara termográfica", "Gas trazador"], // PENDIENTE: confirmar equipos que usa MAFE
      featured: true,
    },
    {
      icon: "wrench" as IconKey,
      title: "Tuberías, desagües y desatascos",
      text: "Reparación e instalación de tuberías, bajantes y desagües. Desatascos en viviendas, comunidades y locales.",
      bullets: ["Reparación e instalación", "Desatascos", "Bajantes"],
    },
    {
      icon: "radiator" as IconKey,
      title: "Calefacción y radiadores",
      text: "Radiadores que no calientan, purgados, fugas en circuito, cambios de válvulas e instalación nueva.",
      bullets: ["Purgado y equilibrado", "Válvulas y detentores", "Instalación"],
    },
    {
      icon: "boiler" as IconKey,
      title: "Calderas",
      text: "Revisión, reparación y sustitución de calderas y termos. Te asesoramos para que gastes menos.",
      bullets: ["Averías", "Sustitución", "Mantenimiento"],
    },
    {
      icon: "toilet" as IconKey,
      title: "Baños, cocinas y sanitarios",
      text: "Inodoros, cisternas, grifería, fregaderos y reformas de baño completas con acabados cuidados.",
      bullets: ["Sanitarios y grifería", "Reforma de baño", "Cocinas"],
    },
    {
      icon: "pool" as IconKey,
      title: "Piscinas",
      text: "Localización de fugas en piscinas, reparación de conducciones y mantenimiento de temporada.",
      bullets: ["Fugas en vaso y tuberías", "Depuración", "Mantenimiento"],
    },
  ],
  extras: {
    title: "También hacemos",
    items: ["Reformas integrales", "Mantenimiento preventivo", "Mantenimiento correctivo", "Comunidades de vecinos", "Locales comerciales"],
  },
};

// ─── Por qué MAFE ────────────────────────────────────────────────────────────
export const whyUs = {
  title: "Por qué elegir MAFE",
  intro: "Somos fontaneros del barrio del Arrabal. Trabajamos como nos gustaría que trabajaran en nuestra casa.",
  items: [
    { title: "Sin obras innecesarias", text: "Primero localizamos, luego abrimos. Solo el hueco imprescindible para reparar." },
    { title: "Rapidez", text: "Las urgencias van primero. Te decimos al momento cuándo podemos ir." },
    { title: "Trato cercano", text: "Te explicamos qué pasa y qué opciones tienes, sin tecnicismos ni prisas." },
    { title: "Precios transparentes", text: "Presupuesto gratuito y cerrado antes de empezar. Sin sorpresas en la factura." },
  ],
};

// ─── Proceso ─────────────────────────────────────────────────────────────────
export const workProcess = {
  title: "Cómo trabajamos",
  intro: "Cuatro pasos, sin sorpresas. Sabes en todo momento qué hacemos y por qué.",
  steps: [
    { title: "Diagnóstico", text: "Revisamos la instalación y localizamos el origen exacto con equipos de detección." },
    { title: "Plan", text: "Te explicamos la solución y te damos presupuesto cerrado. Tú decides." },
    { title: "Reparación", text: "Abrimos solo lo imprescindible, reparamos y dejamos la zona limpia." },
    { title: "Verificación", text: "Probamos presión y estanqueidad. Te entregamos informe para el seguro si lo necesitas." },
  ],
};

// ─── Opiniones ───────────────────────────────────────────────────────────────
// IMPORTANTE: las reseñas con placeholder: true son TEXTOS DE EJEMPLO y se muestran
// con la etiqueta «Reseña de ejemplo». Sustitúyelas por reseñas reales (con permiso
// del cliente) y pon placeholder: false. Publicar reseñas inventadas es ilegal.
export const reviews = {
  title: "Lo que dicen nuestros clientes",
  intro: "4,8 de 5 en Google. Estas son algunas de las opiniones.",
  items: [
    { author: "María L.", place: "Actur", rating: 5, text: "Tenía una mancha en el techo del vecino y nadie encontraba el origen. Vinieron el mismo día, localizaron la fuga en la tubería del baño y solo abrieron un hueco pequeño.", placeholder: true },
    { author: "Comunidad Av. Cataluña", place: "Arrabal", rating: 5, text: "Nos detectaron una fuga en la bajante general sin levantar el portal. Presupuesto claro y trabajo limpio. Muy recomendables.", placeholder: true },
    { author: "Javier R.", place: "Delicias", rating: 5, text: "La factura del agua se había duplicado. En una mañana lo tenían localizado y reparado. Trato muy cercano y precio justo.", placeholder: true },
    { author: "Lucía P.", place: "Utebo", rating: 5, text: "Perdíamos agua en la piscina cada semana. Encontraron la fuga en la conducción del skimmer y nos lo arreglaron antes del verano.", placeholder: true },
    { author: "Bar El Rincón", place: "Casco Histórico", rating: 5, text: "Atasco en el local un viernes por la tarde. Llegaron rápido, lo solucionaron y nos explicaron cómo evitarlo.", placeholder: true },
  ],
};

// ─── Zona de servicio ────────────────────────────────────────────────────────
export const serviceArea = {
  title: "Zona de servicio",
  intro: "Desde el Arrabal a toda Zaragoza capital y municipios cercanos.",
  districts: [
    "Arrabal", "Actur", "Centro", "Casco Histórico", "Delicias", "Universidad", "Las Fuentes", "San José",
    "Torrero", "La Almozara", "Oliver", "Valdefierro", "Miralbueno", "Casablanca", "Valdespartera",
    "Rosales del Canal", "Arcosur", "Parque Goya", "Santa Isabel", "Juslibol",
  ],
  towns: [
    "Utebo", "Casetas", "Cuarte de Huerva", "Cadrete", "María de Huerva", "Villanueva de Gállego",
    "San Juan de Mozarrifar", "La Puebla de Alfindén", "Alfajarín", "Pastriz", "Movera", "Montañana",
    "Garrapinillos", "Villamayor de Gállego", "Pinseque", "Zuera",
  ],
  note: "¿Tu localidad no aparece? Llámanos: probablemente también llegamos.",
};

// ─── Preguntas frecuentes ────────────────────────────────────────────────────
export const faq = {
  title: "Preguntas frecuentes",
  items: [
    {
      q: "¿Cómo encontráis una fuga sin romper?",
      a: "Combinamos equipos de detección (escucha acústica, cámara termográfica y gas trazador, según el caso) para marcar el punto exacto de la fuga. Así solo abrimos el hueco imprescindible para repararla.",
    },
    {
      q: "¿Cuánto cuesta localizar una fuga?",
      a: "Depende del tipo de instalación y de la zona. El presupuesto es gratuito y te decimos el precio cerrado antes de empezar, sin sorpresas.",
    },
    {
      q: "¿El seguro del hogar lo cubre?",
      a: "Muchas pólizas cubren la localización y reparación de fugas. Te entregamos un informe con fotos y la ubicación de la fuga para que lo presentes a tu aseguradora.",
    },
    {
      q: "¿Cuándo podéis venir?",
      a: "Las urgencias tienen prioridad. Llámanos o escríbenos por WhatsApp y te damos hora en el momento.",
    },
    {
      q: "¿Trabajáis con comunidades de vecinos y locales comerciales?",
      a: "Sí. Atendemos bajantes, montantes, acometidas y fugas en zonas comunes, y nos coordinamos con el administrador de fincas.",
    },
    {
      q: "¿Qué señales indican que tengo una fuga?",
      a: "Manchas de humedad que crecen, una factura de agua más alta de lo normal, pérdida de presión, ruido de agua con todo cerrado o el contador girando sin consumo.",
    },
    {
      q: "¿Dais garantía de los trabajos?",
      a: "Sí. Todos los trabajos se entregan con factura y garantía. Antes de irnos comprobamos presión y estanqueidad contigo delante.",
    },
  ],
};

// ─── Formulario de presupuesto ───────────────────────────────────────────────
export const quoteForm = {
  title: "Pide tu presupuesto gratuito",
  intro: "Cuéntanos qué pasa y te llamamos lo antes posible. Si puedes, adjunta una foto: nos ayuda a darte un precio más ajustado.",
  problemTypes: [
    "Fuga o humedad",
    "Atasco o desagüe",
    "Calefacción o radiadores",
    "Caldera o termo",
    "Baño, cocina o sanitarios",
    "Piscina",
    "Reforma",
    "Otro",
  ],
  urgency: [
    { value: "hoy", label: "Urgente", hint: "Hoy mismo" },
    { value: "semana", label: "Esta semana", hint: "En unos días" },
    { value: "presupuesto", label: "Sin prisa", hint: "Solo presupuesto" },
  ],
  success: {
    title: "¡Recibido! Te llamamos enseguida",
    text: "Hemos recibido tu solicitud. Si es urgente, llámanos ahora y te atendemos al momento.",
  },
};

// ─── CTAs intermedias (una cada dos secciones) ──────────────────────────────
export const ctaBands = [
  { title: "¿Tienes una fuga ahora mismo?", text: "Cierra la llave de paso y llámanos. Te decimos qué hacer mientras llegamos." },
  { title: "Presupuesto gratuito y sin compromiso", text: "Te damos precio cerrado antes de empezar. Sin letra pequeña." },
  { title: "¿Mancha, goteo o factura rara?", text: "No esperes a que vaya a más. Una fuga pequeña hoy es una obra grande mañana." },
];

// ─── SEO ─────────────────────────────────────────────────────────────────────
export const seo = {
  title: "Fontanero Zaragoza | Detección de fugas Zaragoza sin obras · MAFE",
  description:
    "Fontanero en Zaragoza especialista en detección de fugas: localizamos tu fuga sin romper media casa. 4,8★ en Google, presupuesto gratuito. Llama al 661 97 65 54.",
  keywords: [
    "fontanero Zaragoza",
    "detección de fugas Zaragoza",
    "busca fugas Zaragoza",
    "localizar fuga de agua",
    "fontanería Arrabal",
    "desatascos Zaragoza",
    "reparación calderas Zaragoza",
  ],
};

// ─── Navegación ──────────────────────────────────────────────────────────────
export const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#opiniones", label: "Opiniones" },
  { href: "#zona", label: "Zona" },
  { href: "#faq", label: "FAQ" },
];
