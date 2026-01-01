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
import { artFacts } from '@/data/art';
import { Fact } from '@/types/fact';
import { topics } from '@/config/topics';

export const topicData: Record<string, { facts: Fact[]; title: string; description: string }> = {
  braincells: { facts: braincellsFacts, title: 'Brain Facts', description: topics.find(t => t.slug === 'braincells')?.description || '' },
  coffee: { facts: coffeeFacts, title: 'Coffee Facts', description: topics.find(t => t.slug === 'coffee')?.description || '' },
  'greek-mythology': { facts: greekMythologyFacts, title: 'Greek Mythology Facts', description: topics.find(t => t.slug === 'greek-mythology')?.description || '' },
  space: { facts: spaceFacts, title: 'Space Facts', description: topics.find(t => t.slug === 'space')?.description || '' },
  electricity: { facts: electricityFacts, title: 'Electricity Facts', description: topics.find(t => t.slug === 'electricity')?.description || '' },
  mining: { facts: miningFacts, title: 'Mining Facts', description: topics.find(t => t.slug === 'mining')?.description || '' },
  engines: { facts: enginesFacts, title: 'Engines Facts', description: topics.find(t => t.slug === 'engines')?.description || '' },
  supercars: { facts: supercarsFacts, title: 'Supercars Facts', description: topics.find(t => t.slug === 'supercars')?.description || '' },
  'movie-quotes': { facts: movieQuotesFacts, title: 'Movie Quotes Facts', description: topics.find(t => t.slug === 'movie-quotes')?.description || '' },
  beer: { facts: beerFacts, title: 'Beer Facts', description: topics.find(t => t.slug === 'beer')?.description || '' },
  whiskey: { facts: whiskeyFacts, title: 'Whiskey Facts', description: topics.find(t => t.slug === 'whiskey')?.description || '' },
  cocktails: { facts: cocktailsFacts, title: 'Cocktails Facts', description: topics.find(t => t.slug === 'cocktails')?.description || '' },
  presidents: { facts: presidentsFacts, title: 'Presidents Facts', description: topics.find(t => t.slug === 'presidents')?.description || '' },
  cars: { facts: carsFacts, title: 'Cars Facts', description: topics.find(t => t.slug === 'cars')?.description || '' },
  bible: { facts: bibleFacts, title: 'The Bible Facts', description: topics.find(t => t.slug === 'bible')?.description || '' },
  organs: { facts: organsFacts, title: 'Organs Facts', description: topics.find(t => t.slug === 'organs')?.description || '' },
  planes: { facts: planesFacts, title: 'Planes Facts', description: topics.find(t => t.slug === 'planes')?.description || '' },
  'world-leaders': { facts: worldLeadersFacts, title: 'World Leaders Facts', description: topics.find(t => t.slug === 'world-leaders')?.description || '' },
  elements: { facts: elementsFacts, title: 'Elements Facts', description: topics.find(t => t.slug === 'elements')?.description || '' },
  philosophy: { facts: philosophyFacts, title: 'Philosophy Facts', description: topics.find(t => t.slug === 'philosophy')?.description || '' },
  seinfeld: { facts: seinfeldFacts, title: 'Seinfeld Facts', description: topics.find(t => t.slug === 'seinfeld')?.description || '' },
  olympics: { facts: olympicsFacts, title: 'Olympics Facts', description: topics.find(t => t.slug === 'olympics')?.description || '' },
  internet: { facts: internetFacts, title: 'The Internet Facts', description: topics.find(t => t.slug === 'internet')?.description || '' },
  octopi: { facts: octopiFacts, title: 'Octopus Facts', description: topics.find(t => t.slug === 'octopi')?.description || '' },
  snakes: { facts: snakesFacts, title: 'Snakes Facts', description: topics.find(t => t.slug === 'snakes')?.description || '' },
  sharks: { facts: sharksFacts, title: 'Sharks Facts', description: topics.find(t => t.slug === 'sharks')?.description || '' },
  oceans: { facts: oceansFacts, title: 'Oceans Facts', description: topics.find(t => t.slug === 'oceans')?.description || '' },
  mountains: { facts: mountainsFacts, title: 'Mountains Facts', description: topics.find(t => t.slug === 'mountains')?.description || '' },
  'ancient-egypt': { facts: ancientEgyptFacts, title: 'Ancient Egypt Facts', description: topics.find(t => t.slug === 'ancient-egypt')?.description || '' },
  chocolate: { facts: chocolateFacts, title: 'Chocolate Facts', description: topics.find(t => t.slug === 'chocolate')?.description || '' },
  spices: { facts: spicesFacts, title: 'Spices Facts', description: topics.find(t => t.slug === 'spices')?.description || '' },
  art: { facts: artFacts, title: 'Art Facts', description: topics.find(t => t.slug === 'art')?.description || '' },
};

