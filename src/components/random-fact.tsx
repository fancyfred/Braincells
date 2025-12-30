'use client';

import { useState, useEffect, useRef } from 'react';
import { getTTSService, type TTSService } from '@/lib/tts-service';

interface RandomFactProps {
  className?: string;
}

interface FactData {
  fact: string;
  tags: string[];
  topic: string;
}

// Map topic slugs to readable names
const topicNames: Record<string, string> = {
  'braincells': 'the brain',
  'coffee': 'coffee',
  'greek-mythology': 'Greek mythology',
  'space': 'space',
  'electricity': 'electricity',
  'mining': 'mining',
  'engines': 'engines',
  'supercars': 'supercars',
  'movie-quotes': 'movie quotes',
  'beer': 'beer',
  'whiskey': 'whiskey',
  'cocktails': 'cocktails',
  'presidents': 'U.S. presidents',
  'cars': 'cars',
  'bible': 'the Bible',
  'organs': 'body organs',
  'planes': 'planes',
  'world-leaders': 'world leaders',
  'elements': 'chemical elements',
  'philosophy': 'philosophy',
  'seinfeld': 'Seinfeld',
  'olympics': 'the Olympics',
  'internet': 'the internet',
  'octopi': 'octopuses',
  'snakes': 'snakes',
  'sharks': 'sharks',
  'oceans': 'the oceans',
  'mountains': 'mountains',
  'ancient-egypt': 'ancient Egypt',
  'chocolate': 'chocolate',
  'spices': 'spices',
};

export function RandomFact({ className }: RandomFactProps) {
  const [fact, setFact] = useState<FactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [factFeedMode, setFactFeedMode] = useState(false);
  const ttsServiceRef = useRef<TTSService | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const factFeedActiveRef = useRef<boolean>(false);

  // Initialize TTS service
  useEffect(() => {
    ttsServiceRef.current = getTTSService();
  }, []);

  const fetchRandomFact = async () => {
    setLoading(true);
    // Always fetch from all topics, regardless of current page
    try {
      const response = await fetch('/api/random-fact');
      const data = await response.json();
      setFact(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch random fact:', error);
      const errorFact = { fact: 'Failed to load a fact.', tags: [], topic: 'all' };
      setFact(errorFact);
      return errorFact;
    } finally {
      setLoading(false);
    }
  };

  // Set up Media Session API for background audio support
  useEffect(() => {
    if (!factFeedMode || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Fact Feed',
      artist: 'Fact Me App',
      artwork: []
    });

    navigator.mediaSession.setActionHandler('play', () => {
      // Resume if paused
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      ttsServiceRef.current?.cancel();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      ttsServiceRef.current?.cancel();
    });

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
      }
    };
  }, [factFeedMode]);

  const speakText = async (text: string): Promise<void> => {
    if (!ttsServiceRef.current) {
      console.error('[RandomFact] TTS service not initialized');
      throw new Error('TTS service not initialized');
    }
    try {
      console.log('[RandomFact] Speaking text:', text.substring(0, 50) + '...');
      await ttsServiceRef.current.speak(text);
      console.log('[RandomFact] Finished speaking');
    } catch (error) {
      console.error('[RandomFact] Error speaking text:', error);
      throw error;
    }
  };

  const speakFact = async (factText: string, topic: string): Promise<void> => {
    // Cancel any existing speech first
    ttsServiceRef.current?.cancel();
    
    // Get topic name
    const topicName = topicNames[topic] || 'various topics';
    
    // Random intro sentence variations
    const introVariations = [
      `Here's a fact about ${topicName}.`,
      `Did you know this about ${topicName}?`,
      `Here's something interesting about ${topicName}.`,
      `Let's learn about ${topicName}.`,
      `Here's a ${topicName} fact.`,
      `Time for a ${topicName} fact.`,
      `Here's something about ${topicName}.`,
      `A quick fact about ${topicName}.`,
      `Here's what you should know about ${topicName}.`,
      `Interesting fact about ${topicName}.`,
    ];
    
    // Pick a random intro
    const intro = introVariations[Math.floor(Math.random() * introVariations.length)];
    
    // Speak intro
    await speakText(intro);
    
    // Reduced pause between intro and fact (from 500ms to 250ms)
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Speak the fact (voice will be randomized automatically by the service)
    await speakText(factText);
  };

  // Request wake lock to keep device awake during fact feed
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    let wakeLockRetryInterval: NodeJS.Timeout | null = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && factFeedMode) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('[RandomFact] Wake lock acquired');
          
          // Re-request wake lock if it gets released (e.g., user switches tabs)
          wakeLock.addEventListener('release', () => {
            console.log('[RandomFact] Wake lock released, attempting to re-acquire...');
            if (factFeedMode) {
              requestWakeLock();
            }
          });
        } catch (err) {
          console.log('[RandomFact] Wake lock not supported or failed:', err);
        }
      }
    };

    // Periodically re-request wake lock to ensure it stays active
    const maintainWakeLock = () => {
      if (factFeedMode && 'wakeLock' in navigator) {
        // Check if wake lock is still active
        if (!wakeLock || wakeLock.released) {
          requestWakeLock();
        }
      }
    };

    if (factFeedMode) {
      requestWakeLock();
      // Re-check every 30 seconds to ensure wake lock is still active
      wakeLockRetryInterval = setInterval(maintainWakeLock, 30000);
    }

    // Handle visibility changes to re-request wake lock
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && factFeedMode && 'wakeLock' in navigator) {
        if (!wakeLock || wakeLock.released) {
          await requestWakeLock();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLockRetryInterval) {
        clearInterval(wakeLockRetryInterval);
      }
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [factFeedMode]);

  useEffect(() => {
    // Initial fetch
    fetchRandomFact();

    if (!factFeedMode) {
      // Normal mode: refresh every 30 seconds
      const interval = setInterval(fetchRandomFact, 30000);
      return () => clearInterval(interval);
    }
  }, [factFeedMode]);

  useEffect(() => {
    factFeedActiveRef.current = factFeedMode;
    
    if (!factFeedMode) {
      // Stop any ongoing processing when mode is turned off
      isProcessingRef.current = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Only start processing if we have a fact and we're not already processing
    if (!fact?.fact || isProcessingRef.current) return;

    const playFactAndContinue = async () => {
      // Mark as processing to prevent multiple simultaneous executions
      isProcessingRef.current = true;

      try {
        // Check if fact feed is still active before speaking
        if (!factFeedActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }

        // Play the current fact with intro and wait for it to complete
        await speakFact(fact.fact, fact.topic);
        
        // Check again if fact feed is still active after speech
        if (!factFeedActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }
        
        // Reduced wait time between facts (from 5 seconds to 2.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Final check before fetching next fact
        if (!factFeedActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }
        
        // Fetch next fact - this will update the fact state
        await fetchRandomFact();
        
        // Reset processing flag so the effect can run again for the new fact
        isProcessingRef.current = false;
      } catch (error) {
        console.error('Error in fact feed:', error);
        isProcessingRef.current = false;
        
        // Even on error, wait and try to continue if mode is still active
        if (factFeedActiveRef.current) {
          await new Promise(resolve => setTimeout(resolve, 2500));
          if (factFeedActiveRef.current) {
            await fetchRandomFact();
          }
        }
      }
    };

    playFactAndContinue();
  }, [fact, factFeedMode]);

  // Cleanup: stop speech when component unmounts or mode changes
  useEffect(() => {
    return () => {
      ttsServiceRef.current?.cancel();
    };
  }, []);

  const toggleFactFeed = () => {
    // Stop any current speech
    ttsServiceRef.current?.cancel();
    // Reset processing flag
    isProcessingRef.current = false;
    setFactFeedMode(!factFeedMode);
  };

  return (
    <div className={`random-fact ${className || ''} ${factFeedMode ? 'fact-feed-active' : ''}`}>
      <span className="random-fact-label">Fact:</span>
      <span className="random-fact-text">
        {loading ? 'Loading...' : fact?.fact || 'No fact available.'}
      </span>
      <button
        className={`fact-feed-toggle ${factFeedMode ? 'active' : ''}`}
        onClick={toggleFactFeed}
        aria-label={factFeedMode ? 'Stop Fact Feed' : 'Start Fact Feed'}
        title={factFeedMode ? 'Stop Fact Feed' : 'Start Fact Feed'}
      >
        {factFeedMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        <span className="fact-feed-label">{factFeedMode ? 'Stop Feed' : 'Fact Feed'}</span>
      </button>
    </div>
  );
}

