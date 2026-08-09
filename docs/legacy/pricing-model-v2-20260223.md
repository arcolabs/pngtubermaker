# PNGTuber Maker — Pricing Model v2 (Top-up First)

> Last updated: 2026-02-23
> Supersedes: pricing-model-20260219.md

---

## 0. Why v2

v1 was a subscription-first model (Free / Start $9 / Pro $30). After cost analysis with the actual API stack (Qwen + Seedream, ~$0.025/image), we identified fundamental issues:

1. **Usage mismatch**: PNGTuber is bursty (create once, use for months). Monthly subscriptions force users to pay during inactive months → churn.
2. **Price barrier too high**: $9/month is a "real subscription decision" for small streamers. Most won't convert.
3. **Credit waste**: Start gives 12,000 credits/month but typical users need ~2,000. Unused credits = negative user sentiment.

**v2 core shift**: Credits purchased on-demand (top-up) become the primary revenue path. Subscription becomes an optional "save more" upgrade for power users.

---

## 1. Pricing Structure

### 1.1 Free Tier (unchanged)

| | |
|---|---|
| Welcome credits | 500 (expires in 30 days) |
| Export quality | 512px max |
| Purpose | Try the product, generate ~1 avatar + 1 expression |

### 1.2 Credit Packs (primary monetization)

| Pack | Price | Credits | Per-Avatar Equiv. | Stripe Fee | Net Margin (worst case) |
|------|-------|---------|-------------------|------------|------------------------|
| **Starter** | $2.99 | 2,000 | ~$0.45 | 12.7% | **67%** |
| **Popular** | $6.99 | 5,500 | ~$0.38 | 7.2% | **67%** |
| **Best Value** | $14.99 | 13,000 | ~$0.35 | 4.9% | **66%** |

- Credits **never expire**
- Volume discount is mild (~22% from Starter → Best Value) to avoid subsidizing heavy usage
- No bonus credits (removed from v1 to simplify and protect margins)

### 1.3 Creator Pass (optional subscription)

| | Monthly | Yearly |
|---|---|---|
| Price | **$7.99/mo** | **$5.99/mo** ($71.88/yr) |
| Credits | 6,000/month | 6,000/month |
| vs Top-up savings | ~30% | ~48% |
| Subscription credits | Expire at billing cycle end | Same |

**Subscriber-exclusive features:**
- 4K export (2160p)
- Full commercial license
- Priority generation queue
- Access to avatar library

**Why one tier, not two:**
Two subscription tiers + top-up packs = 5-6 choices = decision paralysis. One clear subscription simplifies the user journey to: Free → Buy Credits → (optional) Subscribe & Save.

---

## 2. Task Costs (unchanged from v1)

| Task | Credits | API Calls | API Cost | Notes |
|------|---------|-----------|----------|-------|
| Avatar generation | 300 | 4 (2×Qwen + 2×Seedream) | $0.10 | Most expensive task |
| Expression edit | 200 | 1 (Qwen) | $0.025 | High margin |
| HD upscale | 100 | 1 | $0.025 | |
| Background removal | 0 | 1 | ~$0 | Included, negligible cost |

### Typical user journey

> 1 avatar (300) + 6 expressions (1,200) = **1,500 credits**
> API cost: $0.10 + 6 × $0.025 = **$0.25**
> If bought via Starter pack ($2.99 / 2,000 credits): user pays ~$2.24 for this journey
> Our margin after Stripe: **~$1.48 (66%)**

---

## 3. Conversion Funnel

```
Sign up → 500 free credits → Generate first avatar
                ↓
        Credits run out
                ↓
    ┌───────────────────────┐
    │  "Buy 2,000 credits   │  ← Primary CTA
    │   for $2.99"          │
    └───────────────────────┘
                ↓
        User buys, creates more
                ↓
        Comes back, buys again
                ↓
    ┌───────────────────────┐
    │  "You've spent $X on  │  ← Smart upsell
    │   credits. Subscribe  │     (after 2+ purchases)
    │   for $7.99/mo and    │
    │   save 30%"           │
    └───────────────────────┘
                ↓
        Power user subscribes
```

Key principle: **the first paid CTA is always "Buy Credits", never "Subscribe".**

---

## 4. Margin Analysis

### 4.1 Credit Packs (worst case = all avatar generation)

| Pack | Revenue | Stripe Fee | Max API Cost | Net Profit | Margin |
|------|---------|------------|-------------|------------|--------|
| Starter $2.99 | $2.99 | $0.38 | $0.60 (6 avatars) | $2.01 | 67% |
| Popular $6.99 | $6.99 | $0.50 | $1.80 (18 avatars) | $4.69 | 67% |
| Best Value $14.99 | $14.99 | $0.73 | $4.30 (43 avatars) | $9.96 | 66% |

### 4.2 Creator Pass (worst case = all avatar generation)

| | Monthly | Yearly |
|---|---|---|
| Revenue | $7.99 | $5.99 |
| Stripe fee | $0.53 | $0.47 |
| Max API cost | $2.00 (20 avatars) | $2.00 |
| Net profit | $5.46 | $3.52 |
| Margin | **68%** | **59%** |

### 4.3 Typical scenario margins

Most users do a mix of avatars + expressions. Typical: 8 avatars + 15 expressions per "session."
- API cost: 8 × $0.10 + 15 × $0.025 = $1.175
- Across any pack/subscription, margins are **75-80%** in typical usage.

---

## 5. Comparison: v1 vs v2

| Metric | v1 (Subscription-first) | v2 (Top-up-first) |
|--------|------------------------|-------------------|
| First paid CTA | "Subscribe for $9/mo" | "Buy credits for $2.99" |
| Expected Free→Paid conversion | 10-15% | 20-30% (lower barrier) |
| Churn risk | High (inactive months) | Low (no subscription to cancel) |
| MRR predictability | Higher on paper, fragile | Lower, but more stable |
| Revenue at 6 months | Drops as users churn | Grows with user base |
| User sentiment | "Wasting credits I don't use" | "I pay when I need it" |
| Complexity | 3 tiers + top-ups = 6 options | 3 packs + 1 sub = 4 options |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Low MRR (fewer subscribers) | Hard to forecast revenue | Focus on growing user base; top-up revenue compensates |
| Stripe fees on $2.99 (12.7%) | Cuts into margin | Guide users to $6.99+ via UI; mark Popular as "recommended" |
| Users buy once and never return | Low LTV | Seasonal prompts ("New year, new avatar!"), expression packs as upsell |
| Power users drain API on cheap credits | Margin squeeze | Rate limits unchanged; no bonus credits; credit costs reflect API reality |

---

## 7. Open Questions (validate post-launch)

1. **Is $2.99 minimum viable?** Track Stripe fee impact. If margin too thin, raise to $3.99.
2. **What's the re-purchase rate?** If <20% of paid users re-purchase within 60 days, need retention mechanics.
3. **Does the Creator Pass convert?** Target: 5-10% of active paid users upgrade to subscription.
4. **Should we add a $29.99 "Lifetime Pack"?** Large one-time purchase for users who hate subscriptions but want bulk credits. Consider if top-up re-purchase rate is low.

---

## 8. Migration Plan (v1 → v2)

### Code changes needed

1. **`lib/stripe.ts`** — Replace `PRICING_CONFIG` (3 tiers → 1 subscription + credit packs)
2. **`lib/services/credits.ts`** — Update `TOPUP_PACKAGES` (new packs, remove bonuses)
3. **Pricing page** — Redesign: credit packs as primary, subscription as secondary section
4. **Post-generation CTA** — When credits run out, show "Buy Credits" not "Subscribe"
5. **Smart upsell logic** — Track cumulative top-up spend; suggest subscription after threshold
6. **Stripe products** — Create new products/prices in Stripe dashboard

### Existing user handling

- Users on v1 Start/Pro: Honor until current billing cycle ends, then migrate to Creator Pass or credits
- Purchased credits: Unaffected (never expire)

---

## 9. Implementation Config (draft)

```typescript
// Credit Packs (one-time purchase, never expire)
export const CREDIT_PACKS = {
  starter:    { credits: 2_000,  priceInCents: 299  },
  popular:    { credits: 5_500,  priceInCents: 699  },
  best_value: { credits: 13_000, priceInCents: 1499 },
} as const;

// Creator Pass (monthly subscription)
export const CREATOR_PASS = {
  name: "Creator Pass",
  monthlyPrice: 7.99,
  yearlyPrice: 71.88,       // $5.99/mo
  monthlyCredits: 6_000,
  features: [
    "6,000 credits/month (~30% savings vs top-up)",
    "4K export (2160p)",
    "Full commercial license",
    "Priority generation queue",
    "Access to avatar library",
  ],
} as const;

// Task costs (unchanged)
export const TASK_COSTS = {
  avatar_generation: 300,
  expression_edit: 200,
  hd_upscale: 100,
} as const;
```
