import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { braincellsFacts } from '@/data/braincells';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Brain Facts',
  description: 'Fun facts about brain cells, neurons, and how your brain works.',
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
        <h1>Brain Facts</h1>
        <FactFilter facts={braincellsFacts} selectedTag={selectedTag} />
        <FactList facts={braincellsFacts} selectedTag={selectedTag} />
      </section>
    </SiteLayout>
  );
}

