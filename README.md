# Claude Skills

Skills para [Claude Code](https://claude.ai/code). Este repo es un **directorio de
skills**: cada carpeta es una skill independiente, lista para copiar a
`.claude/skills/` de tu proyecto.

**Creado por [Aina-Lluna Taylor](https://ainalluna.com/)** — Si te interesan herramientas de IA aplicadas a productividad, desarrollo y automatización, suscríbete a mi newsletter **[ainalluna](https://ainalluna.substack.com/)** donde comparto este tipo de proyectos, tutoriales y reflexiones cada semana.

## Skills

| Skill | Qué hace |
|-------|----------|
| [youtube-channel-research](./youtube-channel-research/) | Analiza canales de YouTube: top vídeos, métricas de engagement y análisis de estrategia de contenido |
| [browser-console-automation](./browser-console-automation/) | Automatiza tareas en webs con sesión iniciada ejecutando un script en la consola del navegador (vía MCP de Playwright) en lugar de navegar: extrae datos a CSV o ejecuta acciones, minimizando el consumo de tokens |

## Instalación

Cada skill es una carpeta. Para instalar una:

1. Clona el repo (o descarga el [ZIP](https://github.com/seoutopico/claude_skills/archive/refs/heads/master.zip)):
   ```bash
   git clone https://github.com/seoutopico/claude_skills
   ```
2. Copia la carpeta de la skill que quieras dentro de tu proyecto, en
   `.claude/skills/` (créala si no existe):
   ```
   tu-proyecto/
   └── .claude/
       └── skills/
           └── browser-console-automation/
               ├── SKILL.md
               ├── assets/
               └── references/
   ```
3. Cierra y abre Claude Code de nuevo.

## Notas por skill

### browser-console-automation
Requiere el **MCP de Playwright** (aporta las herramientas `browser_*`). Instálalo
una vez, con perfil persistente para conservar tus sesiones:

```bash
claude mcp add --scope user playwright -- npx -y @playwright/mcp@latest --user-data-dir "RUTA/A/tu/playwright-profile"
```

> Windows: `C:\Users\TU_USUARIO\.claude\playwright-profile` ·
> macOS/Linux: `~/.claude/playwright-profile`

Detalles de uso, modos (leer / actuar) y técnicas en su `SKILL.md` y
`references/playwright-mcp.md`.

### youtube-channel-research
Requiere una API key gratuita de YouTube Data API v3. Ver instrucciones en su
`SKILL.md`.

## Licencia

MIT

---

## Autora

**Aina-Lluna Taylor** — Desarrollo herramientas de IA para resolver problemas reales.

- [Newsletter ainalluna](https://ainalluna.substack.com/) — IA aplicada, herramientas y automatización. Suscríbete.
- [Web](https://ainalluna.com/)
- [LinkedIn](https://www.linkedin.com/in/ainataylor/)
