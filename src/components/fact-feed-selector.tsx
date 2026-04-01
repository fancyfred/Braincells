'use client';

import { useState, useEffect, useRef } from 'react';
import { topics } from '@/config/topics';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createPortal } = require('react-dom');

interface FactFeedSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopics: Set<string>;
  onTopicsChange: (topics: Set<string>) => void;
}

export function FactFeedSelector({ isOpen, onClose, selectedTopics, onTopicsChange }: FactFeedSelectorProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(selectedTopics);
  const [randomCount, setRandomCount] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync local state with props
  useEffect(() => {
    setLocalSelected(selectedTopics);
  }, [selectedTopics]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchableTopics = normalizedSearchQuery
    ? topics.filter((topic) => (
      topic.title.toLowerCase().includes(normalizedSearchQuery)
      || topic.slug.toLowerCase().includes(normalizedSearchQuery)
      || topic.description.toLowerCase().includes(normalizedSearchQuery)
    ))
    : topics;

  // Group topics by mood
  const topicsByMood = {
    general: searchableTopics.filter(t => t.mood === 'general'),
    niche: searchableTopics.filter(t => t.mood === 'niche'),
    obscure: searchableTopics.filter(t => t.mood === 'obscure'),
  };

  const hasSearchResults = searchableTopics.length > 0;

  const handleTopicToggle = (slug: string) => {
    const newSelected = new Set(localSelected);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setLocalSelected(newSelected);
  };

  const handleSelectAll = () => {
    const allSlugs = new Set(topics.map(t => t.slug));
    setLocalSelected(allSlugs);
  };

  const handleDeselectAll = () => {
    setLocalSelected(new Set());
  };

  const handleRandomize = () => {
    const allSlugs = topics.map(t => t.slug);
    const shuffled = [...allSlugs].sort(() => Math.random() - 0.5);
    const count = Math.min(Math.max(1, randomCount), allSlugs.length);
    const randomSelection = new Set(shuffled.slice(0, count));
    setLocalSelected(randomSelection);
  };

  const handleApply = () => {
    onTopicsChange(localSelected);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelected(selectedTopics); // Reset to original
    onClose();
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const menuContent = (
    <div className="fact-feed-selector-overlay" onClick={onClose}>
      <div className="fact-feed-selector-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <div className="fact-feed-selector-header">
          <h3>Select Topics for Fact Feed</h3>
          <button
            className="fact-feed-selector-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="fact-feed-selector-actions">
          <button onClick={handleSelectAll} className="btn secondary small">
            Select All
          </button>
          <button onClick={handleDeselectAll} className="btn secondary small">
            Deselect All
          </button>
          <div className="fact-feed-selector-randomizer">
            <input
              type="number"
              min="1"
              max={topics.length}
              value={randomCount}
              onChange={(e) => setRandomCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), topics.length))}
              className="fact-feed-selector-randomizer-input"
              aria-label="Number of topics to randomly select"
            />
            <button onClick={handleRandomize} className="btn secondary small">
              Randomize
            </button>
          </div>
          <div className="fact-feed-selector-count">
            {localSelected.size} of {topics.length} selected
          </div>
        </div>

        <div className="fact-feed-selector-search-row">
          <input
            type="search"
            className="fact-feed-selector-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search topics..."
            aria-label="Search topics"
          />
        </div>

        <div className="fact-feed-selector-content">
          {hasSearchResults ? (
            (['general', 'niche', 'obscure'] as const).map((mood) => (
              <div key={mood} className="fact-feed-selector-group">
                <h4 className="fact-feed-selector-group-title">
                  <span className={`mood-badge mood-${mood}`}>
                    {mood === 'general' ? 'General' : mood === 'niche' ? 'Niche' : 'Obscure'}
                  </span>
                  <span className="fact-feed-selector-group-count">
                    ({topicsByMood[mood].length})
                  </span>
                </h4>
                <div className="fact-feed-selector-topics">
                  {topicsByMood[mood].map((topic) => (
                    <label
                      key={topic.slug}
                      className="fact-feed-selector-topic"
                    >
                      <input
                        type="checkbox"
                        checked={localSelected.has(topic.slug)}
                        onChange={() => handleTopicToggle(topic.slug)}
                      />
                      <span className="fact-feed-selector-topic-emoji">{topic.emoji}</span>
                      <span className="fact-feed-selector-topic-name">{topic.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="fact-feed-selector-empty">No topics match your search.</p>
          )}
        </div>

        <div className="fact-feed-selector-footer">
          <button onClick={handleCancel} className="btn secondary">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="btn primary"
            disabled={localSelected.size === 0}
          >
            Apply ({localSelected.size})
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}

