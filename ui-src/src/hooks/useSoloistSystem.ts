import { useState, useEffect } from 'react';

export type StorageType = 'local' | 'github' | 'cloud';
export type VisualFidelity = 'performance' | 'high';
export type AILevel = 'silent' | 'guide' | 'teacher';

interface SystemSettings {
  storageType: StorageType;
  visualFidelity: VisualFidelity;
  aiLevel: AILevel;
}

const DEFAULT_SETTINGS: SystemSettings = {
  storageType: 'local',
  visualFidelity: 'high',
  aiLevel: 'guide'
};

export const useSoloistSystem = () => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('soloist-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('soloist-settings', JSON.stringify(settings));
  }, [settings]);

  return {
    settings,
    updateSettings: (newSettings: Partial<SystemSettings>) => setSettings(p => ({ ...p, ...newSettings })),
    saveData: (key: string, data: any) => localStorage.setItem(`soloist-data-${key}`, JSON.stringify(data)),
    loadData: (key: string) => { const d = localStorage.getItem(`soloist-data-${key}`); return d ? JSON.parse(d) : null; }
  };
};