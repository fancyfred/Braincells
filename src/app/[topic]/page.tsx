import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { FactList } from '@/components/fact-list';
import { topicData } from '@/lib/topic-data';
import { topics } from '@/config/topics';

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const topicInfo = topicData[topic];

  if (!topicInfo) {
    return {
      title: 'Topic Not Found',
    };
  }

  return {
    title: topicInfo.title,
    description: topicInfo.description,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ fact?: string }> | { fact?: string };
}) {
  const { topic } = await params;
  const topicInfo = topicData[topic];

  if (!topicInfo) {
    notFound();
  }

  const searchParamsResolved = await Promise.resolve(searchParams);
  const factParam = searchParamsResolved.fact;
  const hasFactParam = factParam !== undefined && factParam !== '';
  const factIndex = Math.max(0, parseInt(factParam ?? '0', 10) || 0);
  const clampedIndex = Math.min(factIndex, topicInfo.facts.length - 1);

  const topicConfig = topics.find((t) => t.slug === topic);
  const moodLabel =
    topicConfig?.mood === 'general'
      ? 'General'
      : topicConfig?.mood === 'niche'
        ? 'Niche'
        : topicConfig?.mood === 'obscure'
          ? 'Obscure'
          : null;
  const topicListHref = `/${topic}`;
  const breadcrumbItems = moodLabel
    ? [
        { label: 'Browse', href: '/browse' },
        { label: moodLabel, href: `/browse?mood=${topicConfig!.mood}` },
        { label: topicInfo.title, href: hasFactParam ? topicListHref : undefined },
      ]
    : [
        { label: 'Browse', href: '/browse' },
        { label: topicInfo.title, href: hasFactParam ? topicListHref : undefined },
      ];

  return (
    <SiteLayout>
      <section className="shell">
        <Breadcrumbs items={breadcrumbItems} />
        <h1>{topicInfo.title}</h1>
        {hasFactParam && (
          <p className="topic-fact-counter" aria-live="polite">
            {clampedIndex + 1} / {topicInfo.facts.length}
          </p>
        )}
        <div className="facts-layout">
          <main className="facts-content facts-content-full">
            <FactList
              facts={topicInfo.facts}
              currentFactIndex={clampedIndex}
              singleFactView={hasFactParam}
            />
          </main>
        </div>
      </section>
    </SiteLayout>
  );
}
