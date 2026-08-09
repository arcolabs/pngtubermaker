# Reference Sheet 功能需求

## 概述

基于用户已确认的 avatar（`status: completed`），使用 img2img 生成角色设定资料卡（reference sheet）。

**用户场景**：找画师约稿、二创素材参考、角色设计存档

---

## 技术可行性（已验证）

- Cocorouter edit 接口 (`/v1/zeakai/images/edits`) 支持 `image_url` + text prompt
- GPT-Image-2 输出 1024x1024 正方形（当前硬限制，无法改 landscape）
- Reference Sheet Prompt 固定，无需变量
- 文字说明直接画在图上，无需 LLM 额外生成

**测试 Prompt**:
```
Based on this character and background, create an official-style character reference sheet.
Include three views: front, side, and back. Add facial expression variations.
Break down and show detailed parts of clothing and equipment. Add a color palette.
Include a brief description of the world setting. Overall, use an organized layout with white background, illustration style.
```

---

## 数据模型

### avatars 表新增字段

```typescript
referenceSheetUrl: text("reference_sheet_url")        // CDN URL
referenceSheetR2Key: text("reference_sheet_r2_key")   // R2 key
referenceSheetGeneratedAt: timestamp("reference_sheet_generated_at")
```

每个 avatar 只能有 1 份 reference sheet（覆盖式，非追加）。

---

## Credits 逻辑

| 操作 | Credits |
|------|---------|
| 生成 / 覆盖 reference sheet | 400（新增 `TASK_COSTS.reference_sheet`） |

- 扣费前检查余额，不足则拒绝生成并提示充值
- 无 tier 区别，所有用户同等收费
- 覆盖时不退款旧版本

---

## API 设计

### `POST /api/avatars/[id]/reference-sheet`

**认证**：Required（必须拥有该 avatar）

**请求体**：无（avatarId 从 URL 获取）

**响应**：
```json
{
  "avatarId": "xxx",
  "referenceSheetUrl": "https://cdn.xxx.png",
  "referenceSheetR2Key": "avatars/xxx/reference-sheet/xxx.png"
}
```

**错误码**：
- 401: Unauthorized
- 403: 不拥有该 avatar
- 400: Avatar 未完成（`status !== 'completed'`）
- 402: Credits 不足

**流程**：
1. Auth check + ownership check + avatar status check
2. 检查余额 ≥ 400 credits
3. 原子扣费（`consumeCredits`）
4. 调用 `GptImageAdapter.postEdit(avatar.originalBaseImageUrl, REFERENCE_SHEET_PROMPT)`
5. 上传结果到 R2
6. 更新 avatar 记录（`referenceSheetUrl`, `referenceSheetR2Key`, `referenceSheetGeneratedAt`）
7. 返回 URL

---

## UI 设计

### 位置

Avatar Detail 页面，**独立 Section**，与 Expression Pack 并行：

```
[Avatar Detail Page]
├── Base Avatar display
│
├── Expression Pack
│   ├── Generate Expression button → modal
│   └── Expression Grid (idle, talking, blink...)
│
└── Reference Sheet ← NEW SECTION
    ├── [Generate Reference Sheet] button (触发 POST)
    ├── Preview thumbnail (generated 后显示)
    └── [Download] [Regenerate] (generated 后显示)
```

### Dashboard 列表

Avatar 卡片上显示 Reference Sheet 缩略图入口，点击跳转 Avatar Detail 的 Reference Sheet Section。

---

## 待确认 / 注意事项

- R2 上 reference sheet 的存储路径：`avatars/{userId}/{avatarId}/reference-sheet/{timestamp}.png`
- 无需 background removal（reference sheet 本身就是白底）
- 不需要 expression pack 那样的状态机（generating/completed/failed），直接同步生成即可
- Regenerate：直接覆盖，扣费后重新生成
