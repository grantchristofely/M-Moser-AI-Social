import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Hero } from "./components/Hero";
import { Platforms } from "./components/Platforms";
import { Ecosystems } from "./components/Ecosystems";
import { UseCases } from "./components/UseCases";

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-[var(--color-text)] selection:text-[var(--color-bg)]">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--color-text)] origin-left z-50"
        style={{ scaleX }}
      />

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg)]/20 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center md:justify-end gap-6 md:gap-8">
          <button 
            onClick={() => scrollToSection('platforms')}
            className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Platforms
          </button>
          <button 
            onClick={() => scrollToSection('ecosystems')}
            className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Ecosystems
          </button>
          {/* <button 
            onClick={() => scrollToSection('use-cases')}
            className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Use Cases
          </button> */}
        </div>
      </nav>

      {/* Return to Top Button */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] shadow-2xl hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Return to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <main>
        <Hero />
        <Platforms />
        
        {/* Parallax Divider */}
        <div className="h-32 w-full relative overflow-hidden my-16">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
              backgroundSize: '2rem 2rem',
              transform: 'translateY(-20%)'
            }}
          />
        </div>

        <Ecosystems />
        {/* <UseCases /> */}
      </main>

      <footer className="py-12 px-6 border-t border-[var(--color-border)] mt-32 relative z-10 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-[var(--color-text-muted)] uppercase tracking-widest font-semibold">
            M Moser Associates
          </div>
          <p className="text-sm text-[var(--color-text-muted)] text-center md:text-right">
            This guide reflects the AI landscape as of March 2026.<br className="hidden md:block" /> Treat this as a living reference.
          </p>
        </div>
      </footer>
    </div>
  );
}
