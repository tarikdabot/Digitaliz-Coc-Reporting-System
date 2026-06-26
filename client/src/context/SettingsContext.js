import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    sigRegistrar:  'TARIK DABOT SEMAGN',
    sigAssessment: 'ZAKARIAS GENET',
    sigSupervisor: 'AYNALEM DEGNET',
    centerName:    'SHEWA BIRHAN COLLEGE',
    departments:   [
      'WEB DEVELOPMENT AND DATABASE ADMINSTRATION',
      'Pharmacy',
      'Accounting',
    ],
  });

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  const saveSettings = async (updates) => {
    const { data } = await api.put('/settings', updates);
    setSettings(data);
    return data;
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
