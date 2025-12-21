import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { coffeeFacts } from '@/data/coffee';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Coffee Facts',
  description: 'Fascinating facts about coffee, caffeine, brewing methods, and coffee culture around the world.',
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
        <h1>Coffee Facts</h1>
        <FactFilter facts={coffeeFacts} selectedTag={selectedTag} />
        <FactList facts={coffeeFacts} selectedTag={selectedTag} />
      </section>
    </SiteLayout>
  );
}

