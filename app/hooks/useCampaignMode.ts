'use client';

import { useState, useCallback, useEffect } from 'react';

export interface CampaignLevel {
  id: number;
  name: string;
  description: string;
  objective: string;
  targetScore: number;
  timeLimit?: number; // in seconds
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  reward: number; // coins
  unlocked: boolean;
  completed: boolean;
  bestScore: number;
}

export const useCampaignMode = () => {
  const [levels, setLevels] = useState<CampaignLevel[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [totalCoins, setTotalCoins] = useState(0);

  // Initialize levels
  useEffect(() => {
    const savedLevels = localStorage.getItem('campaignLevels');
    const savedCoins = localStorage.getItem('campaignCoins');

    if (savedLevels) {
      try {
        setLevels(JSON.parse(savedLevels));
      } catch (error) {
        console.warn('Error loading campaign levels:', error);
        initializeLevels();
      }
    } else {
      initializeLevels();
    }

    if (savedCoins) {
      setTotalCoins(parseInt(savedCoins));
    }
  }, []);

  // Initialize default levels
  const initializeLevels = () => {
    const defaultLevels: CampaignLevel[] = [
      {
        id: 1,
        name: 'শুরুর পাঠ',
        description: 'সাপ গেমের প্রথম পাঠ',
        objective: '৩০ সেকেন্ডে ১০টি খাবার খান',
        targetScore: 100,
        timeLimit: 30,
        difficulty: 'EASY',
        reward: 50,
        unlocked: true,
        completed: false,
        bestScore: 0,
      },
      {
        id: 2,
        name: 'দ্রুত গতি',
        description: 'আরও দ্রুত খেলুন',
        objective: '৪৫ সেকেন্ডে ২০টি খাবার খান',
        targetScore: 200,
        timeLimit: 45,
        difficulty: 'EASY',
        reward: 75,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
      {
        id: 3,
        name: 'মাঝারি চ্যালেঞ্জ',
        description: 'এখন কঠিন হয়ে উঠছে',
        objective: '১ মিনিটে ৩০টি খাবার খান',
        targetScore: 300,
        timeLimit: 60,
        difficulty: 'MEDIUM',
        reward: 100,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
      {
        id: 4,
        name: 'দক্ষতার পরীক্ষা',
        description: 'আপনার দক্ষতা দেখান',
        objective: 'কোনো সংঘর্ষ ছাড়াই ৫০টি খাবার খান',
        targetScore: 500,
        difficulty: 'MEDIUM',
        reward: 150,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
      {
        id: 5,
        name: 'বিষাক্ত জোন',
        description: 'বিষাক্ত এলাকা এড়িয়ে খেলুন',
        objective: 'বিষাক্ত জোন এড়িয়ে ৫০ স্কোর করুন',
        targetScore: 500,
        difficulty: 'HARD',
        reward: 200,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
      {
        id: 6,
        name: 'AI এর বিরুদ্ধে',
        description: 'AI সাপের সাথে প্রতিযোগিতা করুন',
        objective: 'AI সাপকে পরাজিত করে ১০০ স্কোর করুন',
        targetScore: 1000,
        difficulty: 'HARD',
        reward: 250,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
      {
        id: 7,
        name: 'মাস্টার চ্যালেঞ্জ',
        description: 'চূড়ান্ত চ্যালেঞ্জ',
        objective: '২ মিনিটে ১৫০টি খাবার খান',
        targetScore: 1500,
        timeLimit: 120,
        difficulty: 'HARD',
        reward: 300,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
      {
        id: 8,
        name: 'অসম্ভব মিশন',
        description: 'শুধুমাত্র সেরাদের জন্য',
        objective: 'কোনো সময় সীমা ছাড়াই ২০০টি খাবার খান',
        targetScore: 2000,
        difficulty: 'HARD',
        reward: 500,
        unlocked: false,
        completed: false,
        bestScore: 0,
      },
    ];

    setLevels(defaultLevels);
    localStorage.setItem('campaignLevels', JSON.stringify(defaultLevels));
  };

  // Complete a level
  const completeLevel = useCallback((levelId: number, score: number) => {
    setLevels((prevLevels) => {
      const updatedLevels = prevLevels.map((level) => {
        if (level.id === levelId) {
          const isCompleted = score >= level.targetScore;
          const reward = isCompleted ? level.reward : Math.floor(level.reward * 0.3);

          if (isCompleted || score > level.bestScore) {
            setTotalCoins((prev) => {
              const newCoins = prev + reward;
              localStorage.setItem('campaignCoins', newCoins.toString());
              return newCoins;
            });
          }

          return {
            ...level,
            completed: isCompleted || level.completed,
            bestScore: Math.max(level.bestScore, score),
          };
        }

        // Unlock next level if current is completed
        if (level.id === levelId + 1 && score >= prevLevels[levelId - 1].targetScore) {
          return { ...level, unlocked: true };
        }

        return level;
      });

      localStorage.setItem('campaignLevels', JSON.stringify(updatedLevels));
      return updatedLevels;
    });
  }, []);

  // Get current level
  const getCurrentLevel = useCallback(() => {
    return levels.find((level) => level.id === currentLevelId);
  }, [levels, currentLevelId]);

  // Get next unlocked level
  const getNextUnlockedLevel = useCallback(() => {
    return levels.find((level) => level.unlocked && !level.completed);
  }, [levels]);

  // Get progress
  const getProgress = useCallback(() => {
    const completed = levels.filter((level) => level.completed).length;
    const total = levels.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [levels]);

  // Reset campaign
  const resetCampaign = useCallback(() => {
    localStorage.removeItem('campaignLevels');
    localStorage.removeItem('campaignCoins');
    setTotalCoins(0);
    initializeLevels();
  }, []);

  return {
    levels,
    currentLevelId,
    setCurrentLevelId,
    totalCoins,
    completeLevel,
    getCurrentLevel,
    getNextUnlockedLevel,
    getProgress,
    resetCampaign,
  };
};

export default useCampaignMode;
