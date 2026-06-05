// ============================================================================
// action_template.js — PLANTILLA genérica para colecciones de ACCIÓN
// ----------------------------------------------------------------------------
// Para una acción nueva: copiar a collections/<dominio>/scrape.js y completar
// las secciones [ADAPTAR] con los pasos concretos. Se inyecta de UNA sola vez
// vía browser_evaluate (función async). Devuelve { status, ... } al verificar
// éxito, o { error: '...' } indicando el paso que falló.
//
// Helpers incluidos (probados contra Google Search Console):
//   - visible(el)      : el elemento se está mostrando (no oculto/duplicado)
//   - dialogs()        : diálogos/modales visibles
//   - buttonIn(root,re): botón por TEXTO visible (regex), incl. <div role=button>
//   - setInput(inp,val): setea inputs de Material/SPA con el setter nativo
//   - sleep(ms)        : pausa para que rendericen modales entre pasos
// ============================================================================

async () => {
  // ----- Configuración (parámetros variables de cada ejecución) ------------
  const CFG = {
    // [ADAPTAR] parámetros que cambian por ejecución, p. ej.:
    // TARGET_URL: 'https://example.com/...',
    STEP_PAUSE_MS: 1500,
  };

  // ----- Helpers (no tocar) -----------------------------------------------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => el.offsetParent !== null;
  const dialogs = () =>
    Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"]'))
      .filter(visible);
  const buttonIn = (root, re) =>
    Array.from(root.querySelectorAll('button, [role="button"]'))
      .filter(visible)
      .find((b) => re.test((b.innerText || '').trim()));
  const setInput = (inp, val) => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value').set;
    inp.focus();
    setter.call(inp, val);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // ----- [ADAPTAR] Pasos de la acción -------------------------------------
  // Patrón recomendado: localizar -> actuar -> pausar -> verificar cada paso,
  // devolviendo { error } en cada punto de control. Ejemplo (formulario modal):
  //
  //   const open = buttonIn(document, /^new request$/i);
  //   if (!open) return { error: 'botón de apertura no encontrado' };
  //   open.click();
  //   await sleep(CFG.STEP_PAUSE_MS);
  //
  //   const modal = dialogs().find((d) => /Título Modal/i.test(d.innerText));
  //   if (!modal) return { error: 'el modal no se abrió' };
  //   const inp = Array.from(modal.querySelectorAll('input[type="text"]')).find(visible);
  //   if (!inp) return { error: 'input no visible' };
  //   setInput(inp, CFG.TARGET_URL);
  //   await sleep(500);
  //   if (inp.value !== CFG.TARGET_URL) return { error: 'input no aceptó el valor', value: inp.value };
  //
  //   const submit = buttonIn(modal, /^(next|submit|enviar)$/i);
  //   if (!submit) return { error: 'botón de envío no encontrado' };
  //   submit.click();
  //   await sleep(CFG.STEP_PAUSE_MS + 1000);

  // ----- [ADAPTAR] Verificación final -------------------------------------
  // Leer el estado resultante y devolverlo. NO asumir éxito.
  //   const main = document.querySelector('[role="main"], main') || document.body;
  //   const state = main.innerText.replace(/\s+/g, ' ');
  //   const ok = state.includes(CFG.TARGET_URL);
  //   return { status: ok ? 'done' : 'submitted_but_not_verified', excerpt: state.slice(0, 400) };

  return { error: 'plantilla sin adaptar: completar las secciones [ADAPTAR]' };
};
