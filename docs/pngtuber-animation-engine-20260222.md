# PNGTuber Animation Engine — 技术文档

> Last updated: 2026-02-23

---

## 1. 概述

PNGTuber Animation Engine 是一个零框架依赖的 TypeScript 动画引擎，运行在 HTML Canvas 上，为 Live Preview 提供实时动画预览。

设计参考了游戏 Sprite 动画机的思路：
- **瞬时帧切换**（无 alpha 渐变，避免透明 PNG 白闪）
- **Squash & Stretch 弹跳**动画（经典动画原则）
- **双层说话检测**（宏观 isSpeaking + 微观 mouthOpen，模拟自然唇动节奏）
- **状态标记组合**决定当前帧（类似 Animator Controller 的参数驱动）

### 文件位置

| 文件 | 职责 |
|------|------|
| `lib/pngtuber-engine.ts` | 引擎核心（状态机 + 统一渲染循环 + 动画） |
| `components/avatars/PNGTuberPreview.tsx` | React 包装组件（生命周期管理 + UI 控件） |
| `components/avatars/AudioWaveButton.tsx` | 音频波形按钮（使用引擎归一化音量） |

---

## 2. 状态模型

引擎用四层状态组合决定每帧显示哪张图片：

```
┌─────────────────────────────────────────────────┐
│  currentExpression (基础表情)                      │
│  "idle" | "happy" | "sad" | "angry"              │
├─────────────────────────────────────────────────┤
│  isSpeaking (宏观说话)  boolean  ← 平滑检测       │
│  mouthOpen  (嘴巴张开)  boolean  ← 原始音量驱动    │
│  isBlinking (眨眼中)    boolean                   │
└─────────────────────────────────────────────────┘
```

### 帧解析规则 (`resolveExpression`)

使用 `mouthOpen` 作为统一的嘴巴状态标记（demo/mic/audio 模式均统一）。

基础表情为 idle 时：

| isBlinking | mouthOpen | 解析结果 |
|:---:|:---:|---|
| true | true | `blink_talking` → fallback `blink` → `talking` |
| true | false | `blink` → fallback `idle` |
| false | true | `talking` → fallback `idle` |
| false | false | `idle` |

基础表情为 happy/sad/angry 时：

| mouthOpen | 解析结果 |
|:---:|---|
| true | `{base}_talking` → fallback `{base}` |
| false | `{base}` |

> 自定义表情目前没有 blink 变体，眨眼时保持基础表情不变。

### 可用表情帧列表

```
idle, talking, blink, blink_talking
happy, happy_talking
sad, sad_talking
angry, angry_talking
```

---

## 3. 驱动模式

### 3.1 Demo 模式（自动演示）

```
每 1800ms 自动切换:
idle → talking → happy → happy_talking → sad → sad_talking → angry → angry_talking
  ↑                                                                              │
  └─────────────────────────────── 循环 ──────────────────────────────────────────┘
```

- 仅包含 `imageMap` 中实际存在的表情
- 通过 `applyDemoEntry()` 分解序列项为 base + mouthOpen
  - `"talking"` → base=`idle`, mouthOpen=true
  - `"happy_talking"` → base=`happy`, mouthOpen=true
  - `"idle"` → base=`idle`, mouthOpen=false
- 基础表情切换触发**完整 bounce** (amplitude=1.0)
- 仅嘴巴状态切换触发**半幅 bounce** (amplitude=0.5)

### 3.2 Mic / Audio 模式（音量驱动）

基础表情固定为 idle，使用**双层检测**驱动嘴巴动画：

```
                ┌─────────────────────────────────────────┐
                │         Raw RMS (每帧计算)               │
                └──────────┬──────────────┬───────────────┘
                           │              │
                   ┌───────▼───────┐  ┌───▼────────────────┐
                   │   宏观层       │  │   微观层             │
                   │  (isSpeaking)  │  │  (mouthOpen)        │
                   ├───────────────┤  ├────────────────────┤
                   │ EMA 平滑       │  │ 原始音量直接比较      │
                   │ 滞回阈值       │  │ 极短 debounce (30ms) │
                   │ Hold 150ms    │  │ 保底振荡 (200+70ms)  │
                   ├───────────────┤  ├────────────────────┤
                   │ 控制: bounce   │  │ 控制: 嘴巴帧切换      │
                   │ 控制: 事件     │  │ 跟随语音自然节奏       │
                   └───────────────┘  └────────────────────┘
```

#### 宏观层：isSpeaking

稳定检测"是否在说话"，用于触发 bounce 动画和 UI 事件。保持原有三层处理：

**① EMA 平滑（Exponential Moving Average）**
```
smoothedVolume = old * 0.7 + rawRms * 0.3
```

**② 滞回阈值（Hysteresis）**
```
开口阈值 (open):  micThreshold      (默认 0.06)
闭口阈值 (close): micThreshold × 0.65 (默认 0.039)
```

**③ 最小保持时间（Hold Time）**
```
开口后至少保持 150ms 才允许闭合
```

#### 微观层：mouthOpen

跟随语音的自然节奏驱动嘴巴帧切换，让嘴巴在说话时有开合动画而非一直张开。

**① 原始音量驱动**
```
使用 rawVolume（不经 EMA 平滑）直接与阈值比较
开口: rawVolume > micThreshold
闭口: rawVolume < micThreshold × 0.5  且超过 30ms debounce
```
人类语音天然有节奏——元音响亮（嘴开）、辅音安静（嘴合），rawVolume 的自然波动直接驱动嘴巴开合。

**② 保底振荡（Fallback Oscillation）**
```
嘴巴连续张开 > 200ms → 强制闭合 70ms → 自动重新张开
周期: 270ms ≈ 3.7 Hz（符合 3-8 Hz 的自然说话唇动频率）
```
应对极端情况（持续长音、音频质量导致音量恒定），保证嘴巴始终有动画。

**时间线示例（对比旧方案）：**
```
音量:      ──▄▆█▆▄▂▁▂▄▆█▆▄▂▁▁▁▁▁──
旧 isTalking: ○○○●●●●●●●●●●●●●●●○○○  ← 嘴巴一直张开
新 isSpeaking: ○○○●●●●●●●●●●●●●●●○○○  ← 宏观仍保持稳定
新 mouthOpen:  ○○○●●●○○●●●●○○●○○○○○○  ← 微观跟随节奏开合
```

- 宏观变化时触发**半幅 bounce** (amplitude=0.5)
- 微观变化时**不触发 bounce**（频率太高，加弹跳会显得抽搐）
- 麦克风权限被拒绝时自动 fallback 到 Demo 模式

---

## 4. 眨眼系统

独立于驱动模式运行，始终有效：

```
随机等待 3~7s
    → isBlinking = true
    → 150ms 后
    → isBlinking = false
    → 重新随机等待
```

- 直接修改 `isBlinking` flag，不经过 `setExpression()`
- 帧切换**瞬时**（下一帧直接显示 blink 图）
- **不触发 bounce**（眨眼是高频微动作，加弹跳会显得不自然）

---

## 5. 程序化动画系统

所有动画在 `draw()` 中通过 Canvas transform 叠加，锚点统一在**底部中心**。

### 5.1 持续动画（始终运行）

**呼吸 (Breathing)**
```
scaleY = 1 + 0.003 × sin(engineTime / 3500 × 2π)
```
- 幅度 ±0.3%，周期 3.5s
- 角色轻微起伏，避免"完全静止"的不自然感

**微摆 (Sway)**
```
rotation = 0.005 × sin(engineTime / 5000 × 2π)  // ≈ ±0.29°
```
- 幅度 ±0.29°，周期 5s
- 与呼吸周期不同步（3.5s vs 5s），形成 Lissajous 式自然运动

### 5.2 触发动画：Bounce（Squash & Stretch）

三种触发场景，不同强度：

| 触发 | amplitude | 效果 |
|------|:---------:|------|
| Demo 基础表情切换 (`setExpression`) | 1.0 | 完整弹跳 |
| 宏观说话切换 / Demo 嘴巴切换 | 0.5 | 半幅弹跳 |
| 微观嘴巴开合 | — | 不触发 |
| 眨眼 | — | 不触发 |

### 动画曲线（amplitude=1.0 时）

总时长 300ms，三阶段 squash & stretch：

```
时间    scaleY    scaleX (=2-scaleY)    视觉效果
─────   ──────    ──────────────────    ────────
0%      1.00      1.00                  正常
35%     0.95      1.05                  压扁（矮胖）
65%     1.03      0.97                  拉伸超调（高瘦）
100%    1.00      1.00                  回归正常
```

amplitude=0.5 时所有偏移量减半（squash 到 0.975, stretch 到 1.015）。

- 各阶段使用 `smoothstep` 缓动（平滑起止）
- `scaleX = 2 - scaleY` 保持面积不变（体积守恒原则）
- 变换锚点：**底部中心**（角色脚底不动，向上压缩/拉伸）

### 5.3 变换叠加顺序

```
ctx.translate(width/2, height)    // 移到锚点（底部中心）
ctx.rotate(swayAngle)             // 微摆
ctx.scale(bounceSx, breathSy × bounceSy)  // 呼吸 × 弹跳
ctx.translate(-width/2, -height)  // 还原
ctx.drawImage(...)                // 绘制
```

### 为什么不用 alpha 渐变（Crossfade）

之前的实现在帧切换时做 alpha crossfade：

```
prevImg at globalAlpha = (1 - progress)   // 例如 0.5
currImg at globalAlpha = progress         // 例如 0.5
```

对于透明 PNG（背景移除后），两张图在重叠区域的合成 alpha < 1.0，
导致白色 CSS 背景穿透可见 → **白色闪烁**。

Sprite 动画机不做 alpha 混合，而是瞬时切帧 + 物理动画（弹跳/位移），
这从根本上避免了透明图片的合成问题。

---

## 6. 渲染循环（统一 RAF）

引擎使用**单一 requestAnimationFrame 循环**驱动所有逻辑（音量检测 + 动画更新 + 绘制），
避免多个 RAF 循环的性能浪费和时序不一致。

```
requestAnimationFrame (每帧 ~16ms)
│
├─ updateVolume()          // 仅 mic/audio 模式：双层音量检测
│    ├─ 宏观: EMA → 滞回 → Hold → isSpeaking
│    └─ 微观: raw → debounce → 保底振荡 → mouthOpen
│
├─ updateBounce(dt)
│    └─ 推进 bounceTime，超过 bounceDuration 则结束
│
└─ draw()
     ├─ resolveExpression()       // 状态组合 → 帧名
     ├─ imageMap.get(帧名)         // 查预加载的 HTMLImageElement
     ├─ ctx.clearRect()           // 清空画布
     └─ ctx.drawImage()           // 绘制（带 transform 叠加）
```

首帧 dt 保护：`lastRenderTime === 0` 时 dt 固定为 16ms，避免首帧 dt 爆表。

---

## 7. 音频系统

### AudioContext 复用

引擎在所有模式间复用同一个 AudioContext，避免浏览器 AudioContext 数量限制（Chrome ~6个）。

```
ensureAudioContext()  → 懒创建，suspended 时自动 resume
ensureAnalyser()      → 懒创建 AnalyserNode + 复用 Uint8Array 数据缓冲
disconnectAudioGraph() → 断开所有 source/analyser 连接（保留 Context）
destroy()             → 唯一关闭 AudioContext 的时机
```

### Mic 模式音频拓扑
```
MediaStream → MediaStreamSourceNode → AnalyserNode  (不连接 destination)
```

### Audio 模式音频拓扑
```
HTMLAudioElement → MediaElementSourceNode → AnalyserNode → AudioContext.destination
```

### 动态音量归一化

引擎跟踪音量峰值，提供归一化后的音量值供 UI 使用：

```typescript
// 峰值跟踪（每帧衰减 0.2%，约 5s 半衰期）
peakVolume = max(peakVolume × 0.998, smoothedVolume)

// 归一化 API
getNormalizedVolume(): number → smoothedVolume / peakVolume  // 0-1
```

AudioWaveButton 直接使用归一化值，不再硬编码 `volume / 0.2`。

---

## 8. 图片预加载

```
expressions[] → 并行加载所有图片
             → 外部 URL 走 /api/proxy-image 代理（解决 CORS）
             → 同源 URL 直接加载
             → 加载失败跳过（非致命）
             → 如果没有 idle，用第一张图兜底
             → 全部失败则 emit error
```

加载进度通过 `loadProgress` 事件上报，UI 层显示进度条。

---

## 9. 配置项

| 配置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvas` | HTMLCanvasElement | (必填) | 渲染目标 |
| `expressions` | ExpressionAsset[] | (必填) | 表情图片列表 |
| `mode` | `"demo"` \| `"mic"` | `"demo"` | 初始驱动模式 |
| `micThreshold` | number | 0.06 | 麦克风音量阈值 (0-1) |
| `bounceOnChange` | boolean | true | 是否启用 bounce 动画 |
| `bounceDuration` | number | 300 | bounce 动画时长 (ms) |
| `proxyBaseUrl` | string | `/api/proxy-image?url=` | 图片代理 URL 前缀 |

---

## 10. 事件系统

| 事件类型 | 触发时机 | 附带数据 |
|----------|----------|----------|
| `ready` | 图片预加载完成，引擎就绪 | — |
| `loadProgress` | 每张图片加载完成 | `progress: number (0-1)` |
| `expressionChange` | 当前表情变化（含微观嘴巴开合） | `expression: EngineExpressionType` |
| `modeChange` | 驱动模式切换 | `mode: EngineMode` |
| `audioEnded` | 音频播放结束 | — |
| `error` | 错误（图片加载失败、麦克风拒绝等） | `error: string` |

---

## 11. 已知限制与后续方向

### 当前限制

1. **自定义表情无 blink 变体** — happy/sad/angry 眨眼时保持原表情
2. **Demo 节奏固定** — 1800ms 等间隔，缺乏自然感

### 后续可探索方向

- **OBS Browser Source Player** — 独立播放器页面，替代 veadotube（详见 `docs/obs-player-feature-20260223.md`）
- **Demo 随机节奏** — 随机间隔 (1.5~3s) 替代固定 1800ms
- **正式状态机** — 用显式 state machine 替代 flag 组合，便于扩展复杂过渡规则
- **入场/退场动画** — 首次加载完成后的 pop-in 效果
- **音量驱动弹跳强度** — 根据音量大小动态调整 bounce amplitude
