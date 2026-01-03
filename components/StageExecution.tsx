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
    "步骤还是有点大",
    "单纯不想动",
    "很焦虑/抗拒",
    "被别的事分心了",
    "身体不舒服/太累",
    "缺少必要工具",
];

const PRAISE_MESSAGES = [
    "干得漂亮！",
    "保持节奏",
    "没那么难对吧？",
    "进度条在动了",
    "给自己点个赞",
    "又搞定一个",
    "慢慢来，很好",
    "雪球滚起来了",
];

// Coffee/Tea Icon for break
const TeaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

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
  const [praise, setPraise] = useState("");
  
  // New state for break feature
  const [stepsSinceLastBreak, setStepsSinceLastBreak] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  
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
    // Pick a random praise message (Removed emoji from array for cleaner look per request, or just kept text simple)
    setPraise(PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)]);
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Wait for animation
    setTimeout(() => {
        setIsCompleting(false);
        setPraise(""); // Reset praise
        onStepComplete(currentStep.id, timeSpent);
        
        const nextCount = stepsSinceLastBreak + 1;

        if (currentIndex < steps.length - 1) {
          setCurrentIndex(prev => prev + 1);
          
          // Check for break condition (5 consecutive steps)
          if (nextCount >= 5) {
              setShowBreakModal(true);
              setStepsSinceLastBreak(0);
          } else {
              setStepsSinceLastBreak(nextCount);
          }

        } else {
          onFinish();
        }
    }, 800); 
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
      setStepsSinceLastBreak(0); // Reset break counter on replan
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
      case StepType.PHYSICAL_RESET: return 'bg-orange-50 dark:bg-orange-900/10 text-orange-900 dark:text-orange-100 border-orange-100 dark:border-orange-800/30';
      case StepType.PHYSIOLOGICAL_RESET: return 'bg-teal-50 dark:bg-teal-900/10 text-teal-900 dark:text-teal-100 border-teal-100 dark:border-teal-800/30';
      case StepType.PHYSICAL_START: return 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-100 border-indigo-100 dark:border-indigo-800/30';
      default: return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-700';
    }
  };

  // Simplified Icons (less emoji-like, more minimal text or simple svg if I had them, but standard emojis are fine if minimal)
  // User asked for "minimalist theme... avoid excessive emojis". I'll use simple emojis but maybe fewer.
  const getStepIcon = (type: StepType) => {
      switch (type) {
          case StepType.PHYSICAL_RESET: return "🧹";
          case StepType.PHYSIOLOGICAL_RESET: return "🍃";
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
       
       {/* Minimalist Progress Bar */}
      <div className="mb-10 px-2">
         <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-full overflow-hidden">
            <div 
                className="absolute top-0 left-0 h-full bg-primary/80 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
            ></div>
         </div>
         <div className="text-center mt-2 text-xs text-gray-400 font-medium tracking-widest uppercase">
            Step {currentIndex + 1} / {steps.length}
         </div>
      </div>

      {/* Main Card */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border-2 shadow-sm transition-all duration-500 ${getStepColor(currentStep.type)}`}>
        <div className="text-4xl mb-6 select-none opacity-80">
            {getStepIcon(currentStep.type)}
        </div>
        <h2 className="text-2xl font-medium text-center leading-relaxed tracking-tight">
          {currentStep.instruction}
        </h2>
      </div>

      {/* Controls */}
      <div className="mt-8 space-y-4">
        <Button 
            fullWidth 
            onClick={handleDone}
            className={`
                h-16 text-lg shadow-lg shadow-primary/10 transition-all transform
                ${isCompleting ? 'bg-emerald-500 border-emerald-600 scale-[0.98]' : 'hover:scale-[1.01]'}
            `}
        >
          {isCompleting ? `✨ ${praise}` : "完成"}
        </Button>
        
        <button 
            onClick={() => setShowStuckModal(true)}
            disabled={isStuckLoading}
            className="w-full flex items-center justify-center text-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-3 transition-colors disabled:opacity-50"
        >
          有点难 / 调整一下
        </button>
      </div>

      {/* Stuck Modal Overlay */}
      {showStuckModal && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md animate-slide-up-fade">
              <div className="bg-white dark:bg-gray-900 w-full rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 sm:m-4 max-w-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">遇到阻碍了吗？</h3>
                      <button onClick={() => setShowStuckModal(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                      {STUCK_REASONS.map(reason => (
                          <button 
                            key={reason}
                            onClick={() => setStuckReason(reason)}
                            className={`px-4 py-2 rounded-xl text-sm transition-colors border
                                ${stuckReason === reason 
                                    ? 'bg-primary/10 text-primary border-primary/20' 
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}
                            `}
                          >
                              {reason}
                          </button>
                      ))}
                  </div>

                  <textarea 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-1 focus:ring-primary/50 text-sm mb-6 resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                    placeholder="其他原因..."
                    rows={2}
                    value={stuckReason}
                    onChange={(e) => setStuckReason(e.target.value)}
                  />

                  <Button 
                    fullWidth 
                    onClick={handleSubmitStuck}
                    disabled={!stuckReason || isStuckLoading}
                  >
                      {isStuckLoading ? "正在调整..." : "调整步骤"}
                  </Button>
              </div>
          </div>
      )}

      {/* Break Modal (New Feature) */}
      {showBreakModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm animate-fade-in px-6">
             <div className="w-full max-w-xs text-center animate-slide-up-fade">
                 <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 dark:text-teal-400">
                     <LeafIcon />
                 </div>
                 <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 tracking-tight">
                     小憩片刻
                 </h3>
                 <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm mb-8">
                     你已经连续前进了好几步。<br/>
                     欲速则不达，建议闭眼深呼吸，或者喝口水。
                 </p>
                 <div className="space-y-3">
                     <Button fullWidth onClick={() => setShowBreakModal(false)} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20">
                         我休息好了
                     </Button>
                     <button 
                         onClick={() => setShowBreakModal(false)}
                         className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors py-2"
                     >
                         跳过
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};