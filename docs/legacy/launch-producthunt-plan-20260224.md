# PNGTuberMaker — Product Hunt 发布方案

> Created: 2026-02-24
> Depends on: launch-discord-announcement-20260224.md（Discord 内测阶段提供素材和验证）

---

## 0. 核心认知

Product Hunt 是一次性资源。Launch 后无法重新 launch。所以：

- **不要急**。Discord 内测 1-2 周后，确认产品稳定、有真实用户反馈，再上 PH
- **准备 > 上线**。PH 排名取决于前 24 小时的 upvote 质量和互动密度
- **PH 是放大器，不是起点**。它给你一天的流量脉冲，长期增长靠 SEO 和口碑

---

## 1. 时间线

```
Discord 上线        PH 准备期         PH Launch Day      PH 后续
    |                   |                   |                |
    D-Day          D+7 ~ D+12          D+14 (目标)       D+15 ~ D+30
    |                   |                   |                |
  收集反馈         准备素材/文案        全天在线互动        持续内容营销
  修复 bug         邀约投票人           回复每条评论        Reddit/YouTube
  积累作品         预热社交媒体          社交媒体同步        SEO 长尾
```

> D+14 是目标，实际根据 Discord 阶段反馈灵活调整。如果 bug 多或体验差，宁可推迟。

---

## 2. PH 页面素材准备

### 2.1 核心信息

| 字段 | 内容 |
|------|------|
| **Product Name** | PNGTuberMaker |
| **Tagline** (60 chars max) | AI-powered PNGTuber avatars — prompt to live stream in 2 min |
| **URL** | https://pngtubermaker.com |
| **Category** | Artificial Intelligence / Design Tools / Streaming |
| **Topics** | #AI, #Design, #Streaming, #VTuber, #Avatar |

### 2.2 Tagline 备选

按优先级排列：

1. **"AI-powered PNGTuber avatars — prompt to live stream in 2 min"** ← 推荐
2. "Create PNGTuber avatars with AI — no art skills, no install, just stream"
3. "From text prompt to live PNGTuber — zero install, 2 minutes"
4. "AI avatar generator built for streamers — expressions, animations, OBS-ready"

> 选 Tagline 的标准：一句话讲清楚 **谁用（streamers）** + **做什么（PNGTuber）** + **差异化（AI + 快 + 零安装）**

### 2.3 Description（PH 详情页正文）

```markdown
# The Problem

Creating a PNGTuber is harder than it should be. Commission an artist ($50-300, wait 2 weeks), or fight with generic AI tools that can't keep expressions consistent. Then you still need to install veadotube, configure triggers, and wire up OBS — another 30-60 minutes of setup.

# The Solution

PNGTuberMaker generates your entire PNGTuber from a text prompt:

1. **Describe your character** → AI generates a consistent avatar
2. **Generate expressions** → Happy, angry, sad, surprised — all matching your character
3. **Get a live URL** → Paste into OBS as Browser Source, start streaming

No software to install. No files to manage. No technical skills needed.

# Key Features

🎨 **AI Avatar Generation** — Describe your character, get a professional PNGTuber in seconds
😊 **Expression Packs** — One-click generation of matching expressions (happy, angry, sad, surprised)
📺 **Zero-Install OBS Integration** — Browser Source URL, paste and stream
🖼️ **Multiple Styles** — Anime, chibi, and more
⬆️ **HD/4K Export** — From 512px to 4K resolution

# Built for Streamers

Whether you're a first-time Twitch streamer or a growing content creator, PNGTuberMaker gets you from "I want to stream" to "I'm live" in 2 minutes.

Free to try — no credit card required.
```

### 2.4 视觉素材

| 素材 | 规格 | 内容 |
|------|------|------|
| **Gallery Image 1** | 1270×760px | 产品主界面 — 展示 prompt 输入 + 生成结果 |
| **Gallery Image 2** | 1270×760px | 表情包生成 — 一个角色的 4-6 个表情一览 |
| **Gallery Image 3** | 1270×760px | OBS 集成效果 — 浏览器源在 OBS 中的实际画面 |
| **Gallery Image 4** | 1270×760px | 多风格展示 — Anime/Chibi/Pixel 不同风格对比 |
| **Demo Video** | 90s 以内, MP4 | 完整流程：prompt → 生成 → 表情 → OBS 直播 |
| **Thumbnail** | 240×240px | 产品 logo 或标志性角色 |

> **视频是最关键的素材**。PH 上有视频的产品互动率显著更高。90 秒以内，前 10 秒必须抓住注意力。

### 2.5 Demo 视频脚本（90 秒）

```
[0-5s]   标题卡：PNGTuberMaker — AI PNGTuber in 2 Minutes
[5-15s]  痛点：展示传统流程（找画师 → 等两周 → 装 veadotube → 配 OBS）打叉
[15-25s] 输入 prompt，点击生成，等待 loading
[25-35s] 结果出现 — 展示生成的角色，切换候选图
[35-50s] 点击生成表情包 — 快速展示 4-6 个表情生成过程
[50-65s] 复制 OBS Browser Source URL → 粘贴到 OBS → 角色出现在直播画面
[65-80s] 实际效果：对着麦克风说话，角色嘴巴动，表情切换
[80-90s] 结尾卡：pngtubermaker.com — Free to try
```

---

## 3. First Comment（Maker's Comment）

PH 上线后的第一条评论（Maker's Comment）非常重要，它定义了社区对你的第一印象。

```markdown
Hi Product Hunt! 👋

I'm [Your Name], a solo developer who built PNGTuberMaker.

**Why I built this:**

I noticed a gap in the PNGTuber ecosystem — there are tools to *display* PNGTubers (veadotube, PNGTuber Plus), but nothing to *create* them easily. New streamers either commission artists ($50-300, 2-week wait) or try generic AI tools that can't keep expressions consistent.

PNGTuberMaker solves both problems:
- **Consistent AI generation** — your expressions actually match your character
- **Zero-install streaming** — paste a URL into OBS, no software needed

**What's free:**
You get 500 credits on signup (enough to create your first character + expressions). No credit card, no catch.

**What I'd love from you:**
1. Try it and share what you create — I genuinely want to see your characters
2. Tell me what's missing — this is early, and your feedback shapes the roadmap
3. If you're a streamer, I'd love to know if the OBS integration actually works for your setup

This is a solo project and every piece of feedback matters. I'm here all day — ask me anything!
```

> 关键点：**真诚 > 营销**。PH 社区对独立开发者友好，但对过度营销反感。强调个人故事和"我想听反馈"。

---

## 4. 投票动员策略

### 4.1 可动员的人群

| 人群 | 预估人数 | 动员方式 |
|------|----------|----------|
| Discord 社区活跃用户 | 15-30 | 提前 1 天在 #announcements 预告 |
| Twitter/X 关注者 | 视现有粉丝数 | 发布当天发推 + pin |
| 独立开发者朋友圈 | 5-10 | 私信提前通知 |
| Reddit 社区互动过的人 | 5-10 | 如果之前发过帖，评论区提及 |

### 4.2 投票注意事项

**PH 反作弊机制严格**，以下行为会导致票数被清零：

- ❌ 直接发 PH 产品链接让人点投票
- ❌ 短时间内大量新注册 PH 账号投票
- ❌ 所有投票者来自同一 IP/地区
- ✅ 让用户从 producthunt.com 首页搜索 "PNGTuberMaker" 进入投票
- ✅ 有真实 PH 历史活跃度的账号投票权重更高
- ✅ 附带评论的投票权重更高

### 4.3 Discord 预告文案

PH 上线前 1 天在 Discord #announcements 发：

```markdown
📢 **明天我们登上 Product Hunt！**

PNGTuberMaker 明天会在 Product Hunt 正式发布。

如果你用过并且觉得不错，能帮个忙吗？

1. 明天到 producthunt.com 搜索 "PNGTuberMaker"
2. 给我们投一票 ⬆️
3. 如果能留一句评论（哪怕一两句你的使用感受）就更好了

PH 的排名会帮助更多创作者发现这个工具。谢谢大家的支持！🙏

（具体时间到了我会再发一次提醒）
```

---

## 5. Launch Day 执行清单

### 5.1 上线时间

- **日期**：周二/周三/周四（避开周一和周五）
- **时间**：PST 00:01（北京时间 16:01）PH 自动刷新排行
- **建议**：PST 00:01 前完成所有准备，排行刷新后立刻发布

### 5.2 当天时间表

| 时间 (PST) | 动作 |
|------------|------|
| 00:00 | 产品页面确认就绪，Maker's Comment 准备好 |
| 00:01 | PH 排行刷新 → 确认产品出现在 New 列表 |
| 00:05 | 发布 Maker's Comment |
| 00:15 | Discord #announcements 发通知："我们上线了！" |
| 00:30 | Twitter/X 发推 |
| 01:00-12:00 | 持续刷新 PH 评论，每条都回复 |
| 06:00 | 中期检查：排名位置、upvote 数、评论数 |
| 12:00 | 如果排名前 5，在 Discord 发进度更新鼓励继续投票 |
| 18:00 | 发一条"感谢"推文/Discord 消息，附当前排名 |
| 24:00 | PH 当日结束，统计最终排名 |

### 5.3 应急预案

| 风险 | 应对 |
|------|------|
| 服务器挂了 | 提前扩容/确认 auto-scaling；准备一条"正在修复"的状态消息 |
| 0 评论 | 自己发 Maker's Comment 后，请 2-3 个朋友留真实体验评论 |
| 负面评论 | 不要删除，不要防御性回复。承认问题 + 说明改进计划 |
| 票数被清洗 | 不要恐慌，PH 反作弊会在 24 小时内校准，真实票不会被清 |

---

## 6. PH 上线后（D+1 ~ D+7）

### 6.1 流量承接

PH 带来的流量是脉冲式的，90% 集中在第一天。关键是把这波流量转化为长期用户：

1. **Landing Page 增加 PH Badge**：`Featured on Product Hunt` 徽章，增加信任度
2. **邮件收集**：确保注册流程顺畅，不要在这一天出任何 bug
3. **Discord 入口明显**：让 PH 用户能方便加入 Discord 社区

### 6.2 内容复用

把 PH 的素材和结果复用到其他渠道：

| 渠道 | 内容 |
|------|------|
| **Reddit** | r/SideProject, r/indiehackers: "I launched on PH today, here's what I learned" |
| **Twitter/X** | Launch day thread: 开发故事 + 成果数据 |
| **YouTube** | 把 demo 视频扩展为 3-5 分钟教程 |
| **Blog/SEO** | "How to create a PNGTuber with AI — step by step guide" |

### 6.3 数据复盘（D+3）

| 指标 | 记录 |
|------|------|
| PH 最终排名（当日 / 当周） | |
| 总 Upvote 数 | |
| 评论数 | |
| PH 带来的注册用户数 | |
| PH 用户中完成首次生成的比例 | |
| PH 用户中付费转化数 | |

---

## 7. 完整素材清单（Checklist）

### PH 页面

- [ ] Product Name、Tagline、Description 定稿
- [ ] 4 张 Gallery Images（1270×760px）
- [ ] 1 段 Demo Video（90s 以内）
- [ ] Thumbnail（240×240px）
- [ ] Maker's Comment 写好

### 社交证明

- [ ] 至少 5 张用户作品截图（来自 Discord 内测）
- [ ] 至少 3 条用户好评引用（来自 Discord）
- [ ] 注册/生成的数据点（"已有 X 个创作者使用"）

### 技术准备

- [ ] 服务器容量确认（预期 PH 当天 2-5x 流量）
- [ ] 注册流程无 bug（当天重点测试 OAuth 登录）
- [ ] 关键页面加载速度 < 3s
- [ ] 监控和告警已配置

### 动员准备

- [ ] Discord 预告已发（D-1）
- [ ] Twitter 预告已发（D-1）
- [ ] 5-10 个可靠投票人已确认
- [ ] 投票引导话术已准备（搜索进入，不要直接链接）

---

## 8. 期望管理

**现实的预期**：

| 排名 | 含义 |
|------|------|
| **Top 5 of the Day** | 非常好，会上 PH 首页 newsletter，预计 1000-3000 访客 |
| **Top 10 of the Day** | 不错，会有持续流量，预计 500-1000 访客 |
| **Top 20 of the Day** | 一般，但仍有 SEO 价值（PH 页面会被 Google 收录） |
| **未进前 20** | 也没关系，PH 不是唯一渠道 |

**无论排名如何**，PH 的长期价值在于：
- 一个高权重的外链（SEO）
- "Featured on Product Hunt" 的信任徽章
- 一次完整的 launch 演练经验
- 可复用到所有渠道的素材

不要把成功与否系于 PH 排名。它是冷启动组合拳中的一环，不是全部。
