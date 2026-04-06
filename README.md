# Claude Skills

Skills para [Claude Code](https://claude.ai/code). Cada skill es un plugin independiente que puedes instalar por separado.

**Creado por [Aina-Lluna Taylor](https://ainalluna.com/)** — Si te interesan herramientas de IA aplicadas a productividad, desarrollo y automatizacion, suscribete a mi newsletter **[ainalluna](https://ainalluna.substack.com/)** donde comparto este tipo de proyectos, tutoriales y reflexiones cada semana.

## Skills

| Skill | Que hace |
|-------|----------|
| [youtube-channel-research](./youtube-channel-research/) | Analiza canales de YouTube: top videos, metricas de engagement y analisis de estrategia de contenido |

## Instalacion

### Opcion 1 — Desde la terminal (recomendado)

Clona el repo e instala el skill que quieras:

```bash
git clone https://github.com/seoutopico/claude_skills
claude plugins add ./claude_skills/youtube-channel-research
```

### Opcion 2 — Manual (sin git)

1. Descarga la carpeta del skill que quieras (o descarga el [ZIP del repo](https://github.com/seoutopico/claude_skills/archive/refs/heads/master.zip) y descomprime)
2. Copia la carpeta `skills/youtube-channel-research/` a tu directorio de skills de Claude Code:

```bash
# Todos tus proyectos (global)
cp -r youtube-channel-research/skills/youtube-channel-research ~/.claude/skills/

# Solo un proyecto
cp -r youtube-channel-research/skills/youtube-channel-research tu-proyecto/.claude/skills/
```

3. Reinicia Claude Code

## Ejemplos

Mira [examples/](./examples/) para ver output real generado por cada skill.

## Licencia

MIT

---

## Autora

**Aina-Lluna Taylor** — Desarrollo herramientas de IA para resolver problemas reales.

- [Newsletter ainalluna](https://ainalluna.substack.com/) — IA aplicada, herramientas y automatizacion. Suscribete.
- [Web](https://ainalluna.com/)
- [LinkedIn](https://www.linkedin.com/in/ainataylor/)
