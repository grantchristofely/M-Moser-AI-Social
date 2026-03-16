'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const publicRoutes = ['/', '/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isLoading && !user && !isPublicRoute) {
      router.push('/login');
    }
  }, [isLoading, user, pathname, router]);

  const isPublicRoute = publicRoutes.includes(pathname);
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-black animate-spin"></div>
        <p className="mt-4 text-sm text-[#666] animate-pulse">Checking access...</p>
      </div>
    );
  }

  if (!isLoading && !user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
