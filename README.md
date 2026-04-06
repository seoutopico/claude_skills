# Claude Skills

Skills para [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Skills

### `youtube-channel-research`

Analiza canales de YouTube: obtiene los 30 videos recientes, calcula métricas de engagement y genera un análisis de qué contenido funciona mejor.

```
/youtube-channel-research @midudev
/youtube-channel-research @ThePrimeagen -o primeagen.md
/youtube-channel-research @AlexHormozi -d mi-vault/research/
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

### Como plugin (marketplace)

```bash
/plugin marketplace add seoutopico/claude_skills
/plugin install claude-skills@claude-skills
```

### Manual

```bash
cp -r skills/youtube-channel-research ~/.claude/skills/
```

---

## Setup

```bash
# Linux/macOS
export YOUTUBE_API_KEY="tu-api-key"

# Windows
setx YOUTUBE_API_KEY "tu-api-key"
```

Obtén una key gratis en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) activando la YouTube Data API v3.

## Licencia

MIT
