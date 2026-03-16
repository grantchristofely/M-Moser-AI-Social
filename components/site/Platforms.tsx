'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { platforms } from '@/components/site/data';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { ArrowRight, Info } from 'lucide-react';

/** Local cn helper so this component has no external lib dependency. */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Expandable platform cards (ChatGPT, Claude, Gemini, Copilot, Photoshop AI, Perplexity).
 * Ported from M-Moser-AI-Site-main with no design changes.
 */
export function Platforms() {
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  return (
    <section
      className="py-32 px-6 max-w-7xl mx-auto relative z-10 scroll-mt-16"
      id="platforms"
    >
      {/* Section header */}
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-[var(--font-display)] text-3xl text-[var(--site-text-muted)]">01</span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl tracking-tight">The Platforms</h2>
        </div>
        <p className="text-[var(--site-text-muted)] text-lg max-w-2xl">
          The core tools shaping the AI landscape. Understand their mental models and where they
          fit best in your workflow.
        </p>
      </div>

      {/* Platform cards grid — clicking a card expands its details */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {platforms.map((platform, i) => (
          <motion.div
            layout
            key={platform.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
            className="flex w-full"
          >
            <button
              onClick={() =>
                setActivePlatform(activePlatform === platform.id ? null : platform.id)
              }
              className={cn(
                'w-full text-left p-8 rounded-2xl border transition-all duration-300 flex flex-col',
                activePlatform === platform.id
                  ? 'bg-[var(--site-surface)] border-[var(--site-text)]'
                  : 'bg-[var(--site-bg)] border-[var(--site-border)] hover:border-[var(--site-text-muted)] hover:bg-[var(--site-surface-hover)]'
              )}
            >
              <motion.div layout className="flex justify-between items-start mb-6 w-full">
                <img
                  src={platform.avatar}
                  alt={platform.name}
                  className="w-14 h-14 rounded-full object-cover border border-[var(--site-border)]"
                  referrerPolicy="no-referrer"
                />
                <ArrowRight
                  className={cn(
                    'w-5 h-5 text-[var(--site-text-muted)] transition-transform duration-300',
                    activePlatform === platform.id ? 'rotate-90 text-[var(--site-text)]' : ''
                  )}
                />
              </motion.div>

              <motion.h3 layout className="font-[var(--font-display)] text-2xl mb-2 w-full">
                {platform.name}
              </motion.h3>
              <motion.div
                layout
                className="text-xs uppercase tracking-wider text-[var(--site-text-muted)] font-semibold mb-4 w-full"
              >
                {platform.mentalModel}
              </motion.div>
              <motion.p layout className="text-sm text-[var(--site-text-muted)] leading-relaxed w-full">
                {platform.bestFor}
              </motion.p>

              {/* Expanded detail panel */}
              <AnimatePresence>
                {activePlatform === platform.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden w-full"
                  >
                    <div className="pt-8 mt-8 border-t border-[var(--site-border)] space-y-6 text-left">
                      {/* "Think of it as" description */}
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-[var(--site-text-muted)] mb-2">
                          Think of it as
                        </h4>
                        <p className="text-base font-light leading-relaxed">{platform.thinkOfItAs}</p>
                      </div>

                      {/* Best-fit use cases */}
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-[var(--site-text-muted)] mb-3">
                          Where it fits best
                        </h4>
                        <ul className="space-y-2">
                          {platform.whereItFitsBest.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-[var(--site-text)] text-sm"
                            >
                              <span className="text-[var(--site-text-muted)] mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Caveat callout */}
                      <div className="bg-[var(--site-bg)] border border-[var(--site-border)] rounded-xl p-5 mt-6">
                        <div className="flex items-center gap-2 mb-3 text-[var(--site-text-muted)]">
                          <Info className="w-4 h-4" />
                          <h4 className="text-xs uppercase tracking-widest font-semibold">One Caveat</h4>
                        </div>
                        <p className="text-sm text-[var(--site-text-muted)] leading-relaxed">
                          {platform.caveat}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
