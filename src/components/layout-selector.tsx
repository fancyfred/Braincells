'use client';

import { useState, useEffect } from 'react';

export type LayoutOption = 'left' | 'right' | 'top' | 'bottom' | 'surround';

export function LayoutSelector() {
  const [layout, setLayout] = useState<LayoutOption>('left');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preference from localStorage
    const saved = localStorage.getItem('fact-layout') as LayoutOption;
    const initialLayout = (saved && ['left', 'right', 'top', 'bottom', 'surround'].includes(saved)) 
      ? saved 
      : 'left';
    setLayout(initialLayout);
    // Apply layout immediately
    applyLayout(initialLayout);
  }, []);

  const applyLayout = (newLayout: LayoutOption) => {
    // Remove all layout classes
    const shell = document.querySelector('section.shell');
    if (shell) {
      shell.classList.remove('layout-left', 'layout-right', 'layout-top', 'layout-bottom', 'layout-surround');
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

  const layouts = [
    { value: 'left' as LayoutOption, label: 'Left', icon: '⬅️' },
    { value: 'right' as LayoutOption, label: 'Right', icon: '➡️' },
    { value: 'top' as LayoutOption, label: 'Top', icon: '⬆️' },
    { value: 'bottom' as LayoutOption, label: 'Bottom', icon: '⬇️' },
    { value: 'surround' as LayoutOption, label: 'Surround', icon: '🔲' },
  ];

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

