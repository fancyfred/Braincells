import nlp from 'compromise';
import { Fact } from '@/types/fact';

export interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  factText: string;
}

export function generateQuizQuestions(facts: Fact[], numQuestions: number = 10, topicName?: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const usedFacts = new Set<number>();
  const usedAnswers = new Set<string>(); // Track used answers to avoid repeats
  
  // List of pronouns and common words to exclude
  const pronouns = new Set([
    'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'mine', 'yours', 'hers', 'ours', 'theirs',
    'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
    'this', 'that', 'these', 'those',
    'who', 'whom', 'whose', 'which', 'what',
    'whoever', 'whomever', 'whatever', 'whichever',
    'somebody', 'someone', 'something', 'anybody', 'anyone', 'anything',
    'nobody', 'nothing', 'everybody', 'everyone', 'everything',
    'there', 'here', 'where', 'when', 'why', 'how', // Adverbs/pronouns
    'people' // Common but too generic
  ]);
  
  // Helper function to check if a word is a pronoun
  const isPronoun = (word: string): boolean => {
    return pronouns.has(word.toLowerCase());
  };
  
  // Helper function to check if a word is a contraction
  const isContraction = (word: string): boolean => {
    const lower = word.toLowerCase();
    // Check for common contractions like it's, that's, there's, what's, who's, etc.
    return /^[a-z]+'[a-z]+$/.test(lower) || 
           ['it\'s', 'that\'s', 'there\'s', 'here\'s', 'what\'s', 'who\'s', 'where\'s', 'when\'s', 'why\'s', 'how\'s', 
            'he\'s', 'she\'s', 'we\'re', 'they\'re', 'you\'re', 'i\'m', 'i\'ve', 'i\'ll', 'i\'d',
            'can\'t', 'won\'t', 'don\'t', 'doesn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t',
            'hasn\'t', 'haven\'t', 'hadn\'t', 'wouldn\'t', 'couldn\'t', 'shouldn\'t'].includes(lower);
  };
  
  // Get all unique nouns from all facts for generating distractors
  // Only collect single-word nouns, not phrases
  const allNouns = new Set<string>();
  facts.forEach(fact => {
    const doc = nlp(fact.text);
    const nouns = doc.nouns().out('array');
    nouns.forEach((noun: string) => {
      // Remove punctuation from the noun
      const cleanedNoun = noun.trim().replace(/^[.,!?;:()'"-]+/, '').replace(/[.,!?;:()'"-]+$/, '');
      // Only use single words (no spaces), reasonable length, and not pronouns/common words/contractions
      if (cleanedNoun.length > 2 && 
          cleanedNoun.length < 30 && 
          !cleanedNoun.includes(' ') && 
          !isPronoun(cleanedNoun) &&
          !isContraction(cleanedNoun) &&
          !['the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'when', 'where', 'why', 'how'].includes(cleanedNoun.toLowerCase())) {
        allNouns.add(cleanedNoun.toLowerCase());
      }
    });
  });
  
  const allNounsArray = Array.from(allNouns);
  
  while (questions.length < numQuestions && usedFacts.size < facts.length) {
    // Pick a random fact
    let factIndex = Math.floor(Math.random() * facts.length);
    while (usedFacts.has(factIndex)) {
      factIndex = Math.floor(Math.random() * facts.length);
    }
    usedFacts.add(factIndex);
    
    const fact = facts[factIndex];
    const doc = nlp(fact.text);
    
    // Get nouns from the sentence - only single words, not phrases
    const nouns = doc.nouns().out('array');
    
    // Filter to only meaningful single-word nouns (no spaces, reasonable length, not pronouns)
    // Strip punctuation from nouns when extracting
    const meaningfulNouns = nouns
      .map((noun: string) => {
        // Remove punctuation from the noun
        return noun.trim().replace(/[.,!?;:()'"-]+$/, '').replace(/^[.,!?;:()'"-]+/, '');
      })
      .filter((noun: string) => {
        const lowerNoun = noun.toLowerCase();
        return noun.length > 3 && 
          noun.length < 30 &&
          !noun.includes(' ') && // Only single words, no phrases
          !isPronoun(noun) && // Exclude pronouns
          !isContraction(noun) && // Exclude contractions
          !['the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'when', 'where', 'why', 'how'].includes(lowerNoun) &&
          !usedAnswers.has(lowerNoun) && // Exclude already used answers
          !(topicName && lowerNoun === topicName.toLowerCase()); // Exclude topic name (e.g., "coffee" in coffee quiz)
      })
      .filter((noun: string, index: number, self: string[]) => self.indexOf(noun) === index);
    
    // Extract numbers from the fact text
    // Match numbers including: digits (1, 2, 100), numbers with commas (1,000), decimals (3.14), ranges (1-5), percentages (50%)
    const numberMatches = fact.text.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d+\.\d+\b|\b\d+-\d+\b|\b\d+%/g) || [];
    const numbers = numberMatches
      .map(num => num.trim())
      .filter((num: string, index: number, self: string[]) => self.indexOf(num) === index);
    
    // Create a pool of candidates: nouns and numbers
    const candidates: Array<{ type: 'noun' | 'number', value: string }> = [
      ...meaningfulNouns.map((n: string) => ({ type: 'noun' as const, value: n })),
      ...numbers.map((n: string) => ({ type: 'number' as const, value: n }))
    ];
    
    if (candidates.length === 0) continue;
    
    // Filter out topic name and already used answers from candidates
    const filteredCandidates = candidates.filter(c => {
      const lowerValue = c.value.toLowerCase();
      return !usedAnswers.has(lowerValue) && 
             !(topicName && lowerValue === topicName.toLowerCase());
    });
    
    // If no candidates left after filtering, skip this fact
    if (filteredCandidates.length === 0) continue;
    
    // Randomly pick a candidate (noun or number)
    const candidate = filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
    const isNumber = candidate.type === 'number';
    const answerToRemove = candidate.value;
    const answerLower = answerToRemove.toLowerCase();
    
    // Mark this answer as used
    usedAnswers.add(answerLower);
    
    // Escape special regex characters for replacement
    const escapedAnswer = answerToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create the question by replacing the answer with a blank
    let questionText: string;
    if (isNumber) {
      // For numbers, match the exact number pattern
      questionText = fact.text.replace(
        new RegExp(`\\b${escapedAnswer}\\b`, 'g'),
        '______'
      );
    } else {
      // For nouns, handle word boundaries and punctuation
      questionText = fact.text.replace(
        new RegExp(`\\b${escapedAnswer}\\b([.,!?;:()'"-]*)`, 'gi'),
        '______$1'
      );
      
      // If the replacement didn't work, try without word boundaries
      if (questionText === fact.text) {
        questionText = fact.text.replace(
          new RegExp(`${escapedAnswer}([.,!?;:()'"-]*)`, 'gi'),
          '______$1'
        );
      }
    }
    
    // If still no replacement happened, skip this fact
    if (questionText === fact.text) {
      continue;
    }
    
    // Generate distractors (wrong answers)
    const distractors: string[] = [];
    const usedDistractors = new Set<string>([answerLower]);
    
    if (isNumber) {
      // For numbers, generate numeric distractors
      const numValue = parseFloat(answerToRemove.replace(/,/g, '').replace(/%/g, '').replace(/-.*/, ''));
      if (!isNaN(numValue)) {
        // Generate numbers that are similar but different
        // Try: half, double, +10%, -10%, +1, -1, etc.
        const numDistractors = [
          Math.round(numValue * 0.5).toString(),
          Math.round(numValue * 2).toString(),
          Math.round(numValue * 1.1).toString(),
          Math.round(numValue * 0.9).toString(),
          (numValue + 1).toString(),
          (numValue - 1).toString(),
          (numValue + 10).toString(),
          (numValue - 10).toString(),
        ].filter(n => n !== answerToRemove && !usedDistractors.has(n));
        
        // If the original had formatting (commas, %, etc.), try to preserve it
        const hasCommas = answerToRemove.includes(',');
        const hasPercent = answerToRemove.includes('%');
        const hasRange = answerToRemove.includes('-');
        
        numDistractors.slice(0, 3).forEach(num => {
          let formatted = num;
          if (hasCommas && num.length > 3) {
            formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
          if (hasPercent) {
            formatted = formatted + '%';
          }
          if (!usedDistractors.has(formatted)) {
            distractors.push(formatted);
            usedDistractors.add(formatted);
          }
        });
      }
      
      // Fill remaining with other numbers from the fact or random numbers
      const otherNumbers = numbers.filter(n => n !== answerToRemove && !usedDistractors.has(n));
      otherNumbers.slice(0, 3 - distractors.length).forEach(num => {
        if (distractors.length < 3) {
          distractors.push(num);
          usedDistractors.add(num);
        }
      });
      
      // If still need more, generate random numbers in similar range
      while (distractors.length < 3) {
        const randomNum = Math.floor(Math.random() * 1000).toString();
        if (!usedDistractors.has(randomNum)) {
          distractors.push(randomNum);
          usedDistractors.add(randomNum);
        } else {
          break;
        }
      }
    } else {
      // For nouns, use improved logic
      // Check if answer is a proper noun (starts with capital) - if so, prefer other proper nouns
      const isProperNoun = answerToRemove[0] === answerToRemove[0].toUpperCase();
      
      // Filter out very common/generic words that don't make good quiz answers
      const genericWords = new Set(['light', 'lights', 'power', 'energy', 'electricity', 'current', 'voltage', 'circuit', 'wire', 'wires', 'outlet', 'outlets', 'switch', 'switches', 'bulb', 'bulbs', 'lamp', 'lamps', 'device', 'devices', 'thing', 'things', 'item', 'items', 'object', 'objects', 'part', 'parts', 'piece', 'pieces', 'unit', 'units', 'element', 'elements']);
      
      // Try to get related nouns from tags or other facts
      const relatedNouns: string[] = [];
      fact.tags.forEach(tag => {
        allNounsArray.forEach(noun => {
          if (noun.includes(tag.toLowerCase()) || tag.toLowerCase().includes(noun)) {
            if (!usedDistractors.has(noun) && 
                noun !== answerLower && 
                !isPronoun(noun) && // Exclude pronouns
                !isContraction(noun) && // Exclude contractions
                !genericWords.has(noun.toLowerCase()) && // Exclude generic words
                (!isProperNoun || noun[0] === noun[0].toUpperCase())) { // If answer is proper noun, prefer proper nouns
              relatedNouns.push(noun);
            }
          }
        });
      });
      
      // Add related nouns first
      relatedNouns.slice(0, 2).forEach(noun => {
        if (distractors.length < 3 && !usedDistractors.has(noun)) {
          distractors.push(noun);
          usedDistractors.add(noun);
        }
      });
      
      // Fill remaining with random nouns (ensure they're single words and reasonable length)
      let attempts = 0;
      while (distractors.length < 3 && attempts < 200) {
        attempts++;
        const randomNoun = allNounsArray[Math.floor(Math.random() * allNounsArray.length)];
        // Ensure it's a single word, reasonable length, not a pronoun/contraction, not generic, and not already used
        if (randomNoun && 
            !randomNoun.includes(' ') && 
            randomNoun.length >= 4 && // Minimum 4 characters for better quality
            randomNoun.length < 30 &&
            !isPronoun(randomNoun) &&
            !isContraction(randomNoun) &&
            !genericWords.has(randomNoun.toLowerCase()) &&
            !usedDistractors.has(randomNoun) && 
            randomNoun !== answerLower &&
            (!isProperNoun || randomNoun[0] === randomNoun[0].toUpperCase())) { // If answer is proper noun, prefer proper nouns
          distractors.push(randomNoun);
          usedDistractors.add(randomNoun);
        }
      }
      
      // If we still don't have enough distractors, try to find better options from other facts
      // Look for nouns that are proper nouns if answer is proper noun, or regular nouns otherwise
      if (distractors.length < 3) {
        const remainingNouns = allNounsArray.filter(noun => 
          !usedDistractors.has(noun) &&
          noun !== answerLower &&
          !isPronoun(noun) &&
          !isContraction(noun) &&
          !genericWords.has(noun.toLowerCase()) &&
          noun.length >= 4 &&
          (!isProperNoun || noun[0] === noun[0].toUpperCase())
        );
        
        // Shuffle and take what we need
        const shuffled = remainingNouns.sort(() => Math.random() - 0.5);
        shuffled.slice(0, 3 - distractors.length).forEach(noun => {
          if (distractors.length < 3) {
            distractors.push(noun);
            usedDistractors.add(noun);
          }
        });
      }
      
      // Last resort: use context-appropriate fallback words based on answer type
      if (distractors.length < 3) {
        const fallbackWords = isProperNoun 
          ? ['London', 'Berlin', 'Rome', 'Madrid', 'Tokyo', 'Moscow', 'Vienna', 'Athens'] // City names for proper noun answers
          : ['system', 'method', 'process', 'technology', 'device', 'component', 'material', 'substance']; // More specific generic words
        let fallbackIndex = 0;
        while (distractors.length < 3 && fallbackIndex < fallbackWords.length) {
          const fallback = fallbackWords[fallbackIndex];
          if (!usedDistractors.has(fallback.toLowerCase())) {
            distractors.push(fallback);
            usedDistractors.add(fallback.toLowerCase());
          }
          fallbackIndex++;
        }
      }
    }
    
    // Helper function to clean and capitalize options (remove punctuation)
    const cleanAndCapitalize = (str: string) => {
      // Remove all punctuation from the beginning and end
      const cleaned = str.replace(/^[.,!?;:()'"-]+/, '').replace(/[.,!?;:()'"-]+$/, '');
      // Capitalize first letter
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    };
    
    // Filter out any options that are too long (safety check) and clean them
    // For numbers, don't remove punctuation (commas, %, etc.)
    const validOptions = [answerToRemove, ...distractors]
      .filter(opt => opt && opt.length < 30 && !opt.includes('  ')) // No double spaces or very long strings
      .map(opt => {
        if (isNumber) {
          // For numbers, keep as-is (preserve formatting)
          return opt;
        } else {
          // For nouns, remove punctuation from the option
          return opt.replace(/^[.,!?;:()'"-]+/, '').replace(/[.,!?;:()'"-]+$/, '');
        }
      })
      .filter(opt => opt.length > 0); // Remove any empty strings after cleaning
    
    // Shuffle options and format
    const options = validOptions
      .sort(() => Math.random() - 0.5)
      .map(opt => {
        if (isNumber) {
          // For numbers, keep as-is
          return opt;
        } else {
          // For nouns, capitalize
          return cleanAndCapitalize(opt);
        }
      });
    
    questions.push({
      question: questionText,
      correctAnswer: answerToRemove,
      options,
      factText: fact.text,
    });
  }
  
  return questions;
}

