export const colors = {
  dark: {
    background: '#020617',
    foreground: '#f8fafc',
    primary: '#6366f1',
    primaryForeground: '#ffffff',
    card: '#0f172a',
    cardForeground: '#f8fafc',
    cardBorder: '#1e293b',
    cardHover: '#1e293b',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#6366f1',
    accent: '#ca8a04',
    accentForeground: '#f8fafc',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    // Sidebar colors
    sidebar: '#0f172a',
    sidebarForeground: '#f8fafc',
    sidebarBorder: '#1e293b',
    sidebarAccent: '#1e293b',
  },
  light: {
    background: '#fcfcfd',
    foreground: '#09090b',
    primary: '#4f46e5',
    primaryForeground: '#ffffff',
    card: '#ffffff',
    cardForeground: '#09090b',
    cardBorder: '#e4e4e7',
    cardHover: '#f4f4f5',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    input: '#f4f4f5',
    ring: '#4f46e5',
    accent: '#ca8a04',
    accentForeground: '#ffffff',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    // Sidebar colors
    sidebar: '#f8fafc',
    sidebarForeground: '#0f172a',
    sidebarBorder: '#e2e8f0',
    sidebarAccent: '#f1f5f9',
  },
};

// Quality badge colors (consistent across themes)
export const qualityColors = {
  UHD_4K: {
    gradient: ['#f59e0b', '#facc15'],
    text: '#000000',
  },
  FHD: {
    gradient: ['#6366f1', '#a855f7'],
    text: '#ffffff',
  },
  HD: {
    gradient: ['#3b82f6', '#06b6d4'],
    text: '#ffffff',
  },
  SD: {
    solid: '#475569',
    text: '#e2e8f0',
  },
  H265: {
    gradient: ['#10b981', '#14b8a6'],
    text: '#ffffff',
  },
};

// Logo gradient colors
export const logoColors = {
  bestPlayer: ['#3b82f6', '#a855f7', '#ec4899'],
  eightK: ['#fbbf24', '#f97316', '#ef4444'],
};

export type ThemeColors = typeof colors.dark;
export type ThemeMode = 'dark' | 'light';
