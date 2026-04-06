# Claude Skills

Skills para Claude Code. Cada skill es un agente especializado invocable como slash command.

## Skills disponibles

### `/youtube` — YouTube Channel Research

Analiza canales de YouTube: obtiene los 30 videos recientes, calcula métricas de engagement y genera un análisis de qué contenido funciona mejor.

```
/youtube @midudev
/youtube @ThePrimeagen -o primeagen.md
/youtube @AlexHormozi -d mi-vault/research/
```

**Qué genera:**
- Tabla con los 30 videos recientes ordenados por views
- Métricas: promedio de views, likes, engagement ratio
- Análisis de qué tipo de contenido funciona y qué no
- Recomendaciones accionables
- Output compatible con Obsidian (frontmatter YAML)

**Requiere:** YouTube Data API v3 key (gratis) — [obtener aquí](https://console.cloud.google.com/apis/credentials)

---

## Instalación

### Como plugin de Claude Code

```bash
claude plugin install seoutopico/claude_skills
```

### Con npx skills

```bash
npx skills add seoutopico/claude_skills
```

### Manual

Copia el skill a tu directorio de skills:

```bash
# Global (todos los proyectos)
cp -r skills/youtube ~/.claude/skills/youtube

# Solo un proyecto
cp -r skills/youtube tu-proyecto/.claude/skills/youtube
```

## Setup

Configura tu YouTube API key:

```bash
# Linux/macOS
export YOUTUBE_API_KEY="tu-api-key"

# Windows
setx YOUTUBE_API_KEY "tu-api-key"
```

## Licencia

MIT
