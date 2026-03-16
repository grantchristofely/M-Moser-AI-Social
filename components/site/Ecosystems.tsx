'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ecosystems, platforms } from '@/components/site/data';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/** Local cn helper. */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tabbed ecosystem explorer — shows features for each AI platform.
 * Ported from M-Moser-AI-Site-main with no design changes.
 */
export function Ecosystems() {
  const [activeTab, setActiveTab] = useState(ecosystems[0].platformId);

  return (
    <section
      className="py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-[var(--site-border)] scroll-mt-16"
      id="ecosystems"
    >
      {/* Section header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-[var(--font-display)] text-3xl text-[var(--site-text-muted)]">02</span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl tracking-tight">The Ecosystems</h2>
        </div>
        <p className="text-[var(--site-text-muted)] text-lg max-w-2xl">
          What lives inside each platform beyond the front door. Explore the specific features and
          tools available.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Platform tab list (scrolls horizontally on mobile) */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 lg:w-64 shrink-0">
          {ecosystems.map((eco) => {
            const platform = platforms.find((p) => p.id === eco.platformId);
            const isActive = activeTab === eco.platformId;

            return (
              <button
                key={eco.platformId}
                onClick={() => setActiveTab(eco.platformId)}
                className={cn(
                  'flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all whitespace-nowrap lg:whitespace-normal',
                  isActive
                    ? 'bg-[var(--site-surface)] text-[var(--site-text)]'
                    : 'text-[var(--site-text-muted)] hover:text-[var(--site-text)] hover:bg-[var(--site-surface-hover)]'
                )}
              >
                {platform && (
                  <img
                    src={platform.avatar}
                    alt={platform.name}
                    className="w-6 h-6 rounded-full object-cover border border-[var(--site-border)] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="font-medium">{eco.name}</span>
              </button>
            );
          })}
        </div>

        {/* Feature cards for the selected platform */}
        <div className="flex-1 min-h-[400px]">
          <AnimatePresence mode="wait">
            {ecosystems.map((eco) => {
              if (eco.platformId !== activeTab) return null;

              return (
                <motion.div
                  key={eco.platformId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {eco.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] hover:border-[var(--site-text-muted)] transition-colors"
                    >
                      <h4 className="font-medium text-lg mb-2">{feature.name}</h4>
                      <p className="text-sm text-[var(--site-text-muted)] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
