# PNGTuber Maker — MVP Definition & User Flow

> Last updated: 2026-02-21

---

## 1. MVP Scope

### In Scope (v1.0)

- [x] Landing page（已完成）
- [x] OAuth login — Google/GitHub/Discord/Twitch（已完成）
- [ ] Dashboard — 用户主页（Credit 余额、近期作品、创建入口）
- [ ] Create Flow — 核心生成流程（描述 → 首图 → 表情包 → 下载/上线）
- [ ] My Avatars — 作品库（查看、下载、删除）
- [ ] Credit System — 余额管理、消耗记录
- [ ] Pricing Page — 订阅 + 充值（更新为 Credit 模型）
- [ ] Stripe Integration — 订阅付费 + Credit 充值包
- [ ] **Live PNGTuber (OBS Browser Source)** — 零安装直播运行时（核心差异化功能）
  - `/live/[avatarId]` 页面：麦克风音量检测 → 表情自动切换
  - 用户复制 URL → 粘贴到 OBS Browser Source → 直接开播
  - 状态机：idle ↔ talking（语音驱动）+ blink（定时器驱动）
  - 设置面板：音量阈值、眨眼频率、表情切换速度

### Out of Scope (v2+)

- Character Studio（可调节编辑器）
- Avatar Library（社区共享模板）
- Style Transfer（风格迁移）
- Pixel art / Cartoon 风格
- 社交分享功能
- Live 高级功能：键盘热键切换、Twitch 弹幕触发、自定义动画曲线、多角色场景

---

## 2. Page Map

```
/                         ← Landing Page（已有）
/login                    ← OAuth Login（已有）
/dashboard                ← [NEW] 用户主页
/create                   ← [NEW] 生成流程（多步骤单页）
/avatars                  ← [NEW] 我的作品库
/avatars/[id]             ← [NEW] 单个角色详情（所有表情）
/live/[avatarId]          ← [NEW] ★ 直播运行时页面（OBS Browser Source）
/pricing                  ← [UPDATE] 更新为 Credit 模型
/api/avatars/generate     ← [NEW] 首图生成 API
/api/avatars/expressions  ← [NEW] 表情包生成 API
/api/avatars/[id]/live    ← [NEW] 获取 Live URL + token
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

### Step 4: Go Live / Download

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE PNGTUBER                              Step 4 of 4    │
│ ─────────────────────────────────────────────────────────── │
│ ✓ Describe  ✓ Choose Base  ✓ Expressions  ● Go Live         │
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
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ★ USE IN OBS (Recommended — zero install)                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  Add this URL as a Browser Source in OBS:               │ │
│ │  ┌───────────────────────────────────────────────┐      │ │
│ │  │ https://pngtubermaker.com/live/abc123?t=xxx   │ [📋] │ │
│ │  └───────────────────────────────────────────────┘      │ │
│ │                                                         │ │
│ │  3 steps to start streaming:                            │ │
│ │  1. Open OBS → Sources → + → Browser Source             │ │
│ │  2. Paste the URL above, set size to 512×512            │ │
│ │  3. Allow microphone → Done! Your avatar reacts         │ │
│ │     to your voice automatically.                        │ │
│ │                                                         │ │
│ │  [▶ Preview Live]    [⚙ Customize Settings]             │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ── OR download files ──────────────────────────────────────  │
│                                                             │
│ Export Size                                                  │
│ ○ 512x512 (Free)  ● 1080x1080 (Start+)  ○ 2160x2160 (Pro) │
│                                                             │
│ [📥 Download ZIP]  [📥 Download PNGs]                        │
│                                                             │
│ Use downloaded files with:                                  │
│ • veadotube mini → [Setup Guide]                            │
│ • PNGTuber Plus → [Setup Guide]                             │
│                                                             │
│ [Create Another]              [Go to My Avatars]            │
└─────────────────────────────────────────────────────────────┘
```

**逻辑说明：**

**OBS Browser Source（主推路径）：**
- 生成完成后自动创建 Live URL：`/live/{avatarId}?t={accessToken}`
- accessToken 是一次性生成的长期 token，绑定 avatarId + userId
- "Preview Live" 在当前页面内嵌预览（iframe 或内联 Canvas），让用户看到效果
- "Customize Settings" 打开设置面板：音量阈值、眨眼频率、idle 切换延迟
- URL 参数支持自定义：`?threshold=0.3&blink=5&transition=fade`
- 复制按钮 [📋] 一键复制完整 URL 到剪贴板

**ZIP 下载（备选路径）：**
- 命名角色：用于文件名和作品库展示
- 导出尺寸：根据用户订阅等级限制（Free=512, Start=1080, Pro=2160）
- ZIP 打包：`Luna_idle.png`, `Luna_talking.png`, `Luna_happy.png`, `Luna_sad.png`
- Setup Guide：简短弹窗，教用户如何在 veadotube 中使用
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
│ [▶ Go Live]  [📥 Download ZIP]  [➕ Add Expression]  [🗑 Delete]│
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
- **Go Live**：从详情页直接获取 OBS Browser Source URL

---

## 5.5 Live PNGTuber 页面 — OBS Browser Source 运行时

### 架构概述

```
/live/[avatarId]?t={token}&threshold=0.3&blink=5
```

这是一个**独立的轻量页面**，专为 OBS Browser Source 设计。不加载 Next.js 运行时、不加载导航栏、不加载 DaisyUI —— 纯 vanilla JS + Canvas，确保极致性能。

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ LIVE PNGTUBER (OBS Browser Source 视角)                      │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │                                                        │ │
│  │              [Avatar Expression Image]                 │ │
│  │                                                        │ │
│  │              Canvas renders current expression         │ │
│  │              based on mic input + blink timer          │ │
│  │                                                        │ │
│  │              Transparent background (for OBS)          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  状态指示（仅调试模式可见）:                                    │
│  🎤 Volume: ████░░░░ 0.42  State: TALKING  Blink: 3.2s     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 表情状态机

```
                    ┌──────────┐
           ┌───────│   IDLE   │───────┐
           │       └──────────┘       │
           │            ↑↓            │
      blink timer   voice on/off   blink timer
           │            ↑↓            │
           ↓       ┌──────────┐       ↓
    ┌────────────┐ │ TALKING  │ ┌──────────────┐
    │   BLINK    │ └──────────┘ │ BLINK_TALKING│
    └────────────┘      ↑↓      └──────────────┘
           ↑       blink timer         ↑
           └───────────────────────────┘
```

**状态切换逻辑：**
```
voice_active = volume > threshold (持续 50ms 以上，防抖)
blink_active = blink timer triggered (持续 150ms)

if (!voice_active && !blink_active) → idle
if (voice_active && !blink_active)  → talking
if (!voice_active && blink_active)  → blink
if (voice_active && blink_active)   → blink_talking
```

### 可配置参数（URL Params）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `t` | required | Access token（鉴权） |
| `threshold` | `0.15` | 音量阈值（0.0-1.0），低于此值判定为静音 |
| `blink` | `4` | 平均眨眼间隔（秒），实际值 ±30% 随机 |
| `blinkDuration` | `150` | 眨眼持续时间（ms） |
| `talkDelay` | `50` | 语音激活延迟（ms），防止短噪音触发 |
| `talkHold` | `200` | 语音停止后维持 talking 状态的时间（ms） |
| `transition` | `instant` | 表情切换方式：`instant`（直切）、`fade`（100ms 淡入） |
| `debug` | `false` | 显示调试信息（音量条、状态、FPS） |
| `flip` | `false` | 水平翻转（部分用户习惯镜像） |

### 技术实现要点

**1. 鉴权**
```
GET /live/abc123?t=eyJhbG...
→ 验证 token（JWT 或 opaque token）→ 获取 avatarId + userId
→ 查询 avatar 的所有 expression 图片 URL
→ Token 长期有效，不走 session（因为 OBS 无法登录）
```

**2. 资源加载**
```
页面加载 → 预加载所有表情 PNG（通常 4-10 张，总计 2-10MB）
→ 全部加载完成后才开始渲染
→ 显示 loading spinner 直到就绪
```

**3. 音频处理**
```javascript
// 伪代码 — 实际实现用 vanilla JS
navigator.mediaDevices.getUserMedia({ audio: true })
→ AudioContext → AnalyserNode → getByteFrequencyData()
→ 计算 RMS 音量 → 与 threshold 比较
→ 60fps requestAnimationFrame 循环更新状态
```

**4. Canvas 渲染**
```
Canvas 大小 = 表情图片原始尺寸（512/1080/2160）
背景透明 → OBS 自动 chroma-free
drawImage() 切换当前表情
transition=fade 时用 globalAlpha 实现过渡
```

**5. 降级处理**
```
麦克风权限拒绝 → 显示提示 "Allow microphone for voice detection"
                → 降级为纯 idle 展示（仍可用，只是不会动）
Token 无效     → 显示 "Invalid link. Go to pngtubermaker.com to get a new one"
图片加载失败   → 重试 3 次 → 显示 fallback 占位图
```

### 设置面板（Preview 模式）

当用户从 PNGTuberMaker 网站内访问 `/live/[id]`（非 OBS 环境），显示完整设置面板：

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Avatar                       Luna — Live Preview  │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │                          │  │ Settings                  │ │
│  │    [Live Avatar Preview] │  │                          │ │
│  │                          │  │ Mic Threshold    ───●──── │ │
│  │    Shows real-time       │  │                   0.15    │ │
│  │    expression switching  │  │                          │ │
│  │    with your microphone  │  │ Blink Interval   ──●───── │ │
│  │                          │  │                   4s      │ │
│  │                          │  │                          │ │
│  │                          │  │ Talk Hold Time   ───●──── │ │
│  │                          │  │                   200ms   │ │
│  │                          │  │                          │ │
│  │                          │  │ Transition   [Instant ▾]  │ │
│  │                          │  │                          │ │
│  │                          │  │ [x] Flip horizontal      │ │
│  │                          │  │ [ ] Show debug info       │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  Your OBS Browser Source URL:                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │ https://pngtubermaker.com/live/abc123?t=xxx&...   │ [📋] │
│  └───────────────────────────────────────────────────┘      │
│  URL auto-updates as you change settings above              │
│                                                             │
│  ── Quick Setup ──                                          │
│  1. Copy the URL above                                      │
│  2. In OBS: Sources → + → Browser Source                    │
│  3. Paste URL, set Width=512 Height=512                     │
│  4. Click OK — your PNGTuber is live!                       │
│                                                             │
│  ⚠ First time? You may need to allow microphone access      │
│    in the Browser Source properties panel.                   │
└─────────────────────────────────────────────────────────────┘
```

**OBS 环境检测：**
- 检测 `window.obsstudio` 对象（OBS Browser Source 注入的全局变量）
- 或检测 User-Agent 中的 OBS 标识
- OBS 环境内：只显示 Canvas，不显示设置面板
- 浏览器环境内：显示设置面板 + 预览 + URL 复制

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

### Live PNGTuber APIs (OBS Browser Source)

```
POST /api/avatars/[id]/live
  Auth: Required (session-based, owner only)
  Action: Generate or regenerate a long-lived access token for this avatar
  Returns: { liveUrl, token, expiresAt (null = never) }

GET /api/avatars/[id]/live
  Auth: Required (session-based, owner only)
  Returns: { liveUrl, token, active: boolean, lastUsed: timestamp }

DELETE /api/avatars/[id]/live
  Auth: Required
  Action: Revoke the live token (disable the live URL)
  Returns: { success: true }

GET /api/live/[avatarId]/config?t={token}
  Auth: Token-based (from URL param, no session needed)
  Purpose: Called by the /live page on load to fetch avatar data
  Returns: {
    avatarId,
    avatarName,
    expressions: [
      { type: "idle", url: "https://r2.../idle.png" },
      { type: "talking", url: "https://r2.../talking.png" },
      { type: "blink", url: "https://r2.../blink.png" },
      { type: "blink_talking", url: "https://r2.../blink_talking.png" },
      { type: "happy", url: "..." },          // if generated
      { type: "happy_talking", url: "..." },   // if generated
      ...
    ],
    settings: {
      threshold: 0.15,
      blinkInterval: 4,
      blinkDuration: 150,
      talkDelay: 50,
      talkHold: 200,
      transition: "instant",
      flip: false
    }
  }

PATCH /api/live/[avatarId]/settings
  Auth: Required (session-based, owner only)
  Body: { threshold?, blinkInterval?, talkHold?, transition?, flip? }
  Action: Save custom settings (persisted, applied to live page on next load)
  Returns: { settings: {...} }
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
| Live page load | 加载表情图片时显示 spinner → 全部加载完成后才开始渲染 |

### Error States

| Error | UX |
|-------|-----|
| Generation failed | "Generation failed. Your credits have been refunded." + retry button |
| Insufficient credits | Show balance, suggest top-up or upgrade, allow partial flow |
| Network error | Toast notification + retry |
| Session expired | Redirect to login, preserve create flow state in localStorage |
| Live: Mic denied | 显示提示 "Allow microphone for voice reactions" + 降级为静态 idle |
| Live: Invalid token | 显示 "This link has expired. Visit pngtubermaker.com to get a new one" |
| Live: Images failed | 重试 3 次 → 显示 fallback 文字提示 |

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
- [ ] Create flow (4-step stepper, Step 4 包含 Live URL)
- [ ] My Avatars page + detail page
- [ ] Header update (credits display, user menu)
- [ ] Pricing page update (credit model)

### Phase 4: Live PNGTuber (OBS Browser Source) ★ 核心差异化
- [ ] DB: `live_tokens` 表（avatarId, token, settings JSON, lastUsed, createdAt）
- [ ] API: `/api/avatars/[id]/live` — 生成/获取/吊销 live token
- [ ] API: `/api/live/[avatarId]/config` — token 鉴权，返回表情图片 URLs + 设置
- [ ] API: `/api/live/[avatarId]/settings` — 保存用户自定义参数
- [ ] Page: `/live/[avatarId]` — 轻量独立页面（不加载 Next.js 客户端运行时）
  - [ ] Canvas 渲染引擎：预加载表情图 → drawImage 切换
  - [ ] 音频引擎：getUserMedia → AudioContext → AnalyserNode → RMS 音量
  - [ ] 状态机：idle/talking/blink/blink_talking 四态切换
  - [ ] URL 参数解析：threshold、blink、transition 等
  - [ ] OBS 环境检测：`window.obsstudio` → 隐藏 UI，只显示 Canvas
- [ ] Page: `/live/[avatarId]` Preview 模式（浏览器内）
  - [ ] 设置面板 UI：滑块调节参数
  - [ ] URL 实时更新：设置变更 → URL 自动拼接新参数
  - [ ] 一键复制 URL
  - [ ] OBS 设置引导（3 步图文）
- [ ] Create Flow Step 4 集成：生成完成后展示 Live URL + 复制按钮
- [ ] Avatar Detail 页集成："Go Live" 按钮 + URL 管理

### Phase 5: Polish & Launch
- [ ] Watermark system (Free tier)
- [ ] Export size gating (512/1080/2160 by tier)
- [ ] Error handling & credit refund logic
- [ ] Loading & empty states
- [ ] veadotube/PNGTuber Plus Setup Guides（ZIP 下载备选路径）
- [ ] Mobile responsive
- [ ] E2E testing of full flow（包括 Live 页面的麦克风模拟测试）
- [ ] Live 页面性能测试（目标：< 100ms 表情切换延迟，< 30MB 内存）
