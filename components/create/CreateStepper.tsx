"use client";

import { useEffect } from "react";
import type { CreateStep } from "@/hooks/use-generation";
import { useGeneration } from "@/hooks/use-generation";
import { StepChooseBase } from "./StepChooseBase";
import { StepDescribe } from "./StepDescribe";
import { StepDownload } from "./StepDownload";
import { StepExpressions } from "./StepExpressions";

const STEPS: { id: CreateStep; label: string; number: number }[] = [
  { id: "describe", label: "Describe", number: 1 },
  { id: "choose-base", label: "Choose Base", number: 2 },
  { id: "expressions", label: "Expressions", number: 3 },
  { id: "download", label: "Download", number: 4 },
];

function getStepIndex(step: CreateStep): number {
  return STEPS.findIndex((s) => s.id === step);
}

export function CreateStepper() {
  const generation = useGeneration();
  const { state } = generation;
  const currentStepIndex = getStepIndex(state.step);

  // Fetch credit balance on mount
  useEffect(() => {
    generation.fetchBalance();
  }, [generation.fetchBalance]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Create PNGTuber</h1>
        <ul className="steps steps-horizontal w-full">
          {STEPS.map((step, i) => (
            <li
              key={step.id}
              className={`step ${i <= currentStepIndex ? "step-primary" : ""}`}
            >
              {step.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="alert alert-error mb-6">
          <span>{state.error}</span>
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[400px]">
        {state.step === "describe" && (
          <StepDescribe
            prompt={state.prompt}
            style={state.style}
            creditBalance={generation.creditBalance}
            isGenerating={state.isGenerating}
            onPromptChange={generation.updatePrompt}
            onStyleChange={generation.updateStyle}
            onSubmit={generation.generateCharacter}
          />
        )}

        {state.step === "choose-base" && (
          <StepChooseBase
            candidates={state.candidateImages}
            selectedIndex={state.selectedIndex}
            creditBalance={generation.creditBalance}
            isRegenerating={state.isGenerating}
            onSelect={generation.selectCandidate}
            onRegenerate={generation.regenerateCharacter}
            onNext={generation.generateExpressions}
            onBack={generation.goBack}
          />
        )}

        {state.step === "expressions" && (
          <StepExpressions
            expressions={state.expressions}
            isGenerating={state.isGeneratingExpressions}
            onNext={generation.proceedToDownload}
            onBack={generation.goBack}
          />
        )}

        {state.step === "download" && (
          <StepDownload
            avatarId={state.avatarId}
            avatarName={state.avatarName}
            expressions={state.expressions}
            onNameChange={generation.updateAvatarName}
          />
        )}
      </div>
    </div>
  );
}
