# Stripe 配置指南

本文档将引导你在 Stripe Dashboard 中获取所有必要的密钥和 Price ID，并配置到项目的 `.env` 文件中。

> 建议先使用 **Test Mode（测试模式）** 完成全部配置和调试，确认无误后再切换到 Live Mode。

---

## 目录

1. [获取 API 密钥](#1-获取-api-密钥)
2. [创建产品和价格](#2-创建产品和价格)
3. [配置 Webhook](#3-配置-webhook)
4. [填写环境变量](#4-填写环境变量)
5. [推送数据库变更](#5-推送数据库变更)
6. [本地测试 Webhook（可选）](#6-本地测试-webhook可选)
7. [验证清单](#7-验证清单)

---

## 1. 获取 API 密钥

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

## 2. 创建产品和价格

本项目有两个订阅套餐（Starter 和 Pro），每个套餐有月付和年付两种价格，共需创建 **4 个 Price ID**。

### 2.1 创建 Starter 产品

1. 进入 **"Products"** → 点击 **"+ Add product"**
2. 填写：
   - **Name**: `Starter`
   - **Description**: `Perfect for individuals getting started`
3. 在 **Pricing** 区域添加第一个价格（月付）：
   - **Pricing model**: Standard pricing
   - **Price**: `$9.00`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`
   - 点击 **"Add another price"**
4. 添加第二个价格（年付）：
   - **Price**: `$86.40`（相当于 $7.20/月，省 20%）
   - **Billing period**: `Yearly`
   - **Currency**: `USD`
5. 点击 **"Save product"**

### 2.2 创建 Pro 产品

1. 再次点击 **"+ Add product"**
2. 填写：
   - **Name**: `Pro`
   - **Description**: `For professionals and growing teams`
3. 添加月付价格：
   - **Price**: `$30.00`
   - **Billing period**: `Monthly`
4. 添加年付价格：
   - **Price**: `$288.00`（相当于 $24/月，省 20%）
   - **Billing period**: `Yearly`
5. 点击 **"Save product"**

### 2.3 获取 Price ID

创建完成后，进入每个产品的详情页：

1. 点击产品名称进入详情
2. 在 **Pricing** 区域，每个价格行右侧有一个 ID，格式为 `price_xxxxxxxxxxxxxxxx`
3. 点击 ID 即可复制

你需要收集 4 个 Price ID：

| 套餐 | 周期 | 价格 | 对应环境变量 |
|------|------|------|-------------|
| Starter | Monthly | $9/mo | `STRIPE_PRICE_START_MONTHLY` |
| Starter | Yearly | $86.40/yr | `STRIPE_PRICE_START_YEARLY` |
| Pro | Monthly | $30/mo | `STRIPE_PRICE_PRO_MONTHLY` |
| Pro | Yearly | $288/yr | `STRIPE_PRICE_PRO_YEARLY` |

---

## 3. 配置 Webhook

Webhook 让 Stripe 在支付完成、订阅变更等事件发生时通知你的应用。

### 生产环境

1. 进入 **"Developers"** → **"Webhooks"**
2. 点击 **"+ Add endpoint"**
3. 填写：
   - **Endpoint URL**: `https://你的域名/api/webhooks/stripe`
   - **Description**: `Production webhook`
4. 点击 **"Select events"**，勾选以下事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.payment_failed`
5. 点击 **"Add endpoint"**
6. 创建后进入 endpoint 详情页，点击 **"Reveal"** 查看 **Signing secret**
   - 格式为 `whsec_xxxxxxxxxxxxxxxx`
   - 这就是 `STRIPE_WEBHOOK_SECRET`

---

## 4. 填写环境变量

将上面获取的所有值填入项目根目录的 `.env` 文件：

```bash
# Stripe API 密钥
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Webhook 签名密钥
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs
STRIPE_PRICE_START_MONTHLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_START_YEARLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxxxxx
```

> **安全提示**：`.env` 文件已在 `.gitignore` 中，不会被提交到代码仓库。绝不要将 `sk_test_` 或 `sk_live_` 开头的密钥提交到 Git。

---

## 5. 推送数据库变更

Stripe 集成需要以下数据库表，运行命令同步 schema：

```bash
bun run db:push
```

这会创建/更新以下表：
- `subscriptions` — 用户订阅记录
- `wallets` — 用户钱包余额
- `transactions` — 支付交易记录
- `webhook_events` — Webhook 幂等性记录

---

## 6. 本地测试 Webhook（可选）

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

## 7. 验证清单

配置完成后，逐项确认：

- [ ] `.env` 中 6 个 Stripe 变量都已填写（不含空值）
- [ ] `bun run db:push` 执行成功
- [ ] `bun run dev` 启动无报错
- [ ] 访问 `/pricing` 页面能正常显示两个套餐卡片
- [ ] 点击 Subscribe 按钮能跳转到 Stripe Checkout 页面
- [ ] 使用测试卡号 `4242 4242 4242 4242`（任意未来日期、任意 CVC）完成支付
- [ ] 支付后跳转回 `/pricing?success=true` 并显示成功提示
- [ ] 数据库 `subscriptions` 表中出现新记录

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
3. 重新创建产品和价格（或从 Test 复制到 Live）
4. 重新创建 Webhook endpoint 并获取新的 signing secret
5. 更新生产环境的环境变量（Vercel / 服务器）
6. **不要**在生产环境使用 `test` 前缀的密钥
