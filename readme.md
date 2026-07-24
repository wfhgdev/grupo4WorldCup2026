# World Cup 2026 Web · Grupo 4

![Captura de la aplicación](images/pantallazo.png)

Plataforma web moderna, interactiva y responsive sobre la Copa Mundial FIFA 2026. Consume datos en tiempo real de [Football-Data.org](https://www.football-data.org/) a través de un proxy serverless.

Proyecto del módulo **Frontend: JavaScript & APIs** en **Factoría 5**.

---

## Enlaces

* **Repositorio:** [github.com/wfhgdev/grupo4WorldCup2026](https://github.com/wfhgdev/grupo4WorldCup2026.git)
* **Despliegue (Vercel):** [wc-2026-prueba.vercel.app](https://wc-2026-prueba.vercel.app/index.html)
* **Tablero (GitHub Projects):** [Sprint Backlog](https://github.com/users/wfhgdev/projects/1/views/2)
* **Diseño (Figma):** [Prototipo](https://www.figma.com/design/24TjyRzS6OAZhD1D2kwCJm/PROY-WORLD-CUP26?node-id=70-96)
* **Manual educativo:** [`learn/index.html`](learn/index.html) — guías paso a paso del código (ES/EN)

---

## Secciones de la aplicación

Arquitectura semántica (`header`, `main`, footer inyectado) con 5 vistas:

1. **Inicio** — Hero, bento grid y accesos a Partidos, Grupos, Eliminatorias y Estadísticas.
2. **Partidos** — Calendario con filtros por estado (`Programados`, `En vivo`, `Finalizados`, `Todos`), escudos, skeleton loaders y badges de estado.
3. **Grupos** — Clasificación de la fase de grupos (Puntos, PJ, PG, PE, PP, GF, GC, DG), calculada desde los partidos cuando hace falta.
4. **Eliminatorias** — Árbol visual desde octavos hasta la final, con conectores y resaltado de partidos.
5. **Estadísticas** — Goleadores (Bota de Oro), equipos más goleadores y equipos con más goles encajados.

---

## Stack y arquitectura

| Pieza | Uso |
| --- | --- |
| **HTML5** | Estructura semántica y accesible |
| **CSS3 + Tailwind CSS** (CDN) | Layouts, responsive y tokens de diseño en `js/tailwindCustom.js` + `index.css` |
| **Vanilla JavaScript (ES6+)** | DOM, eventos, `async/await`, filtrado y renderizado |
| **Fetch API** | Datos vía proxy hacia Football-Data.org v4 |
| **Vercel Serverless** | `api/proxy.js` — resuelve CORS y oculta el token de la API |
| **localStorage** | Caché de respuestas (TTL 5 min) y preferencia de cookies |
| **i18n** | Diccionarios ES que traducen datos en inglés de la API (`js/i18n/`) |
| **Material Symbols** | Iconografía de la UI |

> **Nota:** `proxy.php` en la raíz es legado; el cliente actual **solo** usa `/api/proxy`.

### Capas compartidas

* **`js/api.js`** — cliente único: caché → proxy → validación → guardado.
* **`js/i18n/`** — traducción de equipos, estados, fases y textos de UI (no es un selector de idioma de la app).
* **`components/footer/`** — footer HTML inyectado por `fetch` en todas las páginas.
* **`js/cookieConsent.js`** — banner de consentimiento accesible.
* **`js/teamImage.js`** — escudos reutilizables con fallback.
* **`js/menu.js`** — menú móvil fullscreen.

---

## Estructura del proyecto

```
├── index.html                 # Inicio (estático + footer/cookies/menú)
├── index.css                  # Estilos base y crests
├── api/
│   └── proxy.js               # Proxy serverless (Vercel)
├── js/
│   ├── api.js                 # fetch + caché TTL 5 min
│   ├── menu.js
│   ├── cookieConsent.js
│   ├── teamImage.js
│   ├── tailwindCustom.js
│   └── i18n/                  # Motor + diccionarios ES
├── components/footer/         # Footer compartido
├── matches/ · groups/ · knockout/ · stats/
├── learn/                     # Manual educativo (lecciones 00–13)
├── images/
└── proxy.php                  # Legado (no lo usa el cliente)
```

---

## Cómo arrancar en local

Las rutas absolutas (`/api/proxy`, `/components/...`) **no funcionan** con `file://`. Sirve el proyecto por HTTP:

```bash
npx serve .
# o
python -m http.server 8000
```

Abre la URL que indique el servidor (por ejemplo `http://localhost:3000`).

Para datos en vivo hace falta desplegar el proxy (p. ej. en Vercel) o apuntar un entorno local equivalente a `api/proxy.js`. En Vercel define el token de Football-Data.org como variable de entorno del proyecto.

### Validación HTML

```bash
npm install
npm test              # todos los HTML
npm run test:learn    # solo learn/*.html
```

---

## Manual `learn/`

Carpeta educativa con explicaciones del código real (ES/EN):

| Lección | Tema |
| --- | --- |
| 00 | Introducción y estructura |
| 01 | HTML, CSS y Tailwind |
| 02 | JavaScript |
| 03 | API y proxy serverless |
| 04 | Sistema de caché |
| 05 | Internacionalización |
| 06–10 | Inicio, Partidos, Grupos, Eliminatorias, Estadísticas |
| 11 | Menú móvil |
| 12 | Componentes compartidos |
| 13 | Cómo reconstruir el proyecto desde cero |

Entrada: [`learn/index.html`](learn/index.html).

---

## Planificación y sprints

Gestión ágil con **GitHub Projects**:

* **Sprint 1 (10 jul):** Figma, HTML/CSS base, maquetación del árbol, primeras pruebas de API.
* **Sprint 2 / entrega (17 jul):** Lógica JS, filtros, estadísticas, clean code, despliegue y bugs.
* **Post-entrega:** proxy serverless, caché, i18n, componentes compartidos, menú móvil y manual `learn/`.

---

## Flujo de trabajo

### Ramas

* `main` / `master` — producción estable
* `develop` — integración
* `feature/…`, `fix/…`, `docs/…` — trabajo por tarea

### Commits (Conventional Commits)

```
feat: add group classification tables
fix: resolve active filter bug on schedule page
```

### Clean Code

* JS modular, una responsabilidad por función.
* API separada del renderizado del DOM.
* Componentes y helpers compartidos en `js/` y `components/`.

---

## Equipo

* **Carlos Javier Pérez Pérez** — *Scrum Master* — [@carlosjper](https://github.com/carlosjper)
* **Konstantin Mlechka** — *Frontend Developer* — [@kvadrakola](https://github.com/kvadrakola)
* **Cristina Rodríguez López** — *Frontend Developer* — [@cristinarodriguezl-dev](https://github.com/cristinarodriguezl-dev)
* **Margarita Bellido Ro** — *Frontend Developer* — [@margaritabellidoroig](https://github.com/margaritabellidoroig)
* **José Loero Niele** — *Frontend Developer* — [@Mltiformacionjose](https://github.com/Mltiformacionjose)
* **William Hernández** — *Product Owner* — [@wfhgdev](https://github.com/wfhgdev)

---

## Cookies

Banner en `js/cookieConsent.js`:

* Primera visita: **Aceptar** / **Rechazar** con el mismo peso visual.
* Se puede cambiar desde el enlace **Cookies** del pie.
* Preferencia en `localStorage` (`wc2026_cookie_consent`).

Este sitio **no** usa cookies de publicidad ni de seguimiento. Solo se guarda la preferencia del usuario y se usa caché técnico. No hay analítica ni CMP de terceros.

> Implementación didáctica con fines de aprendizaje.
