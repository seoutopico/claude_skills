// ============================================================================
// probe_dom.js — Sonda de calibración (BARATA, ~300-800 tokens de salida)
// ----------------------------------------------------------------------------
// Ejecutar vía browser_evaluate al CREAR una colección nueva o cuando el
// scrape.js de una colección devuelve count: 0 o campos vacíos.
// Devuelve un resumen compacto de la estructura real
// del DOM (conteos de selectores candidatos, iframes, shadow roots y una
// muestra de un post) para actualizar los selectores del script guardado.
// NUNCA usar browser_snapshot para esto.
// ============================================================================

() => {
  const out = { url: location.href, title: document.title };

  // Conteo de selectores candidatos de contenedor de publicación
  const candidates = [
    'div[data-urn^="urn:li"]',
    'div[data-id^="urn:li"]',
    '[data-view-tracking-scope]',
    'div.feed-shared-update-v2',
    'div.fie-impression-container',
    'div.scaffold-finite-scroll__content > div',
    'main div[role="article"]',
    'main',
  ];
  out.counts = {};
  for (const sel of candidates) {
    try { out.counts[sel] = document.querySelectorAll(sel).length; } catch (e) {}
  }

  // ¿Contenido dentro de iframes?
  out.iframes = Array.from(document.querySelectorAll('iframe'))
    .slice(0, 5)
    .map((f) => (f.src || '(sin src)').slice(0, 100));

  // ¿Shadow DOM en uso?
  let shadowHosts = 0;
  for (const el of document.querySelectorAll('*')) {
    if (el.shadowRoot) shadowHosts++;
    if (shadowHosts > 20) break;
  }
  out.shadowHosts = shadowHosts;

  // Muestra del primer contenedor que exista (recortada)
  const first = document.querySelector(
    'div[data-urn^="urn:li"], div[data-id^="urn:li"], div.feed-shared-update-v2'
  );
  if (first) {
    out.sampleTag = first.tagName + '.' + (first.className || '').toString().slice(0, 120);
    out.sampleAttrs = Array.from(first.attributes)
      .map((a) => `${a.name}=${a.value.slice(0, 60)}`)
      .slice(0, 10);
    out.sampleHtml = first.outerHTML.slice(0, 1200);
  } else {
    // Sin candidatos: muestra del main para orientarse
    const main = document.querySelector('main') || document.body;
    out.mainSample = main.innerHTML.replace(/\s+/g, ' ').slice(0, 1200);
  }

  return out;
};
