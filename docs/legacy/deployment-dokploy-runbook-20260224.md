# Dokploy 部署 Runbook — 手动执行指南

> 2026-02-24 | 基于 Dokploy 官方文档

本文档是一份可手动逐步执行的部署指南。按顺序执行即可完成从裸机 VPS 到多项目生产环境的搭建。

---

## 前置准备

### 你需要准备

| # | 资源 | 示例 |
|---|------|------|
| 1 | Hetzner VPS（Ubuntu 22.04/24.04, ≥2GB RAM, ≥30GB 磁盘） | CPX21 或 CPX31 |
| 2 | SSH root 登录方式 | `ssh root@your-server-ip` |
| 3 | 一个域名（已托管在 Cloudflare） | `yourdomain.com` |
| 4 | Cloudflare 账号（DNS 管理权限） | — |
| 5 | GitHub 账号（项目仓库所在） | — |
| 6 | Cloudflare R2 Bucket + API Token（用于备份） | — |

### 端口要求

安装前确保以下端口未被占用：

| 端口 | 用途 |
|------|------|
| 80 | Traefik HTTP |
| 443 | Traefik HTTPS |
| 3000 | Dokploy 管理面板（配好域名后关闭） |

---

## Phase 1: 系统初始化

SSH 登录 VPS 后执行：

### 1.1 系统更新

```bash
apt update && apt upgrade -y
```

### 1.2 配置 swap（小内存 VPS 必须）

```bash
# 检查是否已有 swap
swapon --show

# 如果没有，创建 2GB swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 持久化
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 1.3 配置防火墙

```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 443/udp     # HTTP/3
ufw allow 3000/tcp    # Dokploy 面板（临时，后面会关）
ufw --force enable
ufw status
```

### 1.4 设置时区

```bash
timedatectl set-timezone Asia/Shanghai  # 或你的时区
```

---

## Phase 2: 安装 Dokploy

### 2.1 一键安装

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

安装脚本会自动：
- 安装 Docker（如果没有）
- 初始化 Docker Swarm
- 创建 `dokploy-network` overlay 网络
- 部署 PostgreSQL 16（Dokploy 内部用）、Redis 7、Traefik v3
- 启动 Dokploy 服务

**等待约 15 秒后**，浏览器访问：

```
http://<your-server-ip>:3000
```

### 2.2 创建管理员账号

首次访问会提示创建管理员账号。设置邮箱和强密码。

### 2.3 验证安装

```bash
# 检查所有服务是否运行
docker service ls
```

应看到 `dokploy`、`dokploy-postgres`、`dokploy-redis`、`dokploy-traefik` 四个服务。

---

## Phase 3: 配置域名 + SSL

### 3.1 Cloudflare DNS 设置

在 Cloudflare Dashboard 中为你的域名添加 A 记录：

| 类型 | 名称 | 内容 | 代理 |
|------|------|------|------|
| A | `ops` | `<your-server-ip>` | 关闭（仅 DNS） |

> `ops.yourdomain.com` 将用于 Dokploy 管理面板。

**关于 Cloudflare 代理**：

- **管理面板域名**：建议关闭代理（灰色云朵），使用 Let's Encrypt 直接签发证书，避免 WebSocket 问题
- **项目域名**：可以开启代理（橙色云朵），使用 Cloudflare Full (Strict) 模式

### 3.2 给 Dokploy 面板配置域名

1. 登录 Dokploy 面板 → **Settings** → **Server**
2. 找到 **Server Domain** 配置
3. 填入 `ops.yourdomain.com`
4. 启用 HTTPS，选择 **Let's Encrypt**
5. 保存

等待 1-2 分钟 SSL 证书签发完成后，访问：

```
https://ops.yourdomain.com
```

### 3.3 关闭端口 3000 直接访问

确认域名访问正常后：

```bash
docker service update --publish-rm "published=3000,target=3000,mode=host" dokploy
```

从防火墙中也移除：

```bash
ufw delete allow 3000/tcp
```

此时只能通过 `https://ops.yourdomain.com` 访问面板。

---

## Phase 4: 部署 PostgreSQL（业务数据库）

Dokploy 自带的 PostgreSQL 是其内部用的，**不要用它跑业务数据**。为业务项目单独部署一个。

### 4.1 创建项目

1. Dokploy 面板 → **Projects** → **Create Project**
2. 名称：`infrastructure`

### 4.2 添加 PostgreSQL 服务

1. 进入 `infrastructure` 项目 → **Add Service** → **Database** → **PostgreSQL**
2. 配置：
   - Database Name: `business_db`（或按项目命名，如 `pngtuber`）
   - 设置 Username / Password（记好）
3. 部署

### 4.3 获取连接信息

部署完成后，在数据库详情页可以看到：

- **Internal Connection URL**：`postgresql://user:pass@internal-host:5432/dbname`

> 应用使用 Internal URL 连接（同一 Docker 网络内，延迟 <1ms）。

### 4.4 多项目共用

一个 PostgreSQL 实例可以运行多个数据库。后续项目直接在同一个 PG 容器内创建新数据库即可：

```bash
# 进入 PG 容器执行
docker exec -it <pg-container-id> psql -U <username>
CREATE DATABASE project2_db;
CREATE DATABASE project3_db;
```

或者每个项目部署独立的 PG 服务（隔离性更好但内存开销更大）。推荐低流量项目共用，跑出来的项目独立。

---

## Phase 5: 部署 PNGTuber（第一个项目）

### 5.1 准备 Dockerfile

在 PNGTuber 仓库根目录确保有 `Dockerfile`。Next.js standalone 模式推荐：

```dockerfile
FROM node:20-alpine AS base

# 安装 bun
RUN npm install -g bun

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

确保 `next.config.ts` 中有：

```ts
output: "standalone"
```

### 5.2 在 Dokploy 创建应用

1. **Projects** → **Create Project** → 名称：`pngtuber`
2. 进入项目 → **Add Service** → **Application**
3. 配置来源：
   - Source: **GitHub**（首次需要连接 GitHub 账号授权）
   - Repository: 选择 PNGTuber 仓库
   - Branch: `main`
4. Build Type: **Dockerfile**
5. 点击 **Save**（先不部署）

### 5.3 配置环境变量

进入应用 → **Environment** tab，添加所有生产环境变量：

```env
# 基础
NEXT_PUBLIC_APP_NAME=PNGTuberMaker
NEXT_PUBLIC_APP_URL=https://pngtubermaker.com
NODE_ENV=production

# 数据库（使用 Phase 4 的 Internal URL）
DATABASE_URL=postgresql://user:pass@internal-host:5432/pngtuber

# Auth
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://pngtubermaker.com

# OAuth (Google/GitHub/Discord/Twitch)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
# ... 其他 OAuth 配置

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
# ... 其他 Stripe 价格 ID

# R2
R2_ENDPOINT=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx
R2_PUBLIC_URL=xxx
```

> 多行值需要用双引号包裹。

### 5.4 配置域名

进入 **Domains** tab：

1. **Add Domain**
2. Host: `pngtubermaker.com`
3. Container Port: `3000`
4. HTTPS: ON
5. Certificate: **Let's Encrypt**

Cloudflare DNS 中添加：

| 类型 | 名称 | 内容 | 代理 |
|------|------|------|------|
| A | `@` | `<your-server-ip>` | 按需 |
| A | `www` | `<your-server-ip>` | 按需 |

### 5.5 配置健康检查 + 自动回滚

进入 **Advanced** tab：

Health Check:
```json
{
  "Test": ["CMD", "curl", "-f", "http://localhost:3000/health"],
  "Interval": 30000000000,
  "Timeout": 10000000000,
  "StartPeriod": 30000000000,
  "Retries": 3
}
```

Rollback Policy:
```json
{
  "Parallelism": 1,
  "Delay": 10000000000,
  "FailureAction": "rollback",
  "Order": "start-first"
}
```

> `start-first` 确保新容器就绪后才停旧容器 = 零停机部署。

### 5.6 部署

点击 **Deploy**。首次构建约 3-5 分钟。

在 **Deployments** tab 和 **Logs** tab 观察构建和运行日志。

### 5.7 验证

```bash
curl -I https://pngtubermaker.com
curl https://pngtubermaker.com/health
```

---

## Phase 6: 配置自动部署

### 6.1 Webhook 方式（简单）

1. 应用 **General** tab → 打开 **Auto Deploy**
2. **Deployments** tab → 复制 Webhook URL
3. GitHub 仓库 → **Settings** → **Webhooks** → **Add webhook**
   - Payload URL: 粘贴 Dokploy Webhook URL
   - Content type: `application/json`
   - Events: `Just the push event`
   - Save

此后 `git push main` 将自动触发部署。

### 6.2 API 方式（适合 CI/CD）

如果更喜欢 GitHub Actions 构建镜像再部署：

1. Dokploy 面板 → 个人设置 → 创建 **API Token**
2. GitHub Actions 中调用：

```bash
curl -X POST https://ops.yourdomain.com/api/application.deploy \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: <your-api-token>' \
  -d '{"applicationId": "<your-app-id>"}'
```

---

## Phase 7: 配置数据库备份 → R2

### 7.1 添加 R2 存储目标

1. Dokploy 面板 → **Settings** → **S3 Destinations** → **Add**
2. 填写：

| 字段 | 值 |
|------|------|
| Name | `cloudflare-r2` |
| Access Key ID | Cloudflare R2 API Token 的 Access Key |
| Secret Access Key | Cloudflare R2 API Token 的 Secret Key |
| Bucket | `dokploy-backups`（需先在 Cloudflare 创建） |
| Region | `auto` 或 `WNAM` |
| Endpoint | `https://<account-id>.r2.cloudflarestorage.com` |

3. 点击 **Test** 验证连接

### 7.2 配置定时备份

1. 进入 PostgreSQL 服务 → **Backups** tab
2. 配置：
   - Destination: `cloudflare-r2`
   - Database: `pngtuber`
   - Schedule: `0 3 * * *`（每天凌晨 3 点）
   - Prefix: `backups/pngtuber/`
   - Enabled: ON
3. 点击 **Test** 执行一次试备份

对每个业务数据库重复此步骤。

---

## Phase 8: 部署 Uptime Kuma（监控）

### 8.1 在 Dokploy 中部署

1. 进入 `infrastructure` 项目 → **Add Service** → **Application**
2. Source: **Docker Image**
3. Image: `louislam/uptime-kuma:1`
4. 配置 Volume：`/app/data` → 持久化存储
5. 配置域名：`status.yourdomain.com`，Container Port: `3001`
6. 部署

### 8.2 配置监控

访问 `https://status.yourdomain.com`，创建管理员账号后：

1. **Add New Monitor** → HTTP(s)
2. 为每个项目添加：
   - URL: `https://pngtubermaker.com/health`
   - Interval: 60 秒
3. 配置通知：
   - **Setup Notification** → Telegram / Discord
   - 填入 Bot Token / Webhook URL

---

## Phase 9: 部署后续项目

每个新项目重复 Phase 5 的流程，只是更快：

```
1. Projects → Create Project → "project-name"
2. Add Application → GitHub → 选仓库 → Dockerfile
3. 配置 Environment（DATABASE_URL 指向共用 PG 的新 DB）
4. 配置 Domain
5. Deploy
6. 配置 Auto Deploy webhook
7. Uptime Kuma 添加监控
```

熟练后每个项目 15-20 分钟可完成部署。

---

## Phase 10: 添加 Worker 节点（横向扩展，按需）

当 Main VPS 资源紧张时，将 Backup VPS 加入集群。

### 10.1 前置条件

- Backup VPS 已安装 Docker
- 两台 VPS 之间的 Swarm 端口已放通：

```bash
# 在 Backup VPS 上
ufw allow 2377/tcp
ufw allow 7946/tcp
ufw allow 7946/udp
ufw allow 4789/udp
```

### 10.2 配置 Docker Registry

Worker 节点需要从 Registry 拉取镜像。

1. Dokploy 面板 → **Settings** → **Registry**
2. 添加一个 Registry（推荐 GitHub Container Registry，免费）：
   - URL: `ghcr.io`
   - Username: GitHub 用户名
   - Password: GitHub Personal Access Token（需 `write:packages` 权限）

### 10.3 添加 Worker

1. Dokploy 面板 → **Cluster** → **Add Node**
2. 复制显示的 `docker swarm join` 命令
3. SSH 到 Backup VPS，执行该命令
4. 回到 Dokploy 面板，节点应该出现在列表中

### 10.4 迁移项目到 Worker

在应用的 **Advanced** → **Cluster Settings** 中：
- 配置 Registry
- 设置 replica 数量
- 选择目标节点

---

## 常用运维命令

```bash
# 查看所有 Docker 服务状态
docker service ls

# 查看某个服务的日志
docker service logs <service-name> --tail 100 -f

# 手动重启某个服务
docker service update --force <service-name>

# 查看资源占用
docker stats

# 清理未使用的镜像（释放磁盘）
docker system prune -a --volumes

# 更新 Dokploy 本身
curl -sSL https://dokploy.com/install.sh | sh -s update
```

---

## 故障排查

| 问题 | 排查 |
|------|------|
| 部署后 502 | 检查容器日志：应用 → Logs tab。通常是环境变量缺失或端口不匹配 |
| SSL 证书失败 | 确认 DNS 已生效（`dig your-domain`），确认 Cloudflare 代理状态 |
| 数据库连不上 | 确认使用 Internal URL（不是 External），确认两个服务在同一 Docker 网络 |
| 构建 OOM | 升级 VPS 规格，或改用 CI/CD 外部构建 + 推送镜像 |
| 磁盘满 | `docker system prune -a --volumes` 清理旧镜像和构建缓存 |

---

## 参考链接

- [Dokploy 安装文档](https://docs.dokploy.com/docs/core/installation)
- [Next.js 部署指南](https://docs.dokploy.com/docs/core/nextjs)
- [数据库管理](https://docs.dokploy.com/docs/core/databases)
- [域名配置](https://docs.dokploy.com/docs/core/domains)
- [Cloudflare 集成](https://docs.dokploy.com/docs/core/domains/cloudflare)
- [R2 备份配置](https://docs.dokploy.com/docs/core/cloudflare-r2)
- [自动部署](https://docs.dokploy.com/docs/core/auto-deploy)
- [集群管理](https://docs.dokploy.com/docs/core/cluster)
- [生产环境建议](https://docs.dokploy.com/docs/core/applications/going-production)
