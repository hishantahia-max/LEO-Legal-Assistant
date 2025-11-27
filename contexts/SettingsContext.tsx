
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  theme: 'system',
  density: 'comfortable',
  fontSize: 'medium',
  aiStrictness: 'strict',
  namingTemplate: '{YEAR}-{CASE_NO}-{DOC_TYPE}',
  autoProcess: true,
  defaultCourt: 'Supreme Court of India',
  backupFrequency: 'daily',
  soundEnabled: true,
  notificationsEnabled: true
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: any) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('autodoc_settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) { console.error("Failed to parse settings", e); }
    }
  }, []);

  useEffect(() => {
    // Apply Theme
    const root = document.documentElement;
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    
  }, [settings.theme]);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('autodoc_settings', JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
