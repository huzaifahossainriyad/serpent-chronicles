'use client';

import { useEffect, useRef } from 'react';

interface SoundEffectsConfig {
  enabled: boolean;
  volume: number;
}

export const useSoundEffects = (config: SoundEffectsConfig = { enabled: true, volume: 0.5 }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<{ [key: string]: OscillatorNode | null }>({});

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
      } catch (error) {
        console.warn('AudioContext not supported:', error);
      }
    }
  }, []);

  // Play a simple beep sound
  const playBeep = (frequency: number = 440, duration: number = 100) => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Error playing beep:', error);
    }
  };

  // Food eaten sound (high pitch beep)
  const playFoodEaten = () => {
    playBeep(800, 100);
  };

  // Game over sound (descending beeps)
  const playGameOver = () => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const frequencies = [400, 300, 200];
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          playBeep(freq, 150);
        }, index * 200);
      });
    } catch (error) {
      console.warn('Error playing game over sound:', error);
    }
  };

  // Level up sound (ascending beeps)
  const playLevelUp = () => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const frequencies = [400, 500, 600, 700];
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          playBeep(freq, 100);
        }, index * 120);
      });
    } catch (error) {
      console.warn('Error playing level up sound:', error);
    }
  };

  // Combo sound (quick beeps)
  const playCombo = (comboCount: number = 1) => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const beepCount = Math.min(comboCount, 5);
      for (let i = 0; i < beepCount; i++) {
        setTimeout(() => {
          playBeep(600 + i * 100, 80);
        }, i * 100);
      }
    } catch (error) {
      console.warn('Error playing combo sound:', error);
    }
  };

  // Collision sound (low frequency buzz)
  const playCollision = () => {
    playBeep(200, 200);
  };

  // Power-up sound (ascending chirp)
  const playPowerUp = () => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const frequencies = [600, 800, 1000];
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          playBeep(freq, 80);
        }, index * 100);
      });
    } catch (error) {
      console.warn('Error playing power-up sound:', error);
    }
  };

  // Stun sound (wobble effect)
  const playStun = () => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          playBeep(300 + Math.random() * 200, 100);
        }, i * 150);
      }
    } catch (error) {
      console.warn('Error playing stun sound:', error);
    }
  };

  // Boss encounter sound (deep bass)
  const playBossEncounter = () => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      playBeep(100, 300);
      setTimeout(() => {
        playBeep(150, 300);
      }, 350);
    } catch (error) {
      console.warn('Error playing boss encounter sound:', error);
    }
  };

  // Victory sound (triumphant beeps)
  const playVictory = () => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C (major chord)
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          playBeep(freq, 200);
        }, index * 150);
      });
    } catch (error) {
      console.warn('Error playing victory sound:', error);
    }
  };

  // Menu click sound
  const playMenuClick = () => {
    playBeep(500, 50);
  };

  return {
    playFoodEaten,
    playGameOver,
    playLevelUp,
    playCombo,
    playCollision,
    playPowerUp,
    playStun,
    playBossEncounter,
    playVictory,
    playMenuClick,
    playBeep,
  };
};

export default useSoundEffects;
