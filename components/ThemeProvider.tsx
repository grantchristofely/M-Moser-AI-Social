'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Thin wrapper around next-themes ThemeProvider.
 *
 * - attribute="data-theme"  → writes data-theme="dark"|"light" on <html>
 * - defaultTheme="light"    → start in light mode unless user has a saved preference
 * - enableSystem             → respects the OS-level dark/light preference on first visit
 * - disableTransitionOnChange → suppresses the CSS transition on initial render
 *   to avoid a flash when the stored theme is applied on page load.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
