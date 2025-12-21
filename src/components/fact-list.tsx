'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import nlp from 'compromise';
import { Fact } from '@/types/fact';

interface FactWithImage extends Fact {
  imageUrl: string | null;
  imageAlt: string;
}

interface FactListProps {
  facts: Fact[];
  selectedTag: string;
}

export function FactList({ facts, selectedTag }: FactListProps) {
  const [factsWithImages, setFactsWithImages] = useState<FactWithImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter facts based on selected tag
  const filteredFacts = useMemo(() => {
    if (!selectedTag) return facts;
    return facts.filter((fact) => fact.tags.includes(selectedTag));
  }, [facts, selectedTag]);

  useEffect(() => {
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
          };
        } catch (error) {
          return {
            ...fact,
            imageUrl: null,
            imageAlt: 'Brain illustration',
          };
        }
      });

      const results = await Promise.all(imagePromises);
      setFactsWithImages(results);
      setLoading(false);
    };

    setLoading(true);
    fetchImages();
  }, [filteredFacts]);

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
    <ul className="fun-facts">
      {factsWithImages.map((item, index) => (
        <li key={`${item.text}-${index}`} className="fact-item">
          {item.imageUrl && (
            <div className="fact-image">
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                width={400}
                height={300}
                style={{ objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}
          <div className="fact-text">{item.text}</div>
        </li>
      ))}
    </ul>
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

