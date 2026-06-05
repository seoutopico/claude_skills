# Browser Console Automation

Skill para [Claude Code](https://claude.ai/code) que **automatiza tareas en webs
donde ya tienes sesión iniciada** ejecutando un script en la consola del
navegador, en lugar de navegar clic a clic. Sirve para **leer** (extraer datos a
CSV) y para **actuar** (rellenar formularios, pulsar botones, ejecutar acciones).
El objetivo: hacer el trabajo **sin gastar tokens navegando**.

## El problema que resuelve

El MCP de Playwright permite a Claude controlar un navegador. La forma "normal"
de trabajar es `browser_snapshot`, que devuelve el árbol de accesibilidad
**completo** de la página — **decenas de miles de tokens** cada uno. Para leer un
feed infinito hacen falta muchos (uno por scroll); para una acción de varios
pasos haría falta uno por clic para "ver" el estado. El coste se dispara.

Esta skill da la vuelta al problema: en vez de que Claude *lea* la página,
inyecta **un único script JavaScript** vía `browser_evaluate` que hace todo
**dentro del navegador** y devuelve solo un resumen pequeño.

```
Navegar con snapshots          Script de consola (esta skill)
─────────────────────          ──────────────────────────────
snapshot  → 10-40k tokens       browser_navigate
click     → acción              browser_evaluate(script)  → 1 sola llamada
snapshot  → 10-40k tokens       devuelve { status: ok }   → ~unos cientos
… ×N pasos                                                    de tokens

Coste ∝ tamaño × nº pasos       Coste ≈ CONSTANTE
```

## Dos modos

| Modo | Qué hace | Ejemplos de uso |
|------|----------|-----------------|
| **LEER** | Scroll + extracción del DOM → CSV | Feed de LinkedIn, posts de un perfil de Instagram |
| **ACTUAR** | Rellenar/pulsar/disparar la llamada interna de la web | Retirar una URL en Google Search Console, publicar en Substack |

Las acciones se ejecutan de dos formas (la skill prefiere la primera): replicar
con `fetch()` la llamada interna que usa la propia web (lo más robusto), o clics
programáticos sobre el DOM. Ambas en una sola llamada `browser_evaluate`.

## Cómo encaja con el MCP de Playwright

Esta skill **no incluye** navegador ni servidor MCP: se apoya en el **MCP oficial
de Playwright** (`@playwright/mcp`), que instalas una vez. El MCP aporta las
herramientas `browser_*`; la skill aporta el *cómo* usarlas sin gastar tokens.

| Herramienta del MCP | Para qué la usa la skill |
|---|---|
| `browser_navigate` | Ir a la URL objetivo. |
| `browser_evaluate` | **El núcleo.** Inyecta y ejecuta el script (leer o actuar). |
| `browser_wait_for` | Esperar a que cargue el contenido o confirmar sesión. |
| `browser_network_requests` | Ver qué endpoint interno dispara una acción, para replicarlo. |
| `browser_close` | Cerrar al terminar (libera el perfil; **no** cierra tus sesiones web). |
| `browser_snapshot` | **NO se usa para leer.** La calibración usa una sonda ligera propia. |

### Perfil persistente (sesiones con login)

LinkedIn, Instagram, Search Console… requieren estar logueado. Por eso el MCP se
instala con un **perfil de usuario persistente** (`--user-data-dir`): inicias
sesión **una sola vez** manualmente en la ventana que abre Claude, y las cookies
quedan guardadas. La skill **nunca** pide ni maneja tus credenciales.

> ⚠️ El perfil persistente solo admite **una instancia de Chromium a la vez**.
> La skill cierra el navegador al terminar y no debes correr dos sesiones de
> Claude Code usando el navegador a la vez. Cerrar el navegador **no** te
> desloguea.

## Instalación

### Paso 1 — Instala la skill

Copia esta carpeta (`browser-console-automation/`) dentro de tu proyecto, en
`.claude/skills/`:

```bash
git clone https://github.com/seoutopico/claude_skills
# copia la carpeta browser-console-automation/ a tu-proyecto/.claude/skills/
```

```
tu-proyecto/
└── .claude/
    └── skills/
        └── browser-console-automation/
            ├── SKILL.md
            ├── assets/
            └── references/
```

Cierra y abre Claude Code de nuevo.

### Paso 2 — Instala el MCP de Playwright (requisito)

```bash
claude mcp add --scope user playwright -- npx -y @playwright/mcp@latest --user-data-dir "RUTA/A/tu/playwright-profile"
```

> Windows: `C:\Users\TU_USUARIO\.claude\playwright-profile` ·
> macOS/Linux: `~/.claude/playwright-profile`

La primera vez Playwright descarga un navegador (~150-300 MB); para adelantarlo:
`npx -y playwright@latest install chromium`. Comprueba que conecta con
`claude mcp get playwright` (debe decir `Status: ✓ Connected`). **Reinicia Claude
Code o usa `/mcp`** para que aparezcan las herramientas `browser_*`.

## Uso

La skill se activa sola cuando pides leer o actuar sobre una web:

```
Extrae las publicaciones de mi feed de LinkedIn a un CSV
Crea un scraper para los posts de este perfil de Instagram: <url>
Retira esta URL en Search Console: <url>
```

### Colecciones (reutilizables por sitio)

Cada tarea se guarda como una **colección** en la **raíz de tu proyecto** (no
dentro de la skill — la skill es el procedimiento; las colecciones son tus datos,
y por eso no se publican en este repo):

```
tu-proyecto/
└── collections/
    ├── INDEX.md
    └── <dominio>/
        ├── scrape.js   # el script calibrado para ese sitio
        └── meta.md     # URL, columnas/acción, calibración, notas
```

- **Crear** (la primera vez): la skill sondea el DOM real, adapta una plantilla
  y guarda la colección.
- **Ejecutar** (siempre después): abre, inyecta el script guardado tal cual,
  recolecta o ejecuta la acción. Sin volver a mirar el DOM.
- **Recalibrar** (solo si el sitio cambió y falla): vuelve a sondear, corrige el
  script y lo re-guarda.

## Uso responsable

Opera siempre sobre recursos a los que tienes **acceso legítimo** (tus cuentas y
propiedades). Para leer: muchos sitios prohíben el scraping en sus ToS (LinkedIn
entre ellos) — uso personal/educativo, ritmo humano, límite de elementos. Para
actuar: solo acciones que tú mismo podrías hacer en tu sesión (p. ej. retirar una
URL de **tu propia** web). Para acciones con efectos visibles o difíciles de
revertir, la skill confirma antes de ejecutar. Nada de recolección masiva, datos
de terceros sin permiso, ni evasión de límites o paywalls.

---

## Autora

**Aina-Lluna Taylor** — Desarrollo herramientas de IA para resolver problemas reales.

- [Newsletter ainalluna](https://ainalluna.substack.com/) — IA aplicada, herramientas y automatización. Suscríbete.
- [Web](https://ainalluna.com/)
- [LinkedIn](https://www.linkedin.com/in/ainataylor/)
