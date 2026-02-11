"use client";

import { memo } from "react";
import AIImageGeneratorForm from "./AIImageGeneratorForm";
import AIImageGeneratorResults from "./AIImageGeneratorResults";
import { useAIImageGeneration } from "./hooks";
import type { AIImageGeneratorProps } from "./types";

const AIImageGenerator = memo(function AIImageGenerator({
  className = "",
}: AIImageGeneratorProps) {
  const {
    formState,
    setFormState,
    currentTask,
    isGenerating,
    generate,
    regenerate,
  } = useAIImageGeneration();

  return (
    <div className={className}>
      {/* Form Section */}
      <AIImageGeneratorForm
        formState={formState}
        onFormChange={setFormState}
        onSubmit={generate}
        isGenerating={isGenerating}
      />

      {/* Results Section */}
      {currentTask && (
        <AIImageGeneratorResults task={currentTask} onRegenerate={regenerate} />
      )}
    </div>
  );
});

export default AIImageGenerator;
