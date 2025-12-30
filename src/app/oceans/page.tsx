import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { oceansFacts } from '@/data/oceans';
import { UNSPLASH_DISABLED } from '@/config/images';

export const metadata: Metadata = {
  title: 'Oceans Facts',
  description: 'Fascinating facts about the world\'s oceans, their depths, currents, and importance to life on Earth.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(oceansFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/oceans?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Oceans Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={oceansFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={oceansFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={oceansFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={oceansFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={oceansFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

