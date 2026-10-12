'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { getTTSService, type TTSService } from '@/lib/tts-service';
import { topics, type Topic } from '@/config/topics';

export interface FactData {
  fact: string;
  topic: string;
  /** Mood of the topic (for browse link). */
  mood?: string;
  /** Category of the topic (for browse-by-category link). */
  category?: string;
  /** Area within the topic (for topic?area= link); omitted when misc. */
  area?: string;
}

const topicNames: Record<string, string> = {
  'ice-cream': 'Ice Cream',
  braincells: 'The Brain',
  coffee: 'Coffee',
  'greek-mythology': 'Greek Mythology',
  space: 'Space',
  electricity: 'Electricity',
  mining: 'Mining',
  engines: 'Engines',
  supercars: 'Supercars',
  'movie-quotes': 'Movie Quotes',
  beer: 'Beer',
  whiskey: 'Whiskey',
  cocktails: 'Cocktails',
  presidents: 'U.S. Presidents',
  cars: 'Cars',
  bible: 'The Bible',
  organs: 'Body Organs',
  planes: 'Planes',
  'world-leaders': 'World Leaders',
  elements: 'Chemical Elements',
  philosophy: 'Philosophy',
  'human-body': 'The Human Body',
  olympics: 'The Olympics',
  internet: 'The Internet',
  octopi: 'Octopuses',
  snakes: 'Snakes',
  sharks: 'Sharks',
  oceans: 'The Oceans',
  mountains: 'Mountains',
  'ancient-egypt': 'Ancient Egypt',
  'american-civil-war': 'The American Civil War',
  chocolate: 'Chocolate',
  spices: 'Spices',
  art: 'Art',
  'operating-theatre': 'The Operating Theatre',
  'ethiopian-tribes': 'Ethiopian Tribes',
  denominations: 'Religious Denominations',
  'number-one-singles': 'Number One Singles',
  ai: 'Artificial Intelligence',
  robots: 'Robots',
  drones: 'Drones',
  explorers: 'Explorers',
  simpsons: 'The Simpsons',
  memes: 'Memes',
  bamboo: 'Bamboo',
  'technology-timeline': 'The Technology Timeline',
  'latitude-longitude': 'Latitude and Longitude',
  greenland: 'Greenland',
  'austronesian-migration': 'The Austronesian Migration',
  'dutch-empire': 'The Dutch Empire',
  'fast-food-chains': 'Fast Food Chains',
  composers: 'Composers',
  'area-51': 'Area 51',
  'jupiters-moons': 'Jupiter\'s Moons',
  vikings: 'Vikings',
  frequencies: 'Frequencies',
  semiconductors: 'Semiconductors',
  papacy: 'The Papacy',
  'roman-emperors': 'Roman Emperors',
  crypto: 'Crypto and Bitcoin',
  wwi: 'World War I',
  wwii: 'World War II',
};

const FACT_FEED_FREE_LIMIT = 100;
const FACT_FEED_COUNT_KEY = 'fact-feed-played-count';
const FACT_FEED_PAID_KEY = 'fact-feed-paid';
const FACT_FEED_DEV_IGNORE_LIMIT_KEY = 'fact-feed-dev-ignore-limit';
const PAYWALL_ENABLED = process.env.NEXT_PUBLIC_PAYWALL_ENABLED === 'true';

interface FactFeedContextValue {
  fact: FactData | null;
  loading: boolean;
  factFeedMode: boolean;
  paused: boolean;
  setPaused: (paused: boolean) => void;
  resume: () => void;
  skipToNext: () => void;
  selectedTopics: Set<string>;
  setSelectedTopics: (topics: Set<string>) => void;
  fetchRandomFact: (retryCount?: number) => Promise<FactData>;
  toggleFactFeed: () => void;
  selectorOpen: boolean;
  setSelectorOpen: (open: boolean) => void;
  playedFactsCount: number;
  freeFactsLimit: number;
  paywallOpen: boolean;
  setPaywallOpen: (open: boolean) => void;
  paywallEnabled: boolean;
  startCheckout: () => Promise<void>;
  isCheckingOut: boolean;
  isLocalDev: boolean;
  devTriggerPaywallAfterCurrent: boolean;
  setDevTriggerPaywallAfterCurrent: (enabled: boolean) => void;
  devIgnoreLimit: boolean;
  setDevIgnoreLimit: (enabled: boolean) => void;
  topicNames: Record<string, string>;
}

const FactFeedContext = createContext<FactFeedContextValue | null>(null);

export function FactFeedProvider({ children }: { children: ReactNode }) {
  const [fact, setFact] = useState<FactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [factFeedMode, setFactFeedMode] = useState(false);
  const [paused, setPausedState] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [playedFactsCount, setPlayedFactsCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [paywallOpen, setPaywallOpenState] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [devTriggerPaywallAfterCurrent, setDevTriggerPaywallAfterCurrentState] = useState(false);
  const [devIgnoreLimit, setDevIgnoreLimitState] = useState(false);
  const [selectedTopics, setSelectedTopicsState] = useState<Set<string>>(new Set());
  const ttsServiceRef = useRef<TTSService | null>(null);
  const isProcessingRef = useRef(false);
  const factFeedActiveRef = useRef(false);
  const pausedRef = useRef(false);
  const skipRequestedRef = useRef(false);
  const hasPaidRef = useRef(false);
  const paywallAfterCurrentRef = useRef(false);
  const devIgnoreLimitRef = useRef(false);
  const previousTopicRef = useRef<string | null>(null);
  const recentlyPlayedFactsRef = useRef<string[]>([]);

  const setPaused = useCallback((p: boolean) => {
    setPausedState(p);
    pausedRef.current = p;
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const setSelectedTopics = useCallback((newTopics: Set<string>) => {
    setSelectedTopicsState(newTopics);
    localStorage.setItem('fact-feed-topics', JSON.stringify(Array.from(newTopics)));
    previousTopicRef.current = null;
    recentlyPlayedFactsRef.current = [];
  }, []);

  const setPaywallOpen = useCallback((open: boolean) => {
    setPaywallOpenState(open);
  }, []);

  const setDevTriggerPaywallAfterCurrent = useCallback((enabled: boolean) => {
    setDevTriggerPaywallAfterCurrentState(enabled);
    paywallAfterCurrentRef.current = enabled;
  }, []);

  const setDevIgnoreLimit = useCallback((enabled: boolean) => {
    const shouldEnable = isLocalDev && enabled;
    setDevIgnoreLimitState(shouldEnable);
    devIgnoreLimitRef.current = shouldEnable;

    if (shouldEnable) {
      localStorage.setItem(FACT_FEED_DEV_IGNORE_LIMIT_KEY, '1');
    } else {
      localStorage.removeItem(FACT_FEED_DEV_IGNORE_LIMIT_KEY);
    }
  }, [isLocalDev]);

  const incrementPlayedFactsCount = useCallback((): number => {
    let nextCount = 0;
    setPlayedFactsCount((prev) => {
      nextCount = prev + 1;
      localStorage.setItem(FACT_FEED_COUNT_KEY, String(nextCount));
      return nextCount;
    });
    return nextCount;
  }, []);

  const openPaywallAndStopFeed = useCallback(() => {
    if (!PAYWALL_ENABLED) return;
    factFeedActiveRef.current = false;
    localStorage.removeItem('fact-feed-active');
    setFactFeedMode(false);
    setPaywallOpenState(true);
  }, []);

  const startCheckout = useCallback(async () => {
    if (!PAYWALL_ENABLED) return;
    try {
      setIsCheckingOut(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin: window.location.origin }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      if (!data.url) {
        throw new Error('No checkout URL returned from Stripe session API');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Unable to start checkout right now. Please try again in a moment.');
    } finally {
      setIsCheckingOut(false);
    }
  }, []);

  useEffect(() => {
    const localDev = window.location.hostname === 'localhost';
    setIsLocalDev(localDev);

    if (localDev) {
      const savedDevIgnore = localStorage.getItem(FACT_FEED_DEV_IGNORE_LIMIT_KEY) === '1';
      setDevIgnoreLimitState(savedDevIgnore);
      devIgnoreLimitRef.current = savedDevIgnore;
    } else {
      setDevIgnoreLimitState(false);
      devIgnoreLimitRef.current = false;
      localStorage.removeItem(FACT_FEED_DEV_IGNORE_LIMIT_KEY);
    }

    const savedCount = parseInt(localStorage.getItem(FACT_FEED_COUNT_KEY) || '0', 10);
    if (!Number.isNaN(savedCount) && savedCount > 0) {
      setPlayedFactsCount(savedCount);
    }

    const savedPaid = localStorage.getItem(FACT_FEED_PAID_KEY) === '1';
    setHasPaid(savedPaid);
    hasPaidRef.current = savedPaid;

    const url = new URL(window.location.href);
    if (url.searchParams.get('ff_paid') === '1') {
      setHasPaid(true);
      hasPaidRef.current = true;
      localStorage.setItem(FACT_FEED_PAID_KEY, '1');
      setPaywallOpenState(false);
      url.searchParams.delete('ff_paid');
      window.history.replaceState({}, '', url.toString());
    }

    const saved = localStorage.getItem('fact-feed-topics');
    if (saved) {
      try {
        const topicsArray = JSON.parse(saved);
        setSelectedTopicsState(new Set(topicsArray));
      } catch {
        setSelectedTopicsState(new Set(topics.map((t: Topic) => t.slug)));
      }
    } else {
      setSelectedTopicsState(new Set(topics.map((t: Topic) => t.slug)));
    }
    const savedFactFeedState = localStorage.getItem('fact-feed-active');
    if (savedFactFeedState === 'true') {
      setTimeout(() => {
        setFactFeedMode(true);
        factFeedActiveRef.current = true;
      }, 0);
    }
  }, []);

  useEffect(() => {
    ttsServiceRef.current = getTTSService();
  }, []);

  const fetchRandomFact = useCallback(
    async (retryCount = 0): Promise<FactData> => {
      setLoading(true);
      try {
        const topicsParam = Array.from(selectedTopics).join(',');
        const url = topicsParam ? `/api/random-fact?topics=${encodeURIComponent(topicsParam)}` : '/api/random-fact';
        const response = await fetch(url);
        const data = await response.json();
        const maxRetries = 10;
        if (recentlyPlayedFactsRef.current.includes(data.fact) && retryCount < maxRetries) {
          return fetchRandomFact(retryCount + 1);
        }
        recentlyPlayedFactsRef.current.push(data.fact);
        if (recentlyPlayedFactsRef.current.length > 5) {
          recentlyPlayedFactsRef.current.shift();
        }
        setFact(data);
        return data;
      } catch (error) {
        console.error('Failed to fetch random fact:', error);
        const errorFact: FactData = { fact: 'Failed to load a fact.', topic: 'all' };
        setFact(errorFact);
        return errorFact;
      } finally {
        setLoading(false);
      }
    },
    [selectedTopics]
  );

  useEffect(() => {
    if (!factFeedMode || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Fact Feed',
      artist: 'The Fact Feed',
      artwork: [],
    });
    // Avoid hard-canceling speech on media-session pause because some browsers
    // dispatch pause automatically, which can interrupt every fact cycle.
    navigator.mediaSession.setActionHandler('pause', () => {
      setPausedState(true);
      pausedRef.current = true;
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      setPausedState(true);
      pausedRef.current = true;
      ttsServiceRef.current?.cancel();
    });
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
      }
    };
  }, [factFeedMode]);

  const speakText = useCallback(async (text: string) => {
    if (!ttsServiceRef.current) throw new Error('TTS service not initialized');
    await ttsServiceRef.current.speak(text);
  }, []);

  const speakFact = useCallback(
    async (factText: string, topic: string) => {
      let topicName = topicNames[topic] || 'various topics';
      const processTopicName = (name: string): { name: string; article: string } => {
        if (name.startsWith('The ')) {
          const nameWithoutThe = name.substring(4);
          const firstLetter = nameWithoutThe.charAt(0).toLowerCase();
          const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
          return { name: nameWithoutThe, article };
        }
        const firstLetter = name.charAt(0).toLowerCase();
        const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
        return { name, article };
      };
      const { name: processedTopicName, article } = processTopicName(topicName);
      const isSameTopic = previousTopicRef.current === topic;
      previousTopicRef.current = topic;
      const introVariations = isSameTopic
        ? [
            `While we're on the subject of ${topicName},`,
            `Here's another fact about ${topicName}.`,
            `Continuing with ${topicName},`,
            `More about ${topicName}:`,
            `Another ${processedTopicName} fact.`,
          ]
        : [
            `Here's a fact about ${topicName}.`,
            `Did you know this about ${topicName}?`,
            `Here's ${article} ${processedTopicName} fact.`,
            `A quick fact about ${topicName}.`,
          ];
      const intro = introVariations[Math.floor(Math.random() * introVariations.length)];

      // Use one TTS request per fact cycle to avoid browser interruption between
      // intro and fact boundaries (common with SpeechSynthesis in some browsers).
      await speakText(`${intro} ${factText}`);
    },
    [speakText]
  );

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    let interval: NodeJS.Timeout | null = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && factFeedMode) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock?.addEventListener('release', () => factFeedMode && requestWakeLock());
        } catch (_) {}
      }
    };
    if (factFeedMode) {
      requestWakeLock();
      interval = setInterval(() => {
        if (factFeedMode && (!wakeLock || wakeLock.released)) requestWakeLock();
      }, 30000);
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && factFeedMode && 'wakeLock' in navigator && (!wakeLock || wakeLock.released)) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      interval && clearInterval(interval);
      wakeLock?.release().catch(() => {});
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [factFeedMode]);

  // When NOT in fact feed mode: fetch on mount and refresh every 30s.
  // When IN fact feed mode: don't fetch here (so we speak the current fact first), except
  // when we have no fact yet (e.g. feed restored from localStorage on load) — then fetch once.
  useEffect(() => {
    if (factFeedMode) {
      if (!fact && !loading) fetchRandomFact();
      return;
    }
    fetchRandomFact();
    const interval = setInterval(fetchRandomFact, 30000);
    return () => clearInterval(interval);
  }, [factFeedMode, selectedTopics, fetchRandomFact]);

  useEffect(() => {
    factFeedActiveRef.current = factFeedMode;
    if (!factFeedMode) {
      isProcessingRef.current = false;
      previousTopicRef.current = null;
      window.speechSynthesis?.cancel();
      return;
    }
    if (!fact?.fact || isProcessingRef.current) return;
    const playAndContinue = async () => {
      isProcessingRef.current = true;
      try {
        if (!factFeedActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }
        await speakFact(fact.fact, fact.topic);

        const nextPlayedCount = incrementPlayedFactsCount();

        if (PAYWALL_ENABLED && paywallAfterCurrentRef.current) {
          paywallAfterCurrentRef.current = false;
          setDevTriggerPaywallAfterCurrentState(false);
          openPaywallAndStopFeed();
          isProcessingRef.current = false;
          return;
        }

        if (PAYWALL_ENABLED && !devIgnoreLimitRef.current && !hasPaidRef.current && nextPlayedCount >= FACT_FEED_FREE_LIMIT) {
          openPaywallAndStopFeed();
          isProcessingRef.current = false;
          return;
        }

        if (skipRequestedRef.current) {
          skipRequestedRef.current = false;
          isProcessingRef.current = false;
          return;
        }
        if (!factFeedActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }
        await new Promise((r) => setTimeout(r, 2500));
        if (skipRequestedRef.current) {
          skipRequestedRef.current = false;
          isProcessingRef.current = false;
          return;
        }
        if (!factFeedActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }
        if (pausedRef.current) {
          isProcessingRef.current = false;
          return;
        }
        await fetchRandomFact();
      } catch (e) {
        console.error('Fact Feed playback failed, pausing feed instead of auto-skipping:', e);
        if (skipRequestedRef.current) {
          skipRequestedRef.current = false;
          isProcessingRef.current = false;
          return;
        }

        // On playback errors, pause and wait for explicit resume/next rather than skipping.
        if (factFeedActiveRef.current) {
          setPausedState(true);
          pausedRef.current = true;
        }
      }
      isProcessingRef.current = false;
    };
    playAndContinue();
  }, [
    fact,
    factFeedMode,
    fetchRandomFact,
    incrementPlayedFactsCount,
    openPaywallAndStopFeed,
    speakFact,
  ]);

  useEffect(() => {
    return () => {
      if (!factFeedActiveRef.current) ttsServiceRef.current?.cancel();
    };
  }, []);

  const toggleFactFeed = useCallback(() => {
    const newMode = !factFeedMode;
    if (PAYWALL_ENABLED && !devIgnoreLimitRef.current && newMode && !hasPaidRef.current && playedFactsCount >= FACT_FEED_FREE_LIMIT) {
      setPaywallOpenState(true);
      return;
    }
    if (!newMode) {
      ttsServiceRef.current?.cancel();
      isProcessingRef.current = false;
      previousTopicRef.current = null;
      recentlyPlayedFactsRef.current = [];
      setPausedState(false);
      pausedRef.current = false;
      localStorage.removeItem('fact-feed-active');
    } else {
      localStorage.setItem('fact-feed-active', 'true');
      recentlyPlayedFactsRef.current = [];
    }
    setFactFeedMode(newMode);
  }, [factFeedMode, playedFactsCount]);

  const resume = useCallback(() => {
    if (PAYWALL_ENABLED && !devIgnoreLimitRef.current && !hasPaidRef.current && playedFactsCount >= FACT_FEED_FREE_LIMIT) {
      setPaywallOpenState(true);
      return;
    }
    setPausedState(false);
    pausedRef.current = false;
    fetchRandomFact();
  }, [fetchRandomFact, playedFactsCount]);

  const skipToNext = useCallback(() => {
    skipRequestedRef.current = true;
    ttsServiceRef.current?.cancel();
    isProcessingRef.current = false;
    fetchRandomFact();
  }, [fetchRandomFact]);

  const value: FactFeedContextValue = {
    fact,
    loading,
    factFeedMode,
    paused,
    setPaused,
    resume,
    skipToNext,
    selectedTopics,
    setSelectedTopics,
    fetchRandomFact,
    toggleFactFeed,
    selectorOpen,
    setSelectorOpen,
    playedFactsCount,
    freeFactsLimit: FACT_FEED_FREE_LIMIT,
    paywallOpen,
    setPaywallOpen,
    paywallEnabled: PAYWALL_ENABLED,
    startCheckout,
    isCheckingOut,
    isLocalDev,
    devTriggerPaywallAfterCurrent,
    setDevTriggerPaywallAfterCurrent,
    devIgnoreLimit,
    setDevIgnoreLimit,
    topicNames,
  };

  return <FactFeedContext.Provider value={value}>{children}</FactFeedContext.Provider>;
}

export function useFactFeed() {
  const ctx = useContext(FactFeedContext);
  if (!ctx) throw new Error('useFactFeed must be used within FactFeedProvider');
  return ctx;
}
