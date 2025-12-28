import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { coffeeFacts } from '@/data/coffee';
import { UNSPLASH_DISABLED } from '@/config/images';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Coffee Facts',
  description: 'Fascinating facts about coffee, caffeine, brewing methods, and coffee culture around the world.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(coffeeFacts.flatMap((fact) => fact.tags))).sort();

  // Only redirect to first tag if Unsplash is enabled (to avoid loading too many images)
  // If Unsplash is disabled, allow showing all facts with no filter
  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/coffee?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Coffee Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={coffeeFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={coffeeFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={coffeeFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={coffeeFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={coffeeFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

