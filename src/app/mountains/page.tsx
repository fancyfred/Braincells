import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { mountainsFacts } from '@/data/mountains';
import { UNSPLASH_DISABLED } from '@/config/images';

export const metadata: Metadata = {
  title: 'Mountains Facts',
  description: 'Fascinating facts about mountains, their formation, height records, and impact on climate and ecosystems.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(mountainsFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/mountains?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Mountains Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={mountainsFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={mountainsFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={mountainsFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={mountainsFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={mountainsFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

