import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { roles } from '@/components/site/data';

// Disciplines are now loaded dynamically from Supabase
import { supabase } from '@/utils/supabase/client';

export interface PostFormData {
  title: string;
  content: string;
  tool: string;
  prompt: string;
  workStreams: string;
  disciplines: string;
  media: string[];
  /** MIME types corresponding to each entry in `media` (e.g. "video/mp4", "image/jpeg") */
  mediaTypes: string[];
  mediaFiles?: File[];
}

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void> | void;
  initialData?: PostFormData | null;
  parentTitle?: string;
}

// Predefined tools are now loaded dynamically from Supabase

// ── Custom multiselect dropdown for disciplines ──────────────────────────────
interface DisciplineDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function DisciplineDropdown({ options, selected, onChange }: DisciplineDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Toggle a single discipline on/off
  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  // Human-readable summary shown in the trigger button
  const label =
    selected.length === 0
      ? 'Select disciplines...'
      : selected.length === 1
      ? selected[0]
      : `${selected[0]} +${selected.length - 1} more`;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--border-strong)] transition-colors"
      >
        <span className={selected.length === 0 ? 'text-[var(--text-faint)]' : ''}>{label}</span>
        {/* Chevron icon rotates when open */}
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
          <ul className="max-h-56 overflow-y-auto py-1">
            {options.map(option => {
              const isSelected = selected.includes(option);
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--surface-sub)] ${
                      isSelected ? 'text-[var(--accent)]' : 'text-[var(--text)]'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <span
                      className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent)] border-[var(--accent)]'
                          : 'border-[var(--border-strong)] bg-[var(--surface-sub)]'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-[var(--accent-fg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Clear / Done footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-sub)]">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-[var(--accent)] hover:opacity-75 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

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
    mediaTypes: [],
    mediaFiles: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [predefinedTools, setPredefinedTools] = useState<string[]>([]);
  const [disciplineOptions, setDisciplineOptions] = useState<string[]>([]);
  
  const [isCustomTool, setIsCustomTool] = useState(false);

  useEffect(() => {
    // Load tools and disciplines dynamically from Supabase
    async function loadData() {
      const [toolsRes, rolesRes] = await Promise.all([
        supabase.from('platforms').select('name').order('order_idx'),
        supabase.from('roles').select('name').order('order_idx').neq('name', 'All Roles')
      ]);
      
      const loadedTools = toolsRes.data ? toolsRes.data.map((t: any) => t.name) : [];
      const loadedDisciplines = rolesRes.data ? rolesRes.data.map((r: any) => r.name) : [];
      
      setPredefinedTools(loadedTools);
      setDisciplineOptions(loadedDisciplines);

      if (initialData?.tool && !loadedTools.includes(initialData.tool)) {
        setIsCustomTool(true);
      }
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen, initialData]);

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
      // Track the MIME type so we can distinguish videos from images
      // even when the URL is a blob:// URL that has no file extension.
      const newMediaTypes = fileArray.map(file => file.type);
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...newMediaUrls],
        mediaTypes: [...(prev.mediaTypes || []), ...newMediaTypes],
        mediaFiles: [...(prev.mediaFiles || []), ...fileArray]
      }));
    }
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setFormData(prev => {
      const newMedia = [...prev.media];
      newMedia.splice(indexToRemove, 1);

      // Remove the corresponding MIME type entry
      const newMediaTypes = [...(prev.mediaTypes || [])];
      newMediaTypes.splice(indexToRemove, 1);

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
        mediaTypes: newMediaTypes,
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
                  value={predefinedTools.includes(formData.tool) ? formData.tool : (formData.tool ? 'custom' : '')}
                  onChange={handleToolChange}
                  className="w-full bg-[var(--surface-sub)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                >
                  <option value="" disabled>Select a tool...</option>
                  {predefinedTools.map(t => (
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
                    // Use tracked MIME type first (reliable for blob URLs),
                    // then fall back to extension check for existing remote URLs.
                    const mimeType = formData.mediaTypes?.[idx] || '';
                    const isVid = mimeType.startsWith('video/') || !!url.match(/\.(mp4|webm|ogg|mov)$/i);
                    return (
                      <div key={url + idx} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-sub)] snap-start group">
                        {isVid ? (
                          <video src={url} className="w-full h-full object-cover" muted />
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
              <DisciplineDropdown
                options={disciplineOptions}
                selected={formData.disciplines.split(',').map(s => s.trim()).filter(Boolean)}
                onChange={selected => setFormData({ ...formData, disciplines: selected.join(', ') })}
              />
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
