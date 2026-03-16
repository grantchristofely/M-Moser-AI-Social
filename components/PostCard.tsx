'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, X, MessageCircle, Send } from 'lucide-react';

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
  title: string;
  content: string;
  media: string[];
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
  id, author, role, avatar, title, content, media, tool, prompt, 
  workStreams, disciplines, comments, 
  isAuthor, onEdit, onDelete, onCreate, onRead, triesCount, childPosts, onTryIt,
  commentsList = [], currentUserId, onCommentSubmit, onOpenComments,
  isSaved = false, onToggleSave
}: PostCardProps) {
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            <h4 className="font-medium text-[var(--text)] tracking-tight text-sm">{author}</h4>
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
            const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
            return (
              <div 
                key={idx} 
                className={`relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-sub)] ${!isVideo ? 'cursor-zoom-in' : ''}`}
                onClick={() => !isVideo && setPreviewMediaUrl(url)}
              >
                {isVideo ? (
                  <video src={url} controls className="w-full h-full object-cover" />
                ) : (
                  <Image src={url} alt={`Post attachment ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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
        
        {/* Save button */}
        <div className="flex items-center gap-4">
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
                return (
                  <div key={`try-${p.id}`} className="bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
                        <Image src={p.avatar} alt={p.author} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-xs font-medium text-[var(--text)]">{p.author}</span>
                      <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-semibold bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">Tried it</span>
                    </div>
                    <h4 className="text-xs font-medium text-[var(--text)] mb-1">{p.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.content}</p>
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

      {/* Fullscreen image preview */}
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
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image 
              src={previewMediaUrl} 
              alt="Fullscreen preview" 
              fill 
              className="object-contain" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
