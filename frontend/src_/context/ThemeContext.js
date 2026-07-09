import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const themes = {
    dark: {
      name: 'dark',
      pageBg:    'bg-[#0A0A0A]',
      cardBg:    'bg-[#121212]',
      inputBg:   'bg-[#0A0A0A]',
      navBg:     'bg-[#121212]',
      modalBg:   'bg-[#121212]',
      hoverBg:   'hover:bg-[#1e1e1e]',
      text:      'text-white',
      subtext:   'text-gray-400',
      muted:     'text-gray-600',
      border:    'border-gray-800',
      divider:   'border-gray-800',
      accent:    '#D4FF33',
      accentBg:  'bg-[#D4FF33]',
      accentText:'text-[#D4FF33]',
      bg:        '#0A0A0A',
      card:      '#121212',
      input:     '#0A0A0A',
      textHex:   '#ffffff',
      subtextHex:'#9ca3af',
      borderHex: '#1f2937',
      // Graph specific colors
      graphAxisColor: '#9ca3af',
      graphEmptyBar:  '#1f2937',
      navBgHex:  '#121212',
    },
    light: {
      name: 'light',
      pageBg:    'bg-gray-50',
      cardBg:    'bg-white',
      inputBg:   'bg-gray-50',
      navBg:     'bg-white',
      modalBg:   'bg-white',
      hoverBg:   'hover:bg-gray-100',
      text:      'text-gray-900',
      subtext:   'text-gray-500',
      muted:     'text-gray-400',
      border:    'border-gray-200',
      divider:   'border-gray-200',
      accent:    '#D4FF33',
      accentBg:  'bg-[#D4FF33]',
      accentText:'text-[#8aad00]',
      bg:        '#f9fafb',
      card:      '#ffffff',
      input:     '#f9fafb',
      textHex:   '#111827',
      subtextHex:'#6b7280',
      borderHex: '#e5e7eb',
      // Graph specific — darker so they show on white background
      graphAxisColor: '#374151',
      graphEmptyBar:  '#d1d5db',
      navBgHex:  '#ffffff',
    },
    warm: {
      name: 'warm',
      pageBg:    'bg-[#1a1410]',
      cardBg:    'bg-[#241a15]',
      inputBg:   'bg-[#1a1410]',
      navBg:     'bg-[#1e1510]',
      modalBg:   'bg-[#241a15]',
      hoverBg:   'hover:bg-[#2e2018]',
      text:      'text-[#e7d8c9]',
      subtext:   'text-[#9c8676]',
      muted:     'text-[#6b5a50]',
      border:    'border-[#3d2e26]',
      divider:   'border-[#3d2e26]',
      accent:    '#D4FF33',
      accentBg:  'bg-[#D4FF33]',
      accentText:'text-[#D4FF33]',
      bg:        '#1a1410',
      card:      '#241a15',
      input:     '#1a1410',
      textHex:   '#e7d8c9',
      subtextHex:'#9c8676',
      borderHex: '#3d2e26',
      // Graph specific
      graphAxisColor: '#9c8676',
      graphEmptyBar:  '#3d2e26',
      navBgHex:  '#1e1510',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, t: themes[theme], themes }}>
      {children}
    </ThemeContext.Provider>
  );
};