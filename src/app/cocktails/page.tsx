import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { cocktailsFacts } from '@/data/cocktails';

export const metadata: Metadata = {
  title: 'Cocktails Facts',
  description: 'Fascinating facts about cocktails, their history, recipes, famous drinks, bartending techniques, and the stories behind the world\'s most iconic mixed drinks.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(cocktailsFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0) {
    redirect(`/cocktails?tag=${encodeURIComponent(tags[0])}`);
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
        <h1>Cocktails Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={cocktailsFacts} selectedTag={selectedTag} tagsToShow={tagsLeft} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={cocktailsFacts} selectedTag={selectedTag} tagsToShow={tagsRight} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={cocktailsFacts} selectedTag={selectedTag} tagsToShow={tagsTop} />
          </aside>
          <main className="facts-content">
            <FactList facts={cocktailsFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={cocktailsFacts} selectedTag={selectedTag} tagsToShow={tagsBottom} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

