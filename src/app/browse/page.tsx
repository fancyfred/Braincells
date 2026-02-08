import { Metadata } from 'next';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { MoodSelector } from '@/components/mood-selector';
import { topics } from '@/config/topics';
import { FactMood } from '@/types/mood';

function moodLabel(mood: FactMood): string {
  return mood === 'general' ? 'General' : mood === 'niche' ? 'Niche' : 'Obscure';
}

export const metadata: Metadata = {
  title: 'Browse facts | Fact Me App!',
  description: 'Browse facts by topic. Choose a mood and explore.',
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string }> | { mood?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedMood = params.mood as FactMood | undefined;

  const filteredTopics =
    selectedMood && ['general', 'niche', 'obscure'].includes(selectedMood)
      ? topics.filter((topic) => topic.mood === selectedMood)
      : topics;

  const breadcrumbItems = selectedMood
    ? [
        { label: 'Browse', href: '/browse' },
        { label: moodLabel(selectedMood) },
      ]
    : [{ label: 'Browse' }];

  return (
    <SiteLayout>
      <section className="shell browse-page">
        <Breadcrumbs items={breadcrumbItems} />
        <h1>Browse facts</h1>
        <p className="browse-intro">
          Pick a topic and read through facts. Use the mood filter to narrow by interest.
        </p>
        <MoodSelector />
        <div className="topics-grid">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/${topic.slug}` as any}
              className="topic-card"
            >
              <div className="topic-emoji">{topic.emoji}</div>
              <div className="topic-header">
                <h2>{topic.title}</h2>
                <span className={`topic-mood-badge mood-${topic.mood}`}>
                  {topic.mood === 'general'
                    ? 'General'
                    : topic.mood === 'niche'
                      ? 'Niche'
                      : 'Obscure'}
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
