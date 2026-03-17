'use client';

import Image from 'next/image';
import { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

/**
 * Reusable Avatar component with fallback to user initials.
 * If the image fails to load or is missing, it displays a styled div with initials.
 */
export function UserAvatar({ src, name = 'User', size = 40, className = '' }: UserAvatarProps) {
  const [error, setError] = useState(false);

  // Get initials from name (e.g., "Grant Christofely" -> "GC")
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Generate a consistent "random" color based on the name
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 50%)`;
  };

  const initials = getInitials(name);
  const bgColor = getColor(name);

  // If we have a source and no error, try to render the image
  if (src && !error) {
    return (
      <div 
        className={`relative rounded-full overflow-hidden border border-[var(--border)] shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image 
          src={src} 
          alt={name} 
          fill 
          className="object-cover" 
          onError={() => setError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div 
      className={`flex items-center justify-center rounded-full border border-[var(--border)] text-white font-medium select-none shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: bgColor,
        fontSize: Math.max(10, size / 2.5),
        background: `linear-gradient(135deg, ${bgColor}, ${getColor(name.split('').reverse().join(''))})`
      }}
    >
      {initials}
    </div>
  );
}
