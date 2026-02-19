# PNGTuber Maker — Product Strategy

> Last updated: 2026-02-19

---

## 1. Product Definition

**PNGTuber Maker** is an AI-powered tool that helps streamers create consistent PNGTuber avatar expression packs in minutes.

**One-liner**: Turn a text prompt into a complete PNGTuber expression pack — idle, talking, happy, sad — all consistent, all in minutes.

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

**Core insight**: The bottleneck is creation, not display.

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

### Direction: "One-Click Expression Pack" (MVP)

User describes a character → AI generates one base avatar → automatically produces 4-6 consistent expression variants (idle, talking, happy, sad, angry, surprised).

**Why this direction:**

1. **Smallest viable scope** — one core workflow to nail
2. **Hits the real pain point** — expression consistency is what generic AI tools can't do
3. **Technically achievable** — Midjourney Niji (首图) + Nano Banana Std (表情编辑 via fal.ai)
4. **Clear value prop** — "one prompt, complete PNGTuber set"

**Confirmed tech stack (2026-02-19):**
- First image: Midjourney Niji (official enterprise API) — best anime quality
- Expression variants: Nano Banana Standard (fal.ai) — cost-effective editing
- Art styles (MVP): Anime + Chibi
- Output: Transparent PNG, 512/1080/2160px, veadotube-compatible

### Future: Character Design Studio (v2+)

- Visual character editor (hair, outfit, accessories adjustable)
- Style presets (anime, cartoon, chibi, realistic)
- Template library for common archetypes
- More granular control over generation

---

## 5. Competitive Landscape

| Solution | Price | Time | Consistency | PNGTuber-ready |
|----------|-------|------|-------------|---------------|
| Commission artist | $50-300 | 3-14 days | High | Yes |
| DIY (draw yourself) | $0 | Hours-days | High | Yes |
| Midjourney | $10-30/mo | Minutes/image | Low across expressions | No (manual work) |
| DALL-E 3 | $0.04/image | Seconds | Low across expressions | No |
| **PNGTuber Maker** | **$0-30/mo (credits)** | **Minutes** | **High (engineered)** | **Yes (native)** |

**Our moat**: Purpose-built for PNGTuber format + expression consistency pipeline.

---

## 6. Success Metrics (North Stars)

1. **Activation rate**: % of signups who complete their first expression pack
2. **Pack completion rate**: % of generations where user downloads all expressions (not just one)
3. **Credit conversion**: % of Free users who purchase credits or subscribe
4. **Retention (30-day)**: % of paying users still active after 30 days
