'use client';

import { useState, useEffect } from 'react';

export function ImageToggle() {
  const [imagesEnabled, setImagesEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load preference from localStorage
    const saved = localStorage.getItem('images-enabled');
    if (saved !== null) {
      setImagesEnabled(saved === 'true');
    } else {
      // Default to true
      setImagesEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Store preference in localStorage
      localStorage.setItem('images-enabled', imagesEnabled.toString());
      // Dispatch custom event so FactList can listen for changes
      window.dispatchEvent(new CustomEvent('images-enabled-changed', { 
        detail: { enabled: imagesEnabled } 
      }));
    }
  }, [imagesEnabled, mounted]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <button
      onClick={() => setImagesEnabled(!imagesEnabled)}
      className="image-toggle"
      aria-label={imagesEnabled ? 'Disable images' : 'Enable images'}
      title={imagesEnabled ? 'Disable images' : 'Enable images'}
    >
      {imagesEnabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      )}
      <span className="image-toggle-label">{imagesEnabled ? 'Images' : 'No Images'}</span>
    </button>
  );
}

