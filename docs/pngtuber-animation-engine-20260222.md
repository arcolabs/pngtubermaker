# PNGTuber Animation Engine — 技术文档

> Last updated: 2026-02-22

---

## 1. 概述

PNGTuber Animation Engine 是一个零框架依赖的 TypeScript 动画引擎，运行在 HTML Canvas 上，为 Live Preview 提供实时动画预览。

设计参考了游戏 Sprite 动画机的思路：
- **瞬时帧切换**（无 alpha 渐变，避免透明 PNG 白闪）
- **Squash & Stretch 弹跳**动画（经典动画原则）
- **状态标记组合**决定当前帧（类似 Animator Controller 的参数驱动）

### 文件位置

| 文件 | 职责 |
|------|------|
| `lib/pngtuber-engine.ts` | 引擎核心（状态机 + 渲染循环 + 动画） |
| `components/avatars/PNGTuberPreview.tsx` | React 包装组件（生命周期管理 + UI 控件） |

---

## 2. 状态模型

引擎用三层状态组合决定每帧显示哪张图片：

```
┌─────────────────────────────────────────────────┐
│  currentExpression (基础表情)                      │
│  "idle" | "talking" | "happy" | "sad" | "angry"  │
├─────────────────────────────────────────────────┤
│  isTalking  (说话中)   boolean                    │
│  isBlinking (眨眼中)   boolean                    │
└─────────────────────────────────────────────────┘
```

### 帧解析规则 (`resolveExpression`)

基础表情为 idle 时：

| isBlinking | isTalking | 解析结果 |
|:---:|:---:|---|
| true | true | `blink_talking` → fallback `blink` → `talking` |
| true | false | `blink` → fallback `idle` |
| false | true | `talking` → fallback `idle` |
| false | false | `idle` |

基础表情为 happy/sad/angry 时：

| isTalking | 解析结果 |
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
- 每次切换调用 `setExpression()` → 触发 bounce 动画
- `isTalking` 根据表情名是否含 `"talking"` 自动设置

### 3.2 Mic 模式（麦克风驱动）

```
基础表情固定为 idle
每帧（~60fps）检测麦克风音量:
  RMS > threshold(0.06) → isTalking = true  → 显示 talking
  RMS ≤ threshold       → isTalking = false → 显示 idle
```

- 不调用 `setExpression()`，不触发 bounce
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

## 5. Bounce 动画（Squash & Stretch）

### 触发条件

仅 `setExpression()` 调用时触发，即：
- Demo 模式下的表情切换 ✅
- Mic 模式下说话状态切换 ❌（直接改 flag）
- 眨眼 ❌（直接改 flag）

### 动画曲线

总时长 300ms，三阶段 squash & stretch：

```
时间    scaleY    scaleX (=2-scaleY)    视觉效果
─────   ──────    ──────────────────    ────────
0%      1.00      1.00                  正常
35%     0.95      1.05                  压扁（矮胖）
65%     1.03      0.97                  拉伸超调（高瘦）
100%    1.00      1.00                  回归正常
```

- 各阶段使用 `smoothstep` 缓动（平滑起止）
- `scaleX = 2 - scaleY` 保持面积不变（体积守恒原则）
- 变换锚点：**底部中心**（角色脚底不动，向上压缩/拉伸）

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

## 6. 渲染循环

```
requestAnimationFrame (每帧 ~16ms)
│
├─ updateBounce(dt)
│    └─ 推进 bounceTime，超过 bounceDuration 则结束
│
└─ draw()
     ├─ resolveExpression()       // 三层状态 → 帧名
     ├─ imageMap.get(帧名)         // 查预加载的 HTMLImageElement
     ├─ ctx.clearRect()           // 清空画布
     └─ ctx.drawImage()           // 绘制（如有 bounce 则先 ctx.scale 变换）
```

首帧 dt 保护：`lastRenderTime === 0` 时 dt 固定为 16ms，避免首帧 dt 爆表。

---

## 7. 图片预加载

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

## 8. 配置项

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

## 9. 事件系统

| 事件类型 | 触发时机 | 附带数据 |
|----------|----------|----------|
| `ready` | 图片预加载完成，引擎就绪 | — |
| `loadProgress` | 每张图片加载完成 | `progress: number (0-1)` |
| `expressionChange` | 当前表情变化 | `expression: EngineExpressionType` |
| `modeChange` | 驱动模式切换 | `mode: EngineMode` |
| `error` | 错误（图片加载失败、麦克风拒绝等） | `error: string` |

---

## 10. 已知限制与后续方向

### 当前限制

1. **自定义表情无 blink 变体** — happy/sad/angry 眨眼时保持原表情
2. **Mic 模式无 bounce** — 说话切换是瞬时的，没有视觉反馈
3. **Demo 节奏固定** — 1800ms 等间隔，缺乏自然感
4. **无呼吸动画** — idle 状态完全静止

### 后续可探索方向

- **Idle 呼吸动画** — idle 时微幅 scaleY 正弦循环，避免"完全静止"的不自然感
- **Mic 说话 bounce** — 开口/闭口时加微弹跳，增强互动感
- **Demo 随机节奏** — 随机间隔 (1.5~3s) 替代固定 1800ms
- **正式状态机** — 用显式 state machine 替代 flag 组合，便于扩展复杂过渡规则
- **入场/退场动画** — 首次加载完成后的 pop-in 效果
