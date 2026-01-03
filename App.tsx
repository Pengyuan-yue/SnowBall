import React, { useState, useEffect } from 'react';
import { AppStage, Route, Step, Reflection } from './types';
import { generateBreakdown } from './services/geminiService';
import { StageIntent } from './components/StageIntent';
import { StageExecution } from './components/StageExecution';
import { StageReflection } from './components/StageReflection';
import { Button } from './components/Button';

// Icons
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.75h3.75M12 18.75V21m-4.72-13.5h9.44a2.25 2.25 0 012.25 2.25v.008c0 .268-.166.497-.395.606l-11 5.5a.75.75 0 01-.67 0l-11-5.5a.75.75 0 01-.395-.606V9.75a2.25 2.25 0 012.25-2.25z" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

const LOADING_TIPS = [
  "正在把大象切成一口大小的块...",
  "正在寻找丢失的多巴胺...",
  "正在与你的前额叶皮层谈判...",
  "正在把珠穆朗玛峰变成小土坡...",
  "别急，慢就是快...",
  "正在给你的执行功能充电...",
  "正在把‘不可能’变成‘稍微动一下’...",
  "正在清理大脑缓存...",
  "正在给你的大脑发糖...",
  "任务正在解压缩...",
  "正在把‘拖延’赶出房间...",
  "深呼吸，马上就好...",
];

export default function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.INTENT);
  const [route, setRoute] = useState<Route>({
    id: '',
    name: '',
    currentStatus: '',
    steps: [],
    createdAt: 0,
  });
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // -- Effects --
  useEffect(() => {
    // Check system preference on init
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [isDarkMode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === AppStage.BREAKDOWN_LOADING) {
      // Rotate tips every 2.5 seconds
      setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      interval = setInterval(() => {
        setLoadingTip(prev => {
           const currentIndex = LOADING_TIPS.indexOf(prev);
           const nextIndex = (currentIndex + 1) % LOADING_TIPS.length;
           return LOADING_TIPS[nextIndex];
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [stage]);

  // -- Handlers --

  const toggleTheme = () => {
      setIsDarkMode(prev => !prev);
  }

  const handleIntentConfirm = async (current: string, target: string) => {
    setStage(AppStage.BREAKDOWN_LOADING);
    
    const steps = await generateBreakdown(current, target);
    
    setRoute({
      id: crypto.randomUUID(),
      name: target,
      currentStatus: current,
      steps: steps,
      createdAt: Date.now(),
    });

    setStage(AppStage.ROUTE_PREVIEW);
  };

  const handleStartExecution = () => {
    setStage(AppStage.EXECUTION);
  };

  const handleStepComplete = (stepId: string, timeSpent: number) => {
    setRoute(prev => ({
      ...prev,
      steps: prev.steps.map(s => 
        s.id === stepId ? { ...s, completed: true, timeSpentSeconds: timeSpent } : s
      )
    }));
  };

  const handleUpdateRemainingSteps = (newSteps: Step[], startIndex: number) => {
      setRoute(prev => {
          // Keep steps before the current index
          const keptSteps = prev.steps.slice(0, startIndex);
          // Replace everything from startIndex onwards with the new plan
          return { ...prev, steps: [...keptSteps, ...newSteps] };
      });
  };

  const handleExecutionFinish = () => {
    setStage(AppStage.SUMMARY);
  };

  const handleReflectionSubmit = (reflection: Reflection) => {
    const finalRoute = { ...route, reflection, completedAt: Date.now() };
    setSavedRoutes(prev => [finalRoute, ...prev]);
    setStage(AppStage.ARCHIVE);
  };

  const handleLoadRoute = (saved: Route) => {
      // Reset progress
      const freshSteps = saved.steps.filter(s => !s.isEmergency).map(s => ({...s, completed: false, timeSpentSeconds: 0}));
      setRoute({
          ...saved,
          id: crypto.randomUUID(), // New session ID
          steps: freshSteps,
          createdAt: Date.now(),
      });
      setStage(AppStage.ROUTE_PREVIEW);
  }

  const handleDeleteRoute = (routeId: string) => {
      if(window.confirm('确定要删除这条路线记录吗？')) {
        setSavedRoutes(prev => prev.filter(r => r.id !== routeId));
      }
  }

  const handleRegenerate = () => {
      // Re-use current inputs to generate again
      handleIntentConfirm(route.currentStatus, route.name);
  }

  // -- Render Helpers --

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6 animate-slide-up-fade">
      <div className="relative w-20 h-20">
         <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p key={loadingTip} className="text-gray-500 dark:text-gray-400 font-medium text-center px-8 animate-slide-up-fade">
        {loadingTip}
      </p>
    </div>
  );

  const renderPreview = () => (
    <div className="flex flex-col h-full animate-slide-up-fade overflow-hidden">
       <div className="mb-6 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">你的路线</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">滚雪球逻辑为你生成了 {route.steps.length} 个步骤。</p>
       </div>
       
       <div className="flex-1 overflow-y-auto pr-2 mb-6 min-h-0">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            <div className="space-y-6 py-2">
                {route.steps.map((step, idx) => (
                    <div key={step.id} className="relative pl-14 group">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 rounded-full text-sm font-bold text-gray-400 dark:text-gray-500 z-10 group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                            {idx + 1}
                        </div>
                        
                        {/* Content */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:shadow-md transition-all">
                            <span className="text-gray-700 dark:text-gray-200">{step.instruction}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
       </div>

       <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <Button fullWidth onClick={handleStartExecution}>看起来很简单，冲！</Button>
        <div className="flex gap-3">
             <Button variant="ghost" className="flex-1" onClick={handleRegenerate}>换个思路</Button>
             <Button variant="ghost" className="flex-1" onClick={() => setStage(AppStage.INTENT)}>返回修改</Button>
        </div>
       </div>
    </div>
  );

  const renderSummary = () => {
      const totalTime = route.steps.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
      const totalSteps = route.steps.length;
      
      return (
        <div className="flex flex-col h-full animate-slide-up-fade overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center flex-shrink-0">🎉 庆祝时刻</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">你比开始前前进了太多！</p>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-3xl text-center mb-6 flex-shrink-0 border border-blue-100 dark:border-blue-800/50">
                <p className="text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide text-xs font-semibold">你消灭了</p>
                <div className="text-5xl font-black text-primary dark:text-primary mb-2">
                    {totalSteps} <span className="text-2xl font-medium text-gray-400">个障碍</span>
                </div>
                 <div className="text-sm text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-800/50 rounded-full px-3 py-1 inline-block">
                    专注投入时长：{totalTime < 60 ? `${totalTime}秒` : `${Math.floor(totalTime/60)}分`}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                 <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 sticky top-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-2">征服记录</h3>
                 {route.steps.map((step) => (
                     <div key={step.id} className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 group">
                         <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center mr-3 text-xs">✓</div>
                         <span className="text-gray-600 dark:text-gray-300 truncate decoration-gray-300">{step.instruction}</span>
                     </div>
                 ))}
            </div>

            <Button className="mt-6 flex-shrink-0" fullWidth onClick={() => setStage(AppStage.REFLECTION)}>去记录感受</Button>
        </div>
      );
  };

  const renderArchive = () => (
      <div className="flex flex-col h-full animate-slide-up-fade overflow-hidden">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">路线库</h2>
            <button onClick={() => setStage(AppStage.INTENT)} className="p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {savedRoutes.length === 0 ? (
                <div className="text-center text-gray-400 dark:text-gray-500 mt-20">暂无保存的路线。</div>
            ) : (
                savedRoutes.map((r, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleLoadRoute(r)}>
                        
                        {/* Absolute Positioned Delete Button */}
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                e.preventDefault();
                                handleDeleteRoute(r.id); 
                            }}
                            className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-all z-20"
                            title="删除"
                        >
                            <TrashIcon />
                        </button>

                        <div className="flex flex-col items-start mb-2 pr-10">
                             <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{r.name}</h3>
                             <div className="flex gap-2 mt-1">
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                                    {r.steps.length} 步
                                </span>
                             </div>
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">状态: {r.currentStatus}</p>
                        
                        {r.reflection && (
                             <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 italic">
                                "{r.reflection.selfTalk}"
                             </div>
                        )}
                        <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                一键复用 →
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-snow-100 dark:bg-gray-900 flex justify-center transition-colors duration-300">
      {/* 
         Updated container logic for Native App support:
         1. Added 'safe-top' and 'safe-bottom' classes for notch/home-bar support.
         2. Kept the desktop layout (md:...) logic for browser testing.
         3. On mobile (default), it now fills the screen fully rather than looking like a card, 
            which feels more native.
      */}
      <div className="w-full max-w-lg bg-white/50 dark:bg-gray-800/50 md:bg-white md:dark:bg-gray-800 shadow-none md:shadow-2xl h-[100dvh] md:h-[90vh] md:my-auto md:rounded-[40px] overflow-hidden relative transition-colors duration-300 flex flex-col safe-top safe-bottom">
        {/* Header - Cleaned up without XP */}
        <div className="absolute top-0 left-0 w-full h-16 flex justify-between items-center px-6 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-transparent dark:border-gray-700 flex-shrink-0 mt-safe-top">
             <div className="font-bold text-gray-400 dark:text-gray-500 tracking-wider text-xs uppercase">滚雪球</div>
             
             <div className="flex items-center gap-4">
                 <button onClick={toggleTheme} className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
                     {isDarkMode ? <SunIcon /> : <MoonIcon />}
                 </button>
                 
                 {stage !== AppStage.INTENT && stage !== AppStage.ARCHIVE && (
                     <button onClick={() => setStage(AppStage.INTENT)} className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                         <BackIcon />
                     </button>
                 )}
                 {stage === AppStage.INTENT && (
                     <button onClick={() => setStage(AppStage.ARCHIVE)} className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary">
                        <ArchiveIcon />
                     </button>
                 )}
             </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 h-full pt-20 pb-8 px-6 overflow-hidden relative">
          {stage === AppStage.INTENT && <StageIntent onConfirm={handleIntentConfirm} />}
          {stage === AppStage.BREAKDOWN_LOADING && renderLoading()}
          {stage === AppStage.ROUTE_PREVIEW && renderPreview()}
          {stage === AppStage.EXECUTION && (
            <StageExecution 
                steps={route.steps} 
                goal={route.name}
                onStepComplete={handleStepComplete}
                onUpdateRemainingSteps={handleUpdateRemainingSteps} 
                onFinish={handleExecutionFinish} 
            />
          )}
          {stage === AppStage.SUMMARY && renderSummary()}
          {stage === AppStage.REFLECTION && <StageReflection onSubmit={handleReflectionSubmit} />}
          {stage === AppStage.ARCHIVE && renderArchive()}
        </div>
      </div>
    </div>
  );
}