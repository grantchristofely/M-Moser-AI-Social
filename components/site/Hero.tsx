'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';

/**
 * Full-screen hero section with parallax video background.
 * Ported from M-Moser-AI-Site-main with no design changes.
 */
export function Hero() {
  const { scrollY } = useScroll();
  // Parallax: background moves down as user scrolls
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  // Content fades out as user scrolls
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Parallax video background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source
            src="https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/Video/Mar_12__1931_24s_202603121946_hrfoo.mp4"
            type="video/mp4"
          />
        </video>
        {/* Gradient fade to background colour at the bottom */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--site-bg)_100%)]" />
      </motion.div>

      {/* Centred headline content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="text-[var(--site-text-muted)] uppercase tracking-[0.2em] text-xs font-semibold mb-6 block">
            M Moser Associates
          </span>
          <h1
            className="font-[var(--font-display)] text-5xl md:text-7xl lg:text-[80px] leading-[0.9] tracking-tight mb-8 text-balance
                       transition-all duration-[2000ms] ease-out
                       hover:text-transparent bg-clip-text
                       bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
                       bg-[length:200%_auto] animate-gradient
                       cursor-default"
          >
            This whole site was made with AI so you can learn AI.
          </h1>
          <p className="text-lg md:text-xl text-[var(--site-text-muted)] max-w-2xl mx-auto font-light leading-relaxed">
            A guide to the platforms, ecosystems, and practical applications of artificial
            intelligence in our daily work.
          </p>
        </motion.div>
      </motion.div>

      {/* Animated scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{ opacity }}
      >
        <span className="text-[10px] uppercase tracking-widest text-[var(--site-text-muted)]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-[var(--site-text-muted)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
