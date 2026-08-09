# Product

**PNGTuberMaker** — AI-powered PNGTuber avatar generator for streamers.
Create professional streaming avatars, expression packs, and animations in
minutes instead of weeks, for a fraction of commission prices.

- **Target users**: Twitch/YouTube/Discord streamers, VTubers, content
  creators who want custom avatars without hiring artists.
- **Value prop**: "Create in minutes, not weeks. Save hundreds vs commissions."
- **Production domain**: `pngtubermaker.com` (local dev: `localhost:4000`,
  see `dev` script; Docker/CI: port 3000).
- **Discord community**: `https://discord.gg/zysPAnvP8f` (linked in Footer,
  FAQ, and DiscordCTA).
- **Contact**: `support@pngtubermaker.com`.

## Features

- AI avatar generation from text prompts or reference images (4 candidates
  per generation, user selects one)
- Expression packs (happy/angry/sad/surprised) via image-edit on the selected
  base avatar
- Animation/blinking via the PNGTuber engine and OBS player embed (`/player/*`)
- HD/4K upscale and variations
- Transparent background removal
- i18n: 12 locales (`ar de en es fr hi it ja ko pt-BR ru zh-CN`), messages
  under `apps/web/messages/<locale>/*.json`

## Pricing tiers

| Tier | Price | Generations | Features |
|------|-------|-------------|----------|
| **Free** | $0 | 3/month | 512px export, community support |
| **Start** | $9/mo | 50/month | HD export (1080p), basic expressions, email support |
| **Pro** | $30/mo | Unlimited | 4K export, all expressions & animations, commercial license, priority queue, avatar library |

Yearly billing saves 20% (Start $86.40/yr, Pro $288/yr). Canonical pricing
copy lives in `apps/web/lib/stripe.ts` (`PRICING_CONFIG`).

## Business rules

1. **Tier allocation matters.** Free = teaser, Start = hobbyists,
   Pro = serious creators. New features must declare their tier.
2. **Auth required for generation.** Check the session before any generation
   API call.
3. **Generation limits enforced in the API layer**: 3/month Free, 50/month
   Start, unlimited Pro. Credit constants live in
   `apps/web/lib/services/credit-config.ts`.
4. **No watermark on any tier.** Differentiation is via export resolution
   (512/1080/2160) and feature access, never watermarking.
5. **Credits expire at billing cycle end** (see `operations.md` → scheduled
   jobs). R2 uploads use `generateFileKey()` / presigned URLs; the
   `avatars/*/candidates/` lifecycle rule is configured in the Cloudflare
   dashboard, not in code.
