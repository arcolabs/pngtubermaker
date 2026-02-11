# AI 图片生成器组件

基于 Midjourney 迁移文档封装的图片生成组件，已集成到 Thumb-Free 主页。

## 组件结构

```
components/ai-image-generator/
├── index.ts                          # 统一导出
├── AIImageGenerator.tsx              # 主组件
├── AIImageGeneratorForm.tsx          # 表单（输入、风格、尺寸选择）
├── AIImageGeneratorResults.tsx       # 结果列表
├── AIImageGeneratorResultCard.tsx    # 单张结果卡片
├── types.ts                          # TypeScript 类型定义
├── constants.ts                      # 预设配置
└── hooks/
    ├── index.ts                      # Hooks 统一导出
    ├── useAutoResizeTextarea.ts      # 自动扩容 Hook
    └── useAIImageGeneration.ts       # 生成状态管理 Hook
```

## 功能特性

### 表单区域
- ✅ 自动扩容标题输入框
- ✅ 可选描述输入
- ✅ 6种风格预设（游戏/教程/Vlog/科技/美食/测评）
- ✅ 3种尺寸预设（YouTube封面/Shorts/方形）
- ✅ 8种主色调选择（含自动）
- ✅ Ctrl+Enter 快捷提交
- ✅ 字符计数器
- ✅ 表单状态持久化（localStorage）

### 结果区域
- ✅ 智能网格布局（根据图片数量自适应）
- ✅ 加载进度条和占位符动画
- ✅ 结果卡片（图片预览 + 下载按钮）
- ✅ 重新生成功能
- ✅ 错误状态处理

### 状态管理
- ✅ 模拟图片生成（使用 Unsplash 随机图片）
- ✅ 任务轮询模拟
- ✅ 72小时临时存储逻辑（已预留）

## 使用方式

### 基础使用

```tsx
import { AIImageGenerator } from "@/components/ai-image-generator";

export default function Page() {
  return (
    <AIImageGenerator />
  );
}
```

### 带自定义样式

```tsx
<AIImageGenerator className="max-w-4xl mx-auto" />
```

### 独立使用子组件

```tsx
import { 
  AIImageGeneratorForm, 
  AIImageGeneratorResults,
  useAIImageGeneration 
} from "@/components/ai-image-generator";

function CustomPage() {
  const { formState, setFormState, currentTask, isGenerating, generate } = useAIImageGeneration();
  
  return (
    <div>
      <AIImageGeneratorForm 
        formState={formState}
        onFormChange={setFormState}
        onSubmit={generate}
        isGenerating={isGenerating}
      />
      {currentTask && (
        <AIImageGeneratorResults 
          task={currentTask}
          onRegenerate={generate}
        />
      )}
    </div>
  );
}
```

## 集成位置

已在 `app/(main)/page.tsx` 中集成，位于 Hero 和 Showcase 之间：

```tsx
<section id="image-generator" className="py-16 sm:py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <AIImageGenerator />
  </div>
</section>
```

## 预设配置

### 风格预设
- 🎮 游戏：高对比度、霓虹灯效果
- 📚 教程：简洁清晰、文字突出
- ✈️ Vlog：明亮温暖、生活化
- 💻 科技：现代感、冷色调、未来感
- 🍕 美食：诱人、暖色调、高饱和
- ⭐ 测评：对比展示、专业、可信

### 尺寸预设
- **YouTube封面**：16:9 (1280×720)
- **YouTube Shorts**：9:16 (720×1280)
- **方形**：1:1 (1080×1080)

## 后续扩展

### 连接真实 API

修改 `hooks/useAIImageGeneration.ts` 中的 `generate` 函数：

```typescript
const generate = useCallback(async () => {
  // ... 现有代码 ...
  
  // 替换模拟逻辑为真实 API 调用
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: finalPrompt,
      aspectRatio: formState.size.aspectRatio,
    }),
  });
  
  const { jobId } = await response.json();
  // ... 开始轮询任务状态
}, [formState, isGenerating, clearTask]);
```

### 添加参考图片

参考迁移文档中的 `ReferenceModule` 实现，添加：
- 图片上传区域
- 参考图片拖拽
- 风格参考功能

### 添加参数面板

参考迁移文档中的 `ParametersPanel` 实现：
- 美学参数（stylization/weirdness/variety）
- 模型选择
- 生成速度

## 技术栈

- **框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS v4
- **图标**: Heroicons (SVG)
- **图片**: Next.js Image 组件
- **状态**: React Hooks (useState/useCallback/useEffect/useRef)
- **存储**: localStorage (表单持久化)

## 设计系统遵循

完全遵循 CLAUDE.md 中定义的设计系统：
- 🎨 纯黑背景 + YouTube 红渐变
- 💎 玻璃拟态卡片效果
- ✨ 一致的 hover/transition 动画
- 📱 响应式布局
- 🔴 主色调 #FF0033

---

组件已准备就绪，可以立即在主页使用！
