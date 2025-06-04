"use client"

import { Stepper, Step, StepLabel } from "@/components/ui/steps"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: 1,
    title: "Informations personnelles",
    description: "Données de l'élève et tuteurs",
  },
  {
    id: 2,
    title: "Informations scolaires",
    description: "Classe et année académique",
  },
  {
    id: 3,
    title: "Tarification",
    description: "Choix des options de paiement",
  },
  {
    id: 4,
    title: "Documents",
    description: "Pièces justificatives",
  },
  {
    id: 5,
    title: "Confirmation",
    description: "Récapitulatif et validation",
  },
]

interface RegistrationStepperProps {
  currentStep: number
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  const renderStepIcon = (stepId: number) => {
    if (currentStep > stepId) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex items-center justify-center w-full h-full"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )
    }
    return <span className="text-sm font-medium">{stepId}</span>
  }

  if (isMobile) {
    return (
      <div className="w-full py-4 px-2">
        <Stepper
          current={currentStep}
          direction="vertical"
          className="gap-8"
        >
          {steps.map((step) => (
            <Step key={step.id}>
              <StepLabel
                icon={renderStepIcon(step.id)}
                completed={currentStep > step.id}
                active={currentStep === step.id}
                className="gap-4 items-start"
              >
                <div className="flex-1 pt-1">
                  <h3 className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {currentStep === step.id && (
                    <motion.p
                      className="text-xs text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    )
  }

  return (
    <div className="w-full py-8 px-6">

      <Stepper
        current={currentStep}
        direction={isTablet ? "vertical" : "horizontal"}
        className={isTablet ? "gap-8 pl-8" : ""}
      >
        {steps.map((step) => (
          <Step key={step.id}>
            <StepLabel
              icon={renderStepIcon(step.id)}
              completed={currentStep > step.id}
              active={currentStep === step.id}
              className={isTablet ? "gap-6 items-start" : ""}
            >
              <div className={isTablet ? "flex-1 pt-2" : "mt-4 text-center max-w-36"}>
                <motion.p
                  className={cn(
                    isTablet ? "text-base" : "text-sm",
                    "font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: step.id * 0.1 + 0.2 }}
                >
                  {step.title}
                </motion.p>
                {currentStep === step.id && (
                  <motion.p
                    className={cn(
                      isTablet ? "text-sm" : "text-xs",
                      "text-muted-foreground mt-1"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  )
}