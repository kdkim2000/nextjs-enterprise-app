'use client';

import React, { useState } from 'react';
import {
  Stepper as MuiStepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Typography,
  StepperProps as MuiStepperProps
} from '@mui/material';

export interface StepItem {
  label: string;
  description?: string;
  content?: React.ReactNode;
  optional?: boolean;
}

export interface StepperProps extends Omit<MuiStepperProps, 'children'> {
  steps: StepItem[];
  activeStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  showContent?: boolean;
  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
  skipLabel?: string;
}

export default function Stepper({
  steps,
  activeStep: controlledStep,
  onStepChange,
  onComplete,
  showContent = false,
  nextLabel = 'Next',
  backLabel = 'Back',
  finishLabel = 'Finish',
  skipLabel = 'Skip',
  orientation = 'horizontal',
  ...rest
}: StepperProps) {
  const [internalStep, setInternalStep] = useState(0);
  const activeStep = controlledStep !== undefined ? controlledStep : internalStep;

  const handleNext = () => {
    const newStep = activeStep + 1;
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep);
    }

    if (newStep === steps.length && onComplete) {
      onComplete();
    }
  };

  const handleBack = () => {
    const newStep = activeStep - 1;
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const isLastStep = activeStep === steps.length - 1;
  const currentStep = steps[activeStep];

  return (
    <Box sx={{ width: '100%' }}>
      <MuiStepper activeStep={activeStep} orientation={orientation} {...rest}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel optional={step.optional && <Typography variant="caption">Optional</Typography>}>
              {step.label}
              {step.description && orientation === 'horizontal' && (
                <Typography variant="caption" display="block" color="text.secondary">
                  {step.description}
                </Typography>
              )}
            </StepLabel>
            {showContent && orientation === 'vertical' && (
              <StepContent>
                {step.content}
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>
                    {isLastStep ? finishLabel : nextLabel}
                  </Button>
                  <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                    {backLabel}
                  </Button>
                  {step.optional && (
                    <Button onClick={handleSkip}>{skipLabel}</Button>
                  )}
                </Box>
              </StepContent>
            )}
          </Step>
        ))}
      </MuiStepper>

      {showContent && orientation === 'horizontal' && activeStep < steps.length && (
        <Box sx={{ mt: 3 }}>
          {currentStep?.content}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              {backLabel}
            </Button>
            <Box sx={{ flex: 1 }} />
            {currentStep?.optional && (
              <Button onClick={handleSkip}>{skipLabel}</Button>
            )}
            <Button variant="contained" onClick={handleNext}>
              {isLastStep ? finishLabel : nextLabel}
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === steps.length && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography>All steps completed!</Typography>
        </Box>
      )}
    </Box>
  );
}
