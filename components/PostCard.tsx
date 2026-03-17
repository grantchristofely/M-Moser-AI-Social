'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, X, MessageCircle, Send, Link2, ThumbsUp } from 'lucide-react';

export interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  author: string;
  avatar: string;
}

export interface PostCardProps {
  id: string;
  author: string;
  role: string;
  avatar: string;
  badge?: string | null;
  title: string;
  content: string;
  media: string[];
  /** Optional MIME types parallel to `media` — used to reliably identify videos */
  mediaTypes?: string[];
  tool: string;
  prompt: string;
  workStreams: string[];
  disciplines: string[];
  likes?: number;
  comments: number;
  isAuthor?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onRead?: (id: string) => void;
  triesCount?: number;
  childPosts?: PostCardProps[];
  onTryIt?: (id: string, title: string) => void;
  // Comments
  commentsList?: CommentItem[];
  currentUserId?: string;
  onCommentSubmit?: (postId: string, text: string) => Promise<void>;
  onOpenComments?: (postId: string) => void;
  // Save feature
  isSaved?: boolean;
  onToggleSave?: (id: string, isSaved: boolean) => void;
  isLiked?: boolean;
  onToggleLike?: (id: string, isLiked: boolean) => void;
}

/** Merge "Try It" child posts and comments into a single chronological stream. */
function buildActivityStream(
  childPosts: PostCardProps[],
  comments: CommentItem[]
): Array<{ type: 'try' | 'comment'; created_at: string; data: PostCardProps | CommentItem }> {
  const tries = childPosts.map(p => ({ type: 'try' as const, created_at: '', data: p }));
  const coms = comments.map(c => ({ type: 'comment' as const, created_at: c.created_at, data: c }));
  return [...tries, ...coms].sort((a, b) =>
    new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );
}

export function PostCard({ 
  id, author, role, avatar, badge, title, content, media, mediaTypes, tool, prompt, 
  workStreams, disciplines, likes, comments, 
  isAuthor, onEdit, onDelete, onCreate, onRead, triesCount, childPosts, onTryIt,
  commentsList = [], currentUserId, onCommentSubmit, onOpenComments,
  isSaved = false, onToggleSave,
  isLiked = false, onToggleLike
}: PostCardProps) {
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [previewMediaIsVideo, setPreviewMediaIsVideo] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedTries, setExpandedTries] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Open the fullscreen preview for an item, given its url and whether it is a video. */
  const openPreview = (url: string, isVideo: boolean) => {
    setPreviewMediaIsVideo(isVideo);
    setPreviewMediaUrl(url);
  };

  /** Copy the direct link to this post to the clipboard. */
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      // Reset the "Copied!" label after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard access
      window.prompt('Copy this link to share the post:', url);
    }
  };

  // Total activity count = comments + tries
  const totalActivity = comments + (triesCount || 0);

  /** Toggle the activity panel, loading comments on first open. */
  const handleToggleActivity = () => {
    const wasOpen = isActivityOpen;
    setIsActivityOpen(!wasOpen);
    if (!wasOpen) {
      // Load comments lazily the first time the panel is opened
      onOpenComments?.(id);
    }
  };

  const handleCommentPost = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCommentSubmit?.(id, trimmed);
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityStream = buildActivityStream(childPosts || [], commentsList);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-strong)] transition-colors">
      {/* Author header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[var(--border)]">
            <Image src={avatar} alt={author} fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-[var(--text)] tracking-tight text-sm">{author}</h4>
              {badge && (
                <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">{role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthor && (
            <>
              <button onClick={() => onEdit?.(id)} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" title="Edit">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete?.(id)} className="text-red-500 hover:text-red-400 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-medium text-[var(--text)] tracking-tight mb-2">{title}</h3>
      
      <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4 font-light whitespace-pre-wrap">
        {content}
      </p>

      {/* Prompt */}
      {prompt && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-1.5">Prompt Used</div>
          <div className="bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl p-4 text-xs font-mono text-[var(--text-muted)] whitespace-pre-wrap">
            {prompt}
          </div>
        </div>
      )}

      {/* Media */}
      {media && media.length > 0 && (
        <div className={`grid gap-2 mb-4 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {media.map((url, idx) => {
            // Prefer tracked MIME type; fall back to URL extension for remote URLs.
            const mime = mediaTypes?.[idx] || '';
            const isVideo = mime.startsWith('video/') || !!url.match(/\.(mp4|webm|ogg|mov)$/i);
            return (
              <div 
                key={idx} 
                className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-sub)] cursor-pointer"
                onClick={() => openPreview(url, isVideo)}
                title={isVideo ? 'Click to play video' : 'Click to enlarge'}
              >
                {isVideo ? (
                  // Show a thumbnail-like frozen first frame; clicking opens the
                  // fullscreen player so the user always has a consistent tap target.
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <Image src={url} alt={`Post attachment ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                )}
                {/* Play icon overlay for videos */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tool && (
          <span className="px-3 py-1 bg-[var(--accent)] text-[var(--accent-fg)] rounded-full text-[10px] font-medium tracking-wider uppercase">
            {tool}
          </span>
        )}
        {workStreams.map(ws => (
          <span key={ws} className="px-3 py-1 bg-[var(--surface-sub)] border border-[var(--border)] rounded-full text-xs text-[var(--text-muted)]">
            {ws}
          </span>
        ))}
        {disciplines.map(disc => (
          <span key={disc} className="px-3 py-1 bg-[var(--surface)] border border-[var(--border-strong)] rounded-full text-xs text-[var(--text-muted)]">
            {disc}
          </span>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onTryIt?.(id, title)}
            className="flex items-center gap-2 transition-colors group text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <span className="text-xs font-medium">Try it out</span>
          </button>
          <button
            onClick={handleToggleActivity}
            className={`flex items-center gap-1.5 transition-colors text-xs font-medium ${
              isActivityOpen ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>
              {totalActivity > 0
                ? `${totalActivity} ${totalActivity === 1 ? 'reply' : 'replies'}`
                : 'Comment'}
            </span>
          </button>
        </div>
        
        {/* Save + Share + Like buttons */}
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={async () => {
              if (onToggleLike && !isLikeSubmitting) {
                setIsLikeSubmitting(true);
                try {
                  await onToggleLike(id, isLiked);
                } finally {
                  setIsLikeSubmitting(false);
                }
              }
            }}
            disabled={isLikeSubmitting}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              isLiked ? 'text-[var(--accent)] hover:text-[var(--accent-hover)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            title={isLiked ? "Unlike post" : "Like post"}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes !== undefined ? likes : 0}</span>
          </button>

          {/* Save */}
          <button 
            onClick={async () => {
              if (onToggleSave && !isSaving) {
                setIsSaving(true);
                try {
                  await onToggleSave(id, isSaved);
                } finally {
                  setIsSaving(false);
                }
              }
            }}
            disabled={isSaving}
            className={`text-xs font-medium transition-colors disabled:opacity-50 ${isSaved ? 'text-[var(--accent)] hover:text-[var(--accent-hover)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            title={isSaved ? "Remove from saved posts" : "Save post"}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>

          {/* Share / copy link */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isCopied ? 'text-green-500' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            title="Copy share link"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Activity panel — comments + tries, unified and chronological */}
      {isActivityOpen && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
          {/* Unified stream */}
          {activityStream.length === 0 ? (
            <p className="text-xs text-[var(--text-faint)] text-center py-2">No replies yet. Be the first!</p>
          ) : (
            activityStream.map((item, idx) => {
              if (item.type === 'comment') {
                const c = item.data as CommentItem;
                return (
                  <div key={`comment-${c.id}`} className="flex gap-3">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[var(--border)] shrink-0 mt-0.5">
                      <Image src={c.avatar} alt={c.author} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-medium text-[var(--text)]">{c.author}</span>
                        <span className="text-[10px] text-[var(--text-faint)]">
                          {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                );
              } else {
                // "Try It" child post
                const p = item.data as PostCardProps;
                const isExpanded = !!expandedTries[p.id];
                const toggleExpanded = () => setExpandedTries(prev => ({ ...prev, [p.id]: !prev[p.id] }));

                return (
                  <div key={`try-${p.id}`} className="bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
                          <Image src={p.avatar} alt={p.author} fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-xs font-medium text-[var(--text)]">{p.author}</span>
                        <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">Tried it</span>
                      </div>
                      <button 
                        onClick={toggleExpanded}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                    <h4 className="text-xs font-medium text-[var(--text)] mb-1">{p.title}</h4>
                    <p className={`text-xs text-[var(--text-muted)] leading-relaxed ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
                      {p.content}
                    </p>
                    
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                        {p.prompt && (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-1">Prompt Used</div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-[10px] font-mono text-[var(--text-muted)] whitespace-pre-wrap break-all">
                              {p.prompt}
                            </div>
                          </div>
                        )}
                        {p.media && p.media.length > 0 && (
                          <div className={`grid gap-2 ${p.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {p.media.map((url, idx) => {
                              const mime = p.mediaTypes?.[idx] || '';
                              const isVideo = mime.startsWith('video/') || !!url.match(/\.(mp4|webm|ogg|mov)$/i);
                              return (
                                <div 
                                  key={idx} 
                                  className="relative w-full aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] cursor-pointer"
                                  onClick={() => openPreview(url, isVideo)}
                                >
                                  {isVideo ? (
                                    <video src={url} className="w-full h-full object-cover" />
                                  ) : (
                                    <Image src={url} alt={`Attachment ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                                  )}
                                  {isVideo && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                                      <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            })
          )}

          {/* Comment input */}
          {currentUserId ? (
            <div className="flex gap-2 pt-2">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentPost();
                  }
                }}
                placeholder="Write a comment..."
                rows={1}
                className="flex-1 min-h-[36px] resize-none bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--border-strong)] transition-colors"
              />
              <button
                onClick={handleCommentPost}
                disabled={!commentText.trim() || isSubmitting}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
                aria-label="Post comment"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-faint)] text-center pb-1">
              <a href="/login" className="underline hover:text-[var(--text-muted)] transition-colors">Sign in</a> to leave a comment
            </p>
          )}
        </div>
      )}

      {/* Fullscreen preview — supports both images and videos */}
      {previewMediaUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12 cursor-zoom-out"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full backdrop-blur-md transition-all z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewMediaUrl(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          {previewMediaIsVideo ? (
            // Video player in fullscreen — stop click propagation so controls work
            <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
              <video
                src={previewMediaUrl}
                controls
                autoPlay
                className="w-full max-h-[85vh] rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image 
                src={previewMediaUrl} 
                alt="Fullscreen preview" 
                fill 
                className="object-contain" 
                referrerPolicy="no-referrer" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
