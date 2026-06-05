# Referencia: MCP de Playwright para automatización por consola

## Por qué este patrón ahorra tokens

Navegar con el MCP de Playwright "a la manera normal" implica llamar a
`browser_snapshot` repetidamente. Cada snapshot devuelve el árbol de
accesibilidad COMPLETO de la página. En un feed infinito (LinkedIn, X,
Instagram, etc.) eso son decenas de miles de tokens por snapshot; y para una
acción con varios pasos (abrir modal, rellenar, confirmar) cada clic obligaría
a un snapshot nuevo para "ver" el estado.

El patrón de esta skill evita los snapshots por completo: se inyecta **un único
script JS** vía `browser_evaluate` que hace todo el trabajo dentro del navegador
y devuelve solo un resumen pequeño. Sirve igual para **leer** (scroll, espera,
extracción, CSV) y para **actuar** (rellenar campos, pulsar botones, disparar la
llamada interna). El coste en tokens pasa de `O(tamaño_página × nº_pasos)` a
prácticamente constante.

## Instalación del MCP de Playwright

Si las herramientas `browser_*` no están disponibles, instalar el servidor:

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

Variantes útiles (pasar tras `@latest`):
- `--browser chrome` — usar Chrome instalado en lugar de Chromium empaquetado.
- `--cdp-endpoint <url>` — conectarse a un Chrome ya abierto por el usuario
  (útil para reutilizar una sesión de LinkedIn ya iniciada; ver abajo).
- `--user-data-dir <ruta>` — perfil persistente para conservar cookies/sesión
  entre ejecuciones (evita volver a iniciar sesión cada vez).
- `--isolated` — sesión efímera sin estado (lo contrario; no usar aquí).

Tras instalar, reiniciar la sesión para que aparezcan las herramientas.

## Herramientas del MCP relevantes

| Herramienta | Uso en esta skill |
|---|---|
| `browser_install` | Descargar el binario del navegador la primera vez. |
| `browser_navigate` | Ir a la URL objetivo (p. ej. `https://www.linkedin.com/feed/`). |
| `browser_evaluate` | **Núcleo del patrón.** Ejecuta el script JS (leer o actuar). |
| `browser_wait_for` | Esperar a que aparezca un texto/elemento antes de inyectar. |
| `browser_close` | Cerrar al terminar (libera el perfil; no cierra sesiones web). |
| `browser_network_requests` | Ver qué endpoint interno dispara una acción, para replicarlo con `fetch()`. |
| `browser_snapshot` | **NO usar para leer/recolectar.** La calibración usa `probe_dom.js`. |
| `browser_tabs` | Gestionar pestañas si hace falta. |

## Forma del parámetro `function` de browser_evaluate

`browser_evaluate` recibe una propiedad `function` con el **texto de una función
JS**. Se ejecuta en el contexto de la página y su valor de retorno se serializa
y se devuelve a Claude. Para scroll con esperas, la función debe ser `async` y
devolver una promesa.

Formato aceptado:

```
() => { /* ... cuerpo síncrono ... */ return valor; }
async () => { /* ... con await ... */ return valor; }
(element) => { /* recibe un elemento si se pasa ref/selector */ }
```

Los `scrape.js` de las colecciones ya tienen este formato: una función
`async () => {...}` lista para pasar como `function`.

## Reutilizar una sesión de LinkedIn ya iniciada

LinkedIn requiere login. Dos estrategias:

1. **Perfil persistente** (`--user-data-dir`): la primera vez Claude abre el
   navegador, el usuario inicia sesión manualmente una vez, y las cookies
   quedan guardadas para ejecuciones futuras.
2. **Conectar a un Chrome existente** (`--cdp-endpoint`): el usuario abre Chrome
   con `--remote-debugging-port=9222` y su sesión de LinkedIn ya activa; el MCP
   se conecta a esa instancia. Útil para no replicar el login.

Nunca pedir ni manejar las credenciales de LinkedIn. El login lo hace siempre el
usuario en su propio navegador.

## Recalibrar selectores cuando LinkedIn cambia el DOM

Los nombres de clase de LinkedIn están ofuscados y rotan. Si el script devuelve
`count: 0` o campos vacíos:

1. Ejecutar `assets/probe_dom.js` vía `browser_evaluate` — devuelve conteos de
   selectores candidatos, iframes, shadow roots y una muestra recortada del
   primer post (~300-800 tokens). **No usar `browser_snapshot`** para esto.
2. Elegir el contenedor real (candidato con conteo > 0 más específico) y
   deducir los selectores de campo a partir de `sampleHtml`.
3. **Persistir** la corrección en `collections/<dominio>/scrape.js` con `Edit`
   (constante `CALIBRATED_CONTAINER` y arrays de `extractPost`). El script
   guardado es la fuente de verdad: las ejecuciones futuras lo usan tal cual,
   sin volver a mirar el DOM.
4. Re-ejecutar el script guardado.

Los anclajes más estables son los atributos `data-urn`/`data-id` (p. ej.
`urn:li:activity:...`) y los roles ARIA; las clases `.update-components-*`
cambian con más frecuencia. Si la sonda muestra todo a 0 con `iframes` o
`shadowHosts` altos, el feed vive en otro contexto de documento — inspeccionar
el iframe o recorrer shadow roots antes de tocar el script principal.

## Adaptar el patrón a otros sitios (LEER)

El mismo enfoque sirve para cualquier feed/listado (X, Reddit, Instagram, una
tabla paginada interna, etc.). Crear una colección nueva copiando
`assets/scrape_template.js` a `collections/<dominio>/scrape.js` y completar las
secciones `[ADAPTAR]`: (a) selector de contenedor, (b) extracción de campos,
(c) columnas del CSV. Mantener intacto el bucle de scroll con detección de
inactividad y la lógica de dedupe/CSV.

## Ejecutar ACCIONES desde la consola

Para automatizar una acción (rellenar un formulario, pulsar botones, lograr un
efecto), copiar `assets/action_template.js` a `collections/<dominio>/scrape.js`.
Dos técnicas, en orden de preferencia:

1. **Replicar la llamada interna (lo más robusto).** Hacer la acción a mano una
   vez observando `browser_network_requests` para ver qué endpoint/payload usa
   la web. Replicarlo con `fetch()` dentro del script: las cookies de sesión se
   envían solas. No depende del DOM, así que no se rompe si cambia la UI.

2. **Clics programáticos (cuando no hay endpoint claro).** Operar el DOM desde
   el script. Reglas que funcionan en SPAs modernas (validado en Google Search
   Console, donde los "botones" son `<div role="button">` con clases ofuscadas):
   - localizar botones por **texto visible** con regex, nunca por clase;
   - filtrar por **visibilidad** (`offsetParent !== null`): suele haber modales
     y pestañas duplicados ocultos en el DOM;
   - setear inputs de Material/SPA con el **setter nativo** de
     `HTMLInputElement.prototype.value` + `dispatchEvent(new Event('input',
     {bubbles:true}))`; asignar `.value` directo no basta, la SPA lo ignora;
   - **pausar** entre pasos (los modales tardan en renderizar);
   - **verificar** el estado final (leer la tabla/mensaje resultante) y
     devolverlo; nunca asumir éxito;
   - devolver `{ error: 'paso X falló' }` en cada punto de control para
     diagnóstico.

Los helpers de `action_template.js` (`visible`, `dialogs`, `buttonIn`,
`setInput`, `sleep`) implementan estas reglas. Para acciones con efectos
visibles o difíciles de revertir, confirmar con el usuario antes de ejecutar y
verificar siempre el resultado.
