import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { miningFacts } from '@/data/mining';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Mining Facts',
  description: 'Dig deep into fascinating facts about mining, minerals, geology, and the history of extracting resources from the Earth.',
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
        <h1>Mining Facts</h1>
        <FactFilter facts={miningFacts} selectedTag={selectedTag} />
        <FactList facts={miningFacts} selectedTag={selectedTag} />
      </section>
    </SiteLayout>
  );
}

