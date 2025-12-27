'use client';

import { useState, useEffect, useRef } from 'react';

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
};

export function RandomFact({ className }: RandomFactProps) {
  const [fact, setFact] = useState<FactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [factFeedMode, setFactFeedMode] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const factFeedActiveRef = useRef<boolean>(false);
  const voiceIndexRef = useRef<number>(0);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

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

  // Get available voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        // Filter to get a variety of English voices
        const englishVoices = voices.filter(voice => 
          voice.lang.startsWith('en') && !voice.localService
        );
        availableVoicesRef.current = englishVoices.length > 0 ? englishVoices : voices;
      }
    };

    loadVoices();
    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakText = (text: string, useVoice: boolean = true): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Use a different voice if available
      if (useVoice && availableVoicesRef.current.length > 0) {
        const voiceIndex = voiceIndexRef.current % availableVoicesRef.current.length;
        utterance.voice = availableVoicesRef.current[voiceIndex];
        // Increment for next time
        voiceIndexRef.current = (voiceIndexRef.current + 1) % availableVoicesRef.current.length;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const speakFact = async (factText: string, topic: string): Promise<void> => {
    // Cancel any existing speech first
    window.speechSynthesis.cancel();
    
    // Get topic name
    const topicName = topicNames[topic] || 'various topics';
    const intro = `Here's a fact about ${topicName}.`;
    
    // Speak intro
    await speakText(intro, true);
    
    // Small pause (built into speech synthesis, but add a tiny delay)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Speak the fact with a different voice
    await speakText(factText, true);
  };

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
        
        // Wait 5 seconds after speech ends
        await new Promise(resolve => setTimeout(resolve, 5000));
        
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
          await new Promise(resolve => setTimeout(resolve, 5000));
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
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleFactFeed = () => {
    // Stop any current speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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

