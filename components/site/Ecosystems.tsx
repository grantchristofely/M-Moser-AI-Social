'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/utils/supabase/client';
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
  const [activeTab, setActiveTab] = useState('');
  const [ecosystems, setEcosystems] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [ecosRes, platsRes, featsRes] = await Promise.all([
        supabase.from('ecosystems').select('*').order('order_idx'),
        supabase.from('platforms').select('*').order('order_idx'),
        supabase.from('ecosystem_features').select('*').order('order_idx'),
      ]);

      if (ecosRes.data && platsRes.data && featsRes.data) {
        setEcosystems(ecosRes.data);
        setPlatforms(platsRes.data);
        setFeatures(featsRes.data);
        if (ecosRes.data.length > 0) {
          setActiveTab(ecosRes.data[0].platform_id);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-[var(--site-border)] min-h-[500px] flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full bg-[var(--site-text-muted)]" />
      </section>
    );
  }

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
          {ecosystems.map((eco: any) => {
            const platform = platforms.find((p: any) => p.id === eco.platform_id);
            const isActive = activeTab === eco.platform_id;

            return (
              <button
                key={eco.id}
                onClick={() => setActiveTab(eco.platform_id)}
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
            {ecosystems.map((eco: any) => {
              if (eco.platform_id !== activeTab) return null;
              
              const ecoFeatures = features.filter((f: any) => f.ecosystem_id === eco.id);

              return (
                <motion.div
                  key={eco.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {ecoFeatures.map((feature: any, idx: number) => (
                    <div
                      key={feature.id}
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
