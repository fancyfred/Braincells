import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { sharksFacts } from '@/data/sharks';
import { UNSPLASH_DISABLED } from '@/config/images';

export const metadata: Metadata = {
  title: 'Sharks Facts',
  description: 'Fascinating facts about sharks, their anatomy, behavior, and incredible adaptations.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(sharksFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/sharks?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Sharks Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={sharksFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={sharksFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={sharksFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={sharksFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={sharksFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

