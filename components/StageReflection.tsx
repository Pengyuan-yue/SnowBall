import React, { useState } from 'react';
import { Button } from './Button';
import { Reflection } from '../types';

interface StageReflectionProps {
  onSubmit: (data: Reflection) => void;
}

export const StageReflection: React.FC<StageReflectionProps> = ({ onSubmit }) => {
  const [focus, setFocus] = useState(50);
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit({
      focusScore: focus,
      moodScore: mood,
      energyScore: energy,
      selfTalk: note
    });
  };

  return (
    <div className="flex flex-col h-full py-4 animate-slide-up-fade space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">任务完成</h2>
        <p className="text-gray-500 dark:text-gray-400">简单记录一下你的感受</p>
      </div>

      <div className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm">
        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>☁️ 昏沉</span>
              <span className="font-bold text-gray-900 dark:text-gray-200">大脑清晰度</span>
              <span>💡 清醒</span>
            </div>
            <input 
              type="range" min="0" max="100" value={focus} 
              onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
             <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>🌧️ 糟糕</span>
              <span className="font-bold text-gray-900 dark:text-gray-200">心情</span>
              <span>☀️ 愉快</span>
            </div>
            <input 
              type="range" min="0" max="100" value={mood} 
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full accent-accent h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
             <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>🔋 没电</span>
              <span className="font-bold text-gray-900 dark:text-gray-200">能量</span>
              <span>⚡️ 充沛</span>
            </div>
            <input 
              type="range" min="0" max="100" value={energy} 
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-yellow-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Self Talk */}
        <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             给自己的一句话（选填）
           </label>
           <textarea 
             className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none resize-none focus:ring-2 focus:ring-primary/50 placeholder-gray-400 dark:placeholder-gray-500"
             rows={3}
             placeholder="比如：其实我比想象中更棒..."
             value={note}
             onChange={(e) => setNote(e.target.value)}
           />
        </div>
      </div>

      <Button fullWidth onClick={handleSubmit}>保存到路线库</Button>
    </div>
  );
};