// FILE: src/components/workflow/CalculationNode.tsx
import { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatrixInput } from "@/components/MatrixInput";
import { useTheme } from "@/contexts/ThemeContext";
import {
  CheckCircle,
  Calculator,
  Lightbulb,
  Lock,
  Unlock,
  CheckCircle2,
} from "lucide-react"; // Added CheckCircle2
import { motion } from "framer-motion";

interface CalculationNodeProps {
  data: {
    label: string;
    formula: string;
    description: string;
    expectedMatrix: number[][];
    hint: string;
    onComplete?: (nodeId: string) => void;
    disabled?: boolean; // New prop
  };
  id: string;
}

export function CalculationNode({ data, id }: CalculationNodeProps) {
  const { isDark } = useTheme();
  const initialMatrix = () =>
    Array(data.expectedMatrix.length)
      .fill(null)
      .map(() => Array(data.expectedMatrix[0].length).fill(0));

  const [userMatrix, setUserMatrix] = useState<number[][]>(initialMatrix());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errors, setErrors] = useState<boolean[][]>([]);

  useEffect(() => {
    // Reset internal state when the node is re-enabled (e.g., after a workflow reset)
    // or if its expected matrix changes (though less likely here)
    if (!data.disabled) {
      setUserMatrix(initialMatrix());
      setIsCompleted(false); // Reset completion status if it becomes enabled again
      setErrors([]);
      setShowHint(false);
    }
  }, [data.disabled, data.expectedMatrix]); // Rerun if disabled status changes

  // Create refs for audio objects to persist across renders
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements only once when component mounts
  useEffect(() => {
    correctAudioRef.current = new Audio("/correct.mp3");
    wrongAudioRef.current = new Audio("/wrong.mp3");

    // Preload audio files
    if (correctAudioRef.current) {
      correctAudioRef.current.load();
    }
    if (wrongAudioRef.current) {
      wrongAudioRef.current.load();
    }

    // Cleanup function to release audio resources
    return () => {
      if (correctAudioRef.current) {
        correctAudioRef.current.pause();
        correctAudioRef.current.src = "";
      }
      if (wrongAudioRef.current) {
        wrongAudioRef.current.pause();
        wrongAudioRef.current.src = "";
      }
    };
  }, []);

  const playSound = (isCorrect: boolean) => {
    const audioElement = isCorrect
      ? correctAudioRef.current
      : wrongAudioRef.current;
    if (audioElement) {
      audioElement.currentTime = 0;
      const playPromise = audioElement.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.error("Error playing sound:", error);
        });
      }
    }
  };

  const validateMatrix = (matrixToValidate: number[][]) => {
    if (data.disabled || isCompleted) return true;

    const newErrors = Array(matrixToValidate.length)
      .fill(null)
      .map((_, rIdx) =>
        Array(matrixToValidate[0]?.length || 0)
          .fill(false)
          .map((__, cIdx) => {
            const userValue = matrixToValidate[rIdx]?.[cIdx] ?? 0;
            const expectedValue = data.expectedMatrix[rIdx]?.[cIdx] ?? NaN;
            const tolerance = 0.0001;
            return Math.abs(userValue - expectedValue) > tolerance;
          })
      );

    const allValid = newErrors.every((row) =>
      row.every((cellError) => !cellError)
    );
    setErrors(newErrors);

    // Update state without playing sound (sound already played on button click)
    if (allValid) {
      setIsCompleted(true);
      data.onComplete?.(id);
    }

    return allValid;
  };

  const handleMatrixChange = (newMatrix: number[][]) => {
    if (data.disabled || isCompleted) return;
    setUserMatrix(newMatrix);
    // Remove this line to prevent auto-validation
    // validateMatrix(newMatrix); // Validate on change after blur
  };

  const resetMatrix = () => {
    if (data.disabled || isCompleted) return; // Don't reset if node is locked or already done
    setUserMatrix(initialMatrix());
    // setIsCompleted(false); // Do not reset isCompleted on manual reset if we want it to stay green
    setErrors([]);
  };

  // Remove the nodeIsEffectivelyReadonly calculation that includes isCompleted
  const nodeIsEffectivelyReadonly = data.disabled; // Only lock if disabled, not if completed

  return (
    <Card
      className={`min-w-[320px] max-w-[400px] transition-all duration-300 relative ${
        // Added relative for overlay
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
      } shadow-xl rounded-lg ${
        isCompleted
          ? isDark
            ? "ring-2 ring-green-500/70"
            : "ring-2 ring-green-500/80"
          : data.disabled
          ? isDark
            ? "border-slate-600"
            : "border-slate-200"
          : "" // More subtle border for disabled
      } ${data.disabled ? "opacity-70" : ""}`}
    >
      {" "}
      {/* Dim disabled nodes */}
      <div className={`p-4 ${data.disabled ? "pointer-events-none" : ""}`}>
        {" "}
        {/* Disable pointer events on content when node is disabled */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isCompleted ? (
              <Unlock
                className={`w-5 h-5 ${
                  isDark ? "text-green-400" : "text-green-500"
                }`}
              />
            ) : (
              <Calculator
                className={`w-5 h-5 ${
                  isDark ? "text-purple-400" : "text-purple-600"
                }`}
              />
            )}
            <h3
              className={`font-semibold text-lg ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {data.label}
            </h3>
            {isCompleted && !data.disabled && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle
                  className={`w-5 h-5 ${
                    isDark ? "text-green-400" : "text-green-500"
                  }`}
                />
              </motion.div>
            )}
          </div>
          <p
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {data.description}
          </p>
        </div>
        <div
          className={`mb-4 p-3 border rounded-md text-center transition-colors duration-300 ${
            isDark
              ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700"
              : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-slate-200"
          }`}
        >
          <div
            className={`text-lg font-mono ${
              isDark ? "text-blue-300" : "text-indigo-600"
            }`}
          >
            {data.formula}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            {" "}
            {/* Added container for left-side buttons */}
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
              disabled={nodeIsEffectivelyReadonly}
              className={`flex items-center gap-1 transition-colors duration-150 ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 focus-visible:ring-slate-500 disabled:opacity-50"
                  : "text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-400 disabled:opacity-50"
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              Hint
            </Button>
            <Button
              onClick={resetMatrix}
              variant="outline"
              size="sm"
              disabled={nodeIsEffectivelyReadonly}
              className={`flex items-center gap-1 transition-colors duration-150 ${
                isDark
                  ? "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 focus-visible:ring-slate-500 disabled:opacity-50"
                  : "text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-400 disabled:opacity-50"
              }`}
            >
              Reset
            </Button>
          </div>

          {/* Add new Verify button */}
          <Button
            onClick={() => {
              // First validate the matrix
              const validationResult = validateMatrix(userMatrix);
              // Then play the appropriate sound based on validation result
              playSound(validationResult);
            }}
            variant="outline"
            size="sm"
            disabled={nodeIsEffectivelyReadonly || isCompleted}
            className={`flex items-center gap-1 transition-colors duration-150 ${
              isDark
                ? "text-emerald-300 border-emerald-600 hover:bg-emerald-700 hover:text-emerald-100 focus-visible:ring-emerald-500 disabled:opacity-50"
                : "text-emerald-600 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:ring-emerald-400 disabled:opacity-50"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Verify
          </Button>
        </div>
        {showHint &&
          !data.disabled && ( // Only show hint if not disabled
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`mb-4 p-3 border rounded-md transition-colors duration-300 ${
                isDark
                  ? "bg-yellow-900/20 border-yellow-600/30"
                  : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <p
                className={`text-sm ${
                  isDark ? "text-yellow-300" : "text-yellow-700"
                }`}
              >
                {data.hint}
              </p>
            </motion.div>
          )}
        <div className="flex justify-center">
          <MatrixInput
            matrix={userMatrix}
            onChange={handleMatrixChange}
            errors={errors}
            readonly={data.disabled}
            isCompleted={isCompleted} // This prop will trigger green styling
          />
        </div>
        {errors.some((row) => row.some((cell) => cell)) &&
          !isCompleted &&
          !data.disabled && (
            <div
              className={`mt-3 p-2 border rounded-md text-center transition-colors duration-300 ${
                isDark
                  ? "bg-red-900/20 border-red-600/30"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <p
                className={`text-sm ${
                  isDark ? "text-red-300" : "text-red-600"
                }`}
              >
                Some values are incorrect.
              </p>
            </div>
          )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? "!bg-blue-500 !border-slate-800"
            : "!bg-blue-500 !border-white"
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !border-2 rounded-full transition-colors duration-300 ${
          isDark
            ? "!bg-purple-500 !border-slate-800"
            : "!bg-purple-500 !border-white"
        }`}
      />
    </Card>
  );
}
