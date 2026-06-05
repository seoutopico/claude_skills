// ============================================================================
// scrape_template.js — PLANTILLA genérica para nuevas colecciones
// ----------------------------------------------------------------------------
// Para crear una colección nueva: copiar este archivo a
//   collections/<dominio>/scrape.js
// y completar las secciones marcadas con [ADAPTAR] usando el resultado de
// assets/probe_dom.js sobre la página real. Mantener intacto el bucle de
// scroll, el dedupe y la construcción del CSV.
//
// Se inyecta de UNA sola vez vía browser_evaluate (función async).
// Modo A (RETURN_CSV: false): descarga el CSV en el navegador, devuelve solo
//   { count, status, filename } — los datos no pasan por Claude.
// Modo B (RETURN_CSV: true): devuelve { count, csv } para guardarlo con Write.
// ============================================================================

async () => {
  // ----- Configuración -----------------------------------------------------
  const CFG = {
    MAX_ITEMS: 100,        // límite de elementos a recolectar
    MAX_SCROLLS: 80,       // tope de iteraciones de scroll
    SCROLL_PAUSE_MS: 1300, // pausa entre scrolls (ritmo humano)
    IDLE_ROUNDS: 4,        // rondas sin altura nueva antes de parar
    RETURN_CSV: false,     // false = descarga Blob; true = devuelve csv
    FILENAME: 'export.csv', // [ADAPTAR] nombre del CSV
    SCROLL_CONTAINER: null, // [ADAPTAR] selector si el scroll no es window
                            // (p. ej. un panel con overflow). null = window.
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const pick = (root, selectors) => {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el && el.innerText && el.innerText.trim()) return el.innerText.trim();
    }
    return '';
  };

  // ----- [ADAPTAR] 1/3: selector de contenedor de elemento ----------------
  // Usar el candidato con conteo > 0 más específico según probe_dom.js.
  const CONTAINER_SELECTOR = 'TODO-selector-de-item';
  const getContainers = () =>
    Array.from(document.querySelectorAll(CONTAINER_SELECTOR));

  // ----- [ADAPTAR] 2/3: extracción de campos por elemento ------------------
  // Cada campo con varios selectores fallback. Deducirlos de sampleHtml.
  const extractItem = (el) => ({
    id: el.getAttribute('data-id') || el.id || '',
    title: pick(el, ['TODO-selector-titulo']),
    text: pick(el, ['TODO-selector-texto']),
    link: el.querySelector('a[href]')?.href || '',
  });

  // ----- [ADAPTAR] 3/3: columnas del CSV (claves de extractItem) ----------
  const HEADER = ['id', 'title', 'text', 'link'];

  // ----- Bucle de scroll + recolección (NO TOCAR) --------------------------
  const scroller = CFG.SCROLL_CONTAINER
    ? document.querySelector(CFG.SCROLL_CONTAINER)
    : null;
  const doScroll = () => {
    if (scroller) scroller.scrollTo(0, scroller.scrollHeight);
    else window.scrollTo(0, document.body.scrollHeight);
  };
  const height = () =>
    scroller ? scroller.scrollHeight : document.body.scrollHeight;

  const collected = new Map();
  let lastHeight = 0;
  let idle = 0;

  for (let i = 0; i < CFG.MAX_SCROLLS && collected.size < CFG.MAX_ITEMS; i++) {
    for (const el of getContainers()) {
      const row = extractItem(el);
      const key =
        row.id || row.link || JSON.stringify(row).slice(0, 120);
      if (key && !collected.has(key) && Object.values(row).some(Boolean)) {
        collected.set(key, row);
        if (collected.size >= CFG.MAX_ITEMS) break;
      }
    }

    doScroll();
    await sleep(CFG.SCROLL_PAUSE_MS);

    const h = height();
    if (h === lastHeight) {
      idle++;
      if (idle >= CFG.IDLE_ROUNDS) break;
    } else {
      idle = 0;
      lastHeight = h;
    }
  }

  const rows = Array.from(collected.values()).slice(0, CFG.MAX_ITEMS);

  // ----- CSV (NO TOCAR) -----------------------------------------------------
  const esc = (v) => {
    const s = (v ?? '').toString().replace(/\r?\n/g, ' ').trim();
    return /[",;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    HEADER.join(','),
    ...rows.map((r) => HEADER.map((k) => esc(r[k])).join(',')),
  ].join('\n');

  // ----- Salida (NO TOCAR) --------------------------------------------------
  if (CFG.RETURN_CSV) return { count: rows.length, csv };

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = CFG.FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return { count: rows.length, status: 'download_triggered', filename: CFG.FILENAME };
};
