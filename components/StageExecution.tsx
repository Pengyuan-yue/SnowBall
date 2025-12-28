import React, { useEffect, useState } from 'react';
import { Step, StepType } from '../types';
import { Button } from './Button';
import { generateAdjustedBreakdown } from '../services/geminiService';

interface StageExecutionProps {
  steps: Step[];
  goal: string;
  onStepComplete: (stepId: string, timeSpent: number) => void;
  onUpdateRemainingSteps: (newSteps: Step[], startIndex: number) => void;
  onFinish: () => void;
}

const STUCK_REASONS = [
    "太难了/步骤太大",
    "单纯不想动",
    "很焦虑/抗拒",
    "被别的事分心了",
    "身体不舒服/太累",
    "缺少必要工具",
];

export const StageExecution: React.FC<StageExecutionProps> = ({
  steps,
  goal,
  onStepComplete,
  onUpdateRemainingSteps,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isStuckLoading, setIsStuckLoading] = useState(false);
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [stuckReason, setStuckReason] = useState("");
  
  // State for button animation
  const [isCompleting, setIsCompleting] = useState(false);

  const currentStep = steps[currentIndex];

  useEffect(() => {
    // Reset start time when step changes
    setStartTime(Date.now());
  }, [currentIndex, steps.length]);

  const handleDone = () => {
    if (isCompleting) return;
    
    // Trigger animation state
    setIsCompleting(true);
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Wait for animation
    setTimeout(() => {
        setIsCompleting(false);
        onStepComplete(currentStep.id, timeSpent);
        if (currentIndex < steps.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onFinish();
        }
    }, 400); 
  };

  const handleSubmitStuck = async () => {
    if (!stuckReason) return;
    
    setIsStuckLoading(true);
    try {
      // Re-plan the rest of the route
      const newPlan = await generateAdjustedBreakdown(currentStep.instruction, stuckReason, goal);
      onUpdateRemainingSteps(newPlan, currentIndex); 
      setShowStuckModal(false);
      setStuckReason("");
    } catch (error) {
      console.error("Failed to replan", error);
    } finally {
      setIsStuckLoading(false);
    }
  };

  if (!currentStep) return null;

  // Visuals based on type
  const getStepColor = (type: StepType) => {
    switch (type) {
      case StepType.PHYSICAL_RESET: return 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case StepType.PHYSIOLOGICAL_RESET: return 'bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800';
      case StepType.PHYSICAL_START: return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-700';
    }
  };

  const getStepIcon = (type: StepType) => {
      switch (type) {
          case StepType.PHYSICAL_RESET: return "🧹";
          case StepType.PHYSIOLOGICAL_RESET: return "🧘";
          case StepType.PHYSICAL_START: return "🚀";
          default: return "⚡";
      }
  }

  // Calculate progress percentage for the bar
  const progressPercent = steps.length > 1 
    ? (currentIndex / (steps.length - 1)) * 100 
    : 0;

  return (
    <div className="flex flex-col h-full justify-between py-6 animate-slide-up-fade relative">
       
       {/* Vivid Visual Progress Bar */}
      <div className="mb-10 px-2">
         <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
            {/* Gradient Progress Line */}
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
            >
                {/* Glowing tip at the end of progress */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] z-20"></div>
            </div>

            {/* Step Nodes */}
            <div className="absolute inset-0 flex justify-between items-center -mx-1 pointer-events-none">
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    
                    return (
                        <div key={step.id || idx} className="relative flex flex-col items-center">
                            {/* Dot */}
                            <div 
                                className={`
                                    w-3 h-3 rounded-full transition-all duration-500 z-10
                                    ${isCompleted ? 'bg-purple-500 scale-100' : 'bg-gray-300 dark:bg-gray-600'}
                                    ${isCurrent ? 'bg-white border-2 border-purple-500 scale-150 shadow-lg' : ''}
                                `}
                            ></div>
                        </div>
                    )
                })}
            </div>
         </div>
      </div>

      {/* Main Card */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border-4 shadow-xl transition-all duration-500 ${getStepColor(currentStep.type)}`}>
        {/* Replaced animate-bounce with calmer animate-float */}
        <div className="text-6xl mb-6 select-none animate-float filter drop-shadow-md">
            {getStepIcon(currentStep.type)}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
          {currentStep.instruction}
        </h2>
      </div>

      {/* Controls */}
      <div className="mt-8 space-y-4">
        <Button 
            fullWidth 
            onClick={handleDone}
            className={`
                h-20 text-xl shadow-xl shadow-primary/20 transition-all transform
                ${isCompleting ? 'animate-pop-click bg-green-500 border-green-600 scale-95' : 'hover:scale-[1.02]'}
            `}
        >
          {isCompleting ? "✨ 很棒！" : "完成了"}
        </Button>
        
        <button 
            onClick={() => setShowStuckModal(true)}
            disabled={isStuckLoading}
            className="w-full flex items-center justify-center text-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-4 transition-colors disabled:opacity-50"
        >
          卡住了 / 做不到
        </button>
      </div>

      {/* Stuck Modal Overlay */}
      {showStuckModal && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm animate-slide-up-fade">
              <div className="bg-white dark:bg-gray-800 w-full rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t border-white/20 sm:border sm:m-4 max-w-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">遇到了什么困难？</h3>
                      <button onClick={() => setShowStuckModal(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                      {STUCK_REASONS.map(reason => (
                          <button 
                            key={reason}
                            onClick={() => setStuckReason(reason)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                                ${stuckReason === reason 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary/50'}
                            `}
                          >
                              {reason}
                          </button>
                      ))}
                  </div>

                  <textarea 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 focus:border-primary focus:ring-0 text-sm mb-4 resize-none text-gray-800 dark:text-gray-200"
                    placeholder="或者告诉我其他原因..."
                    rows={2}
                    value={stuckReason}
                    onChange={(e) => setStuckReason(e.target.value)}
                  />

                  <Button 
                    fullWidth 
                    onClick={handleSubmitStuck}
                    disabled={!stuckReason || isStuckLoading}
                  >
                      {isStuckLoading ? (
                          <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              调整计划中...
                          </span>
                      ) : "帮我调整计划"}
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
};