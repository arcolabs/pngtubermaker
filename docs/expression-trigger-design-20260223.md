# 自定义表情触发方案 — 设计决策

> Created: 2026-02-23

---

## 1. 问题

当前自定义表情（happy/sad/angry）仅在 Demo 模式中自动轮播展示。
Mic/Audio 模式下基础表情锁定在 idle，没有任何途径让用户在直播中切换表情。

表情包（Expression Pack）是 Start/Pro 付费功能的核心卖点之一，如果用户只能在预览页看到它们轮播而无法在直播中使用，这个功能的价值为零。

---

## 2. 备选方案评估

### 方案 A：Hotkey 手动触发

veadotube mini、PNGTuber Plus 的标准做法。用户按快捷键切换表情。

| 维度 | 评分 | 说明 |
|------|:---:|------|
| 可靠性 | ★★★★★ | 零误判，用户 intentional 操作 |
| 实现难度 | ★★☆☆☆ | 键盘监听 + 定时器，引擎已支持 setExpression |
| 用户体验 | ★★★☆☆ | 增加认知负荷，实践中大部分主播忘记按，表情包利用率低 |
| 行业标准 | ★★★★★ | PNGTuber 社区的默认心智模型 |

### 方案 B：音频情绪检测自动驱动

分析音频特征（音高、能量、语速）推断情绪，自动切换表情。

| 维度 | 评分 | 说明 |
|------|:---:|------|
| 可靠性 | ★☆☆☆☆ | 最佳模型（Hume AI 等）准确率仅 60-70%，实时场景更差 |
| 实现难度 | ★★★★★ | 需要 ML 模型，客户端太重 / 服务端有延迟和成本 |
| 用户体验 | ★★☆☆☆ | 高误报比没有表情更令人挫败 |
| 行业标准 | ☆☆☆☆☆ | 无主流 PNGTuber 工具使用此方案 |

**不可行**：技术成熟度不足，强行上线会损害产品信誉。

### 方案 C：Chat 驱动（观众触发）

Twitch/YouTube 聊天命令（`!happy`、`!sad`）或弹幕 emote 情绪分析触发表情。

| 维度 | 评分 | 说明 |
|------|:---:|------|
| 可靠性 | ★★★☆☆ | 关键词匹配可靠，emote 分析有噪声 |
| 实现难度 | ★★★★☆ | 需要 Twitch/YouTube API 集成，OAuth 流程 |
| 用户体验 | ★★★★★ | 观众互动感极强，主播零操作 |
| 行业标准 | ★★★☆☆ | 部分 VTuber 工具支持，但非 PNGTuber 标配 |

**可行但复杂**：适合作为 Pro 增值功能，不适合作为基础方案。

### 方案 D：Hotkey + 定时自动回归（推荐）

按键触发表情，持续 N 秒后自动回到 idle。两层分离：

- **情绪层**（currentExpression）由 hotkey 控制
- **物理层**（mouthOpen）由音量检测持续驱动

```
用户按下 "2" (happy)
  → currentExpression = "happy"
  → mouthOpen 继续由双层音量检测驱动
  → 画面: happy ←→ happy_talking 交替（嘴巴跟着说话节奏开合）
  → 5s 后 auto-return
  → currentExpression = "idle"
  → 画面: idle ←→ talking 交替
```

| 维度 | 评分 | 说明 |
|------|:---:|------|
| 可靠性 | ★★★★★ | 同方案 A |
| 实现难度 | ★★☆☆☆ | 同方案 A + 一个 setTimeout |
| 用户体验 | ★★★★☆ | auto-return 消除"按回去"的负担，降低认知负荷 |
| 行业标准 | ★★★★★ | veadotube 等工具的常见配置模式 |

---

## 3. 决策：方案 D 为主，方案 C 为远期增值

```
Phase 1 (所有 tier):  Hotkey + auto-return
Phase 2 (OBS Player): Remote control panel
Phase 3 (Pro tier):   Chat 驱动（Twitch/YouTube 集成）
```

---

## 4. Hotkey + Auto-return 详细设计

### 4.1 引擎层

在 `PNGTuberEngine` 中新增公开 API：

```typescript
/**
 * 切换到自定义表情，duration(ms) 后自动回到 idle。
 * 在表情期间，mouthOpen 继续由音量检测驱动。
 */
triggerExpression(expression: "happy" | "sad" | "angry", duration?: number): void

/** 立即回到 idle（取消 auto-return 定时器）。 */
clearExpression(): void

/** 当前活跃的自定义表情（null = idle）。 */
getActiveExpression(): EngineExpressionType | null
```

内部实现：
- 调用已有的 `setExpression(expression)` 设置基础表情
- 启动 auto-return 定时器（默认 5000ms，可配置）
- 定时器到期后 `setExpression("idle")`
- 重复触发同一表情则重置定时器（延长持续时间）
- 触发不同表情则清除旧定时器，切换到新表情

### 4.2 跨上下文通信

PNGTuber 运行在不同上下文中，需要不同的触发机制：

| 上下文 | 触发方式 | 技术方案 |
|--------|---------|---------|
| **预览页** | 直接键盘监听 | `document.addEventListener("keydown", ...)` |
| **OBS Browser Source** | 遥控面板 | `BroadcastChannel` / `localStorage` event |
| **移动端** | 触屏按钮 | 遥控面板的响应式 UI |

#### 预览页键盘映射

| 按键 | 表情 | 备注 |
|------|------|------|
| `1` | happy | 数字键直觉映射 |
| `2` | sad | |
| `3` | angry | |
| `0` 或 `Esc` | 回到 idle | 手动清除 |

仅在 canvas focus / 页面 focus 时响应，避免和输入框冲突。

#### OBS 遥控面板

```
路由: /player/[avatarId]/control

┌────────────────────────────────┐
│  Expression Control            │
│                                │
│  [😊 Happy]  [😢 Sad]  [😠 Angry] │
│                                │
│  Auto-return: [5s ▼]           │
│                                │
│  Current: idle                 │
│  Mouth: open                   │
└────────────────────────────────┘
```

通信方式（两个同源页面之间）：

**方案：BroadcastChannel API**
```typescript
// 遥控面板
const channel = new BroadcastChannel(`pngtuber:${avatarId}`);
channel.postMessage({ type: "expression", value: "happy" });

// Player 页面
const channel = new BroadcastChannel(`pngtuber:${avatarId}`);
channel.onmessage = (e) => {
  if (e.data.type === "expression") {
    engine.triggerExpression(e.data.value);
  }
};
```

优势：比 localStorage event 更语义化，支持多 tab，无需 server。
局限：需同源（同域名下的两个标签页），OBS Browser Source 的 origin 策略可能需要验证。

### 4.3 UI 提示

预览页 canvas 下方显示快捷键提示（非侵入式）：

```
[1 😊] [2 😢] [3 😠]  ← 淡色小标签，hover 显示完整名称
```

当表情激活时，对应标签高亮 + 显示倒计时进度条。

### 4.4 配置项

| 配置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `expressionDuration` | number | 5000 | Auto-return 持续时间 (ms) |
| `expressionKeys` | Record | `{1:"happy",2:"sad",3:"angry"}` | 快捷键映射 |

可通过 URL 参数传递（OBS Player 场景）：
```
/player/abc123?expressionDuration=8000
```

---

## 5. Chat 驱动（远期 Pro 功能）

### 5.1 触发逻辑

| 方式 | 触发条件 | 说明 |
|------|---------|------|
| **命令** | `!happy` / `!sad` / `!angry` | 精确触发 |
| **Emote 计数** | 10s 内 >5 个 LUL emote | 触发 happy |
| **投票** | `!vote happy` 多数票 | 民主投票 |

### 5.2 防滥用

- 冷却时间：每个用户每 30s 只能触发一次
- 全局冷却：表情切换后 5s 内不响应新触发
- 主播 override：主播的 hotkey 永远优先于 chat 触发
- 黑名单：主播可屏蔽特定用户的触发权限

### 5.3 需要的集成

| 平台 | API | 鉴权 |
|------|-----|------|
| Twitch | EventSub WebSocket | OAuth (chat:read scope) |
| YouTube | Live Streaming API | OAuth (YouTube Data API v3) |

这是一个完整的功能模块，工作量较大，适合作为独立 milestone。

---

## 6. 产品分层

| 功能 | Free | Start | Pro |
|------|:----:|:-----:|:---:|
| 自定义表情生成 | — | ✅ | ✅ |
| Hotkey 触发（预览页） | — | ✅ | ✅ |
| OBS Player 遥控面板 | — | ✅ | ✅ |
| Auto-return 时间自定义 | — | ✅ | ✅ |
| Chat 驱动（Twitch/YouTube） | — | — | ✅ |
| Chat 投票模式 | — | — | ✅ |

---

## 7. 实施顺序

### Phase 1：引擎层支持
- [ ] `triggerExpression()` / `clearExpression()` API
- [ ] Auto-return 定时器逻辑
- [ ] `expressionDuration` 配置项

### Phase 2：预览页集成
- [ ] 键盘监听（1/2/3 键）
- [ ] UI 快捷键提示标签
- [ ] 激活状态高亮 + 倒计时

### Phase 3：OBS 遥控面板
- [ ] `/player/[avatarId]/control` 页面
- [ ] BroadcastChannel 通信
- [ ] 响应式触屏 UI
- [ ] 在 OBS Player 文档中更新引用

### Phase 4：Chat 集成（Pro）
- [ ] Twitch EventSub 连接
- [ ] YouTube Live Chat 连接
- [ ] 命令解析 + emote 计数
- [ ] 防滥用（冷却、黑名单）
- [ ] 用户设置界面（连接/断开、配置命令）
