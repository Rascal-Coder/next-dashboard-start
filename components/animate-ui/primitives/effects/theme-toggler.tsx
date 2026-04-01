'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';

type ThemeSelection = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

type ChildrenRender =
  | React.ReactNode
  | ((state: {
      resolved: Resolved;
      effective: ThemeSelection;
      toggleTheme: (theme: ThemeSelection) => void;
    }) => React.ReactNode);

function getSystemEffective(): Resolved {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

type ThemeTogglerProps = {
  theme: ThemeSelection;
  resolvedTheme: Resolved;
  setTheme: (theme: ThemeSelection) => void;
  onImmediateChange?: (theme: ThemeSelection) => void;
  children?: ChildrenRender;
};

function ThemeToggler({
  theme,
  resolvedTheme,
  setTheme,
  onImmediateChange,
  children,
  ...props
}: ThemeTogglerProps) {
  const [preview, setPreview] = React.useState<null | {
    effective: ThemeSelection;
    resolved: Resolved;
  }>(null);
  const [current, setCurrent] = React.useState<{
    effective: ThemeSelection;
    resolved: Resolved;
  }>({
    effective: theme,
    resolved: resolvedTheme,
  });

  React.useEffect(() => {
    if (
      preview &&
      theme === preview.effective &&
      resolvedTheme === preview.resolved
    ) {
      setPreview(null);
    }
  }, [theme, resolvedTheme, preview]);

  const toggleTheme = React.useCallback(
    (next: ThemeSelection) => {
      const resolved = next === 'system' ? getSystemEffective() : next;

      setCurrent({ effective: next, resolved });
      onImmediateChange?.(next);

      if (next === 'system' && resolved === resolvedTheme) {
        setTheme(next);
        return;
      }

      flushSync(() => {
        setPreview({ effective: next, resolved });
        setTheme(next);
      });
    },
    [onImmediateChange, resolvedTheme, setTheme],
  );

  return (
    <React.Fragment {...props}>
      {typeof children === 'function'
        ? children({
            effective: current.effective,
            resolved: current.resolved,
            toggleTheme,
          })
        : children}
    </React.Fragment>
  );
}

export {
  ThemeToggler,
  type ThemeTogglerProps,
  type ThemeSelection,
  type Resolved,
};
