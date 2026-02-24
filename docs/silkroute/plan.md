# SilkRoute — HK API Gateway 方案

> 2026-02-23 | Status: Proposal

## 为什么做

PNGTuber 的 avatar 生成依赖中国 AI API（PiAPI、字节 Ark）和中国 CDN 图片下载。当前 US VPS 直连中国的链路存在严重问题：

- **GFW 干扰**：丢包率高，TCP 连接频繁超时
- **HTTP 500/502**：部分中国 CDN 对海外 IP 返回服务端错误
- **延迟高**：US↔中国 RTT 200-400ms，叠加重试后用户体感 5-15 秒

这些问题导致 avatar 生成流程的失败率居高不下，严重影响用户体验和转化率。

**核心洞察**：香港到中国大陆 RTT 仅 10-30ms，且不受 GFW 影响。在 HK 部署一个轻量级网关即可解决所有中国链路问题。

## 做什么

在 HK VPS 部署一个 Rust API Gateway（代号 SilkRoute），承担三个职责：

### 1. API 代理 (`/v1/proxy`)

US 服务将中国 API 请求发送到 SilkRoute，由 SilkRoute 从 HK 转发到中国 API。请求/响应原样透传，对调用方透明。

```
US (PNGTuber) ──→ HK (SilkRoute) ──→ 中国 (PiAPI/Ark)
     稳定链路           10-30ms 低延迟
```

### 2. 图片转存 (`/v1/transfer`)

中国 CDN 上的生成结果图片，由 SilkRoute 在 HK 下载后直传 Cloudflare R2，**不经过 US VPS**。解决图片下载失败和速度慢的问题。

```
中国 CDN ──→ HK (SilkRoute) ──→ Cloudflare R2
                  流式管道           全球 CDN 分发
```

### 3. Webhook 转发 (`/v1/webhook`)

Lark/飞书等中国服务的 webhook 通知，经 SilkRoute 中继后转发到 US 服务。

## 技术选型

| 选型 | 理由 |
|------|------|
| **Rust + axum** | 高性能、低资源占用，适合 HK 小规格 VPS |
| **TOML 配置** | 新增上游服务只需改配置，不改代码 |
| **API Key 认证** | 简单可靠，SHA-256 哈希存储 |
| **Docker 部署** | 标准化，一键部署 |

## PNGTuber 侧改动

在 PNGTuber 项目中：
- 新增 `SILKROUTE_URL` 和 `SILKROUTE_API_KEY` 环境变量
- 修改 generation adapter（PiAPI、Ark 等）的 HTTP 调用，走 SilkRoute `/v1/proxy`
- 修改图片持久化逻辑，走 SilkRoute `/v1/transfer` 直传 R2

改动集中在 `lib/services/` 下的 adapter 和 storage 文件，对上层业务逻辑无影响。

## 分阶段实施

### Phase 1: MVP

目标：跑通 avatar 生成全流程。

- `/v1/proxy` — 通用 HTTP 代理 + 重试
- `/v1/transfer` + `/v1/transfer/batch` — 图片转存管道
- API Key 认证
- JSON 结构化日志 + `/health`
- Docker 部署
- PNGTuber 集成适配

### Phase 2: 可观测性 + 韧性

目标：生产级稳定性。

- Prometheus metrics + Grafana 看板
- 熔断器（上游故障时快速失败）
- `/ready` 端点（上游健康探测）

### Phase 3: SSE 流式 + LLM 代理

目标：支持流式 AI 对话场景。

- `/v1/llm` — SSE passthrough
- OpenAI / Anthropic 兼容格式
- Token 计数 + 成本追踪

### Phase 4: 智能特性

目标：减少 US↔HK 往返次数。

- "提交并等待" — Gateway 内部轮询任务状态
- proxy + transfer 合并端点
- Admin Web UI

## 预期收益

| 指标 | 当前 (US 直连) | 预期 (经 SilkRoute) |
|------|----------------|---------------------|
| API 调用成功率 | ~70-80% | >99% |
| 图片下载成功率 | ~60-70% | >99% |
| 平均延迟增加 | - | +50-80ms (US↔HK) |
| 生成流程端到端 | 15-30s (含重试) | 5-10s |

延迟微增（多一跳 HK），但可靠性大幅提升，用户体感反而更快（消除重试等待）。

## 风险

1. **HK VPS 成本**：额外月费，但小规格即可（Rust 资源占用低）
2. **单点故障**：SilkRoute 挂掉则所有中国 API 不可用 — Phase 2 的健康检查和熔断可缓解
3. **HK↔中国政策变化**：低概率，但需关注

## 独立仓库

SilkRoute 作为独立项目（`silkroute` 仓库），不放在 PNGTuber 仓库内。它是通用网关，未来可服务多个 micro SaaS。
