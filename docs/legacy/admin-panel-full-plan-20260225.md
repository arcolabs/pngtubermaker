# Admin Panel Full Implementation Plan (P0-P2)

> 基于现有 Dashboard + Customers 页面，补充完整运营所需功能。

---

## P0 — 关键运营功能

### 1. 用户详情页 (`/admin/customers/[id]`)

从 Customers 表格点击用户行 → 进入详情页。

**信息区域：**

| 区块 | 内容 | 数据来源 |
|------|------|---------|
| 用户概览 | 名称、邮箱、注册来源、注册时间、分层标签 | `user` + `account` |
| 钱包快照 | 订阅credits、购买credits、过期时间 | `wallets` |
| 订阅状态 | 当前tier、状态、周期、是否将取消 | `subscriptions` |

**历史记录 Tabs：**

| Tab | 列 | 数据来源 |
|-----|----|---------|-
| Credit History | 时间、类型（grant/consume/refund/expire）、金额、余额、描述 | `credit_transactions` |
| Generations | 时间、类型（avatar/expression）、状态、prompt/type、消耗credits | `avatars` + `avatar_expressions` |
| Payments | 时间、类型（topup/subscription）、金额、状态、Stripe ID | `transactions` |

**技术方案：**
- API: `GET /api/admin/customers/[id]` — 返回用户详情 + 三个历史记录
- Service: `lib/services/admin-customer-detail.ts` — 查询逻辑
- Page: `app/(main)/admin/customers/[id]/page.tsx` — 详情页面

### 2. 手动Credits操作

在用户详情页的钱包区域加入操作按钮。

| 操作 | 说明 | 调用 |
|------|------|------|
| Grant Credits | 手动给用户加credits（客服补偿） | `grantPurchasedCredits()` |
| Refund Credits | 退还credits | `refundCredits()` |

**技术方案：**
- API: `POST /api/admin/customers/[id]/credits` — body: `{ action: 'grant' | 'refund', amount: number, reason: string }`
- 操作后自动刷新详情页数据
- 所有操作自动记录到 `credit_transactions`（已有审计追踪）

---

## P1 — 运营增强

### 3. Dashboard 24h 成功率

将 Generation Stats 中的"Success Rate"和"Failed"改为近24小时窗口，方便发现实时故障。

**改动：**
- `admin-customers.ts` 新增查询: 24h内 expression 的 completed/failed 统计
- Dashboard 卡片: "24h Success Rate" + "24h Failed"
- 保留 all-time 数据作为副标题

### 4. 收入/交易列表

Dashboard 下方新增"Recent Transactions"区块（不单独页面）。

| 列 | 来源 |
|----|----- |
| 时间 | `transactions.createdAt` |
| 用户 | JOIN `user.name` |
| 类型 | topup / subscription |
| 金额 | `transactions.amount` |
| 状态 | completed / pending / failed |

**技术方案：**
- `admin-customers.ts` 扩展: 新增 `recentTransactions` 字段（最近20条）
- Dashboard 页面: 新增 RecentTransactions 组件

---

## P2 — 订阅洞察

### 5. 订阅概览

Dashboard 新增"Subscription Overview"区块。

| 指标 | 计算 |
|------|------|
| 活跃订阅数 | COUNT(subscriptions WHERE status='active') |
| MRR（月经常性收入） | SUM by tier pricing |
| 即将流失 | COUNT(subscriptions WHERE cancelAtPeriodEnd=true) |
| 已取消 | COUNT(subscriptions WHERE status='canceled') |

**技术方案：**
- `admin-customers.ts` 扩展: 新增 `subscriptionStats` 字段
- Dashboard 页面: 新增 SubscriptionOverview 组件

---

## 文件清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/services/admin-customer-detail.ts` | **新建** | 用户详情查询 |
| `lib/services/admin-customers.ts` | 修改 | 增加24h stats、交易列表、订阅stats |
| `app/api/admin/customers/[id]/route.ts` | **新建** | 用户详情API |
| `app/api/admin/customers/[id]/credits/route.ts` | **新建** | Credits操作API |
| `app/(main)/admin/customers/[id]/page.tsx` | **新建** | 用户详情页面 |
| `app/(main)/admin/customers/page.tsx` | 修改 | 表格行添加点击跳转 |
| `app/(main)/admin/page.tsx` | 修改 | 增加24h stats、交易列表、订阅概览 |
| `docs/admin-customer-dashboard-20260225.md` | 修改 | 更新文档 |

---

## 实施顺序

1. **P0-1**: `admin-customer-detail.ts` + API + 详情页面
2. **P0-2**: Credits 操作 API + 详情页面操作按钮
3. **P1-3**: 24h 成功率（service + dashboard）
4. **P1-4**: 交易列表（service + dashboard）
5. **P2-5**: 订阅概览（service + dashboard）
6. 文档更新 + lint check
