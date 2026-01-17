'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  selectedTag: string;
}

export function FactList({ facts, selectedTag }: FactListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [factsWithImages, setFactsWithImages] = useState<FactWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [imagesEnabled, setImagesEnabled] = useState(true);
  
  // Navigation state: history of tags and current position
  const [tagHistory, setTagHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const isNavigatingRef = useRef(false); // Track if navigation is from our buttons

  // Load images enabled preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('images-enabled');
    if (saved !== null) {
      setImagesEnabled(saved === 'true');
    }

    // Listen for changes from ImageToggle
    const handleImagesEnabledChange = (event: CustomEvent) => {
      setImagesEnabled(event.detail.enabled);
    };

    window.addEventListener('images-enabled-changed', handleImagesEnabledChange as EventListener);

    return () => {
      window.removeEventListener('images-enabled-changed', handleImagesEnabledChange as EventListener);
    };
  }, []);

  // Filter facts based on selected tag
  const filteredFacts = useMemo(() => {
    if (!selectedTag) return facts;
    return facts.filter((fact) => fact.tags.includes(selectedTag));
  }, [facts, selectedTag]);

  // Initialize tag history when component mounts
  useEffect(() => {
    // Only initialize if history is empty
    if (tagHistory.length === 0) {
      // First time - initialize with current tag (or empty string if no tag)
      const initialTag = selectedTag || '';
      setTagHistory([initialTag]);
      setCurrentHistoryIndex(0);
    }
  }, []); // Only run once on mount

  // Sync history when tag changes from external source (not from our navigation)
  // This handles cases where user clicks a tag button directly
  useEffect(() => {
    if (tagHistory.length === 0) return; // Skip if not initialized yet
    if (isNavigatingRef.current) return; // Skip if navigation is from our buttons
    
    // Check if current tag matches what's in history at current position
    const currentTagInHistory = tagHistory[currentHistoryIndex];
    
    // If tag doesn't match, it's an external change - reset history
    if (currentTagInHistory !== selectedTag) {
      // External change (e.g., user clicked a tag button) - reset history
      setTagHistory([selectedTag || '']);
      setCurrentHistoryIndex(0);
    }
  }, [selectedTag, tagHistory, currentHistoryIndex]);

  const handleNextFact = () => {
    // Get all available tags from all facts
    const allTags = Array.from(new Set(facts.flatMap((fact) => fact.tags))).sort();
    
    if (allTags.length === 0) return;
    
    // Randomly select a new tag
    const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
    
    // Mark that we're navigating from our button
    isNavigatingRef.current = true;
    
    // Add to history (remove any future history if we're not at the end)
    const newHistory = tagHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(randomTag);
    
    setTagHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    
    // Update URL to reflect the new tag
    const params = new URLSearchParams(searchParams.toString());
    params.set('tag', randomTag);
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
    
    // Reset flag after a short delay to allow re-render
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  };

  const handlePreviousFact = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousTag = tagHistory[newIndex];
      
      // Mark that we're navigating from our button
      isNavigatingRef.current = true;
      
      setCurrentHistoryIndex(newIndex);
      
      // Update URL to reflect the previous tag
      const params = new URLSearchParams(searchParams.toString());
      if (previousTag) {
        params.set('tag', previousTag);
      } else {
        params.delete('tag');
      }
      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
      
      // Reset flag after a short delay to allow re-render
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  };

  const canGoBack = currentHistoryIndex > 0;

  useEffect(() => {
    if (!imagesEnabled) {
      // If images are disabled, just set facts without images
      const factsWithoutImages = filteredFacts.map((fact) => ({
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
      const imagePromises = filteredFacts.map(async (fact) => {
        // Use tags first, then extract keywords from fact text for better variety
        const query = buildImageQuery(fact);
        
        try {
          const response = await fetch(`/api/images?query=${encodeURIComponent(query)}`);
          const data = await response.json();
          return {
            ...fact,
            imageUrl: data.url || null,
            imageAlt: data.alt || query || 'Brain illustration',
            useIcon: data.useIcon || false,
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
  }, [filteredFacts, imagesEnabled]);

  // Cleanup: stop speaking when component unmounts or facts change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [filteredFacts]);

  const handleSpeak = (text: string, index: number) => {
    // Stop any currently speaking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // If clicking the same fact, stop speaking
    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Set up Media Session API for background audio support
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Fact',
        artist: 'Fact Me App',
        artwork: []
      });

      // Set up media session actions
      navigator.mediaSession.setActionHandler('pause', () => {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      });
    }

    utterance.onstart = () => {
      setSpeakingIndex(index);
    };

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  if (loading) {
    return (
      <ul className="fun-facts">
        {filteredFacts.map((fact, index) => (
          <li key={`${fact.text}-${index}`}>{fact.text}</li>
        ))}
      </ul>
    );
  }

  if (filteredFacts.length === 0) {
    return (
      <div className="no-facts">
        <p>No facts found for this tag. Try selecting a different tag!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <ul className="fun-facts">
        {filteredFacts.map((fact, index) => (
          <li key={`${fact.text}-${index}`}>{fact.text}</li>
        ))}
      </ul>
    );
  }

  if (filteredFacts.length === 0) {
    return (
      <div className="no-facts">
        <p>No facts found for this tag. Try selecting a different tag!</p>
      </div>
    );
  }

  return (
    <div className="fact-navigation-container">
      <div className="fact-navigation-controls">
        <button
          className={`fact-nav-button fact-nav-prev ${!canGoBack ? 'disabled' : ''}`}
          onClick={handlePreviousFact}
          disabled={!canGoBack}
          aria-label="Previous tag"
          title="Previous tag"
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
          className={`fact-nav-button fact-nav-next`}
          onClick={handleNextFact}
          aria-label="Next tag"
          title="Next tag"
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
      
      <ul className="fun-facts">
        {factsWithImages.map((item, index) => (
          <li key={`${item.text}-${index}`} className="fact-item">
            <div className="fact-image" style={{ visibility: imagesEnabled && (item.imageUrl || item.useIcon) ? 'visible' : 'hidden' }}>
              {imagesEnabled && item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
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
                className={`speak-button ${speakingIndex === index ? 'speaking' : ''}`}
                onClick={() => handleSpeak(item.text, index)}
                aria-label={speakingIndex === index ? 'Stop reading' : 'Read this fact aloud'}
                title={speakingIndex === index ? 'Stop reading' : 'Read this fact aloud'}
              >
                {speakingIndex === index ? (
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
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildImageQuery(fact: Fact): string {
  // First, try to extract main nouns from the sentence using NLP
  const doc = nlp(fact.text);
  const nouns = doc.nouns().out('array');
  // Get noun phrases (more specific than single nouns)
  const nounPhrases = doc.nouns().toPlural().out('array');
  
  // Combine nouns and noun phrases, prioritizing longer/more specific terms
  const extractedEntities = [...nounPhrases, ...nouns].filter((term, index, self) => 
    self.indexOf(term) === index && term.length > 2 // Remove duplicates and short terms
  );
  
  // Prioritize specific tags that make good image searches
  const imageFriendlyTags = fact.tags.filter(tag => 
    !['brain health', 'brain anatomy', 'brain activity', 'brain support', 'brain growth', 'brain damage'].includes(tag)
  );
  
  // Use the most specific tags first
  const specificTags = [
    'hippocampus', 'cerebellum', 'amygdala', 'prefrontal cortex', 'thalamus', 'hypothalamus',
    'fish', 'blueberries', 'walnuts', 'dark chocolate', 'eggs', 'avocados', 'coffee', 'tea',
    'exercise', 'music', 'meditation', 'reading', 'sleep', 'yawning',
    'synapses', 'neurons', 'glial cells', 'neural network'
  ];
  
  // Find the most specific tag
  const bestTag = imageFriendlyTags.find(tag => specificTags.includes(tag)) || imageFriendlyTags[0];
  
  // Find extracted entities that match or are similar to tags
  const relevantEntity = extractedEntities.find(entity => {
    const lowerEntity = entity.toLowerCase();
    return imageFriendlyTags.some(tag => 
      lowerEntity.includes(tag.toLowerCase()) || tag.toLowerCase().includes(lowerEntity)
    ) || specificTags.some(tag => 
      lowerEntity.includes(tag.toLowerCase()) || tag.toLowerCase().includes(lowerEntity)
    );
  });
  
  // Build query: prioritize extracted entity, then best tag, then fallback
  if (relevantEntity) {
    return relevantEntity.toLowerCase();
  }
  
  if (bestTag) {
    // Combine tag with an extracted entity for more variety
    const additionalEntity = extractedEntities.find(e => 
      e.toLowerCase() !== bestTag.toLowerCase() && e.length > 3
    );
    return additionalEntity ? `${bestTag} ${additionalEntity.toLowerCase()}` : bestTag;
  }
  
  // Use extracted entities if available
  if (extractedEntities.length > 0) {
    return extractedEntities.slice(0, 2).join(' ').toLowerCase();
  }
  
  // Fallback to keyword extraction
  const keywords = extractKeywords(fact.text);
  return keywords.length > 0 ? keywords.slice(0, 2).join(' ') : 'brain neuron';
}

function extractKeywords(fact: string): string[] {
  const keywords: string[] = [];
  const lowerFact = fact.toLowerCase();
  
  // Food-related
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
  
  // Brain regions
  if (lowerFact.includes('hippocampus')) keywords.push('hippocampus brain');
  if (lowerFact.includes('cerebellum')) keywords.push('cerebellum');
  if (lowerFact.includes('amygdala')) keywords.push('amygdala');
  if (lowerFact.includes('prefrontal')) keywords.push('prefrontal cortex');
  if (lowerFact.includes('thalamus')) keywords.push('thalamus');
  if (lowerFact.includes('hypothalamus')) keywords.push('hypothalamus');
  if (lowerFact.includes('brainstem') || lowerFact.includes('reptilian')) keywords.push('brainstem');
  
  // Activities
  if (lowerFact.includes('exercise') || lowerFact.includes('workout')) keywords.push('exercise brain');
  if (lowerFact.includes('music') || lowerFact.includes('instrument')) keywords.push('music brain');
  if (lowerFact.includes('meditation') || lowerFact.includes('mindfulness')) keywords.push('meditation');
  if (lowerFact.includes('reading') || lowerFact.includes('book')) keywords.push('reading brain');
  
  // Brain components
  if (lowerFact.includes('neuron')) keywords.push('neuron');
  if (lowerFact.includes('brain')) keywords.push('brain');
  if (lowerFact.includes('glia') || lowerFact.includes('glial')) keywords.push('glial cell');
  if (lowerFact.includes('synapse')) keywords.push('synapse');
  
  // Functions
  if (lowerFact.includes('memory')) keywords.push('memory brain');
  if (lowerFact.includes('sleep')) keywords.push('sleep brain');
  if (lowerFact.includes('yawning') || lowerFact.includes('yawn')) keywords.push('yawning');
  if (lowerFact.includes('connection') || lowerFact.includes('network')) keywords.push('neural network');
  if (lowerFact.includes('thought')) keywords.push('brain thinking');
  if (lowerFact.includes('emotion') || lowerFact.includes('fear')) keywords.push('emotions brain');
  
  // Default fallback
  if (keywords.length === 0) {
    keywords.push('brain', 'neuron');
  }
  
  return keywords;
}

