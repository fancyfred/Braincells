import { Metadata } from 'next';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout';
import { MoodSelector } from '@/components/mood-selector';
import { topics } from '@/config/topics';
import { FactMood } from '@/types/mood';

export const metadata: Metadata = {
  title: 'Quiz Me! | Test Your Knowledge',
  description: 'Test your knowledge with fun quizzes on various topics. Choose a topic and see how much you know!',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string }> | { mood?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedMood = params.mood as FactMood | undefined;

  // Filter topics by mood if a mood is selected
  const filteredTopics = selectedMood && ['general', 'niche', 'obscure'].includes(selectedMood)
    ? topics.filter(topic => topic.mood === selectedMood)
    : topics;

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Quiz Me!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          Test your knowledge with fun quizzes. Choose a topic and see how much you know!
        </p>
        
        <MoodSelector />
        
        <div className="topics-grid">
          {filteredTopics.map((topic) => (
            <Link key={topic.slug} href={`/quiz/${topic.slug}` as any} className="topic-card">
              <div className="topic-emoji">{topic.emoji}</div>
              <div className="topic-header">
                <h2>{topic.title}</h2>
                <span className={`topic-mood-badge mood-${topic.mood}`}>
                  {topic.mood === 'general' ? 'General' : topic.mood === 'niche' ? 'Niche' : 'Obscure'}
                </span>
              </div>
              <p>{topic.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

