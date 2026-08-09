# PNGTuber Maker — Pricing Model (Credit System)

> Last updated: 2026-02-19

---

## 1. Core Design

**Universal currency**: Credits
**Exchange rate**: 1,000 Credits = $1 USD

All AI tasks consume Credits. Subscriptions = monthly Credit packs + feature tiers.

---

## 2. Subscription Tiers

| Tier | Monthly Price | Credits/Month | Equivalent Value | Multiplier | Key Features |
|------|-------------|--------------|-----------------|-----------|-------------|
| **Free** | $0 | 500 | $0.50 | Free trial | Watermark, max 512px |
| **Start** | $9/mo | 12,000 | $12.00 | 1.33x | No watermark, 1080p, basic expressions |
| **Pro** | $30/mo | 50,000 | $50.00 | 1.67x | 4K, all features, commercial license, priority queue |

- Yearly billing: 20% discount (same Credits/month, lower price)
- Higher tiers get better Credit-to-dollar ratio (incentivizes upgrades)

---

## 3. Credit Lifecycle

### Earning Credits

| Source | Credits | Expiry |
|--------|---------|--------|
| Subscription (monthly grant) | Per tier | End of billing cycle (use-it-or-lose-it) |
| One-time purchase (top-up) | 1,000 credits per $1 | Never expires |
| Welcome bonus (new signup) | 500 | 30 days |

### Key Rules

1. **Subscription Credits expire monthly** — encourages regular use, prevents hoarding
2. **Purchased Credits never expire** — fair to one-time buyers
3. **Consumption order**: Expiring credits consumed first, then permanent credits (FIFO by expiry)
4. **No refund on expired credits**

---

## 4. Task Pricing

### Current Tasks (MVP) — Confirmed 2026-02-19

**Pipeline**: Midjourney Niji (首图) + Nano Banana Standard (表情编辑)

| Task | Model | Credits | ~USD | API Cost | Gross Margin |
|------|-------|---------|------|----------|-------------|
| Character generation (首图) | Midjourney Niji | 300 | $0.30 | ~$0.05 | ~83% |
| Expression edit (单个表情) | Nano Banana Std | 200 | $0.20 | ~$0.039 | ~80% |
| Expression pack (4 expressions) | Nano Banana Std x4 | 800 | $0.80 | ~$0.16 | ~80% |
| Expression pack (6 expressions) | Nano Banana Std x6 | 1,200 | $1.20 | ~$0.23 | ~81% |
| HD Upscale (per image) | TBD | 100 | $0.10 | ~$0.02 | ~80% |
| Background removal | Self-hosted (rembg) | 0 | $0.00 | ~$0.00 | Included |

### Future Tasks

| Task | Credits (estimated) | Notes |
|------|-------------------|-------|
| Animation generation | 500 | Blinking, mouth movement |
| Style transfer | 300 | Apply different art styles |
| Character Studio edit | 100 | Per save/regeneration |

### Typical User Journey Cost

> Generate character (300) + Expression pack 4x (800) = **1,100 Credits = $1.10**
> API cost: ~$0.05 + ~$0.16 = **~$0.21** → Gross margin: **~81%**

Compare: Artist commission = $50-300. We are **45-270x cheaper**.

---

## 5. Top-up Packages (a la carte)

| Package | Credits | Price | Bonus |
|---------|---------|-------|-------|
| Starter | 5,000 | $5 | — |
| Value | 12,000 | $10 | +2,000 bonus (20%) |
| Power | 35,000 | $25 | +10,000 bonus (40%) |

Credits from top-up never expire.

---

## 6. UX Display Rules

- Show balance as **Credits**, not dollar equivalents (e.g., "12,000 credits" not "$12.00")
- Before each task, show: "This will use X credits" with confirmation
- Low balance warning at < 500 credits
- Suggest top-up or upgrade when balance insufficient

---

## 7. Business Model Safety

### Why no "Unlimited" tier

With confirmed pipeline (Midjourney Niji + Nano Banana Std):
- Pro user with 50,000 credits, worst case all on cheapest task (expression edit @ 200 credits each):
  - Max 250 edits × $0.039 = $9.75 cost → $30 revenue → safe
- Typical usage (full character sets @ 1,100 credits each):
  - ~45 full sets × $0.21 = $9.45 cost → $30 revenue → safe
- Even in worst case, margin stays strongly positive (~67-68%)

### Anti-abuse

- Rate limit: Max 20 concurrent generation requests
- Daily cap: Even Pro users have a daily credit consumption cap (e.g., 5,000/day) to prevent API abuse
- Monitor for automated/bot usage patterns

---

## 8. Impact on Codebase

### Database Changes Needed

- `wallets` table: Store credit balance (integer, not float)
- `credit_transactions` table: Log every credit movement (grant, consume, expire, purchase)
- `subscriptions` table: Add `monthly_credits` field
- New: `task_pricing` config (code-level, not DB — task → credit cost mapping)

### Stripe Changes Needed

- Subscription products: Same 3 tiers, Stripe handles billing
- One-time products: Credit top-up packages (3 products)
- Webhook: On subscription renewal → grant monthly credits
- Webhook: On top-up purchase → add permanent credits
