'use client';

import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/site/Hero';
import { Platforms } from '@/components/site/Platforms';
import { Ecosystems } from '@/components/site/Ecosystems';
import { UseCases } from '@/components/site/UseCases';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Homepage — renders the full M Moser AI site design inside the Next.js app.
 * The `.homepage` wrapper applies the dark CSS custom properties scoped to
 * this page. Those variables are now aliases of the global design tokens in
 * globals.css, so the theme toggle in the Navbar works here too.
 */
export default function Home() {
  const { scrollYProgress } = useScroll();

  // Thin scroll-progress bar at the very top of the page
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // "Back to top" button — only visible after scrolling 400 px
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    /* .homepage scopes the --site-* aliases used by Hero/Platforms/Ecosystems.
       The actual colour values now come from the active theme tokens in globals.css. */
    <div className="homepage min-h-screen bg-[var(--site-bg)] text-[var(--site-text)] overflow-x-hidden selection:bg-[var(--site-text)]/10">
      {/* Shared Hub Navbar */}
      <Navbar />

      {/* Thin animated scroll-progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--site-text)] origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* "Return to top" floating button */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 p-3 rounded-full bg-[var(--site-surface)] border border-[var(--site-border)] text-[var(--site-text)] shadow-2xl hover:bg-[var(--site-surface-hover)] transition-colors"
            aria-label="Return to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main site content — matches the original M-Moser-AI-Site layout exactly */}
      <main>
        {/* Hero fills the full viewport; the Navbar is fixed on top */}
        <Hero />

        <Platforms />

        {/* Decorative grid divider between sections */}
        <div className="h-32 w-full relative overflow-hidden my-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(var(--site-border) 1px, transparent 1px), linear-gradient(90deg, var(--site-border) 1px, transparent 1px)',
              backgroundSize: '2rem 2rem',
              transform: 'translateY(-20%)',
            }}
          />
        </div>

        <Ecosystems />

        {/* Decorative grid divider between Ecosystems and Use Cases */}
        <div className="h-32 w-full relative overflow-hidden my-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(var(--site-border) 1px, transparent 1px), linear-gradient(90deg, var(--site-border) 1px, transparent 1px)',
              backgroundSize: '2rem 2rem',
              transform: 'translateY(-20%)',
            }}
          />
        </div>

        <UseCases />
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--site-border)] mt-32 relative z-10 bg-[var(--site-surface)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-[var(--site-text-muted)] uppercase tracking-widest font-semibold">
            M Moser Associates
          </div>
          <p className="text-sm text-[var(--site-text-muted)] text-center md:text-right">
            This guide reflects the AI landscape as of March 2026.
            <br className="hidden md:block" />
            Treat this as a living reference.
          </p>
        </div>
      </footer>
    </div>
  );
}
