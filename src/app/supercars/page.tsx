import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { supercarsFacts } from '@/data/supercars';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Supercars Facts',
  description: 'Speed into fascinating facts about supercars, hypercars, legendary brands, and the world\'s most extreme automobiles.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }> | { tag?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedTag = params.tag || '';

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Supercars Facts</h1>
        <FactFilter facts={supercarsFacts} selectedTag={selectedTag} />
        <FactList facts={supercarsFacts} selectedTag={selectedTag} />
      </section>
    </SiteLayout>
  );
}

