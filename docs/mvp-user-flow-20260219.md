# PNGTuber Maker — MVP Definition & User Flow

> Last updated: 2026-02-19

---

## 1. MVP Scope

### In Scope (v1.0)

- [x] Landing page（已完成）
- [x] OAuth login — Google/GitHub/Discord/Twitch（已完成）
- [ ] Dashboard — 用户主页（Credit 余额、近期作品、创建入口）
- [ ] Create Flow — 核心生成流程（描述 → 首图 → 表情包 → 下载）
- [ ] My Avatars — 作品库（查看、下载、删除）
- [ ] Credit System — 余额管理、消耗记录
- [ ] Pricing Page — 订阅 + 充值（更新为 Credit 模型）
- [ ] Stripe Integration — 订阅付费 + Credit 充值包

### Out of Scope (v2+)

- Character Studio（可调节编辑器）
- Animation 生成（眨眼/嘴部动画）
- Avatar Library（社区共享模板）
- Style Transfer（风格迁移）
- Pixel art / Cartoon 风格
- veadotube 配置文件导出
- 社交分享功能

---

## 2. Page Map

```
/                         ← Landing Page（已有）
/login                    ← OAuth Login（已有）
/dashboard                ← [NEW] 用户主页
/create                   ← [NEW] 生成流程（多步骤单页）
/avatars                  ← [NEW] 我的作品库
/avatars/[id]             ← [NEW] 单个角色详情（所有表情）
/pricing                  ← [UPDATE] 更新为 Credit 模型
/api/avatars/generate     ← [NEW] 首图生成 API
/api/avatars/expressions  ← [NEW] 表情包生成 API
/api/credits/balance      ← [NEW] 查询余额 API
/api/payments/subscribe   ← [UPDATE] 订阅（已有，需更新）
/api/payments/topup       ← [UPDATE] 充值（已有，需更新）
```

---

## 3. User Flow — Full Journey

### 3.1 First-Time User（新用户首次体验）

```
┌─────────────────────────────────────────────────────────────┐
│ LANDING PAGE (/)                                            │
│                                                             │
│  "Create Your PNGTuber in Minutes"                          │
│  [Get Started Free] ← 主 CTA                                │
│                                                             │
│  展示: 示例头像、AI 工具介绍、定价对比、FAQ                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Click "Get Started"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LOGIN PAGE (/login)                                         │
│                                                             │
│  [Continue with Google]                                     │
│  [Continue with Discord]                                    │
│  [Continue with Twitch]                                     │
│  [Continue with GitHub]                                     │
│                                                             │
│  首次登录自动创建账号 + 发放 500 Welcome Credits                │
└──────────────────────┬──────────────────────────────────────┘
                       │ OAuth success
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD (/dashboard)                                      │
│                                                             │
│  ┌──────────────────────────────────────┐                   │
│  │ Welcome, {name}!                      │                  │
│  │ Credits: 500 🪙                       │                  │
│  │ Plan: Free                            │                  │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  ┌──────────────────────────────────────┐                   │
│  │ [✨ Create Your First PNGTuber]       │ ← 新用户主 CTA    │
│  │                                       │                  │
│  │ "Describe your character and we'll    │                  │
│  │  generate a complete expression pack" │                  │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  Recent Avatars: (empty state)                              │
│  "No avatars yet. Create your first one!"                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Click "Create"
                       ▼
                  CREATE FLOW
                  (See Section 4)
```

### 3.2 Returning User（回访用户）

```
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD (/dashboard)                                      │
│                                                             │
│  Credits: 8,450 🪙  |  Plan: Start  |  [Top Up] [Upgrade]  │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │            │  │            │  │            │             │
│  │  Avatar 1  │  │  Avatar 2  │  │  [+ New]   │            │
│  │  "Luna"    │  │  "Kai"     │  │            │             │
│  │  4 expr.   │  │  6 expr.   │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                             │
│  [View All Avatars →]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Create Flow — Core Generation Experience

### Overview

单页多步骤流程（stepper UI），不跳转页面，用状态管理切换步骤。

```
Step 1          Step 2          Step 3          Step 4
Describe  →  Choose Base  →  Expressions  →  Download
(输入)        (选择首图)       (生成表情)      (下载打包)
```

---

### Step 1: Describe Your Character

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE PNGTUBER                              Step 1 of 4    │
│ ─────────────────────────────────────────────────────────── │
│ ● Describe  ○ Choose Base  ○ Expressions  ○ Download        │
│                                                             │
│ Describe your character                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ A cute anime girl with long silver hair, blue eyes,     │ │
│ │ wearing a purple hoodie with cat ears on the hood...    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Art Style                                                   │
│ ┌─────────┐  ┌─────────┐                                   │
│ │  Anime  │  │  Chibi  │                                    │
│ │  ✓      │  │         │                                    │
│ └─────────┘  └─────────┘                                   │
│                                                             │
│ Prompt Tips:                                                │
│ • Be specific about hair color, eye color, clothing         │
│ • Mention accessories (headphones, glasses, hat)            │
│ • Describe personality traits for better expressions        │
│                                                             │
│ Cost: 300 credits (character) + 800 credits (4 expressions) │
│ Total: 1,100 credits                                        │
│ Your balance: 500 credits                                   │
│                                                             │
│ [Generate Character — 300 🪙]                                │
│                                                             │
│ ⚠️ Not enough credits for full pack.                        │
│ You can generate the character first, then add expressions  │
│ later. [Get More Credits]                                   │
└─────────────────────────────────────────────────────────────┘
```

**逻辑说明：**
- 文本输入框：最少 10 字符，最多 1000 字符
- 风格选择：Anime（默认） / Chibi
- 预估费用展示：让用户在生成前清楚知道消耗
- 余额不足时：允许先生成首图（300 credits），表情后续单独付费
- 点击 Generate 后 → 调用 `/api/avatars/generate` → 进入 Step 2

---

### Step 2: Choose Your Base Character

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE PNGTUBER                              Step 2 of 4    │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Describe  ● Choose Base  ○ Expressions  ○ Download        │
│                                                             │
│ Choose your favorite                                        │
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │          │  │          │  │          │  │          │     │
│ │ Option 1 │  │ Option 2 │  │ Option 3 │  │ Option 4 │     │
│ │          │  │    ✓     │  │          │  │          │     │
│ │          │  │ selected │  │          │  │          │     │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│ Not happy? [🔄 Regenerate — 300 🪙]                          │
│                                                             │
│                     [← Back]  [Generate Expressions — 800 🪙]│
└─────────────────────────────────────────────────────────────┘
```

**逻辑说明：**
- Midjourney Niji 生成 4 张候选图（grid 模式），用户选 1 张
- 选中状态：高亮边框 + checkmark
- Regenerate：消耗额外 300 credits，重新生成 4 张（如果对全部不满意）
- 选中后点击 Next → 调用 `/api/avatars/expressions` → 进入 Step 3
- 余额不足时：可以只下载首图（跳到 Step 4），表情包后续再做

---

### Step 3: Expression Pack Generation

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE PNGTUBER                              Step 3 of 4    │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Describe  ✓ Choose Base  ● Expressions  ○ Download        │
│                                                             │
│ Generating your expression pack...                          │
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │          │  │ ████░░░  │  │          │  │          │     │
│ │  Idle    │  │ Talking  │  │  Happy   │  │   Sad    │     │
│ │    ✓     │  │ 生成中... │  │  待生成   │  │  待生成   │     │
│ │          │  │          │  │          │  │          │     │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│ ⏱ Estimated time: ~30 seconds                               │
│ ████████████░░░░░░░  2/4 expressions complete               │
└─────────────────────────────────────────────────────────────┘

                        ↓ 生成完成后 ↓

┌─────────────────────────────────────────────────────────────┐
│ CREATE PNGTUBER                              Step 3 of 4    │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Describe  ✓ Choose Base  ● Expressions  ○ Download        │
│                                                             │
│ Your expression pack is ready!                              │
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │          │  │          │  │          │  │          │     │
│ │  Idle    │  │ Talking  │  │  Happy   │  │   Sad    │     │
│ │    ✓     │  │    ✓     │  │    ✓     │  │    ✓     │     │
│ │          │  │          │  │          │  │          │     │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│ 😟 Don't like one? Click to regenerate (200 🪙 each)        │
│                                                             │
│                              [← Back]  [Continue to Download]│
└─────────────────────────────────────────────────────────────┘
```

**逻辑说明：**
- Idle = 首图（已有，无需重新生成）
- Talking / Happy / Sad = Nano Banana 标准版逐张生成
- 实时进度：每张完成立即展示（streaming UX）
- 单张重新生成：点击任意表情 → 消耗 200 credits → 只重做这一张
- 背景移除在服务端自动完成（用户无感知）
- 全部完成 → 进入 Step 4

---

### Step 4: Download

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE PNGTUBER                              Step 4 of 4    │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Describe  ✓ Choose Base  ✓ Expressions  ● Download        │
│                                                             │
│ 🎉 Your PNGTuber is ready!                                  │
│                                                             │
│ Name your character                                         │
│ ┌─────────────────────────────────────┐                     │
│ │ Luna                                │                     │
│ └─────────────────────────────────────┘                     │
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │          │  │          │  │          │  │          │     │
│ │  Idle    │  │ Talking  │  │  Happy   │  │   Sad    │     │
│ │          │  │          │  │          │  │          │     │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│ Export Size                                                  │
│ ○ 512x512 (Free)                                            │
│ ● 1080x1080 (Start+)                                       │
│ ○ 2160x2160 (Pro only) 🔒                                   │
│                                                             │
│ [📥 Download ZIP]    [📥 Download Individual PNGs]           │
│                                                             │
│ ────────────────────────────────────────                    │
│ What's next?                                                │
│ • Use with veadotube mini → [Quick Setup Guide]             │
│ • Use with PNGTuber Plus → [Quick Setup Guide]              │
│ • Use with Discord Reactive → [Quick Setup Guide]           │
│                                                             │
│ [Create Another]              [Go to My Avatars]            │
└─────────────────────────────────────────────────────────────┘
```

**逻辑说明：**
- 命名角色：用于文件名和作品库展示
- 导出尺寸：根据用户订阅等级限制（Free=512, Start=1080, Pro=2160）
- ZIP 打包：`Luna_idle.png`, `Luna_talking.png`, `Luna_happy.png`, `Luna_sad.png`
- Quick Setup Guide：简短的 FAQ 或弹窗，教用户如何在 veadotube 中使用
- 自动保存到 My Avatars（R2 存储）
- Free 用户下载的图片带水印

---

## 5. My Avatars Page

### 作品列表 (/avatars)

```
┌─────────────────────────────────────────────────────────────┐
│ MY AVATARS                                                  │
│                                                             │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│ │            │  │            │  │            │              │
│ │   Luna     │  │    Kai     │  │  [+ New]   │              │
│ │  4 expr.   │  │  4 expr.   │  │            │              │
│ │  Feb 19    │  │  Feb 18    │  │            │              │
│ └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### 角色详情 (/avatars/[id])

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to My Avatars                                        │
│                                                             │
│ Luna                                    Created Feb 19, 2026│
│                                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │          │  │          │  │          │  │          │     │
│ │  Idle    │  │ Talking  │  │  Happy   │  │   Sad    │     │
│ │          │  │          │  │          │  │          │     │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│ [📥 Download ZIP]  [➕ Add Expression — 200 🪙]  [🗑 Delete] │
│                                                             │
│ ── Generation Details ──                                    │
│ Prompt: "A cute anime girl with long silver hair..."        │
│ Style: Anime                                                │
│ Credits used: 1,100                                         │
└─────────────────────────────────────────────────────────────┘
```

**关键功能：**
- 后续追加表情：对已有角色新增 Angry/Surprised 等表情（200 credits/张）
- 重新下载：随时回来下载
- 删除：释放存储空间（不退还 credits）

---

## 6. Dashboard 详细设计

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─── Header ───────────────────────────────────────────┐    │
│ │ PNGTuberMaker    Dashboard  Pricing    [Avatar] ▾    │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─── Credit Bar ───────────────────────────────────────┐    │
│ │ 🪙 8,450 credits    Plan: Start    [Top Up] [Upgrade]│    │
│ └──────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─── Quick Action ─────────────────────────────────────┐    │
│ │                                                       │   │
│ │  [✨ Create New PNGTuber]                              │   │
│ │                                                       │   │
│ └──────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─── Recent Avatars ──────────────────────────────────┐     │
│ │                                                      │    │
│ │  ┌────────┐  ┌────────┐  ┌────────┐                 │    │
│ │  │ Luna   │  │  Kai   │  │ [+New] │                 │    │
│ │  │ 4 expr │  │ 4 expr │  │        │                 │    │
│ │  └────────┘  └────────┘  └────────┘                 │    │
│ │                                                      │    │
│ │  [View All →]                                        │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─── Usage This Month ────────────────────────────────┐     │
│ │ Credits used: 3,550 / 12,000                         │    │
│ │ ████████░░░░░░░░░░░░  29%                            │    │
│ │ Avatars created: 3    Resets: Mar 19                  │    │
│ └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Navigation Structure

### Header (Logged Out)

```
PNGTuberMaker    Pricing    [Login]    [Get Started]
```

### Header (Logged In)

```
PNGTuberMaker    Dashboard    Pricing    🪙 8,450    [Avatar ▾]
                                                       ├── My Avatars
                                                       ├── Settings
                                                       └── Log Out
```

**Key changes from current:**
- 增加 Dashboard 和 credits 显示
- Login 按钮变为用户头像下拉菜单
- Credit 余额始终可见（Header 右侧）

---

## 8. API Endpoints (MVP)

### Generation APIs

```
POST /api/avatars/generate
  Body: { prompt: string, style: "anime" | "chibi" }
  Auth: Required
  Cost: 300 credits
  Returns: { avatarId, images: [url, url, url, url] }  ← 4 candidates

POST /api/avatars/[id]/select
  Body: { selectedIndex: number }
  Auth: Required
  Cost: 0 credits (selection is free)
  Returns: { avatarId, baseImage: url }

POST /api/avatars/[id]/expressions
  Body: { expressions: ["talking", "happy", "sad"] }
  Auth: Required
  Cost: 200 credits × expression count
  Returns: { avatarId, expressions: [{ type, url, status }] }
  Note: Can use SSE/polling for real-time progress

POST /api/avatars/[id]/expressions/[expressionId]/regenerate
  Auth: Required
  Cost: 200 credits
  Returns: { expressionId, url }
```

### Credit APIs

```
GET /api/credits/balance
  Auth: Required
  Returns: { total, subscription, purchased, expiresAt }

GET /api/credits/history
  Auth: Required
  Returns: { transactions: [{ type, amount, description, createdAt }] }
```

### Download APIs

```
GET /api/avatars/[id]/download
  Query: { format: "zip" | "individual", size: 512 | 1080 | 2160 }
  Auth: Required
  Returns: ZIP file or redirect to individual image URLs
```

### Avatar Management APIs

```
GET /api/avatars
  Auth: Required
  Returns: { avatars: [{ id, name, thumbnail, expressionCount, createdAt }] }

GET /api/avatars/[id]
  Auth: Required
  Returns: { avatar detail with all expression URLs }

PATCH /api/avatars/[id]
  Body: { name: string }
  Auth: Required

DELETE /api/avatars/[id]
  Auth: Required
```

---

## 9. State Handling

### Loading States

| Location | Loading UX |
|----------|-----------|
| Step 1 → 2 (首图生成) | Full-screen loading with progress animation, ~15-30s |
| Step 2 → 3 (表情生成) | 逐张展示完成的表情，剩余显示 skeleton + spinner |
| Dashboard load | Skeleton cards for avatars |
| Download | Button spinner → auto download |

### Error States

| Error | UX |
|-------|-----|
| Generation failed | "Generation failed. Your credits have been refunded." + retry button |
| Insufficient credits | Show balance, suggest top-up or upgrade, allow partial flow |
| Network error | Toast notification + retry |
| Session expired | Redirect to login, preserve create flow state in localStorage |

### Empty States

| Location | UX |
|----------|-----|
| Dashboard (new user) | Welcome message + prominent "Create First PNGTuber" CTA |
| My Avatars (empty) | Illustration + "Create your first character" CTA |

---

## 10. MVP Development Phases

### Phase 1: Foundation (Database + Credit System)
- [ ] Update DB schema (wallets → credits, new tables)
- [ ] Credit balance API
- [ ] Credit transaction logging
- [ ] Stripe webhook update (subscription → credit grant)
- [ ] Credit top-up purchase flow

### Phase 2: Core Generation
- [ ] Midjourney Niji API integration (首图生成)
- [ ] Nano Banana Standard API integration via fal.ai (表情编辑)
- [ ] Background removal pipeline (rembg)
- [ ] R2 storage for generated images
- [ ] Generation API endpoints

### Phase 3: User Interface
- [ ] Dashboard page
- [ ] Create flow (4-step stepper)
- [ ] My Avatars page + detail page
- [ ] Header update (credits display, user menu)
- [ ] Pricing page update (credit model)

### Phase 4: Polish & Launch
- [ ] Watermark system (Free tier)
- [ ] Export size gating (512/1080/2160 by tier)
- [ ] Error handling & credit refund logic
- [ ] Loading & empty states
- [ ] Quick Setup Guides (veadotube/PNGTuber Plus)
- [ ] Mobile responsive
- [ ] E2E testing of full flow
