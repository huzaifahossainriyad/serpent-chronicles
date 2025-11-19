'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundSettingsProps {
  onSoundToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  initialEnabled?: boolean;
  initialVolume?: number;
}

export const SoundSettings = ({
  onSoundToggle,
  onVolumeChange,
  initialEnabled = true,
  initialVolume = 0.5,
}: SoundSettingsProps) => {
  const [soundEnabled, setSoundEnabled] = useState(initialEnabled);
  const [volume, setVolume] = useState(initialVolume);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      try {
        const { enabled, volume: savedVolume } = JSON.parse(savedSettings);
        setSoundEnabled(enabled);
        setVolume(savedVolume);
      } catch (error) {
        console.warn('Error loading sound settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    onSoundToggle(newState);
    localStorage.setItem(
      'soundSettings',
      JSON.stringify({ enabled: newState, volume })
    );
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange(newVolume);
    localStorage.setItem(
      'soundSettings',
      JSON.stringify({ enabled: soundEnabled, volume: newVolume })
    );
  };

  return (
    <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-cyan-500/30">
      {/* Sound Toggle Button */}
      <button
        onClick={handleSoundToggle}
        className={`p-2 rounded-lg transition-all ${
          soundEnabled
            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
        }`}
        title={soundEnabled ? 'Sound On' : 'Sound Off'}
      >
        {soundEnabled ? (
          <Volume2 size={20} />
        ) : (
          <VolumeX size={20} />
        )}
      </button>

      {/* Volume Slider */}
      <div className="flex items-center gap-2 flex-1">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          disabled={!soundEnabled}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-xs text-cyan-400 font-mono w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};

export default SoundSettings;
