# Claude Skills

A collection of custom Claude Code skills/plugins.

## Skills

| Skill | Description |
|-------|-------------|
| [youtube-channel-research](./youtube-channel-research/) | YouTube channel analyzer: top videos, engagement metrics, and content strategy insights |

## Installation

Install any skill as a Claude Code plugin:

```bash
claude plugins add /path/to/claude_skills/<skill-name>
```

For example:

```bash
claude plugins add /path/to/claude_skills/youtube-channel-research
```

## Setup

The `youtube-channel-research` skill requires a YouTube Data API v3 key (free):

```bash
# Linux/macOS
export YOUTUBE_API_KEY="your-api-key"

# Windows
setx YOUTUBE_API_KEY "your-api-key"
```

Get a key at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) enabling the YouTube Data API v3.

## License

MIT
