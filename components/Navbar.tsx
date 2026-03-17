'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Site-wide navigation bar, fixed at the top of every page.
 *
 * On the homepage ("/") it also shows two smooth-scroll links:
 *   • Platforms → scrolls to #platforms
 *   • Ecosystems → scrolls to #ecosystems
 *
 * On all other pages those links are hidden so the Navbar stays uncluttered.
 */
export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Avoid hydration mismatch by only rendering the icon after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Subscribe to auth state so the Navbar always reflects the current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  /** Smooth-scroll to a section by its HTML id (homepage only). */
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isHomepage = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo — links back to the homepage */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text)] hover:opacity-70 transition-opacity"
        >
          <span className="font-semibold tracking-tight text-sm">M Moser AI</span>
        </Link>

        {/* Primary navigation links */}
        <div className="hidden md:flex items-center text-xs font-medium tracking-wide text-[var(--text-muted)]">

          {/* Homepage-only scroll links */}
          <AnimatePresence>
            {isHomepage && (
              <motion.div
                initial={{ opacity: 0, width: 0, x: 20, pointerEvents: 'none' }}
                animate={{ opacity: 1, width: 'auto', x: 0, pointerEvents: 'auto' }}
                exit={{ opacity: 0, width: 0, x: 20, pointerEvents: 'none' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="flex items-center gap-8 pr-8">
                  <button
                    onClick={() => scrollToSection('platforms')}
                    className="hover:text-[var(--text)] transition-colors"
                  >
                    Platforms
                  </button>
                  <button
                    onClick={() => scrollToSection('ecosystems')}
                    className="hover:text-[var(--text)] transition-colors"
                  >
                    Ecosystems
                  </button>
                  <button
                    onClick={() => scrollToSection('use-cases')}
                    className="hover:text-[var(--text)] transition-colors"
                  >
                    Use Cases
                  </button>

                  {/* Visual divider between homepage sections and app links */}
                  <span className="text-[var(--text-faint)] select-none">|</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hub app links — redirect to login when user is not authenticated */}
          <div className="flex items-center gap-8">
            <Link
              href={user ? '/feed' : '/login'}
              className="hover:text-[var(--text)] transition-colors"
            >
              Feed
            </Link>
            <Link
              href={user ? '/leaderboard' : '/login'}
              className="hover:text-[var(--text)] transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href={user ? '/profile' : '/login'}
              className="hover:text-[var(--text)] transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* Right side: auth button + theme toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-[var(--text)] bg-[var(--border)] hover:bg-[var(--border-strong)] px-4 py-1.5 rounded-full transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-[var(--text)] bg-[var(--border)] hover:bg-[var(--border-strong)] px-4 py-1.5 rounded-full transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Theme toggle — sun in dark mode (click to go light), moon in light mode (click to go dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
