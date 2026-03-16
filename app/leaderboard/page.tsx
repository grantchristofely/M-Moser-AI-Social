'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';
import { supabase } from '@/utils/supabase/client';

type LeaderboardEntry = {
  rank: number;
  id: string;
  name: string;
  role: string | null;
  avatar: string | null;
  points: number;
  badge: string | null;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const [profilesRes, badgesRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url, total_points')
            .order('total_points', { ascending: false, nullsFirst: false }),
          supabase
            .from('badges')
            .select('profile_id, title, date_awarded')
            .order('date_awarded', { ascending: false })
        ]);

        if (profilesRes.error) throw profilesRes.error;
        
        if (profilesRes.data) {
          // Get the most recent badge for each user
          const badgesByProfile = (badgesRes.data || []).reduce((acc: any, badge) => {
            if (!acc[badge.profile_id]) {
              acc[badge.profile_id] = badge.title;
            }
            return acc;
          }, {});

          const formattedData = profilesRes.data.map((user: any, index: number) => ({
            rank: index + 1,
            id: user.id,
            name: user.full_name || 'Unknown User',
            role: user.role || 'Member',
            avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}`,
            points: user.total_points || 0,
            badge: badgesByProfile[user.id] || null
          }));
          
          // Sort one last time to ensure primary sort by points descending, secondary by name ascending
          formattedData.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return a.name.localeCompare(b.name);
          });
          
          // Re-assign ranks after secondary sort
          const finalData = formattedData.map((user, index) => ({
            ...user,
            rank: index + 1
          }));

          setLeaderboard(finalData);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
      <Navbar />
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-2 text-[var(--text)]">AI Champions</h1>
          <p className="text-[var(--text-muted)] font-light">
            Recognizing the top contributors driving AI adoption across M Moser.
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-6 border-b border-[var(--border)] bg-[var(--surface-sub)] text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <div className="w-12 text-center">Rank</div>
            <div>Contributor</div>
            <div className="text-right">Points</div>
          </div>
          
          <div className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <div className="p-12 text-center text-[var(--text-muted)]">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)]">No data available.</div>
            ) : (
              leaderboard.map((user) => (
                <div key={user.rank} className="grid grid-cols-[auto_1fr_auto] gap-4 p-6 items-center hover:bg-[var(--surface-sub)] transition-colors">
                  <div className="w-12 flex justify-center">
                    <span className={`text-sm font-medium ${user.rank <= 3 ? 'text-[var(--text)]' : 'text-[var(--text-faint)]'}`}>
                      {user.rank}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--border)] flex-shrink-0">
                      <Image 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                        alt={user.name} 
                        fill 
                        className="object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[var(--text)] tracking-tight text-sm">{user.name}</h4>
                        {user.badge && (
                          <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-full text-[9px] font-bold tracking-wider uppercase">
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-medium tracking-tight text-[var(--text)]">{user.points.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
