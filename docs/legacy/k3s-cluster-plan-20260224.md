# K3s 集群方案 — 3 节点起步

> 2026-02-24 | Status: Discussion

## 现有资源

| 节点 | IP | 配置 | 地区 | 厂商 | 当前状态 |
|------|-----|------|------|------|---------|
| hetzner-hel-219 | 135.181.97.219 | 4C/7.5G/150G | 赫尔辛基 | Hetzner (via Zeabur) | Zeabur K3s 运行中 |
| hetzner-nbg-166 | 167.235.65.166 | 2C/3.7G/38G | 纽伦堡 | Hetzner | 裸机，无 K3s/Docker |
| zeabur-tc-sc-108 | 43.135.186.108 | 2C/1.9G/40G | 圣何塞 | 腾讯云 (via Zeabur) | 裸机，K3s 已卸载 |

## 核心问题：Zeabur K3s vs 自建集群

### Zeabur 模式

每台 VPS 运行独立的 K3s Server，由 Zeabur 远程管理。

```
Zeabur 控制面板
  ├── VPS-1 [独立 K3s] → 项目 A, B, C
  ├── VPS-2 [独立 K3s] → 项目 D, E, F
  └── VPS-3 [独立 K3s] → 项目 G, H, I
```

- 优点：零运维，Zeabur 管一切
- 缺点：**不是集群**，VPS-1 挂了项目 A/B/C 全挂，不会自动迁移
- 每台 K3s 基础设施开销 ~800MB（3 台 = 2.4GB 浪费在管理上）

### 自建集群模式

一个 K3s Master + 多个 Worker，组成真正的集群。

```
K3s Master (hetzner-hel-219)
  ├── Worker 1 (hetzner-nbg-166) → 自动调度项目
  └── Worker 2 (zeabur-tc-sc-108) → 自动调度项目

所有项目在整个集群中自动分配，任一节点故障自动迁移
```

- 优点：自愈、自迁移、自调度、资源限制、一个控制面板管所有
- 缺点：需要自己安装和维护 K3s（但 K3s 本身非常稳定，几乎不需要维护）
- 只有 Master 有 K3s Server 开销，Worker 很轻量（~200MB）

### 结论

**自建集群。** 理由：

1. Zeabur 模式本质上只是"多台独立服务器"，不具备集群自愈能力
2. 自建集群才能实现"VPS 挂了项目自动迁移"的杜罗夫式运维
3. K3s 集群安装只需 2 条命令，维护量极低
4. 一个 Master 管所有节点，集中管理

## 集群拓扑

```
                ┌──────────────────────────┐
                │  Master + Worker         │
                │  hetzner-hel-219         │
                │  赫尔辛基 | 4C/7.5G/150G  │
                │                          │
                │  K3s Server (大脑)        │
                │  + 同时承载项目 (干活)     │
                │  可用: ~6.5G RAM          │
                └─────────┬────────────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
    ┌────────▼──────────┐    ┌────────▼──────────┐
    │  Worker 1          │    │  Worker 2          │
    │  hetzner-nbg-166   │    │  zeabur-tc-sc-108  │
    │  纽伦堡 | 2C/3.7G  │    │  圣何塞 | 2C/1.9G  │
    │                    │    │                    │
    │  K3s Agent         │    │  K3s Agent         │
    │  可用: ~3.5G RAM   │    │  可用: ~1.5G RAM   │
    └────────────────────┘    └────────────────────┘
```

### 集群总资源

| 资源 | 合计 |
|------|------|
| CPU | 8 cores (4+2+2) |
| 可用 RAM | ~11.5GB |
| 磁盘 | ~228GB |
| 可承载项目 | 15-20 个 Next.js 应用 (按每个 300-500MB RAM) |

### 地理延迟

| 链路 | 延迟 | 评估 |
|------|------|------|
| 赫尔辛基 ↔ 纽伦堡 | ~20ms | 优秀，同在欧洲 |
| 赫尔辛基 ↔ 圣何塞 | ~150ms | 可接受，K3s 心跳间隔默认 10s，150ms 不影响 |

跨洲节点对 K3s 集群管理没问题。唯一的影响是：如果 Pod 从欧洲节点迁移到美国节点，用户访问延迟会变。可以通过节点标签 + 调度策略控制。

## 节点角色分配

### hetzner-hel-219 (Master + Worker)

- K3s Server — 运行调度器、API Server、etcd
- 同时作为 Worker 承载项目（K3s 默认行为）
- 内存最大，承载主要项目
- **需操作**：卸载 Zeabur K3s → 全新安装 K3s Server

### hetzner-nbg-166 (Worker)

- K3s Agent — 纯粹执行容器
- 欧洲备用算力
- **需操作**：安装 K3s Agent，加入集群

### zeabur-tc-sc-108 (Worker)

- K3s Agent — 纯粹执行容器
- 美国节点，可用于面向美国用户的项目
- 内存较小，承载 2-3 个轻量项目
- **需操作**：安装 K3s Agent，加入集群

## 安装步骤

### Step 1: Master (hetzner-hel-219)

```bash
# 卸载 Zeabur 的 K3s
/usr/local/bin/k3s-uninstall.sh

# 全新安装 K3s Server
curl -sfL https://get.k3s.io | sh -

# 获取 Worker 加入令牌
cat /var/lib/rancher/k3s/server/node-token
```

### Step 2: Worker 1 (hetzner-nbg-166)

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://135.181.97.219:6443 \
  K3S_TOKEN=<token> sh -
```

### Step 3: Worker 2 (zeabur-tc-sc-108)

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://135.181.97.219:6443 \
  K3S_TOKEN=<token> sh -
```

### Step 4: 验证

```bash
# 在 Master 上
k3s kubectl get nodes
# 应该看到 3 个 Ready 节点
```

## 集群管理层

K3s 安装后需要一个 Web UI 来管理。选项：

### 方案 A: Portainer (推荐起步)

- 轻量 Web UI，支持 Kubernetes
- 一键部署应用、查看日志、管理配置
- 免费版支持 1 个集群
- 资源开销 ~200MB

### 方案 B: Rancher

- 完整的 Kubernetes 管理平台
- 功能最强大，但更重
- 适合进阶使用

### 方案 C: Lens (桌面客户端)

- 本地桌面应用连接远程 K3s
- 不需要在服务器上部署任何东西
- 适合开发者日常使用

### 方案 D: 纯 kubectl + CI/CD

- 不要 Web UI
- GitHub Actions 负责构建和部署
- 最轻量，但需要更多 K8s 知识

**建议**：先用 Portainer 起步（类似 Coolify 的体验，但管理的是 K3s 集群），后期可以切换到 kubectl + CI/CD。

## CI/CD 方案

Git push 自动部署的实现：

```
git push main
    ↓
GitHub Actions
    ↓
构建 Docker 镜像 → 推送到 GitHub Container Registry (ghcr.io)
    ↓
kubectl set image deployment/pngtuber app=ghcr.io/org/pngtuber:sha-xxx
    ↓
K3s 自动滚动更新 (零停机)
```

GitHub Actions 免费额度：2000 分钟/月，足够 10+ 项目。

## 监控 + 告警

| 层 | 工具 | 说明 |
|----|------|------|
| 节点监控 | **Prometheus + node-exporter** | CPU/内存/磁盘/网络 |
| 应用监控 | **Prometheus + kube-state-metrics** | Pod 状态、重启次数、资源使用 |
| 告警 | **Alertmanager → Telegram** | 节点宕机、Pod 反复崩溃、磁盘 >80% |
| 日志 | **Loki + Grafana** (可选) | 集中日志查询 |
| 可视化 | **Grafana** | Dashboard 看全局 |

初期只需要：Prometheus + Alertmanager + Telegram 告警。Grafana 可选。

## 与 Coolify 方案的对比

| 维度 | Coolify 方案 | K3s 集群方案 |
|------|-------------|-------------|
| 节点故障自愈 | 无 | **自动迁移 Pod** |
| 资源隔离 | Docker 级别 | **namespace + cgroup 硬限制** |
| 自动扩缩 | 无 | **HPA 原生支持** |
| 部署方式 | Web UI 操作 | **YAML 声明式 (AI 可生成)** |
| 管理面板 | Coolify (内置) | Portainer / Rancher / Lens |
| CI/CD | Coolify 内置 | GitHub Actions (需配置) |
| 学习曲线 | 低 | 中等 |
| 长期运维量 | 随项目数增长 | **基本恒定** |

## 风险

1. **学习成本**：需要理解 K8s 基础概念（Pod/Deployment/Service/Ingress），预计 1-2 天
2. **Master 单点**：只有 1 个 Master，它挂了整个集群不可调度（但已运行的 Pod 不受影响）。后续可加第二个 Master 实现高可用
3. **跨洲延迟**：圣何塞节点到赫尔辛基 ~150ms，Pod 迁移过去会增加用户延迟

## 下一步

1. 确认方案后，执行安装（约 30 分钟）
2. 部署 Portainer 作为管理面板
3. 部署第一个项目（PNGTuber）验证全流程
4. 配置 GitHub Actions 自动部署
5. 配置 Prometheus + Telegram 告警
