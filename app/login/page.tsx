'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
        router.push('/feed');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/feed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-6 pt-14">
        <div className="w-full max-w-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
            <h1 className="text-xl font-medium text-center tracking-tight mb-2 text-[var(--text)]">
              {isSignUp ? 'Create an account' : 'Sign In'}
            </h1>
            <p className="text-[var(--text-muted)] text-center text-xs mb-8 font-light">
              {isSignUp ? 'Sign up to start sharing your AI workflows.' : 'Use your M Moser credentials to continue.'}
            </p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Sarah Jenkins"
                    className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mmoser.com"
                  className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              {!isSignUp && (
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-[var(--border-strong)] accent-[var(--accent)] focus:ring-[var(--border)]" />
                    <span className="text-xs text-[var(--text-muted)]">Remember me</span>
                  </label>
                  <a href="#" className="text-xs text-[var(--text)] hover:underline">Forgot password?</a>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--accent)] text-[var(--accent-fg)] font-medium rounded-xl py-2.5 mt-6 hover:opacity-80 transition-opacity text-sm disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Continue'}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-xs text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-[var(--text)] hover:underline font-medium"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Request access"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
