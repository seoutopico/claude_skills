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

### Opcion 2 — Descarga manual

1. Descarga el [ZIP del repo](https://github.com/seoutopico/claude_skills/archive/refs/heads/master.zip)
2. Descomprime el ZIP
3. Dentro encontraras una carpeta `youtube-channel-research/skills/youtube-channel-research/` — esa carpeta que contiene el archivo `SKILL.md` es la que necesitas
4. Copia esa carpeta dentro de tu proyecto en `.claude/skills/` (creala si no existe)

Tu proyecto deberia quedar asi:

```
tu-proyecto/
├── .claude/
│   └── skills/
│       └── youtube-channel-research/
│           └── SKILL.md
```

5. Cierra y abre Claude Code de nuevo

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
