'use client';

import { Navbar } from '@/components/Navbar';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Camera, Edit2, Loader2, Save, X, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';

interface Profile {
  id: string;
  full_name: string;
  title: string;
  location: string;
  skills: string[];
  total_points: number;
  avatar_url: string;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  date_awarded: string;
}

/** Compact representation of a user's post for the profile sidebar. */
interface UserPost {
  id: string;
  title: string;
  tool: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<UserPost[]>([]);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [tempImageSource, setTempImageSource] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch profile, badges, my posts, and saved posts in parallel
        const [profileRes, badgesRes, postsRes, savedRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('badges').select('*').eq('profile_id', user.id),
          supabase
            .from('posts')
            .select('id, title, tool, created_at')
            .eq('author_id', user.id)
            .is('parent_id', null)
            .order('created_at', { ascending: false }),
          supabase
            .from('post_saves')
            .select('posts!inner(id, title, tool, created_at)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (badgesRes.data) setBadges(badgesRes.data);
        if (postsRes.data) setUserPosts(postsRes.data);

        // Flatten the nested join: each row has { posts: { id, title, tool, created_at } }
        if (savedRes.data) {
          const flat: UserPost[] = savedRes.data
            .map((row: any) => row.posts)
            .filter(Boolean);
          setSavedPosts(flat);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditName(profile?.full_name || '');
      setEditTitle(profile?.title || '');
      setIsEditing(false);
    } else {
      setEditName(profile?.full_name || '');
      setEditTitle(profile?.title || '');
      setIsEditing(true);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSource(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!tempImageSource || !croppedAreaPixels || !profile) return;
    
    setAvatarUploading(true);
    setCropModalOpen(false);
    
    try {
      const croppedFile = await getCroppedImg(tempImageSource, croppedAreaPixels);
      
      if (!croppedFile) throw new Error('Failed to crop image.');

      setAvatarPreview(URL.createObjectURL(croppedFile));

      const fileExt = croppedFile.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedFile);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      setProfile({ ...profile, avatar_url: publicUrl });
      
    } catch (error: any) {
      console.error('Error saving avatar:', error);
      alert(error?.message || 'Failed to save profile picture.');
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
      setTempImageSource(null);
    }
  };

  const cancelCrop = () => {
    setCropModalOpen(false);
    setTempImageSource(null);
  };

  const handleSaveName = async () => {
    if (!profile) return;
    setSaving(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: editName, title: editTitle })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      setProfile({ ...profile, full_name: editName, title: editTitle });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving details:', error);
      alert(error?.message || 'Failed to save profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
        <Navbar />
        <div className="max-w-4xl mx-auto text-center py-20 text-[var(--text-muted)]">Loading profile...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
        <Navbar />
        <div className="max-w-4xl mx-auto text-center py-20 text-[var(--text-muted)]">Profile not found.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 bg-[var(--bg)]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 relative">

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 rounded-full overflow-hidden border border-[var(--border-strong)] bg-[var(--surface-sub)] group shrink-0 cursor-pointer"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
            ) : profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || 'User'} fill className="object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=random`} alt={profile.full_name || 'User'} fill className="object-cover" referrerPolicy="no-referrer" />
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarUploading ? (
                <Loader2 className="text-white animate-spin" size={32} />
              ) : (
                <Camera className="text-white" size={32} />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div className="flex-grow max-w-lg mt-8 md:mt-0">
            {isEditing ? (
              <div className="mb-4 space-y-3 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-medium tracking-tight text-[var(--text)] bg-transparent border-b border-[var(--border-strong)] focus:border-[var(--text)] outline-none w-full pb-1 placeholder:text-[var(--text-faint)]"
                    placeholder="Your Name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleEditToggle();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-[var(--text-muted)] text-sm bg-transparent border-b border-[var(--border-strong)] focus:border-[var(--text)] outline-none w-full pb-1 placeholder:text-[var(--text-faint)]"
                    placeholder="Your Title (e.g., Senior Designer)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleEditToggle();
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="px-4 py-2 text-[var(--text-muted)] text-sm font-medium hover:bg-[var(--surface-sub)] rounded-full transition-colors flex-shrink-0"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveName}
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-medium rounded-full hover:opacity-80 transition-opacity disabled:opacity-50 flex-shrink-0 flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    Save Details
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1 group">
                  <h1 className="text-3xl font-medium tracking-tight text-[var(--text)]">
                    {profile.full_name || 'Anonymous User'}
                  </h1>
                  <button 
                    onClick={handleEditToggle}
                    className="p-1.5 text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--surface-sub)] rounded-full transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Edit details"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <p className="text-[var(--text-muted)] text-sm mb-4">
                  {profile.title || 'Member'} {profile.location ? `• ${profile.location}` : ''}
                </p>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-[var(--surface-sub)] border border-[var(--border)] rounded-full text-xs text-[var(--text-muted)] font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--text-faint)] italic">No skills added yet.</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end hidden md:flex">
            <div className="text-4xl font-light tracking-tighter text-[var(--text)]">{profile.total_points?.toLocaleString() || 0}</div>
            <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold mt-1">Total Points</div>
          </div>
        </div>

        {/* Badges & My Posts */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Badges & Achievements */}
          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-6 border-b border-[var(--border)] pb-2">Badges & Achievements</h2>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {badges.map(badge => (
                  <BadgeCard key={badge.id} title={badge.title} description={badge.description} date={badge.date_awarded} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-2xl text-sm text-[var(--text-faint)]">
                No badges earned yet.
              </div>
            )}
          </section>

          {/* My Posts */}
          <section>
            <h2 className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-6 border-b border-[var(--border)] pb-2">My Posts</h2>
            {userPosts.length > 0 ? (
              <>
                <div className="space-y-3">
                  {(showAllPosts ? userPosts : userPosts.slice(0, 5)).map(post => (
                    <PostListItem key={post.id} post={post} />
                  ))}
                </div>
                {userPosts.length > 5 && (
                  <button
                    onClick={() => setShowAllPosts(!showAllPosts)}
                    className="mt-4 w-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 rounded-xl bg-[var(--surface-sub)] hover:bg-[var(--border)]"
                  >
                    {showAllPosts ? 'Show less' : `Show all ${userPosts.length} posts`}
                  </button>
                )}
              </>
            ) : (
              <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-2xl text-sm text-[var(--text-faint)]">
                No posts yet. Share your first AI result on the feed!
              </div>
            )}
          </section>
        </div>

        {/* Saved Posts — full width section */}
        <section>
          <h2 className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-6 border-b border-[var(--border)] pb-2">Saved Posts</h2>
          {savedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 gap-3">
                {(showAllSaved ? savedPosts : savedPosts.slice(0, 6)).map(post => (
                  <PostListItem key={post.id} post={post} />
                ))}
              </div>
              {savedPosts.length > 6 && (
                <button
                  onClick={() => setShowAllSaved(!showAllSaved)}
                  className="mt-4 w-full text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-2 rounded-xl bg-[var(--surface-sub)] hover:bg-[var(--border)]"
                >
                  {showAllSaved ? 'Show less' : `Show all ${savedPosts.length} saved posts`}
                </button>
              )}
            </>
          ) : (
            <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-2xl text-sm text-[var(--text-faint)]">
              No saved posts yet. Hit <strong>Save</strong> on any post in the feed to bookmark it here.
            </div>
          )}
        </section>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && tempImageSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--surface)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-sub)]">
              <h3 className="text-lg font-medium tracking-tight text-[var(--text)] flex items-center gap-2">
                <Crop size={18} className="text-[var(--text-muted)]"/>
                Adjust Profile Picture
              </h3>
              <button onClick={cancelCrop} className="p-2 text-[var(--text-muted)] hover:bg-[var(--border)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-80 bg-black/5">
              <Cropper
                image={tempImageSource}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 bg-[var(--surface-sub)]">
              <div className="mb-6">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-semibold">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  value={zoom} 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  aria-labelledby="Zoom" 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className="w-full h-1 bg-[var(--border-strong)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={cancelCrop} 
                  className="flex-1 px-4 py-3 bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text)] rounded-full text-sm font-medium hover:bg-[var(--surface-sub)] transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCropSave} 
                  className="flex-1 px-4 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-full text-sm font-medium hover:opacity-80 transition-opacity shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

/** Reusable post list item card used in My Posts and Saved Posts */
function PostListItem({ post }: { post: UserPost }) {
  return (
    <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text)] truncate">{post.title}</p>
        {post.tool && (
          <span className="inline-block mt-1.5 px-2 py-0.5 bg-[var(--accent)] text-[var(--accent-fg)] rounded-full text-[10px] font-medium tracking-wider uppercase">
            {post.tool}
          </span>
        )}
      </div>
      <span className="text-[10px] text-[var(--text-faint)] shrink-0 pt-0.5">
        {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
}

function BadgeCard({ title, description, date }: { title: string, description: string, date: string }) {
  return (
    <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
      <div className="w-8 h-8 rounded-full bg-[var(--surface-sub)] border border-[var(--border)] mb-4 flex items-center justify-center text-xs font-medium text-[var(--text-muted)]">
        ★
      </div>
      <h3 className="text-sm font-medium text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{description}</p>
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">{date}</div>
    </div>
  );
}
