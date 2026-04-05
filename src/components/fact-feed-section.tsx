'use client';

import Link from 'next/link';
import { useFactFeed } from '@/contexts/fact-feed-context';
import { FactFeedSelector } from './fact-feed-selector';
import { getAreaLabel } from '@/types/fact';
import { getCategoryLabel } from '@/config/categories';
import { moodLabels, type FactMood } from '@/types/mood';

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
    playedFactsCount,
    freeFactsLimit,
    paywallOpen,
    setPaywallOpen,
    paywallEnabled,
    startCheckout,
    isCheckingOut,
    isLocalDev,
    devTriggerPaywallAfterCurrent,
    setDevTriggerPaywallAfterCurrent,
    topicNames,
  } = useFactFeed();

  const hasTags = fact?.fact && fact?.topic;
  const moodLabel = fact?.mood ? moodLabels[fact.mood as FactMood] : null;
  const categoryLabel = fact?.category ? getCategoryLabel(fact.category) : null;
  const topicLabel = fact?.topic ? topicNames[fact.topic] ?? fact.topic : null;
  const areaLabel = fact?.area ? getAreaLabel(fact.area) : null;
  const selectedTopicLabels = [...selectedTopics]
    .sort()
    .map((slug) => topicNames[slug] ?? slug);
  const selectedTopicsPreview = selectedTopicLabels.slice(0, 5).join(', ');
  const selectedTopicsSummary = selectedTopicLabels.length > 5 ? `${selectedTopicsPreview}, ...` : selectedTopicsPreview;
  const factsRemaining = Math.max(0, freeFactsLimit - playedFactsCount);

  return (
    <section className="home-section fact-feed-section" id="fact-feed" aria-labelledby="fact-feed-heading">
      <h2 id="fact-feed-heading" className="home-section-title">Fact Feed</h2>
      <p className="home-section-desc">
        Pick topics, hit play, and listen to a continuous stream of facts. Perfect for commutes or background learning.
      </p>
      {paywallEnabled && (
        <p className="fact-feed-section-usage">
          {factsRemaining > 0
            ? `${factsRemaining} free fact${factsRemaining === 1 ? '' : 's'} remaining before paywall`
            : 'Free limit reached. Unlock unlimited listening to continue.'}
        </p>
      )}
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
      {paywallEnabled && isLocalDev && (
        <label className="fact-feed-dev-trigger" htmlFor="fact-feed-dev-paywall-toggle">
          <input
            id="fact-feed-dev-paywall-toggle"
            type="checkbox"
            checked={devTriggerPaywallAfterCurrent}
            onChange={(event) => setDevTriggerPaywallAfterCurrent(event.target.checked)}
          />
          <span>Dev: trigger paywall after current fact finishes</span>
        </label>
      )}
      {selectedTopics.size > 0 && (
        <p className="fact-feed-section-selected">
          <span className="fact-feed-section-selected-label">Playing from: </span>
          <span className="fact-feed-section-selected-list">{selectedTopicsSummary}</span>
          <button
            type="button"
            className="fact-feed-section-selected-change"
            onClick={() => setSelectorOpen(true)}
            aria-label="Change selected topics"
          >
            Change
          </button>
        </p>
      )}
      <div className={`fact-feed-section-current ${factFeedMode ? 'active' : ''}`}>
        {loading ? (
          <p className="fact-feed-section-loading">Loading…</p>
        ) : fact?.fact ? (
          <>
            <p className="fact-feed-section-fact">{fact.fact}</p>
            {hasTags && (
              <div className="fact-feed-section-tags" aria-label="Browse by">
                {fact.mood && (
                  <Link href={`/browse?mood=${fact.mood}`} className="fact-feed-section-tag" title={`Browse by mood: ${moodLabel}`}>
                    {moodLabel}
                  </Link>
                )}
                {fact.category && (
                  <Link href={`/browse/category?cat=${fact.category}`} className="fact-feed-section-tag" title={`Browse by category: ${categoryLabel}`}>
                    {categoryLabel}
                  </Link>
                )}
                {fact.topic && (
                  <Link href={`/${fact.topic}`} className="fact-feed-section-tag" title={`Topic: ${topicLabel}`}>
                    {topicLabel}
                  </Link>
                )}
                {fact.area && (
                  <Link href={`/${fact.topic}?area=${fact.area}`} className="fact-feed-section-tag" title={`Area: ${areaLabel}`}>
                    {areaLabel}
                  </Link>
                )}
              </div>
            )}
          </>
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

      {paywallEnabled && paywallOpen && (
        <div className="fact-feed-paywall-overlay" role="dialog" aria-modal="true" aria-labelledby="fact-feed-paywall-title">
          <div className="fact-feed-paywall-modal">
            <h3 id="fact-feed-paywall-title">Keep The Fact Feed Going</h3>
            <p>
              You&apos;ve listened to {playedFactsCount} facts. Upgrade to continue with unlimited audio facts.
            </p>
            <div className="fact-feed-paywall-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setPaywallOpen(false)}
              >
                Maybe Later
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={startCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Redirecting...' : 'Pay With Stripe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
