"use client";

import { Check } from "lucide-react";
import { Fragment, useEffect } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
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

  useEffect(() => {
    generation.fetchBalance();
  }, [generation.fetchBalance]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Create PNGTuber" },
        ]}
      />

      <div className="flex items-center justify-between mb-10">
        {STEPS.map((step, i) => {
          const status =
            i < currentStepIndex
              ? "completed"
              : i === currentStepIndex
                ? "current"
                : "upcoming";
          return (
            <Fragment key={step.id}>
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded-full transition-colors duration-500 ${
                    i <= currentStepIndex ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    status === "completed"
                      ? "bg-primary text-white"
                      : status === "current"
                        ? "bg-primary text-white shadow-[0_0_0_4px_rgba(6,182,212,0.15)]"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {status === "completed" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    status === "current" ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>

      {state.error && (
        <div className="alert alert-error mb-6">
          <span>{state.error}</span>
        </div>
      )}

      <div
        className="min-h-[400px] bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
        key={state.step}
        style={{
          animation: "fadeInUp 0.3s ease-out",
        }}
      >
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
