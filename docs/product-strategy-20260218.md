# PNGTuber Maker — Product Strategy

> Last updated: 2026-02-21

---

## 1. Product Definition

**PNGTuber Maker** is an AI-powered tool that helps streamers create and use PNGTuber avatars — from text prompt to live on stream, zero software install.

**One-liner**: Turn a text prompt into a live PNGTuber — generate expressions, paste a URL into OBS, start streaming. No veadotube, no config, no friction.

---

## 2. Market Context

### PNGTuber vs VTuber

| | PNGTuber | VTuber |
|--|---------|--------|
| Assets | 2-6 PNG images (idle/talking/expressions) | Live2D/3D model with rigging |
| Cost | $50-300 (commission) | $500-5000+ |
| Tech skill | Low (veadotube mini, etc.) | High (Live2D, VTuber software) |
| Quality | Simple, expressive | Complex, animated |
| Target | Entry-level streamers | Established creators |

### The Gap in PNGTuber Ecosystem

- **Display tools exist**: veadotube mini, PNGTuber Plus — these show PNGs reactively to audio
- **Creation tools don't exist**: No dedicated tool to **make** the PNG assets
- **Current workarounds**: Commission artists ($50-300, 3-14 days) or generic AI tools (no expression consistency)
- **Setup friction kills adoption**: Even after getting assets, users must install desktop software, configure triggers, and wire up OBS — a 30-60 minute process that causes massive drop-off

**Core insight**: There are TWO bottlenecks — creation AND the last mile to streaming. We solve both.

### The "Download → Stream" Gap (Critical)

The #1 churn moment in PNGTuber adoption is **after** the user has their PNG assets. The traditional flow:

```
Get PNGs → Install veadotube → Import files → Configure triggers → Set up OBS window capture → Adjust position/size → Start streaming
```

This is 30-60 minutes of technical setup for non-technical users. Our **OBS Browser Source** approach collapses this to:

```
Get PNGs → Copy URL → Paste into OBS as Browser Source → Start streaming
```

Zero install. Zero config. This is our key differentiator.

---

## 3. Target Users

### Primary: New Streamers (Tier 1)

- Just starting out, 0-50 followers
- Don't want to show face on camera
- Zero art skills, near-zero budget
- Need: Quick, cheap, "good enough" avatar to start streaming TODAY
- Willingness to pay: $0-10

### Secondary: Growing Streamers (Tier 2)

- 100-1000 followers, starting to build brand
- Want a consistent, recognizable character identity
- Tried generic AI tools but frustrated by inconsistency across expressions
- Need: Professional-looking, consistent expression pack
- Willingness to pay: $10-30/month

### Tertiary (future): Community Users

- Discord/social media users wanting unique avatars
- Not streamers, but adjacent audience
- One-time purchase behavior

---

## 4. Differentiation

### Direction: "Prompt → Live on Stream" (MVP)

User describes a character → AI generates expression pack → gets a live URL → pastes into OBS → streaming with PNGTuber. **No software to install, no files to configure.**

**Why this direction:**

1. **Closes the full loop** — from idea to live streaming in one product
2. **Hits BOTH pain points** — expression consistency + setup friction
3. **Technically achievable** — Midjourney Niji (首图) + Nano Banana Std (表情编辑) + Web Audio API (运行时)
4. **Clear value prop** — "one prompt, live PNGTuber, zero install"
5. **Creates lock-in** — avatar runs on our platform, not a local file

**Confirmed tech stack (2026-02-21):**
- First image: Midjourney Niji (official enterprise API) — best anime quality
- Expression variants: Nano Banana Standard (fal.ai) — cost-effective editing
- Art styles (MVP): Anime + Chibi
- Output: Transparent PNG, 512/1080/2160px, veadotube-compatible download
- **Live runtime**: OBS Browser Source page with Web Audio API mic detection

### OBS Browser Source — "Zero-Install PNGTuber" (MVP)

This is the key differentiator. Each avatar gets a live URL:

```
https://pngtubermaker.com/live/{avatarId}?token={accessToken}
```

**How it works:**
1. User adds URL as OBS Browser Source (width: 512-1080px, height: same)
2. Page requests microphone permission via `getUserMedia()`
3. `AudioContext` + `AnalyserNode` monitors real-time volume levels
4. Volume above threshold → switch to `talking` expression
5. Random interval timer → trigger `blink` expression
6. Combine both: talking + blink timing = `blink_talking`
7. All expression images preloaded, instant switching via CSS/Canvas

**Technical details:**
- **Mic access in OBS**: OBS Browser Source supports `getUserMedia()` when launched with `--enable-media-stream` flag (standard practice, documented in our setup guide)
- **Rendering**: `<canvas>` element with preloaded expression PNGs, crossfade transitions
- **State machine**: `idle` ↔ `talking` (voice-driven), `blink` overlay (timer-driven, 3-7s random interval)
- **Settings**: Volume threshold slider, blink frequency, expression hold time — configurable via URL params or settings panel
- **Fallback**: If mic permission denied, show idle with manual hotkey switching
- **Performance**: Lightweight — no frameworks loaded in Browser Source, vanilla JS + Canvas only

**Business value:**
- Zero install = dramatically lower barrier to entry
- Platform lock-in = users' avatars run on our service
- Usage data = we know who's actually streaming with our avatars (retention signal)
- Upsell surface = Pro features in the live runtime (custom animations, Twitch chat reactions)

### Future: Character Design Studio (v2+)

- Visual character editor (hair, outfit, accessories adjustable)
- Style presets (anime, cartoon, chibi, realistic)
- Template library for common archetypes
- More granular control over generation

### Future: Advanced Live Runtime (v2+, post-validation)

Only after Browser Source MVP is validated:
- Keyboard hotkey expression switching (via WebSocket relay)
- Custom animation curves (bounce, shake, pop-in)
- Twitch/YouTube chat integration (emote triggers expressions)
- Multi-avatar scene switching
- Overlay widgets (chat bubbles, alerts)

---

## 5. Competitive Landscape

| Solution | Price | Time to create | Consistency | PNGTuber-ready | Zero install |
|----------|-------|----------------|-------------|---------------|-------------|
| Commission artist | $50-300 | 3-14 days | High | Yes (files only) | No — need veadotube |
| DIY (draw yourself) | $0 | Hours-days | High | Yes (files only) | No — need veadotube |
| Midjourney | $10-30/mo | Minutes/image | Low across expressions | No (manual work) | No |
| DALL-E 3 | $0.04/image | Seconds | Low across expressions | No | No |
| veadotube mini | Free | N/A (display only) | N/A | Yes (display) | No — desktop app |
| **PNGTuber Maker** | **$0-30/mo** | **Minutes** | **High** | **Yes — generate + live** | **Yes — OBS Browser Source** |

**Our moat**: Only product that covers the full pipeline — AI generation with expression consistency + zero-install live PNGTuber via OBS Browser Source. Competitors either create assets (AI tools) OR display them (veadotube). We do both.

---

## 6. Success Metrics (North Stars)

### Generation Metrics
1. **Activation rate**: % of signups who complete their first expression pack
2. **Pack completion rate**: % of generations where user downloads all expressions (not just one)

### Live Runtime Metrics (NEW — OBS Browser Source)
3. **Live adoption rate**: % of users with completed avatars who activate a live URL
4. **Live session frequency**: Average live sessions per user per week (measures actual streaming usage)
5. **Setup completion rate**: % of users who copy the live URL → actually load it in OBS (tracked via first mic permission grant)

### Business Metrics
6. **Credit conversion**: % of Free users who purchase credits or subscribe
7. **Retention (30-day)**: % of paying users still active after 30 days
8. **Download-to-Live ratio**: % choosing Browser Source over ZIP download (validates the feature hypothesis)
