import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { internetFacts } from '@/data/internet';
import { UNSPLASH_DISABLED } from '@/config/images';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'The Internet Facts',
  description: 'Fascinating facts about the internet, its history, development, and how it has transformed the world.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(internetFacts.flatMap((fact) => fact.tags))).sort();

  // Only redirect to first tag if Unsplash is enabled (to avoid loading too many images)
  // If Unsplash is disabled, allow showing all facts with no filter
  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/internet?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>The Internet Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={internetFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={internetFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={internetFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={internetFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={internetFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

