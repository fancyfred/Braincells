'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Fact } from '@/types/fact';

interface FactFilterProps {
  facts: Fact[];
  selectedTag: string;
}

export function FactFilter({ facts, selectedTag }: FactFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get all unique tags from facts
  const allTags = Array.from(
    new Set(facts.flatMap((fact) => fact.tags))
  ).sort();

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
        {allTags.map((tag) => (
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

