import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { topicData } from '@/lib/topic-data';
import { UNSPLASH_DISABLED } from '@/config/images';

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
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const { topic } = await params;
  const topicInfo = topicData[topic];
  
  if (!topicInfo) {
    notFound();
  }
  
  const searchParamsResolved = await Promise.resolve(searchParams);
  const selectedTag = searchParamsResolved.tag || '';
  const tags = Array.from(new Set(topicInfo.facts.flatMap((fact) => fact.tags))).sort();

  // Only redirect to first tag if Unsplash is enabled (to avoid loading too many images)
  // If Unsplash is disabled, allow showing all facts with no filter
  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/${topic}?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>{topicInfo.title}</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={topicInfo.facts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={topicInfo.facts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={topicInfo.facts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={topicInfo.facts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={topicInfo.facts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

