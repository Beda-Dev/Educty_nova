"use client";

import React from "react";
import { Stepper, Step, StepLabel } from "@/components/ui/steps";
import { useMediaQuery } from "@/hooks/use-media-query";

interface StepperWrapperProps {
  steps: { label: string; desc: string }[];
  currentStep: number;
}

export default function StepperWrapper({ steps, currentStep }: StepperWrapperProps) {
  const isTablet = useMediaQuery("(max-width: 1024px)");

  return (
    <>
      <h2 className="text-lg font-semibold text-center mb-8">
        {steps[currentStep]?.desc}
      </h2>
      <Stepper current={currentStep} direction={isTablet ? "vertical" : "horizontal"}>
        {steps.map(({ label }) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </>
  );
}
