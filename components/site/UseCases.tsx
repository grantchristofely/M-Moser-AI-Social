'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/utils/supabase/client';
import { ArrowRight } from 'lucide-react';

/**
 * Role-based use-cases explorer — shows practical AI applications per role.
 * Ported from M-Moser-AI-Site-main with CSS variables updated to --site-* tokens.
 */
export function UseCases() {
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [useCases, setUseCases] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [rolesRes, ucRes, platsRes] = await Promise.all([
        supabase.from('roles').select('*').order('order_idx'),
        supabase.from('use_cases').select('*').order('order_idx'),
        supabase.from('platforms').select('*').order('order_idx'),
      ]);

      if (rolesRes.data && ucRes.data && platsRes.data) {
        setRoles(rolesRes.data);
        setUseCases(ucRes.data);
        setPlatforms(platsRes.data);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredCases = activeRole
    ? useCases.filter((uc: any) => uc.role_name === activeRole || uc.role_name === 'All Roles')
    : useCases;

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
        {roles
          .filter((r: any) => r.name !== 'All Roles')
          .map((roleObj: any) => {
            const role = roleObj.name;
            return (
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
            )
          })}
      </div>

      {/* Use-case cards grid — animates when filter changes */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCases.map((uc: any, idx: number) => {
            const platform = platforms.find((p: any) => p.id === uc.platform_id);

            return (
              <motion.div
                layout
                key={`${uc.role_name}-${uc.platform_id}-${idx}`}
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
                    {uc.role_name}
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
