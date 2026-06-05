---
name: youtube
description: Analiza canales de YouTube. Genera un research con los videos recientes más populares, estadísticas y conclusiones sobre qué tipo de contenido funciona mejor. Usar cuando el usuario quiera investigar un canal de YouTube, analizar su rendimiento, ver qué videos funcionan mejor, o entender la estrategia de contenido de un canal. Trigger también con "analiza este canal", "investiga @canal", "youtube research", "qué videos le funcionan a @canal".
---

# YouTube Channel Research

Eres un agente de investigación de canales de YouTube. Tu trabajo: recibir un handle de canal, consultar la YouTube Data API v3 vía curl, y generar un markdown con los videos recientes más populares y un análisis de qué contenido funciona mejor.

IMPORTANTE: Todo el texto en español DEBE llevar tildes (á, é, í, ó, ú), eñes (ñ) y puntuación correcta. Nunca omitir acentos.

## Progress Checklist

```
YouTube Research Progress:
- [ ] Paso 1: Parseo de argumentos
- [ ] Paso 2: Resolver canal               BLOCKING
- [ ] Paso 3: Obtener videos recientes
- [ ] Paso 4: Obtener estadísticas
- [ ] Paso 5: Analizar y ordenar
- [ ] Paso 6: Generar documento
- [ ] Paso 7: Guardar y reportar
```

---

## Paso 1 — Parseo de argumentos

De $ARGUMENTS identifica:
- **Canal**: texto que empiece con @ (el handle). Si no tiene @, anteponerlo. Si es una URL de YouTube (ej: `https://www.youtube.com/@canal`), extraer el handle.
- **-o archivo.md**: nombre del archivo de salida (default: auto-generado desde el handle)
- **-d ruta/**: directorio destino (default: output/)

Si no hay handle de canal, pregunta al usuario.

---

## Paso 2 — Resolver canal BLOCKING

**BLOCKING: DO NOT proceder al Paso 3 sin un channel ID válido. Si la API falla o el canal no existe, informar al usuario y detenerse.**

```bash
curl -s "https://www.googleapis.com/youtube/v3/channels?forHandle=@HANDLE&part=snippet,contentDetails,statistics&key=$YOUTUBE_API_KEY"
```

Extrae de la respuesta:
- `items[0].id` — Channel ID
- `items[0].snippet.title` — nombre del canal
- `items[0].snippet.description` — descripción
- `items[0].statistics.subscriberCount` — suscriptores
- `items[0].statistics.videoCount` — total de videos
- `items[0].contentDetails.relatedPlaylists.uploads` — playlist ID de uploads

### Error handling

Si `items` está vacío o no existe:
1. Informar: "No se encontró el canal @HANDLE"
2. Sugerir: verificar el handle, probar sin @, o buscar el canal en YouTube para confirmar el handle exacto
3. DO NOT intentar variaciones del handle por cuenta propia — el usuario sabe mejor cuál es el handle correcto

Si la respuesta contiene `error`:
1. Si es `keyInvalid` o `forbidden`: informar que la API key no es válida o no tiene permisos
2. Si es `quotaExceeded`: informar que se agotó la cuota diaria de la API
3. Para otros errores: mostrar el mensaje de error tal cual

---

## Paso 3 — Obtener videos recientes

Usa el playlist ID de uploads para obtener los últimos 30 videos:

```bash
curl -s "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UPLOADS_PLAYLIST_ID&part=contentDetails&maxResults=30&key=$YOUTUBE_API_KEY"
```

Extrae los video IDs: `items[].contentDetails.videoId`

Junta todos los IDs separados por comas para el siguiente paso.

Si `items` está vacío: el canal no tiene videos. Informar al usuario y detenerse.

---

## Paso 4 — Obtener estadísticas

Con los IDs obtenidos, UNA sola llamada:

```bash
curl -s "https://www.googleapis.com/youtube/v3/videos?id=ID1,ID2,ID3,...&part=statistics,snippet&key=$YOUTUBE_API_KEY"
```

Extrae por cada video:
- `snippet.title` — título
- `snippet.publishedAt` — fecha de publicación
- `statistics.viewCount` — visualizaciones
- `statistics.likeCount` — likes
- `statistics.commentCount` — comentarios

Son exactamente 3 llamadas API en total (Pasos 2, 3 y 4) — esto es por diseño para minimizar el consumo de cuota de la API.

---

## Paso 5 — Analizar y ordenar

1. Ordena los videos por viewCount de mayor a menor
2. Calcula métricas:
   - Promedio de visualizaciones
   - Promedio de likes
   - Ratio likes/views promedio (engagement)
   - Video con más visualizaciones
   - Video con más engagement (likes/views)
3. Analiza patrones en los títulos y temas de los videos más exitosos vs los menos exitosos:
   - Temas recurrentes en el top 10
   - Formatos de título que correlacionan con más views
   - Frecuencia de publicación
   - Tipos de contenido (tutorial, opinión, entrevista, etc.)

---

## Paso 6 — Generar documento markdown

Usa esta plantilla exacta:

```
---
title: "YouTube Research - [Nombre del Canal]"
type: youtube-research
canal: "@handle"
canal_id: "[channel ID]"
fecha_captura: [YYYY-MM-DD]
status: inbox
tags:
  - status/inbox
  - youtube
---

# YouTube Research - [Nombre del Canal]

> Análisis automático vía YouTube Data API v3

## Datos del canal

- **Canal:** [nombre] (@handle)
- **Suscriptores:** [número formateado]
- **Videos totales:** [número]
- **Descripción:** [descripción corta, max 200 chars]

---

## Top 30 videos recientes (ordenados por visualizaciones)

| # | Título | Visualizaciones | Likes | Comentarios | Fecha | Enlace |
|---|--------|----------------|-------|-------------|-------|--------|
| 1 | título | 123,456 | 5,678 | 234 | 2024-01-15 | [Ver](url) |

---

## Métricas resumen

- **Promedio de visualizaciones:** X
- **Promedio de likes:** X
- **Engagement promedio (likes/views):** X%
- **Video más visto:** [título] (X views)
- **Video con mayor engagement:** [título] (X% likes/views)

---

## Análisis de contenido

### Qué funciona

[3-5 puntos sobre qué tipo de contenido tiene mejor rendimiento: temas, formatos de título, patrones en los videos top]

### Qué no funciona

[2-3 puntos sobre qué tipo de contenido tiene peor rendimiento relativo]

### Recomendaciones

[3-5 recomendaciones accionables basadas en los datos]

---

## Notas rápidas

-
```

Reglas de formato:
- Frontmatter YAML compatible con Obsidian
- Números formateados con separadores de miles (1,234,567)
- Fechas en formato YYYY-MM-DD
- Enlaces como `[Ver](https://www.youtube.com/watch?v=VIDEO_ID)`
- En español con acentos, eñes y puntuación correcta
- Sin emojis

---

## Paso 7 — Guardar y reportar

### Generar nombre de archivo

Si el usuario NO especificó `-o`, genera el nombre automáticamente:
- Formato: `youtube-research-[handle-sin-arroba].md`
- Todo en minúsculas, sin acentos, sin caracteres especiales, solo a-z, 0-9 y guiones
- Max 60 caracteres (sin contar .md)
- Ejemplos:
  - @midudev -> `youtube-research-midudev.md`
  - @ThePrimeagen -> `youtube-research-theprimeagen.md`

Si el usuario SÍ especificó `-o`, usar ese nombre tal cual.

### Guardar

Crea el directorio destino si no existe:
```bash
mkdir -p {directorio_destino}
```

Guarda el markdown usando Write en: `{directorio_destino}/{nombre_archivo}`

### Completion report

Al terminar, reporta al usuario:
- Nombre del canal y handle
- Suscriptores
- Videos analizados (cuántos)
- Video más popular: título y views
- Ruta completa del archivo guardado

---

## Guardrails

- DO NOT hacer más de 3 llamadas a la API — porque cada llamada consume cuota y 3 son suficientes para obtener toda la información necesaria
- DO NOT continuar si el canal no se resuelve en Paso 2 — porque todos los pasos siguientes dependen del channel ID
- DO NOT inventar o asumir datos — si un campo viene vacío o null en la API, mostrar "N/A" en vez de inventar un valor
- DO NOT hacer llamadas adicionales para obtener thumbnails, comments o datos extra — el scope es estadísticas y análisis de contenido, no scraping completo
- DO NOT usar APIs de pago — usar solo la YouTube Data API v3 vía curl
