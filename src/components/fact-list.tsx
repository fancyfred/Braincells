'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import nlp from 'compromise';
import { Fact } from '@/types/fact';

interface FactWithImage extends Fact {
  imageUrl: string | null;
  imageAlt: string;
  useIcon: boolean;
}

interface FactListProps {
  facts: Fact[];
  currentFactIndex: number;
  singleFactView?: boolean;
  /** Topic slug (e.g. ancient-egypt) for resolving local images. */
  topicSlug?: string;
  /** When set (e.g. on area page), fact links go here with ?fact=N. Use with originalIndices. */
  linkBasePath?: string;
  /** When set, list view uses these indices for ?fact=N (for linking into full topic from area view). */
  originalIndices?: number[];
}

export function FactList({
  facts,
  currentFactIndex: initialFactIndex,
  singleFactView = false,
  topicSlug,
  linkBasePath,
  originalIndices,
}: FactListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentFactRef = useRef<HTMLLIElement>(null);
  /** True while this list started TTS (user clicked speak). Used so we only cancel our own speech on unmount, not the fact feed. */
  const factListSpeakingRef = useRef(false);

  const [factsWithImages, setFactsWithImages] = useState<FactWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [imagesEnabled, setImagesEnabled] = useState(true);

  const currentIndex = Math.max(0, Math.min(initialFactIndex, facts.length - 1));
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < facts.length - 1;

  const factsToShow = singleFactView ? facts.slice(currentIndex, currentIndex + 1) : facts;

  // Load images enabled preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('images-enabled');
    if (saved !== null) {
      setImagesEnabled(saved === 'true');
    }

    const handleImagesEnabledChange = (event: CustomEvent) => {
      setImagesEnabled(event.detail.enabled);
    };

    window.addEventListener('images-enabled-changed', handleImagesEnabledChange as EventListener);

    return () => {
      window.removeEventListener('images-enabled-changed', handleImagesEnabledChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const factsToFetch = singleFactView ? facts.slice(currentIndex, currentIndex + 1) : facts;
    if (!imagesEnabled) {
      const factsWithoutImages = factsToFetch.map((fact) => ({
        ...fact,
        imageUrl: null,
        imageAlt: '',
        useIcon: true,
      }));
      setFactsWithImages(factsWithoutImages);
      setLoading(false);
      return;
    }

    const fetchImages = async () => {
      const imagePromises = factsToFetch.map(async (fact, i) => {
        const query = buildImageQuery(fact);
        const topicFactIndex = originalIndices ? originalIndices[i] : (singleFactView ? currentIndex : i);
        const params = new URLSearchParams({ query });
        if (topicSlug) params.set('topic', topicSlug);
        params.set('factIndex', String(topicFactIndex));
        // Use thumb in list view, medium in single fact view
        params.set('size', singleFactView ? 'medium' : 'thumb');

        try {
          const response = await fetch(`/api/images?${params.toString()}`);
          const data = await response.json();
          return {
            ...fact,
            imageUrl: data.url || null,
            imageAlt: data.alt || query || 'Brain illustration',
            useIcon: data.useIcon ?? true,
          };
        } catch (error) {
          return {
            ...fact,
            imageUrl: null,
            imageAlt: 'Brain illustration',
            useIcon: true,
          };
        }
      });

      const results = await Promise.all(imagePromises);
      setFactsWithImages(results);
      setLoading(false);
    };

    setLoading(true);
    fetchImages();
  }, [facts, imagesEnabled, singleFactView, currentIndex, topicSlug, originalIndices]);

  // Only cancel TTS on unmount/facts change if this list started it (speak button). Don't cancel the fact feed.
  useEffect(() => {
    return () => {
      if (factListSpeakingRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        factListSpeakingRef.current = false;
      }
    };
  }, [facts]);

  // Scroll current fact into view when index changes
  useEffect(() => {
    if (currentFactRef.current) {
      currentFactRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  // Next/prev use full-topic fact index; when in area view use originalIndices so we cycle within area
  const getFactParamForIndex = (indexInList: number): string | null =>
    originalIndices != null ? String(originalIndices[indexInList]) : String(indexInList);

  // Left/Right arrow keys to move through facts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          e.preventDefault();
          const params = new URLSearchParams(searchParams.toString());
          if (originalIndices != null) {
            params.set('fact', getFactParamForIndex(currentIndex - 1));
          } else {
            if (currentIndex <= 1) params.delete('fact');
            else params.set('fact', String(currentIndex - 1));
          }
          const qs = params.toString();
          router.push(`${pathname}${qs ? `?${qs}` : ''}` as any);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < facts.length - 1) {
          e.preventDefault();
          const params = new URLSearchParams(searchParams.toString());
          params.set('fact', getFactParamForIndex(currentIndex + 1));
          router.push(`${pathname}?${params.toString()}` as any);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, facts.length, pathname, searchParams, router, originalIndices]);

  const handleNextFact = () => {
    if (!canGoForward) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('fact', getFactParamForIndex(currentIndex + 1));
    router.push(`${pathname}?${params.toString()}` as any);
  };

  const handlePreviousFact = () => {
    if (!canGoBack) return;
    const params = new URLSearchParams(searchParams.toString());
    if (originalIndices != null) {
      params.set('fact', getFactParamForIndex(currentIndex - 1));
    } else if (currentIndex <= 1) {
      params.delete('fact');
    } else {
      params.set('fact', String(currentIndex - 1));
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
  };

  const handleSpeak = (text: string, index: number) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (speakingIndex === index) {
      factListSpeakingRef.current = false;
      setSpeakingIndex(null);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    factListSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Fact',
        artist: 'The Fact Feed',
        artwork: [],
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        window.speechSynthesis.cancel();
        factListSpeakingRef.current = false;
        setSpeakingIndex(null);
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        window.speechSynthesis.cancel();
        factListSpeakingRef.current = false;
        setSpeakingIndex(null);
      });
    }

    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => {
      factListSpeakingRef.current = false;
      setSpeakingIndex(null);
    };
    utterance.onerror = () => {
      factListSpeakingRef.current = false;
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  if (factsToShow.length === 0) {
    return (
      <div className="no-facts">
        <p>No facts in this topic yet.</p>
      </div>
    );
  }

  const itemsToRender = loading ? factsToShow.map((f) => ({ ...f, imageUrl: null, imageAlt: '', useIcon: true })) : factsWithImages;

  const showNavButtons = singleFactView;

  return (
    <div className="fact-navigation-container">
      {showNavButtons && (
        <div className="fact-nav-buttons">
          <button
            className={`fact-nav-button fact-nav-prev ${!canGoBack ? 'disabled' : ''}`}
            onClick={handlePreviousFact}
            disabled={!canGoBack}
            aria-label="Previous fact"
            title="Previous fact"
            style={{ visibility: !canGoBack ? 'hidden' : 'visible' }}
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className={`fact-nav-button fact-nav-next ${!canGoForward ? 'disabled' : ''}`}
            onClick={handleNextFact}
            disabled={!canGoForward}
            aria-label="Next fact"
            title="Next fact"
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
      <div className="fact-content-area">
        <ul className={`fun-facts ${!singleFactView ? 'fun-facts-list-view' : ''}`}>
        {itemsToRender.map((item, index) => {
          const factNumber = singleFactView ? currentIndex + 1 : index + 1;
          const basePath = linkBasePath ?? pathname;
          const factIndexForLink =
            singleFactView ? currentIndex : (originalIndices != null ? originalIndices[index] : index);
          const factHref = basePath.includes('?')
            ? `${basePath}&fact=${factIndexForLink}`
            : `${basePath}?fact=${factIndexForLink}`;
          const isCurrent = singleFactView ? index === 0 : index === currentIndex;

          const factBody = (
            <>
              {!singleFactView && (
                <span className="fact-list-number" aria-hidden>{factNumber}.</span>
              )}
              <div className="fact-image" style={{ visibility: imagesEnabled && (item.imageUrl || item.useIcon) ? 'visible' : 'hidden' }}>
                {imagesEnabled && item.imageUrl ? (
                  singleFactView ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      width={400}
                      height={300}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  )
                ) : imagesEnabled && item.useIcon ? (
                  <div className="fact-icon">
                    {index % 2 === 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21h6" />
                        <path d="M12 3a6 6 0 0 0-6 6c0 2.5-1.5 4.5-1.5 4.5h15S18 11.5 18 9a6 6 0 0 0-6-6Z" />
                        <path d="M12 9v3" />
                        <path d="M9 15h6" />
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
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="fact-content">
                <div className="fact-text">{item.text}</div>
                <button
                  className={`speak-button ${speakingIndex === (singleFactView ? currentIndex : index) ? 'speaking' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(item.text, singleFactView ? currentIndex : index);
                  }}
                  aria-label={speakingIndex === (singleFactView ? currentIndex : index) ? 'Stop reading' : 'Read this fact aloud'}
                  title={speakingIndex === (singleFactView ? currentIndex : index) ? 'Stop reading' : 'Read this fact aloud'}
                >
                  {speakingIndex === (singleFactView ? currentIndex : index) ? (
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
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          );

          return (
            <li
              key={`${item.text}-${singleFactView ? currentIndex : index}`}
              ref={singleFactView ? currentFactRef : index === currentIndex ? currentFactRef : null}
              className={`fact-item ${isCurrent ? 'fact-item-current' : ''} ${!singleFactView ? 'fact-item-clickable' : ''}`}
            >
              {!singleFactView ? (
                <Link href={factHref} className="fact-item-link">
                  {factBody}
                </Link>
              ) : (
                factBody
              )}
            </li>
          );
        })}
        </ul>
      </div>
    </div>
  );
}

function buildImageQuery(fact: Fact): string {
  const doc = nlp(fact.text);
  const nouns = doc.nouns().out('array');
  const nounPhrases = doc.nouns().toPlural().out('array');

  const extractedEntities = [...nounPhrases, ...nouns].filter(
    (term, index, self) => self.indexOf(term) === index && term.length > 2
  );

  const specificTerms = [
    'hippocampus', 'cerebellum', 'amygdala', 'prefrontal cortex', 'thalamus', 'hypothalamus',
    'fish', 'blueberries', 'walnuts', 'dark chocolate', 'eggs', 'avocados', 'coffee', 'tea',
    'exercise', 'music', 'meditation', 'reading', 'sleep', 'yawning',
    'synapses', 'neurons', 'glial cells', 'neural network',
  ];

  const relevantEntity = extractedEntities.find((entity) => {
    const lowerEntity = entity.toLowerCase();
    return specificTerms.some((term) =>
      lowerEntity.includes(term.toLowerCase()) || term.toLowerCase().includes(lowerEntity)
    );
  });

  if (relevantEntity) {
    return relevantEntity.toLowerCase();
  }

  if (extractedEntities.length > 0) {
    return extractedEntities.slice(0, 2).join(' ').toLowerCase();
  }

  const keywords = extractKeywords(fact.text);
  return keywords.length > 0 ? keywords.slice(0, 2).join(' ') : 'brain neuron';
}

function extractKeywords(fact: string): string[] {
  const keywords: string[] = [];
  const lowerFact = fact.toLowerCase();

  if (lowerFact.includes('fish') || lowerFact.includes('salmon') || lowerFact.includes('sardine')) keywords.push('fish brain');
  if (lowerFact.includes('blueberr')) keywords.push('blueberries');
  if (lowerFact.includes('walnut')) keywords.push('walnuts');
  if (lowerFact.includes('chocolate')) keywords.push('dark chocolate');
  if (lowerFact.includes('egg')) keywords.push('eggs');
  if (lowerFact.includes('avocado')) keywords.push('avocados');
  if (lowerFact.includes('coffee')) keywords.push('coffee brain');
  if (lowerFact.includes('tea')) keywords.push('tea');
  if (lowerFact.includes('spinach') || lowerFact.includes('kale') || lowerFact.includes('greens')) keywords.push('leafy greens');
  if (lowerFact.includes('grain') || lowerFact.includes('oatmeal')) keywords.push('whole grains');
  if (lowerFact.includes('hippocampus')) keywords.push('hippocampus brain');
  if (lowerFact.includes('cerebellum')) keywords.push('cerebellum');
  if (lowerFact.includes('amygdala')) keywords.push('amygdala');
  if (lowerFact.includes('prefrontal')) keywords.push('prefrontal cortex');
  if (lowerFact.includes('thalamus')) keywords.push('thalamus');
  if (lowerFact.includes('hypothalamus')) keywords.push('hypothalamus');
  if (lowerFact.includes('brainstem') || lowerFact.includes('reptilian')) keywords.push('brainstem');
  if (lowerFact.includes('exercise') || lowerFact.includes('workout')) keywords.push('exercise brain');
  if (lowerFact.includes('music') || lowerFact.includes('instrument')) keywords.push('music brain');
  if (lowerFact.includes('meditation') || lowerFact.includes('mindfulness')) keywords.push('meditation');
  if (lowerFact.includes('reading') || lowerFact.includes('book')) keywords.push('reading brain');
  if (lowerFact.includes('neuron')) keywords.push('neuron');
  if (lowerFact.includes('brain')) keywords.push('brain');
  if (lowerFact.includes('glia') || lowerFact.includes('glial')) keywords.push('glial cell');
  if (lowerFact.includes('synapse')) keywords.push('synapse');
  if (lowerFact.includes('memory')) keywords.push('memory brain');
  if (lowerFact.includes('sleep')) keywords.push('sleep brain');
  if (lowerFact.includes('yawning') || lowerFact.includes('yawn')) keywords.push('yawning');
  if (lowerFact.includes('connection') || lowerFact.includes('network')) keywords.push('neural network');
  if (lowerFact.includes('thought')) keywords.push('brain thinking');
  if (lowerFact.includes('emotion') || lowerFact.includes('fear')) keywords.push('emotions brain');

  if (keywords.length === 0) {
    keywords.push('brain', 'neuron');
  }

  return keywords;
}
