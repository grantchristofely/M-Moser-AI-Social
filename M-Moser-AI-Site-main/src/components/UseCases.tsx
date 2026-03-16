import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { roles, useCases, platforms } from "../data";
import { cn } from "../lib/utils";
import { ArrowRight } from "lucide-react";

export function UseCases() {
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const filteredCases = activeRole 
    ? useCases.filter(uc => uc.role === activeRole)
    : useCases;

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative z-10 border-t border-[var(--color-border)] scroll-mt-16" id="use-cases">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-[var(--font-display)] text-3xl text-[var(--color-text-muted)]">03</span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl tracking-tight">Role-Based Use Cases</h2>
        </div>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl">
          What does this actually mean for your job? Filter by role to see practical applications of these platforms.
        </p>
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setActiveRole(null)}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            activeRole === null 
              ? "bg-[var(--color-text)] text-[var(--color-bg)]" 
              : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          )}
        >
          All Roles
        </button>
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all",
              activeRole === role 
                ? "bg-[var(--color-text)] text-[var(--color-bg)]" 
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            )}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Use Cases Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCases.map((uc, idx) => {
            const platform = platforms.find(p => p.id === uc.platformId);
            
            return (
              <motion.div
                layout
                key={`${uc.role}-${uc.platformId}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-text-muted)] transition-colors group flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  {platform && (
                    <img 
                      src={platform.avatar} 
                      alt={platform.name} 
                      className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-semibold">
                    {platform?.name}
                  </span>
                </div>
                
                <h3 className="font-[var(--font-display)] text-xl mb-4">{uc.headline}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-8 flex-1">
                  {uc.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--color-border)]">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                    {uc.role}
                  </span>
                  <a href="#platforms" className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
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
