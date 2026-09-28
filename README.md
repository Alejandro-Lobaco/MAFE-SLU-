# Fontanería MAFE SLU — Busca Fugas · Landing page

Landing page de **Fontanería MAFE SLU (Mafe Espacios)**, fontanero en Zaragoza especialista en **detección y localización de fugas sin obras**.

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **React Three Fiber + drei**: red de tuberías 3D, gota con refracción, fuga con partículas (shader propio), anillo escáner y pin
- **GSAP + ScrollTrigger**: recorrido 3D ligado al scroll (hero fijado) y tubería del «Proceso» que se llena
- **Lenis**: smooth scroll en escritorio (en táctil y con movimiento reducido, scroll nativo)
- **Motion**: solo para el muelle de la inclinación de las tarjetas de servicios (cargado en diferido)
- Lista para **Vercel**

---

## 1. Editar los datos del negocio

**Todo el contenido está en [`src/config/site.ts`](src/config/site.ts)**: teléfonos, WhatsApp y su mensaje, dirección, horario, valoraciones, contadores, textos de cada sección, servicios, reseñas, zonas, FAQ, opciones del formulario, SEO y datos legales. No hace falta tocar ningún componente.

Busca `PENDIENTE` en ese archivo. Antes de publicar hay que completar:

| Dato | Dónde | Nota |
|---|---|---|
| Horario | `hours.summary`, `hours.lines`, `hours.schema` | `schema` alimenta a Google (schema.org). Vacío = no se publica |
| CIF, razón social y datos registrales | `business.cif`, `business.legalName`, `business.registry` | Aparecen en el aviso legal y la privacidad |
| Email de contacto | `business.email` | Opcional; si se rellena aparece en el pie y en los textos legales |
| Años y trabajos realizados | `stats` | Hoy son valores de ejemplo (+15 años, +2500 trabajos) |
| Nº de reseñas de Google | `ratings.google.count` | Directorios públicos indicaban 57 en sep-2026: **compruébalo**. `null` = no se publica la valoración en schema.org |
| Reseñas | `reviews.items` | Son **textos de ejemplo** y se muestran con la etiqueta «Reseña de ejemplo». Sustitúyelas por reseñas reales (con permiso) y pon `placeholder: false` |
| Equipos de detección | `services.items[0].bullets`, `faq` | Detección acústica, termografía y gas trazador: confirma cuáles usa MAFE |
| Coordenadas | `address.geo` | Opcional, para schema.org |

Los textos legales (`/aviso-legal`, `/privacidad`, `/cookies`) son una base orientativa: conviene que los revise un asesor.

## 2. Ejecutar en local

Requisitos: **Node.js 20.9 o superior**.

```bash
npm install
npm run dev          # http://localhost:3000
```

Otros comandos:

```bash
npm run build        # build de producción
npm run start        # sirve la build (http://localhost:3000)
npm run typecheck    # comprobación de tipos
```

Para probar cada versión del 3D sin cambiar de dispositivo, añade `?tier=` a la URL:

| URL | Qué ves |
|---|---|
| `/?tier=high` | Escena completa (escritorio con buena GPU) |
| `/?tier=low` | Escena simplificada (móvil / GPU modesta) |
| `/?tier=static` | Fotograma fijo (lo que ve quien tiene activado «reducir movimiento») |
| `/?tier=none` | Ilustración SVG (sin WebGL o con ahorro de datos) |

## 3. Formulario de presupuesto

El formulario envía a `POST /api/presupuesto` (nombre, teléfono, tipo de problema, urgencia, mensaje y foto opcional; la foto se comprime en el navegador a 1600 px).

Para recibir las solicitudes por email se usa [Resend](https://resend.com) (plan gratuito suficiente). Copia `.env.example` a `.env.local` y rellena:

```bash
RESEND_API_KEY=re_xxxxxxxx
QUOTE_TO_EMAIL=correo@donde-recibir.es
QUOTE_FROM_EMAIL="Web MAFE <web@mafeespacios.com>"   # dominio verificado en Resend
NEXT_PUBLIC_SITE_URL=https://mafeespacios.com
```

Si no se configura, el formulario **no pierde el contacto**: muestra un aviso y un botón de WhatsApp con la solicitud ya escrita, además del botón de llamada.

## 4. Desplegar en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio. Vercel detecta Next.js automáticamente (no hay que cambiar nada del build).
3. En **Settings → Environment Variables** añade las variables del apartado 3 (`NEXT_PUBLIC_SITE_URL` con el dominio definitivo).
4. **Deploy**.
5. En **Settings → Domains** añade `mafeespacios.com` (y `www`) y apunta el DNS como indique Vercel.

Con la CLI:

```bash
npm i -g vercel
vercel            # primer despliegue (preview)
vercel --prod     # producción
```

Tras publicar: da de alta el dominio en Google Search Console, envía `https://mafeespacios.com/sitemap.xml` y pon la URL de la web en el perfil de Google Business.

---

## Cómo está hecho

### Estructura

```
src/
  config/site.ts            ← TODOS los datos y textos editables
  app/
    layout.tsx              metadata SEO, Open Graph, JSON-LD (Plumber)
    page.tsx                orden de secciones
    opengraph-image.tsx     imagen para redes sociales (generada)
    api/presupuesto/        envío del formulario (Resend)
    aviso-legal/ privacidad/ cookies/
  components/
    three/                  escena 3D (carga diferida)
    sections/               secciones de la página
    layout/                 cabecera, barra móvil, pie
    providers/Providers.tsx nivel de 3D, Lenis, entradas al hacer scroll
  lib/
    device-tier.ts          detección de GPU / móvil / movimiento reducido
    scene-store.ts          estado compartido DOM ↔ 3D
    gsap.ts, use-gsap.ts    GSAP con las curvas del sistema (carga diferida)
```

### Rendimiento

- three.js no está en el JS inicial: se carga con el primer gesto del usuario (o tras 2,5 s de reposo en escritorio). Hasta entonces se ve una ilustración SVG con la misma composición.
- El canvas usa `frameloop="demand"`: solo pinta mientras el hero está visible, hay scroll o la cámara se mueve. Al llegar al formulario se oculta y deja de pintar.
- Detección de nivel (`src/lib/device-tier.ts`): renderizado por software, ahorro de datos, GPU modesta, pocos núcleos o poca memoria. En marcha, si baja de ~33 fps, la escena reduce resolución, después se simplifica y, si hace falta, se queda en un fotograma fijo.
- GSAP/ScrollTrigger, Lenis y Motion se cargan después de hidratar. Las secciones bajo el hero usan `content-visibility: auto` y límites `<Suspense>` para hidratar por partes.
- El mapa de Google solo se carga al pulsarlo: mejor rendimiento y sin cookies de terceros hasta que el usuario lo pide.

Lighthouse (build de producción, local, sep-2026): escritorio 100/100/100/100 (también con `?tier=high`); móvil 92–95 en rendimiento y 100 en accesibilidad, buenas prácticas y SEO.

### Animación

Criterios de la skill `animate` (Emil Kowalski), con tokens en `globals.css` y `lib/gsap.ts`:

- Curvas: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` y `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Lo ligado al scroll es lineal: el scroll es el reloj.
- Todo el «espectáculo» está en el hero (fuga → escáner → pin), en la tubería del proceso y en la confirmación del formulario.
- Menú, navegación y anclas: sin animación.
- Hover solo con `(hover: hover) and (pointer: fine)`. Botones: pulsación a `scale(0.97)` en 120 ms.
- `prefers-reduced-motion`: 3D en fotograma fijo, sin Lenis ni hero fijado, entradas solo con opacidad, contadores con el valor final y tubería ya llena.
