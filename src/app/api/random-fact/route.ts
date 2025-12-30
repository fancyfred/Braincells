import { NextResponse } from 'next/server';
import { braincellsFacts } from '@/data/braincells';
import { coffeeFacts } from '@/data/coffee';
import { greekMythologyFacts } from '@/data/greek-mythology';
import { spaceFacts } from '@/data/space';
import { electricityFacts } from '@/data/electricity';
import { miningFacts } from '@/data/mining';
import { enginesFacts } from '@/data/engines';
import { supercarsFacts } from '@/data/supercars';
import { movieQuotesFacts } from '@/data/movie-quotes';
import { beerFacts } from '@/data/beer';
import { whiskeyFacts } from '@/data/whiskey';
import { cocktailsFacts } from '@/data/cocktails';
import { presidentsFacts } from '@/data/presidents';
import { carsFacts } from '@/data/cars';
import { bibleFacts } from '@/data/bible';
import { organsFacts } from '@/data/organs';
import { planesFacts } from '@/data/planes';
import { worldLeadersFacts } from '@/data/world-leaders';
import { elementsFacts } from '@/data/elements';
import { philosophyFacts } from '@/data/philosophy';
import { seinfeldFacts } from '@/data/seinfeld';
import { olympicsFacts } from '@/data/olympics';
import { internetFacts } from '@/data/internet';
import { octopiFacts } from '@/data/octopi';
import { snakesFacts } from '@/data/snakes';
import { sharksFacts } from '@/data/sharks';
import { oceansFacts } from '@/data/oceans';
import { mountainsFacts } from '@/data/mountains';
import { ancientEgyptFacts } from '@/data/ancient-egypt';
import { chocolateFacts } from '@/data/chocolate';
import { spicesFacts } from '@/data/spices';
import { Fact } from '@/types/fact';

// Combine all facts with their topic information
interface FactWithTopic {
  fact: Fact;
  topic: string;
}

const allFactsWithTopics: FactWithTopic[] = [
  ...braincellsFacts.map(f => ({ fact: f, topic: 'braincells' })),
  ...coffeeFacts.map(f => ({ fact: f, topic: 'coffee' })),
  ...greekMythologyFacts.map(f => ({ fact: f, topic: 'greek-mythology' })),
  ...spaceFacts.map(f => ({ fact: f, topic: 'space' })),
  ...electricityFacts.map(f => ({ fact: f, topic: 'electricity' })),
  ...miningFacts.map(f => ({ fact: f, topic: 'mining' })),
  ...enginesFacts.map(f => ({ fact: f, topic: 'engines' })),
  ...supercarsFacts.map(f => ({ fact: f, topic: 'supercars' })),
  ...movieQuotesFacts.map(f => ({ fact: f, topic: 'movie-quotes' })),
  ...beerFacts.map(f => ({ fact: f, topic: 'beer' })),
  ...whiskeyFacts.map(f => ({ fact: f, topic: 'whiskey' })),
  ...cocktailsFacts.map(f => ({ fact: f, topic: 'cocktails' })),
  ...presidentsFacts.map(f => ({ fact: f, topic: 'presidents' })),
  ...carsFacts.map(f => ({ fact: f, topic: 'cars' })),
  ...bibleFacts.map(f => ({ fact: f, topic: 'bible' })),
  ...organsFacts.map(f => ({ fact: f, topic: 'organs' })),
  ...planesFacts.map(f => ({ fact: f, topic: 'planes' })),
  ...worldLeadersFacts.map(f => ({ fact: f, topic: 'world-leaders' })),
  ...elementsFacts.map(f => ({ fact: f, topic: 'elements' })),
  ...philosophyFacts.map(f => ({ fact: f, topic: 'philosophy' })),
  ...seinfeldFacts.map(f => ({ fact: f, topic: 'seinfeld' })),
  ...olympicsFacts.map(f => ({ fact: f, topic: 'olympics' })),
  ...internetFacts.map(f => ({ fact: f, topic: 'internet' })),
  ...octopiFacts.map(f => ({ fact: f, topic: 'octopi' })),
  ...snakesFacts.map(f => ({ fact: f, topic: 'snakes' })),
  ...sharksFacts.map(f => ({ fact: f, topic: 'sharks' })),
  ...oceansFacts.map(f => ({ fact: f, topic: 'oceans' })),
  ...mountainsFacts.map(f => ({ fact: f, topic: 'mountains' })),
  ...ancientEgyptFacts.map(f => ({ fact: f, topic: 'ancient-egypt' })),
  ...chocolateFacts.map(f => ({ fact: f, topic: 'chocolate' })),
  ...spicesFacts.map(f => ({ fact: f, topic: 'spices' })),
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedTopic = searchParams.get('topic'); // Optional: filter by topic
  
  let factsToChooseFrom = allFactsWithTopics;
  
  if (requestedTopic) {
    factsToChooseFrom = allFactsWithTopics.filter(item => item.topic === requestedTopic);
  }
  
  if (factsToChooseFrom.length === 0) {
    return NextResponse.json({ error: 'No facts available' }, { status: 404 });
  }
  
  // Get random fact
  const randomIndex = Math.floor(Math.random() * factsToChooseFrom.length);
  const selected = factsToChooseFrom[randomIndex];
  
  return NextResponse.json({
    fact: selected.fact.text,
    tags: selected.fact.tags,
    topic: selected.topic, // Return the actual topic of the fact
  });
}

