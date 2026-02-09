'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export interface AreaOption {
  slug: string;
  label: string;
  count: number;
}

interface TopicAreaSelectorProps {
  topicSlug: string;
  areas: AreaOption[];
}

export function TopicAreaSelector({ topicSlug, areas }: TopicAreaSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedArea, setSelectedArea] = useState<string | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const area = searchParams.get('area');
    if (area && areas.some((a) => a.slug === area)) {
      setSelectedArea(area);
    } else {
      setSelectedArea('all');
    }
  }, [searchParams, areas]);

  const handleAreaChange = (area: string | 'all') => {
    setSelectedArea(area);
    const params = new URLSearchParams(searchParams.toString());
    if (area === 'all') {
      params.delete('area');
      params.delete('fact');
    } else {
      params.set('area', area);
      params.delete('fact');
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
  };

  if (!mounted || areas.length === 0) {
    return null;
  }

  return (
    <div className="topic-area-selector">
      <div className="topic-area-selector-header">
        <span className="topic-area-label">Area:</span>
        <span className="topic-area-subtitle">Filter facts by area.</span>
      </div>
      <div className="topic-area-buttons">
        <button
          type="button"
          onClick={() => handleAreaChange('all')}
          className={`topic-area-button ${selectedArea === 'all' ? 'active' : ''}`}
          aria-label="All areas"
        >
          All
        </button>
        {areas.map((area) => (
          <button
            key={area.slug}
            type="button"
            onClick={() => handleAreaChange(area.slug)}
            className={`topic-area-button ${selectedArea === area.slug ? 'active' : ''}`}
            aria-label={`${area.label} area`}
          >
            {area.label}
            <span className="topic-area-button-count">({area.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
