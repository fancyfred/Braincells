import { FactMood } from '@/types/mood';

export interface Topic {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  mood: FactMood;
}

export const topics: Topic[] = [
  {
    slug: 'braincells',
    title: 'Brain Facts',
    description: 'Fun facts about brain cells, neurons, and how your brain works.',
    emoji: '🧠',
    mood: 'general',
  },
  {
    slug: 'coffee',
    title: 'Coffee Facts',
    description: 'Fascinating facts about coffee, caffeine, brewing methods, and coffee culture around the world.',
    emoji: '☕',
    mood: 'general',
  },
  {
    slug: 'greek-mythology',
    title: 'Greek Mythology Facts',
    description: 'Fascinating facts about Greek gods, heroes, monsters, and the epic stories that shaped Western culture.',
    emoji: '⚡',
    mood: 'niche',
  },
  {
    slug: 'space',
    title: 'Space Facts',
    description: 'Fascinating facts about space, planets, stars, black holes, astronauts, and the universe beyond Earth.',
    emoji: '🚀',
    mood: 'general',
  },
  {
    slug: 'electricity',
    title: 'Electricity Facts',
    description: 'Shocking facts about electricity, lightning, energy, and how electrical power works.',
    emoji: '⚡',
    mood: 'general',
  },
  {
    slug: 'mining',
    title: 'Mining Facts',
    description: 'Dig deep into fascinating facts about mining, minerals, geology, and the history of extracting resources from the Earth.',
    emoji: '⛏️',
    mood: 'niche',
  },
  {
    slug: 'engines',
    title: 'Engines Facts',
    description: 'Rev up your knowledge with fascinating facts about engines, how they work, automotive history, and engine technology.',
    emoji: '🔧',
    mood: 'niche',
  },
  {
    slug: 'supercars',
    title: 'Supercars Facts',
    description: 'Speed into fascinating facts about supercars, hypercars, legendary brands, and the world\'s most extreme automobiles.',
    emoji: '🏎️',
    mood: 'niche',
  },
  {
    slug: 'movie-quotes',
    title: 'Movie Quotes Facts',
    description: 'Discover fascinating facts about famous movie quotes, their origins, misquotes, cultural impact, and the stories behind iconic lines.',
    emoji: '🎬',
    mood: 'obscure',
  },
  {
    slug: 'beer',
    title: 'Beer Facts',
    description: 'Fascinating facts about beer, brewing, history, culture, styles, and everything you need to know about the world\'s oldest alcoholic beverage.',
    emoji: '🍺',
    mood: 'niche',
  },
  {
    slug: 'whiskey',
    title: 'Whiskey Facts',
    description: 'Fascinating facts about whiskey styles, grains, aging, barrels, regions, and the craft behind great pours.',
    emoji: '🥃',
    mood: 'niche',
  },
  {
    slug: 'cocktails',
    title: 'Cocktails Facts',
    description: 'Fascinating facts about cocktails, their history, recipes, famous drinks, bartending techniques, and the stories behind iconic mixed drinks.',
    emoji: '🍸',
    mood: 'niche',
  },
  {
    slug: 'presidents',
    title: 'Presidents Facts',
    description: 'Fascinating facts about U.S. presidents, their powers, history, and the presidency.',
    emoji: '🇺🇸',
    mood: 'general',
  },
  {
    slug: 'cars',
    title: 'Cars Facts',
    description: 'Fascinating facts about cars, automotive history, manufacturing, and how automobiles work.',
    emoji: '🚗',
    mood: 'general',
  },
  {
    slug: 'bible',
    title: 'The Bible Facts',
    description: 'Fascinating facts about the Bible, its structure, history, translations, and literary content.',
    emoji: '📖',
    mood: 'general',
  },
  {
    slug: 'organs',
    title: 'Organs Facts',
    description: 'Fascinating facts about human body organs, their functions, anatomy, and how they work together.',
    emoji: '🫀',
    mood: 'general',
  },
  {
    slug: 'planes',
    title: 'Planes Facts',
    description: 'Fascinating facts about airplanes, aviation history, flight technology, and how planes work.',
    emoji: '✈️',
    mood: 'general',
  },
  {
    slug: 'world-leaders',
    title: 'World Leaders Facts',
    description: 'Fascinating facts about world leaders, historical figures, and influential political leaders throughout history.',
    emoji: '👑',
    mood: 'general',
  },
  {
    slug: 'elements',
    title: 'Elements Facts',
    description: 'Fascinating facts about chemical elements, the periodic table, and the building blocks of matter.',
    emoji: '⚛️',
    mood: 'general',
  },
  {
    slug: 'philosophy',
    title: 'Philosophy Facts',
    description: 'Fascinating facts about philosophy, famous philosophers, and the great ideas that have shaped human thought.',
    emoji: '🤔',
    mood: 'general',
  },
];

