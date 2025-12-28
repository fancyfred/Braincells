'use client';

import { useState, useEffect } from 'react';

export type LayoutOption = 'left' | 'right' | 'top' | 'bottom';

export function LayoutSelector() {
  const [layout, setLayout] = useState<LayoutOption>('left');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    
    // Listen for resize
    window.addEventListener('resize', checkMobile);
    
    // Load saved preference from localStorage
    const saved = localStorage.getItem('fact-layout') as LayoutOption;
    const validOptions: LayoutOption[] = ['left', 'right', 'top', 'bottom'];
    const initialLayout = (saved && validOptions.includes(saved)) 
      ? saved 
      : 'left';
    
    // If saved layout is not appropriate for current screen size, use default
    const isMobileNow = window.innerWidth < 768;
    const mobileOptions: LayoutOption[] = ['top', 'bottom'];
    const desktopOptions: LayoutOption[] = ['left', 'right'];
    
    let finalLayout = initialLayout;
    if (isMobileNow && !mobileOptions.includes(initialLayout)) {
      finalLayout = 'top';
    } else if (!isMobileNow && !desktopOptions.includes(initialLayout)) {
      finalLayout = 'left';
    }
    
    setLayout(finalLayout);
    // Apply layout immediately
    applyLayout(finalLayout);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const applyLayout = (newLayout: LayoutOption) => {
    // Remove all layout classes
    const shell = document.querySelector('section.shell');
    if (shell) {
      shell.classList.remove('layout-left', 'layout-right', 'layout-top', 'layout-bottom');
      shell.classList.add(`layout-${newLayout}`);
    }
  };

  const handleLayoutChange = (newLayout: LayoutOption) => {
    setLayout(newLayout);
    if (mounted) {
      localStorage.setItem('fact-layout', newLayout);
    }
    applyLayout(newLayout);
  };

  // Desktop options (left/right) - shown on wide screens
  const desktopLayouts: Array<{ value: LayoutOption; label: string; icon: string }> = [
    { value: 'left', label: 'Left', icon: '⬅️' },
    { value: 'right', label: 'Right', icon: '➡️' },
  ];

  // Mobile options (top/bottom) - shown on mobile screens
  const mobileLayouts: Array<{ value: LayoutOption; label: string; icon: string }> = [
    { value: 'top', label: 'Top', icon: '⬆️' },
    { value: 'bottom', label: 'Bottom', icon: '⬇️' },
  ];

  const layouts = isMobile ? mobileLayouts : desktopLayouts;

  return (
    <div className="layout-selector">
      <span className="layout-label">Layout:</span>
      <div className="layout-buttons">
        {layouts.map((option) => (
          <button
            key={option.value}
            onClick={() => handleLayoutChange(option.value)}
            className={`layout-button ${layout === option.value ? 'active' : ''}`}
            title={option.label}
            aria-label={`${option.label} layout`}
          >
            <span className="layout-icon">{option.icon}</span>
            <span className="layout-text">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

