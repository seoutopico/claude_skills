---
name: browser-console-automation
description: Automatiza tareas en webs donde ya tienes sesión iniciada ejecutando UN script de consola vía browser_evaluate del MCP de Playwright, en lugar de navegar clic a clic (que gasta tokens en snapshots). Cubre dos modos — LEER (extraer datos: feeds, listados, tablas → CSV) y ACTUAR (ejecutar acciones: rellenar formularios, pulsar botones, disparar llamadas internas; p. ej. retirar una URL en Google Search Console). Guarda cada tarea como una colección reutilizable por sitio. Úsese cuando el usuario quiera extraer datos o ejecutar acciones en una web minimizando tokens — "extrae los datos de esta URL", "crea un scraper para este sitio", "automatiza esta acción en esta web", "borra/retira esta URL en Search Console", "ejecuta la colección de X", "bajar el feed a CSV".
---

# Browser Console Automation

## Overview

Esta skill automatiza tareas en páginas web donde el usuario **ya tiene sesión
iniciada**, ejecutando **un único script JS** vía `browser_evaluate` del MCP de
Playwright. El script hace todo dentro del navegador y devuelve solo un resumen
pequeño; Claude nunca lee la página con `browser_snapshot` (que cuesta decenas
de miles de tokens). El coste en tokens es casi constante, independiente del
tamaño de la página o del número de pasos.

Cubre **dos modos**, con el mismo mecanismo:

- **LEER** (extracción): scroll + extracción del DOM + CSV. Casos: feeds,
  listados, tablas. Ejemplos: `linkedin.com`, `instagram.com`.
- **ACTUAR** (acción): rellenar campos, pulsar botones o disparar la llamada
  interna que usa la web. Casos: formularios, paneles de administración.
  Ejemplo: `search.google.com-removals` (retirar una URL en Search Console).

El valor no es "scrapear": es **no navegar clic a clic**. Tanto leer como actuar
caben en una sola llamada `browser_evaluate`, sin snapshots caros.

## Principio: el script guardado es la verdad

El script de cada colección se ejecuta **tal cual está guardado**, sin
inspeccionar el DOM antes. Inspeccionar el DOM (calibrar) es la **excepción**:
solo al crear la colección o cuando una ejecución falla. Toda corrección se
persiste con `Edit` en el `scrape.js` de la colección — nunca montar un script
ad-hoc sin guardarlo: debe servir para todas las ejecuciones futuras.

```
¿existe collections/<dominio>/? ──sí──> ejecutar scrape.js guardado ──ok──> fin
        │ no                                    │ falla
        ↓                                       ↓
   CREAR COLECCIÓN  <─────────────  ejecutar assets/probe_dom.js (sonda)
   (calibrar + guardar)                         ↓
                                    Edit en collections/<dominio>/scrape.js
                                                ↓
                                    re-ejecutar el script guardado
```

## Estructura de colecciones

Las colecciones viven en la **raíz del proyecto** (directorio de trabajo), no
dentro del directorio de la skill (la skill es el procedimiento estático; las
colecciones son datos que crecen con el uso):

```
<raíz del proyecto>/
└── collections/
    ├── INDEX.md         # una línea por colección (dominio — objetivo — estado)
    └── <dominio>/       # p. ej. linkedin.com, search.google.com-removals
        ├── scrape.js    # script inyectable (función async para browser_evaluate)
        └── meta.md      # URL, objetivo, modo (leer/actuar), calibración, notas
```

Si `collections/` no existe, crearla al crear la primera colección. Nombrar la
carpeta con el dominio sin `www.`. Si un mismo sitio tiene varios objetivos,
usar sufijo descriptivo: `linkedin.com-perfil/`, `search.google.com-removals/`.

## Aviso de uso responsable

Operar siempre sobre recursos a los que el usuario tiene **acceso legítimo**
(sus propias cuentas y propiedades). Para LEER: muchos sitios prohíben el
scraping en sus ToS (LinkedIn entre ellos) — limitar a uso personal/educativo,
ritmo de scroll humano y límite de elementos. Para ACTUAR: ejecutar solo
acciones que el usuario podría hacer él mismo en su sesión (p. ej. retirar una
URL de **su propia** propiedad en Search Console). Nunca pedir ni manejar
credenciales: el login lo hace el usuario en su navegador. Declinar acciones
destructivas a ciegas, sobre recursos de terceros, o masivas. Para acciones con
efectos visibles o difíciles de revertir, confirmar con el usuario antes de
ejecutar.

## Requisito previo: MCP de Playwright

Comprobar que existen las herramientas `browser_*`. Si no, instalar:

```bash
claude mcp add --scope user playwright -- npx -y @playwright/mcp@latest --user-data-dir <ruta-perfil>
```

El `--user-data-dir` persistente conserva las sesiones (login una sola vez).
**Tras instalar o reconectar el MCP, las herramientas `browser_*` solo aparecen
al (re)iniciar la sesión de Claude Code o con `/mcp`.** Detalles y catálogo de
herramientas en `references/playwright-mcp.md`.

## Workflow A — Ejecutar una colección existente

1. Consultar `collections/INDEX.md` y leer `collections/<dominio>/meta.md`
   (URL, modo, parámetros, espera previa).
2. `browser_navigate` a la URL; `browser_wait_for` según el meta. Si pide login,
   pedir al usuario que inicie sesión manualmente y confirmar antes de seguir.
3. **Si es modo ACTUAR y la acción tiene efectos visibles/irreversibles,
   confirmar con el usuario** la acción y sus parámetros (p. ej. la URL a
   retirar) antes de inyectar.
4. Leer `collections/<dominio>/scrape.js`, ajustar el bloque `CFG` con los
   parámetros de esta ejecución, y pasarlo entero como `function` de **una
   sola** llamada `browser_evaluate`.
5. Recolectar el resultado:
   - LEER, Modo A (`RETURN_CSV: false`): confirmar `status: download_triggered`.
   - LEER, Modo B (`RETURN_CSV: true`): guardar el campo `csv` con `Write`.
     Regla: Modo B solo para resultados pequeños (≈100 filas cortas) o si hay
     que filtrar antes de guardar; para volúmenes grandes, Modo A.
   - ACTUAR: el script devuelve `{ status, ... }` o `{ error: ... }` con un
     mensaje del paso que falló. Reportar el resultado verificado (p. ej. la
     fila nueva visible en la tabla), no asumir éxito.
6. **Al terminar, cerrar el navegador con `browser_close`.** El perfil
   persistente solo admite UNA instancia de Chromium a la vez; dejarlo abierto
   bloquea futuras sesiones. Cerrar NO cierra las sesiones web (cookies en el
   perfil).

## Workflow B — Crear una colección de LECTURA

Entrada: una URL + qué datos (campos, formato).

1. `browser_navigate`; resolver login si aplica.
2. Ejecutar `assets/probe_dom.js` vía `browser_evaluate` para conocer la
   estructura real (conteos de candidatos, iframes, shadow roots, muestra). Es
   una sonda barata; jamás `browser_snapshot` para recolectar.
3. Copiar `assets/scrape_template.js` a `collections/<dominio>/scrape.js` y
   completar las tres secciones `[ADAPTAR]`: selector de contenedor, extracción
   de campos y columnas del CSV. Ajustar `FILENAME` y, si el scroll es de un
   panel interno, `SCROLL_CONTAINER`.
4. Crear `meta.md` y añadir la línea a `INDEX.md`.
5. Ejecutar (Workflow A). Si falla, recalibrar (Workflow C).

## Workflow B' — Crear una colección de ACCIÓN

Entrada: una URL + la acción a ejecutar (qué pulsar/rellenar/lograr).

1. `browser_navigate`; resolver login. **Confirmar la acción con el usuario.**
2. Entender el flujo real. Dos técnicas (preferir la primera si es viable):
   - **Replicar la llamada interna**: ver con `browser_network_requests` qué
     endpoint dispara la web al hacer la acción a mano, y replicarlo con
     `fetch()` dentro del script (usa las cookies de sesión automáticamente).
     Lo más fiable y robusto.
   - **Clics programáticos**: localizar botones/campos y operarlos desde el
     script. Pauta probada (ver ejemplo `search.google.com-removals`):
     - localizar "botones" SIEMPRE por **texto visible** con regex (las clases
       están ofuscadas; muchos son `<div role="button">`);
     - filtrar elementos por **visibilidad** (`offsetParent !== null`) porque
       suele haber diálogos/pestañas duplicados ocultos en el DOM;
     - para inputs de Material/SPA, setear el valor con el **setter nativo**
       (`HTMLInputElement.prototype.value`) + `dispatchEvent(new Event('input',
       {bubbles:true}))`, si no la SPA ignora el valor;
     - pausar entre pasos para que rendericen los modales;
     - **verificar** el resultado al final (leer la tabla/estado) y devolverlo;
     - devolver `{ error: 'paso que falló' }` en cada punto de control.
3. Copiar `assets/action_template.js` a `collections/<dominio>/scrape.js` y
   adaptar los pasos. Exponer los parámetros variables en `CFG` (p. ej.
   `TARGET_URL`).
4. Crear `meta.md` (incluir **modo: actuar**, parámetros, idioma de la UI,
   reversibilidad de la acción) y añadir la línea a `INDEX.md`.
5. Ejecutar (Workflow A) con confirmación previa. Iterar si falla.

## Workflow C — Recalibrar una colección que falla

1. Ejecutar `assets/probe_dom.js` (sonda compacta, ~300-800 tokens). **No usar
   `browser_snapshot`.**
2. Identificar el selector real (contenedor con conteo > 0 más específico) y los
   selectores de campo/botón en `sampleHtml`.
3. **Persistir** con `Edit` en `collections/<dominio>/scrape.js` y anotar la
   fecha y el cambio en `meta.md`.
4. Re-ejecutar el script guardado.

Si la sonda muestra `counts` todos a 0 con `iframes` o `shadowHosts` altos, el
contenido vive en otro contexto de documento: inspeccionar el iframe o recorrer
shadow roots antes de tocar el script.

## Solución de problemas: perfil bloqueado

Si el navegador no arranca con "Browser is already in use" / "ProcessSingleton",
hay otro Chromium anclado al `--user-data-dir` (instancia huérfana, ventana
dejada abierta, u **otra sesión de Claude Code usándolo a la vez**). Resolver:

1. Si la otra sesión está activa, cerrar el navegador desde ella
   (`browser_close`); no matar su proceso a ciegas.
2. Si es huérfano, cerrarlo (solo el Chromium del perfil de Playwright, no el
   Chrome personal):
   ```powershell
   Get-CimInstance Win32_Process -Filter "Name like '%chrome%'" |
     Where-Object { $_.CommandLine -like '*playwright-profile*' } |
     ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
   ```
3. Reintentar `browser_navigate`.

Prevención: cerrar siempre con `browser_close` al terminar y no correr dos
sesiones usando el navegador a la vez.

## Recursos incluidos

(En la skill solo viven recursos estáticos; las colecciones — datos que crecen —
están en `collections/` en la raíz del proyecto.)

- `assets/scrape_template.js` — Plantilla de LECTURA: scroll con detección de
  inactividad, dedupe, CSV con escapado y doble modo de salida ya resueltos;
  solo se adaptan contenedor, campos y columnas.
- `assets/action_template.js` — Plantilla de ACCIÓN: helpers de localización por
  texto, visibilidad, setter nativo de inputs, pausas y verificación final;
  solo se adaptan los pasos concretos.
- `assets/probe_dom.js` — Sonda de calibración para `browser_evaluate`. Salida
  compacta (~300-800 tokens) con la estructura real del DOM.
- `references/playwright-mcp.md` — Instalación del MCP, formato del parámetro
  `function`, reutilización de sesiones con login, técnicas de acción y detalles
  de recalibración.
