import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { enginesFacts } from '@/data/engines';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Engines Facts',
  description: 'Rev up your knowledge with fascinating facts about engines, how they work, automotive history, and engine technology.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(enginesFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0) {
    redirect(`/engines?tag=${encodeURIComponent(tags[0])}`);
  }

  // Split tags into 4 quarters for surround layout
  const quarterSize = Math.ceil(tags.length / 4);
  const tagsTop = tags.slice(0, quarterSize);
  const tagsRight = tags.slice(quarterSize, quarterSize * 2);
  const tagsBottom = tags.slice(quarterSize * 2, quarterSize * 3);
  const tagsLeft = tags.slice(quarterSize * 3);

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Engines Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={enginesFacts} selectedTag={selectedTag} tagsToShow={tagsLeft} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={enginesFacts} selectedTag={selectedTag} tagsToShow={tagsRight} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={enginesFacts} selectedTag={selectedTag} tagsToShow={tagsTop} />
          </aside>
          <main className="facts-content">
            <FactList facts={enginesFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={enginesFacts} selectedTag={selectedTag} tagsToShow={tagsBottom} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

