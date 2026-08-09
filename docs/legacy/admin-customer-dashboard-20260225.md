# Admin Panel

> `/admin` — 统一的管理后台，包含 Dashboard、Customers、Badges、Partners 四个页面。

## 页面结构

| 路径 | 职责 | 说明 |
|------|------|------|
| `/admin` | **Dashboard** | 总览：用户统计 + 生成健康度(24h) + 7天趋势 + 注册来源 + 订阅概览 + 漏斗摘要 + 最近交易 |
| `/admin/customers` | **客户管理** | 搜索 + 分层筛选 + 用户列表表格（排序、点击进入详情） |
| `/admin/customers/[id]` | **用户详情** | 账户信息 + 钱包快照 + 订阅状态 + Credit/Generation/Payment 历史 + 手动Credits操作 |
| `/admin/badges` | **Badge管理** | CRUD badge，展示在首页footer |
| `/admin/partners` | **Partner管理** | CRUD partner links |

所有页面共享 Admin 导航栏（`AdminNav` 组件在 admin layout 中渲染）。

---

## Dashboard (`/admin`)

一眼看全局的总览页面。

### 用户统计卡片（5个）

| 卡片 | 数据来源 | 计算方式 |
|------|---------|---------|
| 总用户数 | `user` | COUNT(*) |
| 本周新增 | `user` | COUNT(*) WHERE createdAt >= 7天前 |
| 激活率 | `user` + `avatars` | 有avatar的用户数 / 总用户数 |
| 付费转化率 | `user` + `transactions` | 有completed交易的用户数 / 总用户数 |
| 总收入 | `transactions` | SUM(amount) WHERE status='completed' |

### 生成健康度卡片（4个）

| 卡片 | 数据来源 |
|------|---------|
| Avatars 总数 | `avatars` COUNT |
| Expressions 总数 | `avatar_expressions` COUNT |
| 24h 成功率 | 近24小时 completed / total（低于90%自动告警图标） |
| 24h 失败数 | 近24小时 status='failed'（副标题显示all-time） |

### 7天趋势图

柱状图并排展示每天注册数 vs 生成数。

### 注册来源分布

水平进度条：Google / GitHub / Discord / Twitch 占比。

### 订阅概览（P2）

| 指标 | 计算 |
|------|------|
| 活跃订阅数 | COUNT(subscriptions WHERE status='active') |
| MRR | SUM by tier pricing |
| 即将流失 | COUNT(cancelAtPeriodEnd=true) |
| 已取消 | COUNT(status='canceled') |

### 漏斗摘要

5个分层计数卡片，点击跳转到 `/admin/customers?segment=xxx`。

### 最近交易列表（P1）

最近20笔 Stripe 交易（时间、用户、类型、金额、状态）。

---

## Customers (`/admin/customers`)

具体客户管理页面。

### 搜索

按用户名或邮箱实时搜索（前端过滤）。

### 分层筛选

| 分层 | 定义 |
|------|------|
| Inactive | 0个avatar，从未消耗credits |
| Exploring | 有avatar，还有剩余credits |
| Exhausted | credits余额为0，从未付费 — **最关键转化目标** |
| Paying | 至少一笔成功充值/订阅 |
| Dormant | 30天无credit交易活动 |

支持从 Dashboard 带 `?segment=xxx` 参数跳转预筛选。

### 用户列表表格

| 列 | 数据来源 |
|----|---------|
| 用户名 / 邮箱 | `user.name`, `user.email` |
| 注册来源 | `account.providerId` |
| 注册时间 | `user.createdAt` |
| Avatar数量 | COUNT(`avatars`) |
| Credits余额 | `wallets.subscriptionCredits + purchasedCredits` |
| 总充值金额 | SUM(`transactions.amount`) WHERE completed |
| 最后活跃 | MAX(`credit_transactions.createdAt`) |
| 分层标签 | 计算得出 |

所有列支持升降排序。点击行进入用户详情页。

---

## 用户详情 (`/admin/customers/[id]`)

### 信息区域（3个卡片）

| 卡片 | 内容 |
|------|------|
| Account | 注册来源、注册时间 |
| Wallet | 总credits、订阅credits、购买credits、过期时间 + **Grant/Refund 操作按钮** |
| Subscription | 当前tier、状态、周期结束时间、是否将取消 |

### 手动Credits操作

- **Grant Credits**: 手动补偿credits → 调用 `grantPurchasedCredits()`
- **Refund Credits**: 退还credits → 调用 `refundCredits()`
- 需填写金额和原因
- 所有操作自动记录到 `credit_transactions`（完整审计追踪）

### 历史记录 Tabs

| Tab | 列 |
|-----|-----|
| Credit History | 时间、类型（grant/consume/refund/expire）、金额、余额、描述 |
| Generations | 时间、类型（avatar/expression）、label、状态、消耗credits |
| Payments | 时间、类型（topup/subscription）、金额、状态、Stripe ID |

---

## 技术实现

### API

| 端点 | 说明 |
|------|------|
| `GET /api/admin/customers` | 总览数据（13个并行查询），Dashboard + Customers 共用 |
| `GET /api/admin/customers/[id]` | 用户详情（7个并行查询） |
| `POST /api/admin/customers/[id]/credits` | Credits操作（grant/refund） |

### 文件清单

| 文件 | 说明 |
|------|------|
| `lib/services/admin-customers.ts` | Dashboard 数据查询 + 分层计算 + 24h stats + 交易 + 订阅 |
| `lib/services/admin-customer-detail.ts` | 用户详情查询（账户/钱包/订阅/历史记录） |
| `app/api/admin/customers/route.ts` | Dashboard API路由 |
| `app/api/admin/customers/[id]/route.ts` | 用户详情 API路由 |
| `app/api/admin/customers/[id]/credits/route.ts` | Credits操作 API路由 |
| `app/(main)/admin/page.tsx` | Dashboard 页面 |
| `app/(main)/admin/customers/page.tsx` | 客户管理页面 |
| `app/(main)/admin/customers/[id]/page.tsx` | 用户详情页面 |
| `app/(main)/admin/AdminNav.tsx` | 共享导航栏组件 |
| `app/(main)/admin/layout.tsx` | Admin layout（noindex + 导航栏） |

### 鉴权

复用 `isAdmin` 检查（`ADMIN_USER_IDS` 环境变量），admin layout 设置 `robots: { index: false, follow: false }`。

---

## 后续可扩展

- 导出CSV
- 实时刷新（WebSocket / polling）
- 批量操作（批量发credits）
- 用户禁用/启用
