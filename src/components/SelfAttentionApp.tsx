import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { ProgressBar } from "@/components/ProgressBar";
import { StepNavigation } from "@/components/StepNavigation";
import { MatrixStep } from "@/components/MatrixStep";
import { EducationalSidebar } from "@/components/EducationalSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export type Step = "input" | "q" | "k" | "v" | "scores" | "softmax" | "output";

const steps: Step[] = ["input", "q", "k", "v", "scores", "softmax", "output"];

export function SelfAttentionApp() {
  const [currentStep, setCurrentStep] = useState<Step>("input");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const { isDark } = useTheme();

  const handleStepComplete = (step: Step) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    setCurrentStep("input");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-opacity-80 border-b border-opacity-20 border-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Self-Attention Mechanism
            </h1>
            <div className="flex items-center gap-4">
              <Button
                onClick={resetProgress}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <ProgressBar
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Matrix Calculation Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MatrixStep
                  step={currentStep}
                  onComplete={() => handleStepComplete(currentStep)}
                  isCompleted={completedSteps.has(currentStep)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Educational Sidebar */}
          <div className="lg:col-span-1">
            <EducationalSidebar currentStep={currentStep} />
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepChange={setCurrentStep}
      />
    </div>
  );
}
