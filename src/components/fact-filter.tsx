'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Fact } from '@/types/fact';

interface FactFilterProps {
  facts: Fact[];
  selectedTag: string;
  tagsToShow?: string[]; // Optional: if provided, only show these tags (only used in surround layout)
}

export function FactFilter({ facts, selectedTag, tagsToShow }: FactFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isSurroundLayout, setIsSurroundLayout] = useState(false);

  // Check if we're in surround layout by looking at the shell element
  useEffect(() => {
    const checkLayout = () => {
      const shell = document.querySelector('section.shell');
      setIsSurroundLayout(shell?.classList.contains('layout-surround') ?? false);
    };

    // Check initially
    checkLayout();

    // Watch for layout changes by observing the shell element
    const observer = new MutationObserver(checkLayout);
    const shell = document.querySelector('section.shell');
    if (shell) {
      observer.observe(shell, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => observer.disconnect();
  }, []);

  // Get all unique tags from facts
  const allTags = Array.from(
    new Set(facts.flatMap((fact) => fact.tags))
  ).sort();
  
  // Only use tagsToShow if we're in surround layout, otherwise show all tags
  const displayTags = (isSurroundLayout && tagsToShow) 
    ? allTags.filter(tag => tagsToShow.includes(tag)) 
    : allTags;

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedTag === tag) {
      // If clicking the same tag, remove the filter
      params.delete('tag');
    } else {
      // Set the new tag
      params.set('tag', tag);
    }
    
    // Use current pathname instead of hardcoded '/'
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
  };

  return (
    <div className="fact-filter">
      <div className="filter-header">
        <span className="filter-label">Filter by tag:</span>
        {selectedTag && (
          <button onClick={clearFilter} className="clear-filter">
            Clear filter
          </button>
        )}
      </div>
      <div className="tag-list">
        {displayTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
          >
            {tag}
          </button>
        ))}
      </div>
      {selectedTag && (
        <div className="filter-info">
          Showing {facts.filter((f) => f.tags.includes(selectedTag)).length} fact(s) tagged "{selectedTag}"
        </div>
      )}
    </div>
  );
}

