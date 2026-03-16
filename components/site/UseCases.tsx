'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { roles, useCases, platforms } from '@/components/site/data';
import { ArrowRight } from 'lucide-react';

/**
 * Role-based use-cases explorer — shows practical AI applications per role.
 * Ported from M-Moser-AI-Site-main with CSS variables updated to --site-* tokens.
 */
export function UseCases() {
  // null means "All Roles" is active (no role filtered)
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // Filter use cases by the selected role, or show all if none selected
  const filteredCases = activeRole
    ? useCases.filter((uc) => uc.role === activeRole || uc.role === 'All Roles')
    : useCases;

  return (
    <section
      className="py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-[var(--site-border)] scroll-mt-16"
      id="use-cases"
    >
      {/* Section header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-[var(--font-display)] text-3xl text-[var(--site-text-muted)]">
            03
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl tracking-tight">
            Role-Based Use Cases
          </h2>
        </div>
        <p className="text-[var(--site-text-muted)] text-lg max-w-2xl">
          What does this actually mean for your job? Filter by role to see practical applications of
          these platforms.
        </p>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        {/* "All Roles" button */}
        <button
          onClick={() => setActiveRole(null)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeRole === null
              ? 'bg-[var(--site-text)] text-[var(--site-bg)]'
              : 'bg-[var(--site-surface)] text-[var(--site-text-muted)] hover:bg-[var(--site-surface-hover)] hover:text-[var(--site-text)]'
          }`}
        >
          All Roles
        </button>
        {/* Individual role buttons (excluding the "All Roles" entry in the roles array) */}
        {roles
          .filter((r) => r !== 'All Roles')
          .map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeRole === role
                  ? 'bg-[var(--site-text)] text-[var(--site-bg)]'
                  : 'bg-[var(--site-surface)] text-[var(--site-text-muted)] hover:bg-[var(--site-surface-hover)] hover:text-[var(--site-text)]'
              }`}
            >
              {role}
            </button>
          ))}
      </div>

      {/* Use-case cards grid — animates when filter changes */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCases.map((uc, idx) => {
            const platform = platforms.find((p) => p.id === uc.platformId);

            return (
              <motion.div
                layout
                key={`${uc.role}-${uc.platformId}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl border border-[var(--site-border)] bg-[var(--site-bg)] hover:border-[var(--site-text-muted)] transition-colors group flex flex-col"
              >
                {/* Platform logo + name */}
                <div className="flex items-center gap-3 mb-6">
                  {platform && (
                    <img
                      src={platform.avatar}
                      alt={platform.name}
                      className="w-8 h-8 rounded-full object-cover border border-[var(--site-border)] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="text-xs uppercase tracking-widest text-[var(--site-text-muted)] font-semibold">
                    {platform?.name}
                  </span>
                </div>

                <h3 className="font-[var(--font-display)] text-xl mb-4">{uc.headline}</h3>
                <p className="text-sm text-[var(--site-text-muted)] leading-relaxed mb-8 flex-1">
                  {uc.description}
                </p>

                {/* Footer: role label + arrow */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--site-border)]">
                  <span className="text-xs uppercase tracking-widest text-[var(--site-text-muted)]">
                    {uc.role}
                  </span>
                  <a
                    href="#platforms"
                    className="text-[var(--site-text-muted)] group-hover:text-[var(--site-text)] transition-colors"
                    aria-label="View platform"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
