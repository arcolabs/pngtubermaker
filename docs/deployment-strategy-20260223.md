# 多项目部署方案 — Zeabur + Hetzner + Coolify

> 2026-02-24 | Status: Approved

## 背景

团队（3 人）同时运营 10+ micro SaaS 项目。当前 Vercel + NeonDB 方案按项目线性计费，10 个项目预估 $400+/月，大部分花在验证期低流量项目上。

需要一套成本固定、运维自动化、横向可扩展的部署方案。

## 核心原则

借鉴 Telegram 的工程哲学：

- **人只做决策，系统做执行** — 部署、监控、恢复、备份全自动
- **克制** — 不用微服务、不用 k8s、不搞复杂编排
- **杀项目零成本** — 共享基础设施，`docker stop` 即释放资源
- **AI-Native** — 统一项目模板 + CLAUDE.md，AI agent 可在任意项目无缝工作

## 架构总览

```
Cloudflare (免费层)
  DNS · CDN · R2 存储 · DDoS 防护
       │
       ├─────────────────────────────────┐
       │                                 │
  VPS-Main (生产)                   VPS-HK (SilkRoute)
  Hetzner 4C/8G (via Zeabur)       中国 API 代理
  ├── Coolify (PaaS 管理面板)       ├── SilkRoute Gateway
  ├── PostgreSQL 16 (共用实例)      └── (独立职责)
  ├── project-1 (Docker)
  ├── project-2 (Docker)            VPS-Backup (热备/溢出)
  ├── ...                           Hetzner (via Zeabur)
  ├── project-10 (Docker)           ├── Coolify Worker 节点
  ├── Uptime Kuma (监控)            └── (被 Main 远程管理)
  └── Plausible (统计，可选)
```

## VPS 采购策略

通过 **Zeabur** 作为 KYC 隔离渠道购买 Hetzner VPS，享受渠道折扣价。

购买后卸载 Zeabur 预装的 K3s，自行安装 Coolify：

```bash
# 卸载 Zeabur 预装的 K3s
/usr/local/bin/k3s-uninstall.sh
# 然后按 Coolify 安装流程执行
```

> **注意**：上线前需向 Zeabur 工单确认：卸载 K3s 后 VPS 订阅和续费不受影响。

### VPS 分工

| 节点 | 规格 | 来源 | 角色 | 月费 |
|------|------|------|------|------|
| **VPS-Main** | 4C/8G/160G/20TB | Zeabur × Hetzner | 生产部署，跑所有项目 | $10 |
| **VPS-Backup** | 按需选配 | Zeabur × Hetzner | 热备 + 溢出，Coolify Worker | $5-10 |
| **VPS-HK** | 基础配置 | Zeabur × 腾讯云 或其他 | SilkRoute 网关（中国 API 代理） | $2-9 |
| 团队成员 VPS | 各自现有 | — | 本地开发 / staging 环境 | 已有 |

### 为什么通过 Zeabur 购买

| 优势 | 说明 |
|------|------|
| **KYC 隔离** | 不需要每个成员注册 Hetzner 账号，统一通过 Zeabur 管理 |
| **渠道折扣** | 4C/8G/160G/20TB 仅 $10/月，比 Hetzner 直购 CPX31 ($16.5) 便宜 40% |
| **多云商** | Hetzner（欧美）、腾讯云（亚洲）等在一个面板购买和续费 |

## PaaS 选型：Coolify

**选定 Coolify** 作为自托管 PaaS。

| 维度 | Coolify |
|------|---------|
| 多节点管理 | 成熟，久经验证 |
| 社区/文档 | 大社区，教程丰富 |
| 功能 | Git push 部署、Docker、SSL、数据库管理、备份 |
| 内置监控 | 容器级 CPU/内存/网络 |

## 其他技术选型

| 层 | 选型 | 理由 |
|----|------|------|
| 数据库 | **PostgreSQL 16** (自托管) | Coolify 一键部署，一个实例多个 DB，替代 NeonDB |
| 存储 | **Cloudflare R2** | 保留，无出口费，所有项目共用 |
| CDN | **Cloudflare** 免费层 | 保留，DNS + CDN + DDoS |
| 监控 | **Uptime Kuma** | 自托管，HTTP 健康检查 + Telegram/Discord 告警 |
| 统计 | **Plausible** (可选) | 自托管 GA 替代，隐私友好 |
| SSH 管理 | **ssh-list** | Rust TUI，管理多台 VPS 的 SSH 连接 |

## 成本对比

| 方案 | 5 个项目 | 10 个项目 |
|------|----------|-----------|
| Vercel + NeonDB | ~$200/月 | ~$400/月 |
| **Zeabur + Coolify** | **~$17-29/月** | **~$17-29/月** |

成本固定，不随项目数线性增长。

## 部署流程

```
开发者写代码 → git push main → Coolify 自动构建 → 零停机部署 → 完成
```

无 CI/CD pipeline 维护。Coolify 监听仓库 webhook，自动触发。

## 数据库策略

```
PostgreSQL 16 (单实例)
├── pngtuber_db
├── project2_db
├── project3_db
└── ...

备份：Coolify 定时备份 → R2，每天一次，保留 7 天
```

## 监控策略

三层，从轻到重，按需启用：

| 层 | 工具 | 场景 |
|----|------|------|
| 1 | Docker `restart: always` | 容器挂了自动重启，无需人工 |
| 2 | Uptime Kuma | /health 端点检查，挂了告警到 Telegram |
| 3 | Coolify 内置监控 | 容器 CPU/内存/网络，需要时手动查看 |

核心理念：**不挂就不管，告警来了才处理。**

## 横向扩展策略

不提前扩展。按信号行动：

| 信号 | 动作 |
|------|------|
| Main CPU 持续 >70% | 升配或添加 Backup 节点 |
| 某项目 DAU > 1000 | 迁移到 Backup VPS 独立运行 |
| 某项目月收入 > $500 | 分配独立服务器 |
| 某项目月收入 > $2000 | 可考虑回 Vercel 等托管方案 |

Coolify 多节点管理：Main 上添加 Backup 作为 Server，UI 内将项目分配到目标节点。

## SSH 管理

使用 **ssh-list**（Rust TUI）统一管理所有 VPS 连接：

```bash
# 安装
cargo install ssh-list

# 使用
ssh-list   # 打开 TUI，添加/管理/连接所有 VPS
```

数据存储在 `~/.ssh/ssh-list.json`，不修改 `~/.ssh/config`。

## AI-Native 项目模板

所有项目基于统一模板创建：

```
micro-saas-template/
├── CLAUDE.md              # AI agent 自动 onboard
├── app/                   # Next.js App Router
├── lib/
│   ├── auth.ts            # better-auth 统一配置
│   ├── db.ts              # Drizzle 统一 pattern
│   └── stripe.ts          # Stripe 统一 pattern
├── database/schema.ts     # 基础 schema
├── Dockerfile             # 标准化构建
└── biome.json             # 统一 lint
```

新项目：Use template → 改品牌 → 写业务 → git push → 上线。

## 项目生命周期

```
Week 1-2:  MVP（AI 写 80% 代码）
Week 3-4:  最小预算投放验证
    ├── 有 traction → 继续
    ├── 不确定 → 再给 2 周
    └── 没 traction → docker stop，保留代码，释放资源
```

杀掉项目成本为零 — 共享基础设施，无订阅要取消。

## 实施步骤

1. 通过 Zeabur 购买 Hetzner VPS (4C/8G)
2. SSH 登录，卸载 K3s，安装 Coolify
3. 部署 PostgreSQL + Uptime Kuma
4. 将 PNGTuber 迁移到 Coolify（第一个验证项目）
5. 验证完整流程：git push → 自动部署 → 健康检查
6. 后续项目全部使用同一套流程
