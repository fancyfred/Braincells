import { Metadata } from 'next';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Did You Know? | Fun Facts About Everything',
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
];

export default function Page() {
  return (
    <SiteLayout>
      <section className="shell">
        <h1>Did You Know?</h1>
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
