"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SESSION_KEY = 'bs_theme';

function readSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === 'dark';
}

interface ThemeCtx {
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Hydrate from sessionStorage after mount
  useEffect(() => {
    setIsDark(readSession());
  }, []);

  // Apply class to <html> and persist on every change
  useEffect(() => {
    document.documentElement.classList.toggle('theme--dark', isDark);
    if (isDark) sessionStorage.setItem(SESSION_KEY, 'dark');
    else sessionStorage.removeItem(SESSION_KEY);
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark((d) => !d), []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
