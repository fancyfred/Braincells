import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { electricityFacts } from '@/data/electricity';
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

  return (
    <SiteLayout>
      <section className="shell">
        <h1>Electricity Facts</h1>
        <FactFilter facts={electricityFacts} selectedTag={selectedTag} />
        <FactList facts={electricityFacts} selectedTag={selectedTag} />
      </section>
    </SiteLayout>
  );
}

