import React, { useState } from 'react';
import { Button } from './Button';

interface StageIntentProps {
  onConfirm: (current: string, target: string) => void;
}

export const StageIntent: React.FC<StageIntentProps> = ({ onConfirm }) => {
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');

  const isReady = current.length > 2 && target.length > 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-6 animate-slide-up-fade">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">滚雪球</h1>
        <p className="text-gray-500 dark:text-gray-400">动能始于微末。</p>
      </div>

      <div className="w-full space-y-6">
        <div className="group">
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 ml-1">
            我现在正在...
          </label>
          <input
            type="text"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="刷抖音，躺在床上发呆..."
            className="w-full p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-2 border-transparent focus:border-primary/50 focus:ring-0 focus:outline-none shadow-sm text-lg transition-all"
            autoFocus
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 ml-1">
            但我想要...
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="去健身房，写数学作业..."
            className="w-full p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-2 border-transparent focus:border-primary/50 focus:ring-0 focus:outline-none shadow-sm text-lg transition-all"
          />
        </div>

        <div className="pt-4">
          <Button 
            fullWidth 
            disabled={!isReady} 
            onClick={() => onConfirm(current, target)}
          >
            开始滚动
          </Button>
        </div>
      </div>
    </div>
  );
};