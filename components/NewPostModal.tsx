import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { roles } from '@/components/site/data';

// Disciplines available in the dropdown (matches homepage section 03/04 role filters)
const DISCIPLINE_OPTIONS = roles.filter(r => r !== 'All Roles');

export interface PostFormData {
  title: string;
  content: string;
  tool: string;
  prompt: string;
  workStreams: string;
  disciplines: string;
  media: string[];
  mediaFiles?: File[];
}

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void> | void;
  initialData?: PostFormData | null;
  parentTitle?: string;
}

const PREDEFINED_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Copilot',
  'Perplexity',
  'NotebookLM',
  'Midjourney',
  'Adobe Firefly',
  'Photoshop AI',
  'DALL-E 3',
  'Runway',
  'Pika Labs',
  'Veras',
  'Finch 3D',
  'Stable Diffusion',
];

export function NewPostModal({ isOpen, onClose, onSubmit, initialData, parentTitle }: NewPostModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<PostFormData>(initialData || {
    title: '',
    content: '',
    tool: '',
    prompt: '',
    workStreams: '',
    disciplines: '',
    media: [],
    mediaFiles: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCustomTool, setIsCustomTool] = useState(() => {
    if (initialData?.tool && !PREDEFINED_TOOLS.includes(initialData.tool)) {
      return true;
    }
    return false;
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'custom') {
      setIsCustomTool(true);
      setFormData({ ...formData, tool: '' });
    } else {
      setIsCustomTool(false);
      setFormData({ ...formData, tool: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newMediaUrls = fileArray.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...newMediaUrls],
        mediaFiles: [...(prev.mediaFiles || []), ...fileArray]
      }));
    }
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setFormData(prev => {
      const newMedia = [...prev.media];
      newMedia.splice(indexToRemove, 1);

      // Only remove from mediaFiles if it was a newly uploaded blob URL
      const urlToRemove = prev.media[indexToRemove];
      let newMediaFiles = prev.mediaFiles ? [...prev.mediaFiles] : [];
      
      if (urlToRemove && urlToRemove.startsWith('blob:')) {
        const blobUrls = prev.media.filter(url => url.startsWith('blob:'));
        const blobIndex = blobUrls.indexOf(urlToRemove);
        if (blobIndex !== -1 && newMediaFiles.length > blobIndex) {
          newMediaFiles.splice(blobIndex, 1);
        }
      }

      return {
        ...prev,
        media: newMedia,
        mediaFiles: newMediaFiles
      };
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--surface)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-medium text-[var(--text)]">
              {initialData ? 'Edit Post' : parentTitle ? 'Try It Out' : 'Create New Post'}
            </h2>
            {parentTitle && !initialData && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Replying to: <span className="font-medium text-[var(--text)]">{parentTitle}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] text-sm font-medium transition-colors">Close</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Post Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Optimizing Concept Generation with Midjourney"
              className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Explanation</label>
            <textarea 
              required
              rows={4}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Explain what you did and the problem you solved..."
              className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Tool Used</label>
              {!isCustomTool ? (
                <select 
                  value={PREDEFINED_TOOLS.includes(formData.tool) ? formData.tool : (formData.tool ? 'custom' : '')}
                  onChange={handleToolChange}
                  className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                >
                  <option value="" disabled>Select a tool...</option>
                  {PREDEFINED_TOOLS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="custom">+ Add new tool...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    autoFocus
                    value={formData.tool}
                    onChange={e => setFormData({...formData, tool: e.target.value})}
                    placeholder="Enter tool name..."
                    className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setIsCustomTool(false);
                      setFormData({ ...formData, tool: '' });
                    }}
                    className="px-3 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Media Upload</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[var(--surface-sub)] border border-[var(--border)] border-dashed rounded-xl px-4 py-2.5 text-center cursor-pointer hover:bg-[var(--border)] transition-colors flex flex-col items-center justify-center min-h-[42px]"
              >
                <span className="text-xs text-[var(--text-muted)]">
                  Click to add images/videos
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  multiple 
                  accept="image/*,video/*"
                />
              </div>

              {formData.media.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x">
                  {formData.media.map((url, idx) => {
                    const isVid = url.match(/\.(mp4|webm|ogg|mov)$/i);
                    return (
                      <div key={url + idx} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-sub)] snap-start group">
                        {isVid ? (
                          <video src={url} className="w-full h-full object-cover" />
                        ) : (
                          <Image src={url} alt="Preview" fill className="object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Prompt Used</label>
            <textarea 
              rows={3}
              value={formData.prompt}
              onChange={e => setFormData({...formData, prompt: e.target.value})}
              placeholder="Paste the exact prompt you used..."
              className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm font-mono focus:outline-none focus:border-[var(--border-strong)] transition-colors resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Applicable Work Streams</label>
              <input 
                type="text" 
                value={formData.workStreams}
                onChange={e => setFormData({...formData, workStreams: e.target.value})}
                placeholder="e.g., Concept Design, Pitching (comma separated)"
                className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Applicable Disciplines</label>
              {/* Multi-select: hold Cmd/Ctrl to pick multiple, or toggle pills */}
              <select
                multiple
                value={formData.disciplines.split(',').map(s => s.trim()).filter(Boolean)}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                  setFormData({ ...formData, disciplines: selected.join(', ') });
                }}
                className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors min-h-[120px]"
              >
                {DISCIPLINE_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--text-faint)] mt-1">Hold ⌘ / Ctrl to select multiple</p>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border)] flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-sub)] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : parentTitle ? 'Try it out' : 'Post to Feed')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
