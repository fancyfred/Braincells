'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { FactMood, moodLabels, moodDescriptions } from '@/types/mood';

export function MoodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedMood, setSelectedMood] = useState<FactMood | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mood = searchParams.get('mood') as FactMood | null;
    if (mood && ['general', 'niche', 'obscure'].includes(mood)) {
      setSelectedMood(mood);
    } else {
      setSelectedMood('all');
    }
  }, [searchParams]);

  const handleMoodChange = (mood: FactMood | 'all') => {
    setSelectedMood(mood);
    const params = new URLSearchParams(searchParams.toString());
    
    if (mood === 'all') {
      params.delete('mood');
    } else {
      params.set('mood', mood);
    }
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
  };

  const moods: Array<{ value: FactMood | 'all'; label: string; description: string }> = [
    { value: 'all', label: 'All Moods', description: 'Show all topics' },
    { value: 'general', label: moodLabels.general, description: moodDescriptions.general },
    { value: 'niche', label: moodLabels.niche, description: moodDescriptions.niche },
    { value: 'obscure', label: moodLabels.obscure, description: moodDescriptions.obscure },
  ];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="mood-selector">
      <div className="mood-selector-header">
        <span className="mood-label">Fact Mood:</span>
        <span className="mood-subtitle">What kind of facts are you in the mood for?</span>
      </div>
      <div className="mood-buttons">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodChange(mood.value)}
            className={`mood-button ${selectedMood === mood.value ? 'active' : ''}`}
            title={mood.description}
            aria-label={`${mood.label} mood`}
          >
            <span className="mood-button-label">{mood.label}</span>
            <span className="mood-button-description">{mood.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

