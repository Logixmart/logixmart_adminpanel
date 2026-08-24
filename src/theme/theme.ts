export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'logixmart_theme';

export const THEME_CLASS_LIGHT = 'light';

/** Resolve initial theme from localStorage (default: dark). */
export function getStoredTheme(): ThemeMode {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'light' ? 'light' : 'dark';
}

/** Apply theme to <html> and persist. */
export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;

  if (mode === 'light') {
    root.classList.add(THEME_CLASS_LIGHT);
  } else {
    root.classList.remove(THEME_CLASS_LIGHT);
  }

  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

/** Toggle between dark and light. Returns the new mode. */
export function toggleTheme(current: ThemeMode): ThemeMode {
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/** Call once before React mounts to avoid theme flash. */
export function initTheme(): ThemeMode {
  const mode = getStoredTheme();
  applyTheme(mode);
  return mode;
}
