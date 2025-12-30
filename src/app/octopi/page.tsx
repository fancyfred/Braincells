import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { LayoutSelector } from '@/components/layout-selector';
import { octopiFacts } from '@/data/octopi';
import { UNSPLASH_DISABLED } from '@/config/images';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Octopus Facts',
  description: 'Fascinating facts about octopuses, their intelligence, anatomy, behavior, and incredible abilities.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';
  const tags = Array.from(new Set(octopiFacts.flatMap((fact) => fact.tags))).sort();

  // Only redirect to first tag if Unsplash is enabled (to avoid loading too many images)
  // If Unsplash is disabled, allow showing all facts with no filter
  if (!selectedTag && tags.length > 0 && !UNSPLASH_DISABLED) {
    redirect(`/octopi?tag=${encodeURIComponent(tags[0])}`);
  }

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Octopus Facts</h1>
        <LayoutSelector />
        <div className="facts-layout">
          <aside className="facts-sidebar filter-left">
            <FactFilter facts={octopiFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-right">
            <FactFilter facts={octopiFacts} selectedTag={selectedTag} />
          </aside>
          <aside className="facts-sidebar filter-top">
            <FactFilter facts={octopiFacts} selectedTag={selectedTag} />
          </aside>
          <main className="facts-content">
            <FactList facts={octopiFacts} selectedTag={selectedTag} />
          </main>
          <aside className="facts-sidebar filter-bottom">
            <FactFilter facts={octopiFacts} selectedTag={selectedTag} />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

