# Stripe 配置指南

本文档将引导你在 Stripe Dashboard 中获取所有必要的密钥和 Price ID，并配置到项目的 `.env` 文件中。

> 建议先使用 **Test Mode（测试模式）** 完成全部配置和调试，确认无误后再切换到 Live Mode。

---

## 目录

1. [计费模型概览](#1-计费模型概览)
2. [获取 API 密钥](#2-获取-api-密钥)
3. [创建产品和价格](#3-创建产品和价格)
4. [配置 Webhook](#4-配置-webhook)
5. [填写环境变量](#5-填写环境变量)
6. [推送数据库变更](#6-推送数据库变更)
7. [本地测试 Webhook（可选）](#7-本地测试-webhook可选)
8. [验证清单](#8-验证清单)

---

## 1. 计费模型概览

项目采用 **Credits（积分）** 计费模型，有两种购买方式：

### Credit Packs（一次性购买，永不过期）

| 包名 | 积分 | 价格 | 单价 |
|------|------|------|------|
| Starter | 2,000 | $2.99 | $1.50/1000 |
| Popular | 5,500 | $6.99 | $1.27/1000 |
| Best Value | 13,000 | $14.99 | $1.15/1000 |

### Creator Pass（可选订阅）

| 周期 | 价格 | 每月积分 | 折算单价 |
|------|------|---------|---------|
| 月付 | $7.99/mo | 6,000 | $1.33/1000 |
| 年付 | $71.88/yr ($5.99/mo) | 6,000/月 | $1.00/1000 |

Creator Pass 额外权益：HD 导出 (1080p)、所有表情包、优先邮件支持。

### 注册赠送

新用户注册时自动获赠 **1,000 积分**（30 天后过期），可免费体验生成流程。

### 积分消耗

| 操作 | 消耗 |
|------|------|
| 角色生成（首图） | 300 积分 |
| 表情生成（单个） | 200 积分 |

---

## 2. 获取 API 密钥

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 确保左上角开关处于 **"Test mode"**（橙色标识）
3. 点击右上角 **"Developers"** → **"API keys"**
4. 你会看到两个密钥：

| 密钥 | 前缀 | 用途 | 对应环境变量 |
|------|------|------|-------------|
| Publishable key | `pk_test_` | 前端使用，可公开 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key | `sk_test_` | 后端使用，**绝不能暴露** | `STRIPE_SECRET_KEY` |

> 点击 Secret key 旁的 **"Reveal test key"** 按钮查看完整密钥。

---

## 3. 创建产品和价格

本项目需要创建 **1 个订阅产品**（Creator Pass，2 个价格）。Credit Packs 使用 Stripe Checkout 的 `price_data` 动态创建，无需预先配置 Price ID。

### 3.1 创建 Creator Pass 产品

1. 进入 **"Products"** → 点击 **"+ Add product"**
2. 填写：
   - **Name**: `Creator Pass`
   - **Description**: `6,000 credits/month + HD export + all expression packs`
3. 在 **Pricing** 区域添加第一个价格（月付）：
   - **Pricing model**: Standard pricing
   - **Price**: `$7.99`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`
   - 点击 **"Add another price"**
4. 添加第二个价格（年付）：
   - **Price**: `$71.88`（相当于 $5.99/月，省 25%）
   - **Billing period**: `Yearly`
   - **Currency**: `USD`
5. 点击 **"Save product"**

### 3.2 获取 Price ID

创建完成后，进入产品详情页：

1. 点击产品名称进入详情
2. 在 **Pricing** 区域，每个价格行右侧有一个 ID，格式为 `price_xxxxxxxxxxxxxxxx`
3. 点击 ID 即可复制

你需要收集 **2 个 Price ID**：

| 产品 | 周期 | 价格 | 对应环境变量 |
|------|------|------|-------------|
| Creator Pass | Monthly | $7.99/mo | `STRIPE_PRICE_CREATOR_MONTHLY` |
| Creator Pass | Yearly | $71.88/yr | `STRIPE_PRICE_CREATOR_YEARLY` |

> Credit Packs 不需要 Price ID — 代码中通过 `price_data` 动态生成价格（见 `lib/stripe.ts` 的 `CREDIT_PACKS` 常量）。

---

## 4. 配置 Webhook

Webhook 让 Stripe 在支付完成、订阅变更等事件发生时通知你的应用。

### 生产环境

1. 进入 **"Developers"** → **"Webhooks"**
2. 点击 **"+ Add endpoint"**
3. 填写：
   - **Endpoint URL**: `https://你的域名/api/webhooks/stripe`
   - **Description**: `Production webhook`
4. 点击 **"Select events"**，勾选以下事件：
   - `checkout.session.completed` — 订阅/充值支付完成
   - `customer.subscription.updated` — 订阅续费、取消计划等变更
   - `customer.subscription.deleted` — 订阅最终删除
   - `payment_intent.payment_failed` — 支付失败
5. 点击 **"Add endpoint"**
6. 创建后进入 endpoint 详情页，点击 **"Reveal"** 查看 **Signing secret**
   - 格式为 `whsec_xxxxxxxxxxxxxxxx`
   - 这就是 `STRIPE_WEBHOOK_SECRET`

---

## 5. 填写环境变量

将上面获取的所有值填入项目根目录的 `.env` 文件：

```bash
# Stripe API 密钥
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Webhook 签名密钥
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (Creator Pass)
STRIPE_PRICE_CREATOR_MONTHLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_CREATOR_YEARLY=price_xxxxxxxxxxxxxxxx
```

> **安全提示**：`.env` 文件已在 `.gitignore` 中，不会被提交到代码仓库。绝不要将 `sk_test_` 或 `sk_live_` 开头的密钥提交到 Git。

---

## 6. 推送数据库变更

Stripe 集成需要以下数据库表，运行命令同步 schema：

```bash
bun run db:push
```

这会创建/更新以下表：
- `subscriptions` — 用户订阅记录（Creator Pass）
- `credit_transactions` — 积分变动记录（充值、消耗、过期）
- `transactions` — 支付交易记录
- `webhook_events` — Webhook 幂等性记录

---

## 7. 本地测试 Webhook（可选）

本地开发时 Stripe 无法直接访问 `localhost`，需要使用 Stripe CLI 转发事件。

### 安装 Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux (Debian/Ubuntu)
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe
```

### 登录并转发

```bash
# 登录 Stripe 账号
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

运行后终端会输出一个临时的 signing secret（`whsec_...`），将它填入 `.env` 的 `STRIPE_WEBHOOK_SECRET`。

### 触发测试事件

在另一个终端窗口：

```bash
# 触发一个 checkout 完成事件
stripe trigger checkout.session.completed

# 触发订阅更新事件
stripe trigger customer.subscription.updated
```

---

## 8. 验证清单

配置完成后，逐项确认：

- [ ] `.env` 中 5 个 Stripe 变量都已填写（不含空值）
- [ ] `bun run db:push` 执行成功
- [ ] `bun run dev` 启动无报错
- [ ] 访问 `/pricing` 页面能正常显示 Credit Packs 和 Creator Pass
- [ ] 点击 Credit Pack 购买按钮能跳转到 Stripe Checkout 页面
- [ ] 点击 Creator Pass 订阅按钮能跳转到 Stripe Checkout 页面
- [ ] 使用测试卡号 `4242 4242 4242 4242`（任意未来日期、任意 CVC）完成支付
- [ ] Credit Pack 支付后积分到账（永不过期）
- [ ] Creator Pass 支付后积分到账（周期结束过期）+ 订阅记录写入数据库

### Stripe 测试卡号速查

| 卡号 | 场景 |
|------|------|
| `4242 4242 4242 4242` | 支付成功 |
| `4000 0000 0000 3220` | 需要 3D Secure 验证 |
| `4000 0000 0000 9995` | 支付被拒绝 |

> 所有测试卡的到期日填任意未来日期，CVC 填任意 3 位数字。

---

## 切换到生产环境

准备上线时：

1. 关闭 Stripe Dashboard 的 Test mode 开关
2. 在 Live mode 下重新获取 `pk_live_` 和 `sk_live_` 密钥
3. 重新创建 Creator Pass 产品和价格（或从 Test 复制到 Live）
4. 重新创建 Webhook endpoint 并获取新的 signing secret
5. 更新生产环境的环境变量
6. **不要**在生产环境使用 `test` 前缀的密钥
