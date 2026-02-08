'use client';

import { useFactFeed } from '@/contexts/fact-feed-context';
import { FactFeedSelector } from './fact-feed-selector';

export function FactFeedSection() {
  const {
    fact,
    loading,
    factFeedMode,
    paused,
    setPaused,
    resume,
    skipToNext,
    selectedTopics,
    setSelectedTopics,
    toggleFactFeed,
    selectorOpen,
    setSelectorOpen,
  } = useFactFeed();

  return (
    <section className="home-section fact-feed-section" id="fact-feed" aria-labelledby="fact-feed-heading">
      <h2 id="fact-feed-heading" className="home-section-title">Fact Feed</h2>
      <p className="home-section-desc">
        Pick topics, hit play, and listen to a continuous stream of facts. Perfect for commutes or background learning.
      </p>
      <div className="fact-feed-section-controls">
        <button
          type="button"
          className="fact-feed-section-topics-btn"
          onClick={() => setSelectorOpen(true)}
          aria-label="Select topics"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>{selectedTopics.size} topics</span>
        </button>
        <button
          type="button"
          className={`fact-feed-section-toggle ${factFeedMode ? 'active' : ''}`}
          onClick={toggleFactFeed}
          aria-label={factFeedMode ? 'Stop Fact Feed' : 'Start Fact Feed'}
        >
          {factFeedMode ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Stop Feed
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Fact Feed
            </>
          )}
        </button>
        {factFeedMode && (
          <>
            {paused ? (
              <button
                type="button"
                className="fact-feed-section-btn fact-feed-section-resume"
                onClick={resume}
                aria-label="Resume Fact Feed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume
              </button>
            ) : (
              <button
                type="button"
                className="fact-feed-section-btn fact-feed-section-pause"
                onClick={() => setPaused(true)}
                aria-label="Pause after current fact"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </button>
            )}
            <button
              type="button"
              className="fact-feed-section-btn fact-feed-section-next"
              onClick={skipToNext}
              disabled={loading}
              aria-label="Next fact"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 5 20 12 12 5 4" />
                <polygon points="13 4 13 20 20 12 13 4" />
              </svg>
              Next
            </button>
          </>
        )}
      </div>
      <div className={`fact-feed-section-current ${factFeedMode ? 'active' : ''}`}>
        {loading ? (
          <p className="fact-feed-section-loading">Loading…</p>
        ) : fact?.fact ? (
          <p className="fact-feed-section-fact">{fact.fact}</p>
        ) : (
          <p className="fact-feed-section-placeholder">Start the feed to hear facts out loud.</p>
        )}
      </div>
      <FactFeedSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        selectedTopics={selectedTopics}
        onTopicsChange={setSelectedTopics}
      />
    </section>
  );
}
