import { Metadata } from 'next';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Fact Me App! | Fun Facts About Everything',
  description: 'Discover fascinating facts about the world around us. From brain cells to coffee, explore knowledge that\'s playful enough for kids, deep enough for adults.',
};

const topics = [
  {
    slug: 'braincells',
    title: 'Brain Facts',
    description: 'Fun facts about brain cells, neurons, and how your brain works.',
    emoji: '🧠',
  },
  {
    slug: 'coffee',
    title: 'Coffee Facts',
    description: 'Fascinating facts about coffee, caffeine, brewing methods, and coffee culture around the world.',
    emoji: '☕',
  },
  {
    slug: 'greek-mythology',
    title: 'Greek Mythology Facts',
    description: 'Fascinating facts about Greek gods, heroes, monsters, and the epic stories that shaped Western culture.',
    emoji: '⚡',
  },
  {
    slug: 'space',
    title: 'Space Facts',
    description: 'Fascinating facts about space, planets, stars, black holes, astronauts, and the universe beyond Earth.',
    emoji: '🚀',
  },
  {
    slug: 'electricity',
    title: 'Electricity Facts',
    description: 'Shocking facts about electricity, lightning, energy, and how electrical power works.',
    emoji: '⚡',
  },
  {
    slug: 'mining',
    title: 'Mining Facts',
    description: 'Dig deep into fascinating facts about mining, minerals, geology, and the history of extracting resources from the Earth.',
    emoji: '⛏️',
  },
  {
    slug: 'engines',
    title: 'Engines Facts',
    description: 'Rev up your knowledge with fascinating facts about engines, how they work, automotive history, and engine technology.',
    emoji: '🔧',
  },
  {
    slug: 'supercars',
    title: 'Supercars Facts',
    description: 'Speed into fascinating facts about supercars, hypercars, legendary brands, and the world\'s most extreme automobiles.',
    emoji: '🏎️',
  },
  {
    slug: 'movie-quotes',
    title: 'Movie Quotes Facts',
    description: 'Discover fascinating facts about famous movie quotes, their origins, misquotes, cultural impact, and the stories behind iconic lines.',
    emoji: '🎬',
  },
  {
    slug: 'beer',
    title: 'Beer Facts',
    description: 'Fascinating facts about beer, brewing, history, culture, styles, and everything you need to know about the world\'s oldest alcoholic beverage.',
    emoji: '🍺',
  },
  {
    slug: 'whiskey',
    title: 'Whiskey Facts',
    description: 'Fascinating facts about whiskey styles, grains, aging, barrels, regions, and the craft behind great pours.',
    emoji: '🥃',
  },
  {
    slug: 'cocktails',
    title: 'Cocktails Facts',
    description: 'Fascinating facts about cocktails, their history, recipes, famous drinks, bartending techniques, and the stories behind iconic mixed drinks.',
    emoji: '🍸',
  },
  {
    slug: 'presidents',
    title: 'Presidents Facts',
    description: 'Fascinating facts about U.S. presidents, their powers, history, and the presidency.',
    emoji: '🇺🇸',
  },
  {
    slug: 'cars',
    title: 'Cars Facts',
    description: 'Fascinating facts about cars, automotive history, manufacturing, and how automobiles work.',
    emoji: '🚗',
  },
  {
    slug: 'bible',
    title: 'The Bible Facts',
    description: 'Fascinating facts about the Bible, its structure, history, translations, and literary content.',
    emoji: '📖',
  },
  {
    slug: 'organs',
    title: 'Organs Facts',
    description: 'Fascinating facts about human body organs, their functions, anatomy, and how they work together.',
    emoji: '🫀',
  },
  {
    slug: 'planes',
    title: 'Planes Facts',
    description: 'Fascinating facts about airplanes, aviation history, flight technology, and how planes work.',
    emoji: '✈️',
  },
];

export default function Page() {
  return (
    <SiteLayout>
      <section className="shell">
        <h1>Fact Me App!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          Discover fascinating facts about the world around us. Playful enough for kids, deep enough for adults.
        </p>
        
        <div className="topics-grid">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/${topic.slug}` as any} className="topic-card">
              <div className="topic-emoji">{topic.emoji}</div>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
