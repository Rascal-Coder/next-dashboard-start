import { Enum } from 'enum-plus';

export const THEME_MODE = Enum({
    LIGHT: { value: 'light', label: 'Light', icon: 'sun' },
    DARK: { value: 'dark', label: 'Dark', icon: 'moon' },
    SYSTEM: { value: 'system', label: 'System', icon: 'laptop' }
  });
  