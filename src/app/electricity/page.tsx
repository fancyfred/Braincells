import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { electricityFacts } from '@/data/electricity';
import { UNSPLASH_DISABLED } from '@/config/images';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Electricity Facts',
  description: 'Shocking facts about electricity, lightning, energy, and how electrical power works.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(electricityFacts.flatMap((fact) => fact.tags))).sort();

  // Only redirect to first tag if Unsplash is enabled (to avoid loading too many images)
  // If Unsplash is disabled, allow showing all facts with no filter
  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/electricity?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Electricity Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={electricityFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={electricityFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={electricityFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={electricityFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={electricityFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

