'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PostCard, PostCardProps, CommentItem } from '@/components/PostCard';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * /post/[id] — Public shareable page for a single prompt/post.
 *
 * This page is accessible without login so that anyone who receives a shared
 * link (e.g. via Slack, iMessage, or email) can view the full prompt, media,
 * and comments. Editing/deleting controls are only shown to the post author.
 */
export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<PostCardProps | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Resolve the current user (optional — page works without login)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Resolve user likes
  useEffect(() => {
    if (!id || !user) {
      setIsLiked(false);
      return;
    }
    const fetchUserLike = async () => {
      const { data } = await supabase
        .from('post_likes')
        .select('post_id')
        .match({ post_id: id, user_id: user.id });
      setIsLiked(!!(data && data.length > 0));
    };
    fetchUserLike();
  }, [id, user]);

  // Load the post by ID
  useEffect(() => {
    if (!id) return;
    fetchPost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      // Fetch the post with author profile
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`*, profiles:author_id (full_name, role, avatar_url, badges (title))`)
        .eq('id', id)
        .is('parent_id', null) // Only top-level posts are directly shareable (not "try it" replies)
        .single();

      if (postError || !postData) {
        setNotFoundError(true);
        return;
      }

      // Fetch "try it" child posts so the activity panel shows them
      const { data: childPostsData } = await supabase
        .from('posts')
        .select(`*, profiles:author_id (full_name, role, avatar_url, badges (title))`)
        .eq('parent_id', id)
        .order('created_at', { ascending: true });

      const childPosts: PostCardProps[] = (childPostsData || []).map((p: any) => ({
        id: p.id,
        author: p.profiles?.full_name || 'Unknown User',
        role: p.profiles?.role || 'Member',
        avatar: p.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.profiles?.full_name || 'User')}`,
        badge: Array.isArray(p.profiles?.badges) && p.profiles.badges.length > 0
          ? p.profiles.badges[p.profiles.badges.length - 1].title
          : null,
        title: p.title,
        content: p.content,
        media: p.media || [],
        mediaTypes: [],
        tool: p.tool || '',
        prompt: p.prompt || '',
        workStreams: p.work_streams || [],
        disciplines: p.disciplines || [],
        comments: 0,
        isAuthor: false,
        childPosts: [],
        commentsList: [],
      }));

      // Fetch likes count for this post
      const { count: totalLikes } = await supabase
        .from('post_likes')
        .select('post_id', { count: 'exact', head: true })
        .eq('post_id', id);
      setLikesCount(totalLikes || 0);

      // Fetch comments for this post
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`id, content, created_at, profiles:user_id (full_name, avatar_url)`)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      const formattedComments: CommentItem[] = (commentsData || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author: c.profiles?.full_name || 'Unknown',
        avatar: c.profiles?.avatar_url || `https://ui-avatars.com/api/?name=User`,
      }));

      setComments(formattedComments);

      const formatted: PostCardProps = {
        id: postData.id,
        author: postData.profiles?.full_name || 'Unknown User',
        role: postData.profiles?.role || 'Member',
        avatar: postData.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(postData.profiles?.full_name || 'User')}`,
        badge: Array.isArray(postData.profiles?.badges) && postData.profiles.badges.length > 0
          ? postData.profiles.badges[postData.profiles.badges.length - 1].title
          : null,
        title: postData.title,
        content: postData.content,
        media: postData.media || [],
        mediaTypes: [],
        tool: postData.tool || '',
        prompt: postData.prompt || '',
        workStreams: postData.work_streams || [],
        disciplines: postData.disciplines || [],
        likes: totalLikes || 0,
        comments: formattedComments.length,
        isAuthor: user?.id === postData.author_id,
        triesCount: childPosts.length,
        childPosts,
        commentsList: formattedComments,
      };

      setPost(formatted);
    } catch (err) {
      console.error('Error fetching shared post:', err);
      setNotFoundError(true);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle inline comment submission from the activity panel. */
  const handleCommentSubmit = async (postId: string, text: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: user.id, content: text }]);

    if (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
      return;
    }

    // Refresh the comment list and update the post's comment count locally
    const { data } = await supabase
      .from('comments')
      .select(`id, content, created_at, profiles:user_id (full_name, avatar_url)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    const updated: CommentItem[] = (data || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author: c.profiles?.full_name || 'Unknown',
      avatar: c.profiles?.avatar_url || `https://ui-avatars.com/api/?name=User`,
    }));
    setComments(updated);
    setPost(prev => prev ? { ...prev, comments: updated.length, commentsList: updated } : prev);
  };

  const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Optimistic update
    setIsLiked(!isCurrentlyLiked);
    setLikesCount(prev => prev + (isCurrentlyLiked ? -1 : 1));
    setPost(prev => prev ? { ...prev, likes: (prev.likes || 0) + (isCurrentlyLiked ? -1 : 1) } : prev);

    try {
      if (isCurrentlyLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error('Error toggling like', err);
      // Revert optimism
      setIsLiked(isCurrentlyLiked);
      setLikesCount(prev => prev + (isCurrentlyLiked ? 1 : -1));
      setPost(prev => prev ? { ...prev, likes: (prev.likes || 0) + (isCurrentlyLiked ? 1 : -1) } : prev);
      alert('Failed to update like status.');
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-16 text-[var(--text-muted)]">
          Loading post…
        </div>
      </main>
    );
  }

  if (notFoundError || !post) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-2xl font-medium text-[var(--text)] mb-3">Post not found</h1>
          <p className="text-[var(--text-muted)] mb-8">
            This link may be invalid, or the post may have been deleted.
          </p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-fg)] rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
      <Navbar />

      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Feed
        </Link>

        {/* Shared-link banner */}
        <div className="mb-6 px-4 py-3 rounded-xl bg-[var(--surface-sub)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center gap-2">
          <span className="text-[var(--accent)] font-semibold">Shared prompt</span>
          <span>·</span>
          <span>You're viewing a prompt shared from the M Moser AI Hub community feed.</span>
          {!user && (
            <>
              <span>·</span>
              <Link href="/login" className="underline hover:text-[var(--text)] transition-colors">
                Sign in
              </Link>
              <span>to join the conversation.</span>
            </>
          )}
        </div>

        {/* The full post card — activity panel opens by default so comments are visible */}
        <PostCard
          {...post}
          isAuthor={user?.id !== undefined && post.isAuthor}
          currentUserId={user?.id}
          commentsList={comments}
          onCommentSubmit={handleCommentSubmit}
          onOpenComments={() => {/* Already loaded above */}}
          isLiked={isLiked}
          onToggleLike={handleToggleLike}
        />
      </div>
    </main>
  );
}
