# PNGTuber Maker — Technical Architecture

> Last updated: 2026-02-19

---

## 1. AI Generation Pipeline

### Overview

```
用户输入描述 + 选择风格
        │
        ▼
┌──────────────────┐
│  Midjourney Niji  │  ← 首图生成（角色设计）
│  (企业合作 API)    │
└────────┬─────────┘
         │ base image
         ▼
┌──────────────────┐
│  Nano Banana      │  ← 表情变体生成（基于首图编辑）
│  (标准版 via fal)  │
└────────┬─────────┘
         │ expression variants
         ▼
┌──────────────────┐
│  背景移除          │  ← 输出透明背景 PNG
│  (rembg / BiRefNet)│
└────────┬─────────┘
         │ transparent PNGs
         ▼
    打包下载 / 存入 R2
```

### Layer 1: First Image Generation — Midjourney Niji

- **Provider**: Midjourney (official enterprise API)
- **Model**: Niji mode (optimized for anime/illustration)
- **Purpose**: Generate the base character design from user text prompt
- **Cost**: ~$0.05/image (enterprise rate TBD)
- **Output**: Single high-quality character image (1024x1024+)
- **Why Midjourney**: Best-in-class anime quality, Niji mode is the industry benchmark

### Layer 2: Expression Variants — Nano Banana (Standard)

- **Provider**: fal.ai (`fal-ai/nano-banana-pro/edit` or standard model)
- **Model**: Nano Banana (standard version, NOT Pro)
- **Purpose**: Edit the base image to create expression variants
- **Cost**: ~$0.039/image
- **Input**: Base image from Layer 1 + text instruction (e.g., "change expression to happy, mouth open")
- **Output**: Expression variant maintaining character consistency
- **Why Standard over Pro**: 4x cheaper ($0.039 vs $0.15), sufficient quality for expression editing

### Layer 3: Post-Processing

- **Background removal**: Output transparent PNG (required for PNGTuber software)
- **Resize**: Conform to standard PNGTuber sizes
- **Quality check**: Ensure consistency across expression set

---

## 2. Expression Definitions

### MVP Expression Set (4 expressions)

| Expression | Edit Instruction | Use Case |
|-----------|-----------------|----------|
| **Idle** | Base image (no edit needed) | Default/silent state |
| **Talking** | "Open mouth slightly, speaking expression" | Active talking |
| **Happy** | "Smiling, cheerful expression, eyes slightly closed" | Positive reactions |
| **Sad** | "Sad expression, downturned mouth, slightly teary eyes" | Negative reactions |

### Extended Expression Set (6 expressions, future)

| Expression | Edit Instruction |
|-----------|-----------------|
| **Angry** | "Angry expression, furrowed brows, gritted teeth" |
| **Surprised** | "Surprised expression, wide eyes, open mouth" |

---

## 3. Cost Structure

### Per-Task Costs

| Task | Model | API Cost | User Price (Credits) | User Price ($) | Gross Margin |
|------|-------|----------|---------------------|---------------|-------------|
| First image (character) | Midjourney Niji | ~$0.05 | 300 | $0.30 | ~83% |
| Expression edit (x1) | Nano Banana Std | ~$0.039 | 200 | $0.20 | ~80% |
| Expression pack (4x) | Nano Banana Std | ~$0.16 | 800 | $0.80 | ~80% |
| Background removal (x1) | rembg (self-hosted) | ~$0.00 | 0 (included) | $0.00 | 100% |
| HD Upscale (x1) | TBD | ~$0.02 | 100 | $0.10 | ~80% |

### Typical User Journey

```
Generate character (300) + Expression pack 4x (800) = 1,100 Credits = $1.10
API cost: ~$0.05 + ~$0.16 = ~$0.21
Gross margin: ~81%
```

### vs Competition

| Solution | Cost | Time |
|----------|------|------|
| PNGTuber Maker (us) | ~$1.10 | ~2 minutes |
| Artist commission | $50-300 | 3-14 days |
| Midjourney DIY | $10-30/mo + manual work | 1-3 hours |

---

## 4. Output Format

### File Specifications

- **Format**: PNG with transparent background (RGBA)
- **Sizes**:
  - Default: 512x512 (veadotube mini standard)
  - HD: 1080x1080 (Start tier+)
  - 4K: 2160x2160 (Pro tier)
- **Naming convention**: `{character_name}_{expression}.png`
  - e.g., `my_avatar_idle.png`, `my_avatar_talking.png`

### Download Options

- Individual PNG files
- ZIP bundle with all expressions
- (Future) veadotube-compatible config bundle

### PNGTuber Software Compatibility

Primary targets:
- **veadotube mini** — Most popular, uses individual PNG files
- **PNGTuber Plus** — Uses PNG files with hotkey mapping
- **Discord Reactive Images** — Uses PNG pairs (idle/talking)

---

## 5. Art Styles (MVP)

| Style | Description | Midjourney Params |
|-------|-------------|-------------------|
| **Anime** | Clean modern anime style | `--niji` default |
| **Chibi** | Super-deformed cute style | `--niji` + chibi prompt modifiers |

### Future Styles

- Cartoon (Western animation)
- Pixel art
- Semi-realistic
- Watercolor

---

## 6. API Providers & Keys

| Service | Provider | Auth | Env Var |
|---------|----------|------|---------|
| First image generation | Midjourney | Enterprise API key | `MIDJOURNEY_API_KEY` |
| Expression editing | fal.ai (Nano Banana) | API key | `FAL_API_KEY` |
| Background removal | Self-hosted (rembg) or API | — | — |
| Image storage | Cloudflare R2 | Access key | `R2_*` (existing) |
| Payments | Stripe | Secret key | `STRIPE_*` (existing) |

---

## 7. Rate Limits & Safety

### Per-User Limits

- Free: Max 2 generations/day
- Start: Max 20 generations/day
- Pro: Max 50 generations/day

### System Limits

- Max concurrent generation jobs: 20 (global)
- Generation timeout: 120 seconds
- Max image upload size: 10MB
- Content moderation: Use provider's built-in NSFW filters

### Queue System

- Free: Standard queue
- Start: Standard queue
- Pro: Priority queue (processed first)
