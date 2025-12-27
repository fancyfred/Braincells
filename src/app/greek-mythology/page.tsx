import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { greekMythologyFacts } from '@/data/greek-mythology';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Greek Mythology Facts',
  description: 'Fascinating facts about Greek gods, heroes, monsters, and the epic stories that shaped Western culture.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(greekMythologyFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0) {
    redirect(`/greek-mythology?tag=${encodeURIComponent(tags[0])}`);
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
        <h1>Greek Mythology Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={greekMythologyFacts} selectedTag={selectedTag} tagsToShow={tagsLeft} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={greekMythologyFacts} selectedTag={selectedTag} tagsToShow={tagsRight} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={greekMythologyFacts} selectedTag={selectedTag} tagsToShow={tagsTop} />
          </aside>
          <main className="facts-content">
            <FactList facts={greekMythologyFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={greekMythologyFacts} selectedTag={selectedTag} tagsToShow={tagsBottom} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

