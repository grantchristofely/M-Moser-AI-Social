'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { PostCard, PostCardProps, CommentItem } from '@/components/PostCard';
import { NewPostModal, PostFormData } from '@/components/NewPostModal';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { recalculateRewards, LeapterRewardResult } from '@/lib/gamification';
import { CelebrationModal } from '@/components/CelebrationModal';
import { roles } from '@/components/site/data';

// Discipline filter options: "All" + the 8 roles from the homepage
const DISCIPLINE_FILTERS = ['All', ...roles.filter(r => r !== 'All Roles')];

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [tryingPostId, setTryingPostId] = useState<string | null>(null);
  const [tryingPostTitle, setTryingPostTitle] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  // Comments: map of postId -> CommentItem[]
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  
  // Track saved posts for the current user
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  
  // Track liked posts
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // Gamification celebration modal state
  const [gamificationResult, setGamificationResult] = useState<(LeapterRewardResult & { type: 'post' | 'try_it' }) | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Re-fetch posts whenever auth state resolves
  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const queries = [
        supabase
          .from('posts')
          .select(`*, profiles:author_id (full_name, role, avatar_url, badges (title))`)
          .order('created_at', { ascending: false }),
        supabase
          .from('comments')
          .select('post_id'),
        supabase
          .from('post_likes')
          .select('post_id')
      ];

      if (user) {
        queries.push(
          supabase
            .from('post_saves')
            .select('post_id')
            .eq('user_id', user.id),
          supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
        );
      }

      const results = await Promise.all(queries);
      const postsRes = results[0];
      const commentCountsRes = results[1];
      const allLikesRes = results[2];
      const savesRes = user ? results[3] : null;
      const userLikesRes = user ? results[4] : null;

      if (postsRes.error) throw postsRes.error;

      // Build saved posts set
      const newSaved = new Set<string>();
      if (savesRes && savesRes.data) {
        savesRes.data.forEach((row: any) => newSaved.add(row.post_id));
      }
      setSavedPostIds(newSaved);

      // Build liked posts set
      const newLiked = new Set<string>();
      if (userLikesRes && userLikesRes.data) {
        userLikesRes.data.forEach((row: any) => newLiked.add(row.post_id));
      }
      setLikedPostIds(newLiked);

      // Build comment count map
      const commentCounts: Record<string, number> = {};
      if (commentCountsRes.data) {
        for (const row of commentCountsRes.data) {
          commentCounts[row.post_id] = (commentCounts[row.post_id] || 0) + 1;
        }
      }
      
      // Build like count map
      const likeCounts: Record<string, number> = {};
      if (allLikesRes.data) {
        for (const row of allLikesRes.data) {
          likeCounts[row.post_id] = (likeCounts[row.post_id] || 0) + 1;
        }
      }

      if (postsRes.data) {
        const formattedPosts: (PostCardProps & { parentId?: string })[] = postsRes.data.map((post: any) => ({
          id: post.id,
          author: post.profiles?.full_name || 'Unknown User',
          role: post.profiles?.role || 'Member',
          avatar: post.profiles?.avatar_url,
          badge: Array.isArray(post.profiles?.badges) && post.profiles.badges.length > 0
            ? post.profiles.badges[post.profiles.badges.length - 1].title 
            : null,
          title: post.title,
          content: post.content,
          media: post.media || [],
          tool: post.tool,
          prompt: post.prompt,
          workStreams: post.work_streams || [],
          disciplines: post.disciplines || [],
          likes: likeCounts[post.id] || 0,
          comments: commentCounts[post.id] || 0,
          isAuthor: user?.id === post.author_id,
          parentId: post.parent_id
        }));

        const topLevelPosts = formattedPosts.filter(p => !p.parentId);
        
        const finalPosts = topLevelPosts.map(post => {
          const children = formattedPosts.filter(p => p.parentId === post.id);
          return {
            ...post,
            triesCount: children.length,
            childPosts: children as PostCardProps[]
          };
        });

        setPosts(finalPosts as PostCardProps[]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Load comments for a specific post on demand (called when panel is opened). */
  const fetchCommentsForPost = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted: CommentItem[] = (data || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author: c.profiles?.full_name || 'Unknown',
        avatar: c.profiles?.avatar_url
      }));

      setCommentsMap(prev => ({ ...prev, [postId]: formatted }));
    } catch (err) {
      console.error('Error fetching comments for post', postId, err);
    }
  }, []);

  /** Submit a new comment. Inserts into DB and refreshes the local comment list. */
  const handleCommentSubmit = useCallback(async (postId: string, text: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: user.id, content: text }]);

      if (error) throw error;

      // Refresh comments for this post
      await fetchCommentsForPost(postId);

      // Bump comment count in local state
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p)
      );

      // Fire-and-forget gamification for comments
      recalculateRewards(user.id).then((reward) => {
        if (reward && (reward.pointsEarned > 0 || (reward.awardedBadge && reward.awardedBadge !== 'None'))) {
          setGamificationResult({ ...reward, type: 'post' }); // treating comment as a general interaction
        }
      });
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to post comment.');
    }
  }, [user, router, fetchCommentsForPost]);

  const handleToggleSave = async (postId: string, isCurrentlySaved: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Optimistic UI update
    setSavedPostIds(prev => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      if (isCurrentlySaved) {
        const { error } = await supabase.from('post_saves').delete().match({ post_id: postId, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_saves').insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling save', err);
      // Revert optimistic update
      setSavedPostIds(prev => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(postId);
        else next.delete(postId);
        return next;
      });
      alert('Failed to save/unsave post.');
    }
  };

  const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Optimistic UI update
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: (p.likes || 0) + (isCurrentlyLiked ? -1 : 1) };
      }
      return p;
    }));

    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling like', err);
      // Revert optimistic update
      setLikedPostIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: (p.likes || 0) + (isCurrentlyLiked ? 1 : -1) };
        }
        return p;
      }));
      alert('Failed to like/unlike post.');
    }
  };

  const handleOpenCreate = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setEditingPostId(null);
    setTryingPostId(null);
    setTryingPostTitle(null);
    setIsModalOpen(true);
  };

  const handleOpenTryIt = (id: string, title: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setEditingPostId(null);
    setTryingPostId(id);
    setTryingPostTitle(title);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingPostId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const postToDelete = posts.find(p => p.id === id);
    if (!postToDelete?.isAuthor) {
      alert('You can only delete your own posts.');
      return;
    }
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleSubmit = async (data: PostFormData) => {
    if (!user) return;

    try {
      let finalMediaUrls = data.media.filter(url => !url.startsWith('blob:'));

      if (data.mediaFiles && data.mediaFiles.length > 0) {
        for (const file of data.mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('post-media')
            .getPublicUrl(fileName);
            
          finalMediaUrls.push(publicUrl);
        }
      }

      const postPayload: any = {
        title: data.title,
        content: data.content,
        tool: data.tool,
        prompt: data.prompt,
        work_streams: data.workStreams.split(',').map(s => s.trim()).filter(Boolean),
        disciplines: data.disciplines.split(',').map(s => s.trim()).filter(Boolean),
        media: finalMediaUrls,
        author_id: user.id
      };

      if (tryingPostId) {
        postPayload.parent_id = tryingPostId;
      }

      if (editingPostId) {
        const { error } = await supabase
          .from('posts')
          .update(postPayload)
          .eq('id', editingPostId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([postPayload]);
        if (error) throw error;

        // Fire-and-forget reward recalculation (non-blocking)
        recalculateRewards(user.id, data.tool).then((reward) => {
          if (reward) {
            setGamificationResult({ ...reward, type: tryingPostId ? 'try_it' : 'post' });
          } else {
             // Fallback if API fails, still celebrate the post
            setGamificationResult({ calculatedTotalPoints: 0, awardedBadge: 'None', pointsEarned: 0, type: tryingPostId ? 'try_it' : 'post' });
          }
        });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post.');
    }
  };

  const editingPostData = editingPostId ? posts.find(p => p.id === editingPostId) : null;
  const initialModalData: PostFormData | null = editingPostData ? {
    title: editingPostData.title,
    content: editingPostData.content,
    tool: editingPostData.tool,
    prompt: editingPostData.prompt,
    workStreams: editingPostData.workStreams.join(', '),
    disciplines: editingPostData.disciplines.join(', '),
    media: editingPostData.media,
    // For existing posts, remote URLs carry no blob MIME type; provide an empty
    // array so the type signature is satisfied. Extension-based fallback is used.
    mediaTypes: []
  } : null;

  const filteredPosts = selectedDiscipline === 'All'
    ? posts
    : posts.filter(post => post.disciplines?.includes(selectedDiscipline));

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
      <Navbar />

      {/* Gamification Celebration Modal */}
      <CelebrationModal
        isOpen={!!gamificationResult}
        onClose={() => setGamificationResult(null)}
        pointsEarned={gamificationResult?.pointsEarned || 0}
        totalPoints={gamificationResult?.calculatedTotalPoints || 0}
        badgeEarned={gamificationResult?.awardedBadge || null}
        actionType={gamificationResult?.type || 'post'}
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-medium tracking-tight mb-2 text-[var(--text)]">Community Feed</h1>
            <p className="text-[var(--text-muted)] font-light">See how M Moser is leveraging AI globally.</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-[var(--accent)] text-[var(--accent-fg)] px-5 py-2.5 rounded-full font-medium text-sm hover:opacity-80 transition-opacity"
          >
            New Post
          </button>
        </div>

        {/* Discipline filter — pill buttons (scrollable on mobile) */}
        <div className="mb-8 -mx-1">
          <div className="flex flex-wrap gap-2 px-1">
            {DISCIPLINE_FILTERS.map((discipline) => (
              <button
                key={discipline}
                onClick={() => setSelectedDiscipline(discipline)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedDiscipline === discipline
                    ? 'bg-[var(--text)] text-[var(--bg)]'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                }`}
              >
                {discipline}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-[var(--text-muted)]">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">No posts found for the selected filter.</div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <PostCard 
                key={post.id} 
                {...post}
                commentsList={commentsMap[post.id] || []}
                currentUserId={user?.id}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onTryIt={handleOpenTryIt}
                onCommentSubmit={handleCommentSubmit}
                onOpenComments={fetchCommentsForPost}
                isSaved={savedPostIds.has(post.id)}
                onToggleSave={handleToggleSave}
                isLiked={likedPostIds.has(post.id)}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <NewPostModal 
          key={editingPostId || tryingPostId || 'new'}
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setTryingPostId(null);
            setTryingPostTitle(null);
          }} 
          onSubmit={handleSubmit}
          initialData={initialModalData}
          parentTitle={tryingPostTitle || undefined}
        />
      )}
    </main>
  );
}
