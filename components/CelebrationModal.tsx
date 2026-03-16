'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Award } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsEarned: number;
  totalPoints: number;
  badgeEarned: string | null;
  actionType: 'post' | 'try_it';
}

export function CelebrationModal({
  isOpen,
  onClose,
  pointsEarned,
  totalPoints,
  badgeEarned,
  actionType
}: CelebrationModalProps) {
  const [showContent, setShowContent] = useState(false);
  
  // Trigger animations after mount for a staggered entrance
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop with a dark blur */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Confetti container (lightweight CSS implementation) */}
      {showContent && (
         <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
             {[...Array(20)].map((_, i) => (
               <div 
                 key={i}
                 className="absolute animate-confetti-fall"
                 style={{
                   left: `${Math.random() * 100}%`,
                   top: `-${Math.random() * 20 + 10}%`,
                   backgroundColor: ['#FFC700', '#FF3D00', '#00E5FF', '#D500F9'][Math.floor(Math.random() * 4)],
                   width: `${Math.random() * 8 + 4}px`,
                   height: `${Math.random() * 16 + 8}px`,
                   opacity: Math.random() + 0.5,
                   transform: `rotate(${Math.random() * 360}deg)`,
                   animationDelay: `${Math.random() * 2}s`,
                   animationDuration: `${Math.random() * 2 + 3}s`
                 }}
               />
             ))}
         </div>
      )}

      {/* Main Modal Content */}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-sub)] text-center shadow-2xl transition-all duration-700 transform ${showContent ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
        
        {/* Glow effect in background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-white/10 hover:text-[var(--text)]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10 p-8 pt-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
             <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>

          <h2 className="mb-2 text-2xl font-bold tracking-tight text-[var(--text)]">
            {actionType === 'post' ? 'Post Published!' : 'Thanks for trying!'}
          </h2>
          
          <p className="mb-8 text-sm text-[var(--text-muted)] leading-relaxed">
            Your contribution helps the community grow. Keep up the great work!
          </p>

          <div className="space-y-4">
            {/* Points Earned Card */}
            <div className={`overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 backdrop-blur-md transition-all duration-700 delay-300 ${showContent ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Points Earned</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">+{pointsEarned}</span>
                <span className="text-sm font-medium text-[var(--text-muted)]">pts</span>
              </div>
              <div className="mt-2 text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                Total Score: <span className="font-semibold text-[var(--text)]">{totalPoints}</span>
              </div>
            </div>

            {/* Badge Earned Card (Optional) */}
            {badgeEarned && badgeEarned !== 'None' && (
              <div className={`overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 backdrop-blur-md transition-all duration-700 delay-500 ${showContent ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-amber-400" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500">New Badge Unlocked</div>
                </div>
                <div className="text-lg font-bold text-[var(--text)]">{badgeEarned}</div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className={`mt-8 w-full rounded-xl bg-[var(--text)] px-4 py-3 text-sm font-semibold text-[var(--bg)] shadow-lg transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-95 duration-500 delay-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
