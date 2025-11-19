'use client';

import { useState } from 'react';
import { Lock, Unlock, Trophy, Star, Coins } from 'lucide-react';
import { CampaignLevel } from '../hooks/useCampaignMode';

interface CampaignModeProps {
  levels: CampaignLevel[];
  totalCoins: number;
  onSelectLevel: (levelId: number) => void;
  onResetCampaign: () => void;
}

export const CampaignMode = ({
  levels,
  totalCoins,
  onSelectLevel,
  onResetCampaign,
}: CampaignModeProps) => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const progress = {
    completed: levels.filter((l) => l.completed).length,
    total: levels.length,
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'from-green-500 to-green-600';
      case 'MEDIUM':
        return 'from-yellow-500 to-yellow-600';
      case 'HARD':
        return 'from-red-500 to-red-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'সহজ';
      case 'MEDIUM':
        return 'মাঝারি';
      case 'HARD':
        return 'কঠিন';
      default:
        return difficulty;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">🎮 ক্যাম্পেইন মোড</h2>
            <p className="text-purple-100">মিশন সম্পূর্ণ করে পুরস্কার জিতুন!</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Coins size={24} />
              <span className="text-2xl font-bold">{totalCoins}</span>
            </div>
            <p className="text-sm text-purple-100">মোট কয়েন</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-purple-900/50 rounded-full h-3 overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all duration-300"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
        <p className="text-sm text-purple-100 mt-2">
          {progress.completed} / {progress.total} মিশন সম্পূর্ণ
        </p>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`relative rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
              level.unlocked
                ? 'border-cyan-500 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50'
                : 'border-slate-600 opacity-60'
            }`}
            onClick={() => level.unlocked && onSelectLevel(level.id)}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(
                level.difficulty
              )} opacity-10`}
            />

            {/* Content */}
            <div className="relative p-4 bg-slate-800/80 backdrop-blur">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-cyan-400">
                      Level {level.id}
                    </span>
                    {level.completed && (
                      <Trophy size={20} className="text-yellow-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{level.name}</h3>
                  <p className="text-sm text-cyan-300">{level.description}</p>
                </div>

                {/* Lock Icon */}
                <div className="ml-2">
                  {level.unlocked ? (
                    <Unlock size={24} className="text-green-400" />
                  ) : (
                    <Lock size={24} className="text-red-400" />
                  )}
                </div>
              </div>

              {/* Objective */}
              <div className="bg-slate-900/50 p-3 rounded mb-3 border border-slate-700">
                <p className="text-xs text-cyan-400 font-mono mb-1">📋 লক্ষ্য:</p>
                <p className="text-sm text-cyan-200">{level.objective}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {/* Target Score */}
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-xs text-cyan-400 font-mono">লক্ষ্য</p>
                  <p className="text-lg font-bold text-cyan-300">
                    {level.targetScore}
                  </p>
                </div>

                {/* Best Score */}
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-xs text-cyan-400 font-mono">সেরা</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {level.bestScore}
                  </p>
                </div>

                {/* Reward */}
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <p className="text-xs text-cyan-400 font-mono">পুরস্কার</p>
                  <p className="text-lg font-bold text-green-400">
                    +{level.reward}
                  </p>
                </div>
              </div>

              {/* Difficulty Badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`bg-gradient-to-r ${getDifficultyColor(
                    level.difficulty
                  )} px-3 py-1 rounded text-white text-xs font-bold`}
                >
                  {getDifficultyLabel(level.difficulty)}
                </div>

                {/* Time Limit */}
                {level.timeLimit && (
                  <div className="text-xs text-cyan-300 font-mono">
                    ⏱️ {level.timeLimit}s
                  </div>
                )}
              </div>

              {/* Play Button */}
              {level.unlocked && (
                <button
                  onClick={() => onSelectLevel(level.id)}
                  className="w-full mt-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-all"
                >
                  {level.completed ? '🔄 আবার খেলো' : '▶️ খেলো'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          onClick={onResetCampaign}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-all"
        >
          🔄 ক্যাম্পেইন রিসেট করো
        </button>
      </div>

      {/* Tips */}
      <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30">
        <h3 className="text-cyan-400 font-bold mb-3">💡 ক্যাম্পেইন টিপস:</h3>
        <ul className="text-sm text-cyan-300 space-y-1">
          <li>✅ প্রতিটি মিশন সম্পূর্ণ করে পরবর্তী আনলক করুন</li>
          <li>🎯 লক্ষ্য স্কোর অর্জন করে সম্পূর্ণ পুরস্কার পান</li>
          <li>💰 কয়েন সংগ্রহ করে শপে আইটেম কিনুন</li>
          <li>🏆 সব মিশন সম্পূর্ণ করে চ্যাম্পিয়ন হন!</li>
        </ul>
      </div>
    </div>
  );
};

export default CampaignMode;
