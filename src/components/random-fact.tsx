'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getTTSService, type TTSService } from '@/lib/tts-service';
import { FactFeedSelector } from './fact-feed-selector';
import { topics, type Topic } from '@/config/topics';

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
  'art': 'art',
  'operating-theatre': 'the operating theatre',
  'ethiopian-tribes': 'Ethiopian tribes',
  'denominations': 'religious denominations',
  'number-one-singles': 'number one singles',
  'ai': 'artificial intelligence',
  'robots': 'robots',
  'drones': 'drones',
  'explorers': 'explorers',
  'simpsons': 'The Simpsons',
  'memes': 'memes',
  'bamboo': 'bamboo',
  'technology-timeline': 'the technology timeline',
  'latitude-longitude': 'latitude and longitude',
  'greenland': 'Greenland',
  'austronesian-migration': 'the Austronesian migration',
  'dutch-empire': 'the Dutch Empire',
};

export function RandomFact({ className }: RandomFactProps) {
  const [fact, setFact] = useState<FactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [factFeedMode, setFactFeedMode] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const ttsServiceRef = useRef<TTSService | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const factFeedActiveRef = useRef<boolean>(false);
  const previousTopicRef = useRef<string | null>(null);
  const recentlyPlayedFactsRef = useRef<string[]>([]); // Track last 5 facts to prevent repeats

  // Load selected topics and fact feed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fact-feed-topics');
    if (saved) {
      try {
        const topicsArray = JSON.parse(saved);
        setSelectedTopics(new Set(topicsArray));
      } catch (e) {
        // If parsing fails, default to all topics
        setSelectedTopics(new Set(topics.map((t: Topic) => t.slug)));
      }
    } else {
      // Default to all topics if nothing saved
      setSelectedTopics(new Set(topics.map((t: Topic) => t.slug)));
    }

    // Restore fact feed state from localStorage
    const savedFactFeedState = localStorage.getItem('fact-feed-active');
    if (savedFactFeedState === 'true') {
      // Use setTimeout to ensure state is set after initial render
      setTimeout(() => {
        setFactFeedMode(true);
        factFeedActiveRef.current = true;
      }, 0);
    }
  }, []);

  // Initialize TTS service
  useEffect(() => {
    ttsServiceRef.current = getTTSService();
  }, []);

  const fetchRandomFact = useCallback(async (retryCount = 0): Promise<FactData> => {
    setLoading(true);
    // Fetch from selected topics only
    try {
      const topicsParam = Array.from(selectedTopics).join(',');
      const url = topicsParam ? `/api/random-fact?topics=${encodeURIComponent(topicsParam)}` : '/api/random-fact';
      const response = await fetch(url);
      const data = await response.json();
      
      // Check if this fact was recently played (prevent immediate repeats)
      const maxRetries = 10; // Prevent infinite loops
      if (recentlyPlayedFactsRef.current.includes(data.fact) && retryCount < maxRetries) {
        // This fact was recently played, fetch again
        return await fetchRandomFact(retryCount + 1);
      }
      
      // Add this fact to recently played list (keep last 5)
      recentlyPlayedFactsRef.current.push(data.fact);
      if (recentlyPlayedFactsRef.current.length > 5) {
        recentlyPlayedFactsRef.current.shift(); // Remove oldest
      }
      
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
  }, [selectedTopics]);

  const handleTopicsChange = (newTopics: Set<string>) => {
    setSelectedTopics(newTopics);
    // Save to localStorage
    localStorage.setItem('fact-feed-topics', JSON.stringify(Array.from(newTopics)));
    // Reset previous topic when topics change
    previousTopicRef.current = null;
    // Clear recently played facts when topics change (fresh start for new selection)
    recentlyPlayedFactsRef.current = [];
    // If fact feed is active, it will use the new selection on next fetch
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
    let topicName = topicNames[topic] || 'various topics';
    
    // Helper function to process topic name and determine article
    const processTopicName = (name: string): { name: string; article: string } => {
      // Check if topic name starts with "The "
      if (name.startsWith('The ')) {
        const nameWithoutThe = name.substring(4); // Remove "The "
        // Determine article based on first letter of the word after "The"
        const firstLetter = nameWithoutThe.charAt(0).toLowerCase();
        const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
        return { name: nameWithoutThe, article };
      }
      // For names not starting with "The", determine article based on first letter
      const firstLetter = name.charAt(0).toLowerCase();
      const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
      return { name, article };
    };
    
    const { name: processedTopicName, article } = processTopicName(topicName);
    
    // Check if this is the same topic as the previous fact
    const isSameTopic = previousTopicRef.current === topic;
    
    // Update previous topic for next time
    previousTopicRef.current = topic;
    
    let introVariations: string[];
    
    if (isSameTopic) {
      // Different intro variations when topic stays the same
      introVariations = [
        `While we're on the subject of ${topicName},`,
        `Staying with ${topicName},`,
        `Here's another fact about ${topicName}.`,
        `Something else you might not have known about ${topicName}:`,
        `Another interesting thing about ${topicName}:`,
        `Continuing with ${topicName},`,
        `More about ${topicName}:`,
        `Here's another ${processedTopicName} fact.`,
        `Still on ${topicName},`,
        `Another ${processedTopicName} tidbit:`,
        `Let's continue with ${topicName}.`,
        `Here's more about ${topicName}.`,
        `Sticking with ${topicName},`,
        `Another fascinating fact about ${topicName}:`,
        `On the topic of ${topicName}, here's another:`,
        `Yet another ${processedTopicName} fact:`,
        `More ${processedTopicName} knowledge:`,
        `Another ${processedTopicName} detail:`,
        `Continuing our exploration of ${topicName},`,
        `Here's another piece of ${processedTopicName} trivia.`,
      ];
    } else {
      // Original intro variations for new topics
      introVariations = [
        `Here's a fact about ${topicName}.`,
        `Did you know this about ${topicName}?`,
        `Here's something interesting about ${topicName}.`,
        `Let's learn about ${topicName}.`,
        `Here's ${article} ${processedTopicName} fact.`,
        `Time for ${article} ${processedTopicName} fact.`,
        `Here's something about ${topicName}.`,
        `A quick fact about ${topicName}.`,
        `Here's what you should know about ${topicName}.`,
        `Interesting fact about ${topicName}.`,
      ];
    }
    
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
  }, [factFeedMode, selectedTopics]);

  useEffect(() => {
    factFeedActiveRef.current = factFeedMode;
    
    if (!factFeedMode) {
      // Stop any ongoing processing when mode is turned off
      isProcessingRef.current = false;
      // Reset previous topic when fact feed is turned off
      previousTopicRef.current = null;
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
  }, [fact, factFeedMode, fetchRandomFact]);

  // Cleanup: only stop speech when component unmounts if fact feed is not active
  // This allows the fact feed to continue across navigation
  useEffect(() => {
    return () => {
      // Only cancel if fact feed is not active (user intentionally stopped it)
      // If fact feed is active, let it continue - it will be restored on remount
      if (!factFeedActiveRef.current) {
        ttsServiceRef.current?.cancel();
      }
    };
  }, []);

  const toggleFactFeed = () => {
    const newMode = !factFeedMode;
    // Stop any current speech only if turning off
    if (!newMode) {
      ttsServiceRef.current?.cancel();
      // Reset processing flag
      isProcessingRef.current = false;
      // Reset previous topic when toggling fact feed
      previousTopicRef.current = null;
      // Clear recently played facts when turning off
      recentlyPlayedFactsRef.current = [];
      // Clear from localStorage
      localStorage.removeItem('fact-feed-active');
    } else {
      // Save to localStorage when turning on
      localStorage.setItem('fact-feed-active', 'true');
      // Clear recently played facts when starting fresh
      recentlyPlayedFactsRef.current = [];
    }
    setFactFeedMode(newMode);
  };

  return (
    <>
      <div className={`random-fact ${className || ''} ${factFeedMode ? 'fact-feed-active' : ''}`}>
        <span className="random-fact-label">Fact:</span>
        <span className="random-fact-text">
          {loading ? 'Loading...' : fact?.fact || 'No fact available.'}
        </span>
        <button
          className="fact-feed-selector-button"
          onClick={() => setSelectorOpen(true)}
          aria-label="Select topics for Fact Feed"
          title="Select topics for Fact Feed"
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
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="fact-feed-selector-count-badge">{selectedTopics.size}</span>
        </button>
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
      <FactFeedSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        selectedTopics={selectedTopics}
        onTopicsChange={handleTopicsChange}
      />
    </>
  );
}

