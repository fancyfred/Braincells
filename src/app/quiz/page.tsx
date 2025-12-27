import { Metadata } from 'next';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Quiz Me! | Test Your Knowledge',
  description: 'Test your knowledge with fun quizzes on various topics. Choose a topic and see how much you know!',
};

const topics = [
  {
    slug: 'braincells',
    title: 'Brain Facts',
    description: 'Test your knowledge about brain cells, neurons, and how your brain works.',
    emoji: '🧠',
  },
  {
    slug: 'coffee',
    title: 'Coffee Facts',
    description: 'Quiz yourself on coffee, caffeine, brewing methods, and coffee culture around the world.',
    emoji: '☕',
  },
  {
    slug: 'greek-mythology',
    title: 'Greek Mythology Facts',
    description: 'Challenge yourself with questions about Greek gods, heroes, monsters, and epic stories.',
    emoji: '⚡',
  },
  {
    slug: 'space',
    title: 'Space Facts',
    description: 'Test your knowledge about space, planets, stars, black holes, astronauts, and the universe.',
    emoji: '🚀',
  },
  {
    slug: 'electricity',
    title: 'Electricity Facts',
    description: 'Quiz yourself on electricity, lightning, energy, and how electrical power works.',
    emoji: '⚡',
  },
  {
    slug: 'mining',
    title: 'Mining Facts',
    description: 'Test your knowledge about mining, minerals, geology, and the history of extracting resources.',
    emoji: '⛏️',
  },
  {
    slug: 'engines',
    title: 'Engines Facts',
    description: 'Challenge yourself with questions about engines, how they work, and automotive history.',
    emoji: '🔧',
  },
  {
    slug: 'supercars',
    title: 'Supercars Facts',
    description: 'Quiz yourself on supercars, hypercars, legendary brands, and extreme automobiles.',
    emoji: '🏎️',
  },
  {
    slug: 'movie-quotes',
    title: 'Movie Quotes Facts',
    description: 'Test your knowledge about famous movie quotes, their origins, and cultural impact.',
    emoji: '🎬',
  },
  {
    slug: 'beer',
    title: 'Beer Facts',
    description: 'Quiz yourself on beer, brewing, history, culture, and styles.',
    emoji: '🍺',
  },
  {
    slug: 'whiskey',
    title: 'Whiskey Facts',
    description: 'Test your knowledge about whiskey styles, grains, aging, barrels, and regions.',
    emoji: '🥃',
  },
  {
    slug: 'cocktails',
    title: 'Cocktails Facts',
    description: 'Challenge yourself with questions about cocktails, their history, and famous drinks.',
    emoji: '🍸',
  },
  {
    slug: 'presidents',
    title: 'Presidents Facts',
    description: 'Quiz yourself on U.S. presidents, their powers, history, and the presidency.',
    emoji: '🇺🇸',
  },
  {
    slug: 'cars',
    title: 'Cars Facts',
    description: 'Test your knowledge about cars, automotive history, manufacturing, and how automobiles work.',
    emoji: '🚗',
  },
  {
    slug: 'bible',
    title: 'The Bible Facts',
    description: 'Quiz yourself on the Bible, its structure, history, translations, and literary content.',
    emoji: '📖',
  },
  {
    slug: 'organs',
    title: 'Organs Facts',
    description: 'Test your knowledge about human body organs, their functions, anatomy, and how they work together.',
    emoji: '🫀',
  },
  {
    slug: 'planes',
    title: 'Planes Facts',
    description: 'Quiz yourself on airplanes, aviation history, flight technology, and how planes work.',
    emoji: '✈️',
  },
];

export default function Page() {
  return (
    <SiteLayout>
      <section className="shell">
        <h1>Quiz Me!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          Test your knowledge with fun quizzes. Choose a topic and see how much you know!
        </p>
        
        <div className="topics-grid">
          {topics.map((topic) => (
            <Link key={topic.slug} href={`/quiz/${topic.slug}` as any} className="topic-card">
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

