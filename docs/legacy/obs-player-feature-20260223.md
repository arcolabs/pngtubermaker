# OBS Browser Source Player — 产品方案

> Created: 2026-02-23

---

## 1. 核心价值

将 PNGTuberMaker 从"头像生成工具"升级为"生成 + 直播一站式平台"。

用户旅程对比：

```
传统方式（veadotube）:
  找画师/自己画 → 下载 veadotube → 导入图片 → 配置参数 → OBS 窗口捕获 → 开播
  耗时：几天到几周

PNGTuberMaker:
  AI 生成头像 → 复制 Player URL → OBS Browser Source 粘贴 → 开播
  耗时：几分钟
```

### 产品意义

- **留存**：纯生成工具用户付一次钱就走，Player 让用户每次开播都依赖我们
- **闭环**：生成 + 使用一站式，veadotube 只做"使用"半边
- **壁垒**：用户头像数据在我们平台，迁移成本高
- **增长**：观众看到主播的 PNGTuber → "怎么做的？" → 自然传播

---

## 2. 用户交互

### 2.1 获取 Player URL

在 Avatar 详情页增加"OBS Setup"区域：

```
┌──────────────────────────────────────────┐
│  🎬 Use in OBS                           │
│                                          │
│  Browser Source URL:                     │
│  ┌────────────────────────────────────┐  │
│  │ https://pngtubermaker.com/player/  │  │
│  │ abc123?threshold=0.06              │  │
│  └────────────────────────────────────┘  │
│  [📋 Copy URL]                           │
│                                          │
│  Settings:                               │
│  Mic Sensitivity: ████████░░ 0.06        │
│  Bounce: [✓]                             │
│  Width: 512  Height: 512                 │
│                                          │
│  ⚡ Quick Setup Guide                    │
│  1. Copy the URL above                   │
│  2. In OBS → Sources → + → Browser       │
│  3. Paste URL, set width/height          │
│  4. Check "Control audio via OBS"        │
│  5. Done!                                │
└──────────────────────────────────────────┘
```

### 2.2 OBS 中的效果

- 透明背景，角色悬浮在游戏画面上
- 麦克风驱动：说话 → 嘴动 + bounce，安静 → idle
- 随机眨眼
- 自定义表情：通过遥控面板或 Chat 命令触发（详见 [`docs/expression-trigger-design-20260223.md`](./expression-trigger-design-20260223.md)）

---

## 3. 技术方案

### 3.1 页面路由

```
app/(player)/player/[avatarId]/page.tsx
```

独立 layout，不包含 Header/Footer/任何 UI chrome。

### 3.2 页面结构

```tsx
// 整个页面就是一个全屏透明 canvas
<html style="background: transparent">
  <body style="background: transparent; margin: 0; overflow: hidden">
    <canvas id="pngtuber" style="width: 100vw; height: 100vh" />
  </body>
</html>
```

### 3.3 URL 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `threshold` | number | 0.06 | 麦克风音量阈值 (0-1) |
| `bounce` | boolean | true | 是否启用弹跳动画 |
| `bounceDuration` | number | 300 | 弹跳时长 (ms) |
| `expressions` | string | (全部) | 逗号分隔的表情列表，限制加载 |

示例：
```
/player/abc123?threshold=0.08&bounce=true&bounceDuration=250
```

### 3.4 数据加载

```
1. 从 URL 获取 avatarId
2. GET /api/avatars/[id]/public → 返回表情图片 URL 列表
   （新 API，无需鉴权，只返回公开数据：图片 URL + 表情类型）
3. 初始化 PNGTuberEngine (mode: "mic")
4. 开始渲染
```

### 3.5 API 端点

```
GET /api/avatars/[id]/public

Response:
{
  "avatarId": "abc123",
  "name": "My PNGTuber",
  "expressions": [
    { "type": "idle", "url": "https://cdn.pngtubermaker.com/..." },
    { "type": "talking", "url": "https://cdn.pngtubermaker.com/..." },
    { "type": "blink", "url": "https://cdn.pngtubermaker.com/..." },
    ...
  ]
}
```

需要考虑：
- 速率限制（防滥用）
- 只返回 status=completed 的 avatar
- 只返回 avatar 拥有者设置为"公开"的 avatar（需要新增 isPublic 字段）

### 3.6 OBS Browser Source 注意事项

- OBS 默认不允许 browser source 访问麦克风
- 需要在 OBS Browser Source 的"自定义 CSS"或启动参数中启用
- 在 Player 页面检测到无麦克风权限时，显示简洁的提示指引
- OBS browser source 原生支持透明背景（页面背景为 transparent 即可）

### 3.7 访问控制

Player URL 是否需要鉴权？两种方案：

**方案 A：公开访问（推荐起步）**
- `/player/[avatarId]` 任何人可访问
- avatarId 使用 UUID，不可猜测
- 简单，OBS 直接粘贴即可

**方案 B：带 token 访问（后续增强）**
- `/player/[avatarId]?token=xxx`
- token 由用户在设置页生成，可吊销
- 防止别人盗用你的 PNGTuber

起步用方案 A，后续有需求再加 token。

---

## 4. 产品分层

| 功能 | Free | Start | Pro |
|------|:----:|:-----:|:---:|
| Player URL | ✅ | ✅ | ✅ |
| 基础表情 (idle/talking/blink) | ✅ | ✅ | ✅ |
| 自定义表情 (happy/sad/angry) | — | ✅ | ✅ |
| 自定义 OBS 参数 | — | ✅ | ✅ |
| 去水印 / 高分辨率 | — | — | ✅ |
| 多 Avatar 切换 | — | — | ✅ |

Free tier 也给 Player URL — 这是获客入口，让免费用户也能开播，
体验到价值后再升级付费获取更多表情和高清。

---

## 5. 实施优先级

### Phase 1：最小可用（MVP）
- [ ] `/player/[avatarId]` 页面 — 透明 canvas + PNGTuberEngine (mic mode)
- [ ] `GET /api/avatars/[id]/public` — 公开 API
- [ ] Avatar 详情页增加 "Use in OBS" 区域 + 复制 URL
- [ ] 基本 URL 参数支持 (threshold)

### Phase 2：体验优化
- [ ] Player 页面加载状态 / 错误提示（麦克风拒绝指引）
- [ ] Avatar 设置页：isPublic 开关
- [ ] OBS Setup Guide 页面（含截图/视频教程）
- [ ] URL 参数扩展（bounce, expressions 过滤）

### Phase 3：商业化增强
- [ ] Token-based 访问控制
- [ ] Player 使用统计（开播时长、次数）
- [ ] 多 Avatar 切换（Pro 功能）
- [ ] 自定义 Player 皮肤/背景

---

## 6. 竞争优势

vs veadotube mini:
- **不需要下载安装任何软件**
- **不需要手动导入图片**
- **创建到使用 3 分钟闭环**
- 劣势：依赖网络（veadotube 是本地应用）

vs Live2D:
- **不竞争** — 完全不同的品类和用户群
- Live2D 面向专业 VTuber（需要建模师 + rigger）
- 我们面向 80% 想要简单 PNGTuber 的主播
