'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Topic } from '@/config/topics';

interface TopicGridProps {
  topics: Topic[];
}

export function TopicGrid({ topics }: TopicGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return topics;
    }

    return topics.filter((topic) => {
      return (
        topic.title.toLowerCase().includes(normalizedQuery)
        || topic.slug.toLowerCase().includes(normalizedQuery)
        || topic.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, topics]);

  return (
    <>
      <div className="topic-search-wrap">
        <input
          type="search"
          className="topic-search-input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search topics..."
          aria-label="Search topics"
        />
      </div>

      {filteredTopics.length === 0 ? (
        <p className="topics-empty">No topics match your search.</p>
      ) : (
        <div className="topics-grid">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/${topic.slug}` as any}
              className="topic-card"
            >
              <div className="topic-emoji">{topic.emoji}</div>
              <div className="topic-header">
                <h2>{topic.title}</h2>
                <span className={`topic-mood-badge mood-${topic.mood}`}>
                  {topic.mood === 'general'
                    ? 'General'
                    : topic.mood === 'niche'
                      ? 'Niche'
                      : 'Obscure'}
                </span>
              </div>
              <p>{topic.description}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
