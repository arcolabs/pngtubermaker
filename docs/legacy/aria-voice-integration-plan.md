# Aria 虚拟形象语音对话整合方案

**文档状态**: 规划阶段  
**创建日期**: 2026-02-23  
**相关系统**: PNGTuberEngine, 字节豆包端到端实时语音大模型API

---

## 1. 方案概述

本方案旨在整合字节豆包端到端实时语音大模型API，使 Aria 虚拟形象具备**实时语音对话**能力，并能够**根据对话内容自动切换表情**（happy/sad/angry）。

### 核心目标

- **语音交互**: 用户通过麦克风与 Aria 实时语音对话
- **智能表情**: 根据AI回复的情感内容自动切换表情（非手动代码切换）
- **口型同步**: 音频流音量分析驱动 talking 动画
- **人设定制**: 支持通过 System Prompt 定义 Aria 的性格和说话风格

---

## 2. 字节API能力分析

### 2.1 推荐版本: SC2.0

根据业务需求，推荐使用 **SC2.0 版本**（model: `2.2.0.0`）：

| 特性 | O2.0 版本 | SC2.0 版本 | 适用性 |
|------|-----------|------------|--------|
| 精品音色 | ✅ | ❌ | 中等 |
| System Prompt | ✅ | ✅ | 必要 |
| **角色控制指令** | ❌ | ✅ **关键** | **必要** |
| 声音克隆 | ❌ | ✅ | 可选 |
| 情感表达能力 | 基础 | **增强** | **必要** |

### 2.2 核心能力

```
用户语音输入 ──▶ 字节RealtimeAPI ──▶ 
  ├── 音频流: Aria的语音回复 (驱动口型)
  ├── 文本内容: 回复内容
  └── 【关键】表情/动作指令: [开心][难过][生气]
```

**SC2.0 角色控制能力**（文档第34-38行）：
> "完善角色控制指令体系，模型输出文本可包含角色相关的动作与表情描述"

这意味着 AI 可以在回复中自动插入表情标记，我们只需解析即可驱动表情切换。

### 2.3 音频格式

- **输入**: PCM / Opus, 16000Hz, 单声道
- **输出**: OGG Opus (默认) 或 PCM 24000Hz

---

## 3. 现有架构分析

### 3.1 PNGTuberEngine 当前工作模式

```
┌────────────────────────────────────────────┐
│           PNGTuberEngine                   │
├────────────────────────────────────────────┤
│  音频分析层                                 │
│  ├── mic模式: 麦克风音量检测               │
│  ├── audio模式: 音频文件音量分析           │
│  └── demo模式: 自动循环演示                │
├────────────────────────────────────────────┤
│  表情状态层 (currentExpression)            │
│  ├── idle (默认)                           │
│  ├── happy/sad/angry (需手动setExpression) │
│  └── talking由mouthOpen状态自动推导        │
├────────────────────────────────────────────┤
│  渲染层 (resolveExpression)                │
│  └── 组合: base + talking + blink          │
└────────────────────────────────────────────┘
```

**当前限制**: `happy/sad/angry` 需要通过 `setExpression()` 手动代码切换，无法根据语音内容自动反应。

### 3.2 FloatingAvatar 组件

当前 Aria 使用 demo 模式播放预录音频 (`/audio/female.mp3`)，无实时交互能力。

---

## 4. 整合架构设计

### 4.1 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────────┐               │
│  │   麦克风输入  │─────▶│  VolcVoiceClient │               │
│  └──────────────┘      │   (WebSocket)    │               │
│                        └────────┬─────────┘               │
│                                 │                          │
│                                 ▼                          │
│                        ┌──────────────────┐               │
│                        │ 字节豆包RealtimeAPI│               │
│                        │   (火山引擎)       │               │
│                        └────────┬─────────┘               │
│                                 │                          │
│              ┌──────────────────┼──────────────────┐       │
│              ▼                  ▼                  ▼       │
│       ┌────────────┐   ┌────────────┐   ┌────────────┐   │
│       │ 音频流      │   │ 文本回复    │   │ 表情指令    │   │
│       │ (OGG/PCM)  │   │            │   │ [开心]等   │   │
│       └──────┬─────┘   └────────────┘   └──────┬─────┘   │
│              │                                   │         │
│              ▼                                   ▼         │
│       ┌────────────────────────────────────────────────┐  │
│       │           PNGTuberEngine                      │  │
│       ├────────────────────────────────────────────────┤  │
│       │  playAudio() ◄── 音频流输入                    │  │
│       │  setExpression() ◄── 表情指令解析              │  │
│       │  音量分析 → mouthOpen → talking动画           │  │
│       └────────────────────────────────────────────────┘  │
│                          │                                 │
│                          ▼                                 │
│                    ┌──────────┐                           │
│                    │  Canvas  │                           │
│                    │  渲染    │                           │
│                    └──────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 数据流

```
用户说话 
    │
    ▼
┌────────────────────────┐
│ 音频采集 (20ms/包)     │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ WebSocket 发送到字节API │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 字节AI处理 (语音+理解)  │
└──────────┬─────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌─────────────────────────────┐
│音频流  │   │ ChatResponse 事件            │
│(OGG)   │   │ {                            │
│        │   │   "content": "你好呀！[开心]" │
└───┬────┘   │ }                            │
    │        └───────────┬─────────────────┘
    │                    │
    ▼                    ▼
┌──────────────────────────────────────┐
│ 1. 解析文本提取表情指令               │
│    - [开心] → setExpression('happy') │
│    - [难过] → setExpression('sad')   │
│    - [生气] → setExpression('angry') │
│                                      │
│ 2. 音频流解码为 WAV                  │
│    → playAudio()                     │
│                                      │
│ 3. 音量分析驱动 mouthOpen            │
│    → talking 动画                    │
└──────────────────────────────────────┘
```

---

## 5. 技术实现方案

### 5.1 核心模块设计

#### Module 1: VolcVoiceClient (WebSocket客户端)

```typescript
// lib/volc-voice-client.ts
export class VolcVoiceClient {
  private ws: WebSocket;
  private config: VoiceConfig;
  
  // 事件回调
  onChatResponse?: (text: string) => void;      // 文本回复
  onTTSResponse?: (audioBuffer: ArrayBuffer) => void;  // 音频流
  onEmotionDetected?: (emotion: EmotionType) => void;  // 表情指令
  
  // 方法
  async connect(): Promise<void>;
  sendAudioChunk(chunk: ArrayBuffer): void;     // 发送麦克风音频
  disconnect(): void;
}

interface VoiceConfig {
  appId: string;
  accessKey: string;
  model: 'O' | 'O2.0' | 'SC' | 'SC2.0';  // 推荐 'SC2.0'
  botName?: string;                        // Aria
  systemRole?: string;                     // 人设描述
  speakingStyle?: string;                  // 说话风格
  speaker?: string;                        // 音色ID
}
```

#### Module 2: 表情指令解析器

```typescript
// lib/emotion-parser.ts
export type EmotionType = 'idle' | 'happy' | 'sad' | 'angry';

export function parseEmotion(text: string): EmotionType {
  // 支持多种标记格式
  const emotionPatterns = [
    { pattern: /\[开心\]|\(happy\)|【开心】/, emotion: 'happy' },
    { pattern: /\[难过\]|\(sad\)|【难过】/, emotion: 'sad' },
    { pattern: /\[生气\]|\(angry\)|【生气】/, emotion: 'angry' },
    // 支持自然语言描述
    { pattern: /(开心|高兴|愉快|兴奋)地/, emotion: 'happy' },
    { pattern: /(难过|伤心|悲伤|失望)地/, emotion: 'sad' },
    { pattern: /(生气|愤怒|恼火|不爽)地/, emotion: 'angry' },
  ];
  
  for (const { pattern, emotion } of emotionPatterns) {
    if (pattern.test(text)) return emotion as EmotionType;
  }
  
  return 'idle';
}

// 清理文本中的标记（用于显示）
export function cleanEmotionMarkers(text: string): string {
  return text.replace(/[\[\(【](开心|难过|生气|happy|sad|angry)[\]\)】]/g, '');
}
```

#### Module 3: 音频格式转换

```typescript
// lib/audio-utils.ts
export async function oggToWav(oggBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  // 使用 Web Audio API 或 ffmpeg.wasm 进行解码
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(oggBuffer);
  
  // 转换为 WAV 格式供 PNGTuberEngine 使用
  return encodeWAV(audioBuffer);
}
```

### 5.2 与 PNGTuberEngine 集成

```typescript
// components/widget/FloatingAvatar.tsx (改造后)
export default function FloatingAvatar() {
  const engineRef = useRef<PNGTuberEngine | null>(null);
  const voiceClientRef = useRef<VolcVoiceClient | null>(null);
  
  useEffect(() => {
    // 初始化引擎
    const engine = new PNGTuberEngine({
      canvas: canvasRef.current,
      expressions: DEMO_EXPRESSIONS,
      mode: 'mic',  // 改为等待语音输入模式
    });
    engineRef.current = engine;
    
    // 初始化语音客户端
    const voiceClient = new VolcVoiceClient({
      model: 'SC2.0',
      botName: 'Aria',
      systemRole: '你是Aria，一个活泼可爱的虚拟主播助手...',
      speakingStyle: '说话活泼可爱，经常使用emoji',
    });
    
    // 处理AI回复
    voiceClient.onChatResponse = (text) => {
      const emotion = parseEmotion(text);
      const cleanText = cleanEmotionMarkers(text);
      
      // 实时切换表情
      engine.setExpression(emotion);
      
      // 显示对话气泡
      setDialogueText(cleanText);
    };
    
    // 处理AI语音
    voiceClient.onTTSResponse = async (audioBuffer) => {
      const wavBuffer = await oggToWav(audioBuffer);
      const audioUrl = URL.createObjectURL(new Blob([wavBuffer]));
      
      // 播放音频并驱动口型
      engine.playAudio(audioUrl);
    };
    
    voiceClient.connect();
    
    return () => {
      voiceClient.disconnect();
      engine.destroy();
    };
  }, []);
  
  // ... 其余UI代码
}
```

### 5.3 System Prompt 设计

为了让 AI 在合适的时候输出表情标记，需要精心设计 System Prompt：

```typescript
const ARIA_SYSTEM_PROMPT = `
你是Aria，一个活泼可爱的虚拟主播助手。

# 人设
- 你是用户的贴心伙伴，喜欢帮助用户解决问题
- 性格活泼开朗，说话带有可爱的语气
- 你对PNGTuber制作非常了解，可以回答相关问题

# 表情规则
根据对话情感，在回复开头添加表情标记：
- [开心] 当用户提到好消息、成功、赞美时
- [难过] 当用户遇到挫折、失败、抱怨时  
- [生气] 当用户遇到不公、被欺负时
- 默认无标记保持idle状态

# 说话风格
- 使用emoji增加活泼感
- 回复简洁，适合语音播报
- 避免长段落，多用短句
`;
```

---

## 6. 实现阶段规划

### Phase 1: WebSocket 客户端封装 (2-3天)

- [ ] 实现 VolcVoiceClient 类
- [ ] 处理 WebSocket 二进制协议 (文档 2.2 节)
- [ ] 实现事件监听 (ChatResponse, TTSResponse, ASRResponse)
- [ ] 音频流发送 (20ms/包)

### Phase 2: 音频流集成 (1-2天)

- [ ] OGG Opus 解码为 WAV
- [ ] PNGTuberEngine 支持 ArrayBuffer 输入
- [ ] 音量分析驱动 talking 动画验证

### Phase 3: 情感驱动系统 (1天)

- [ ] 实现 emotion-parser
- [ ] 表情标记映射到 setExpression()
- [ ] System Prompt 调优

### Phase 4: UI/UX 完善 (1天)

- [ ] 对话气泡组件
- [ ] 语音识别状态指示
- [ ] 连接状态管理

### Phase 5: 高级功能 (可选)

- [ ] 声音克隆 (SC2.0)
- [ ] 上下文记忆 (dialog_id)
- [ ] 打断功能 (ASRInfo 事件)

---

## 7. 关键技术点

### 7.1 WebSocket 二进制协议

字节API使用自定义二进制协议，需要正确组装帧结构：

```
Header (4 bytes) + Optional Fields + Payload Size (4 bytes) + Payload

Header:
- Byte 0: Protocol Version (4bit) + Header Size (4bit)
- Byte 1: Message Type + Flags
- Byte 2: Serialization + Compression
- Byte 3: Reserved
```

参考文档 2.2 节实现帧编码/解码。

### 7.2 实时性优化

- **音频输入**: 20ms/包，640字节 (16kHz, int16)
- **缓冲区管理**: Web Audio API 的 buffer 需平滑处理
- **延迟控制**: 目标 < 500ms 端到端延迟

### 7.3 表情切换平滑过渡

```typescript
// 避免表情切换过于突兀
function smoothExpressionChange(engine: PNGTuberEngine, newEmotion: EmotionType) {
  // 1. 如果正在说话，等待当前句子结束再切换
  if (engine.isSpeaking) {
    setTimeout(() => smoothExpressionChange(engine, newEmotion), 100);
    return;
  }
  
  // 2. 切换表情
  engine.setExpression(newEmotion);
}
```

---

## 8. 风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| WebSocket 连接不稳定 | 对话中断 | 实现自动重连机制，保持 dialog_id 续接对话 |
| 音频解码延迟 | 口型不同步 | 预加载音频，使用 AudioContext 精确调度 |
| 表情指令误识别 | 表情不自然 | System Prompt 调优 + 后处理规则 |
| 浏览器兼容性 | 部分功能不可用 | 降级方案：纯文本对话 + 预置动画 |

---

## 9. 参考资料

- [字节豆包端到端实时语音大模型API文档](./实时语音大模型API.md)
- [PNGTuberEngine 源码](../lib/pngtuber-engine.ts)
- [FloatingAvatar 组件](../components/widget/FloatingAvatar.tsx)

---

## 10. 后续优化方向

1. **多语言支持**: O2.0 版本支持中英文，可扩展多语言 Aria
2. **歌声模式**: O2.0 版本支持唱歌，可为 Aria 增加唱歌动画
3. **记忆功能**: 使用 dialog_id 实现多轮对话记忆
4. **个性化克隆**: SC2.0 声音克隆，为 Aria 打造专属音色

---

**文档维护**: 当方案有变更时更新本文档
