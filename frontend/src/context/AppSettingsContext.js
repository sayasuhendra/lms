import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

const DEFAULT_SETTINGS = {
  organization_name: 'Nama Organisasi',
};

const AppSettingsContext = createContext(null);

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings({ ...DEFAULT_SETTINGS, ...response });
    } catch (error) {
      console.error('Failed to fetch app settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    const response = await settingsAPI.updateSettings(updates);
    setSettings({ ...DEFAULT_SETTINGS, ...response });
    return response;
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
