import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { spicesFacts } from '@/data/spices';
import { UNSPLASH_DISABLED } from '@/config/images';

export const metadata: Metadata = {
  title: 'Spices Facts',
  description: 'Fascinating facts about spices, the spice trade, their history, and how they shaped world exploration.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(spicesFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/spices?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Spices Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={spicesFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={spicesFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={spicesFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={spicesFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={spicesFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

