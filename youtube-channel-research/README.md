# YouTube Channel Research Skill

Skill para Claude Code que analiza canales de YouTube. Obtiene los 30 videos mas recientes, calcula metricas de engagement y genera un analisis de estrategia de contenido — todo en 3 llamadas a la API.

## Capacidades

- **Datos del canal**: Suscriptores, total de videos, descripcion
- **Tabla de videos**: Los 30 mas recientes ordenados por views con likes, comentarios y fechas
- **Metricas de engagement**: Promedio de views, likes, ratio de engagement (likes/views)
- **Analisis de contenido**: Que funciona, que no, y recomendaciones accionables
- **Compatible con Obsidian**: El output incluye frontmatter YAML

## Capturas

### Ejecucion del skill (progress checklist + llamadas API)

![Ejecucion del skill](../examples/youtube-channel-research/skill-execution.png)

### Generacion del output

![Output del skill](../examples/youtube-channel-research/skill-output.png)

## Instalacion

```bash
claude plugins add /path/to/claude_skills/youtube-channel-research
```

## Configuracion

Necesitas una API key de YouTube Data API v3 (gratis).

**Opcion 1 — Variable de entorno:**

```bash
# Linux/macOS
export YOUTUBE_API_KEY="tu-api-key"

# Windows
setx YOUTUBE_API_KEY "tu-api-key"
```

**Opcion 2 — En `.claude/settings.local.json`:**

```json
{
  "env": {
    "YOUTUBE_API_KEY": "tu-api-key"
  }
}
```

Consigue una key gratis en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) activando la YouTube Data API v3.

## Uso

```
/youtube-channel-research @midudev
/youtube-channel-research @ThePrimeagen -o primeagen.md
/youtube-channel-research @AlexHormozi -d mi-vault/research/
```

## Ejemplos de output

Mira ejemplos reales en la carpeta [examples/youtube-channel-research](../examples/youtube-channel-research/):

- [youtube-research-sabrina-ramonov.md](../examples/youtube-channel-research/youtube-research-sabrina-ramonov.md)
- [youtube-research-alexhormozi.md](../examples/youtube-channel-research/youtube-research-alexhormozi.md)

## Fuente

Usa la [YouTube Data API v3](https://developers.google.com/youtube/v3) via curl. Solo 3 llamadas por ejecucion (channels, playlistItems, videos).

---

## Autora

**Aina-Lluna Taylor** — Desarrollo herramientas de IA para resolver problemas reales.

- [Newsletter ainalluna](https://ainalluna.substack.com/) — IA aplicada, herramientas y automatizacion. Suscribete.
- [Web](https://ainalluna.com/)
- [LinkedIn](https://www.linkedin.com/in/ainataylor/)
