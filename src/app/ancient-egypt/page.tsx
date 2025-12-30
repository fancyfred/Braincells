import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { ancientEgyptFacts } from '@/data/ancient-egypt';
import { UNSPLASH_DISABLED } from '@/config/images';

export const metadata: Metadata = {
  title: 'Ancient Egypt Facts',
  description: 'Fascinating facts about ancient Egypt, pharaohs, pyramids, hieroglyphs, and one of history\'s greatest civilizations.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(ancientEgyptFacts.flatMap((fact) => fact.tags))).sort();

  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/ancient-egypt?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Ancient Egypt Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={ancientEgyptFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={ancientEgyptFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={ancientEgyptFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={ancientEgyptFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={ancientEgyptFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

