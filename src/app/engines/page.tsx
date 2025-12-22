import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactList } from '@/components/fact-list';
import { FactFilter } from '@/components/fact-filter';
import { enginesFacts } from '@/data/engines';
import { Fact } from '@/types/fact';

export const metadata: Metadata = {
  title: 'Engines Facts',
  description: 'Rev up your knowledge with fascinating facts about engines, how they work, automotive history, and engine technology.',
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
        <h1>Engines Facts</h1>
        <FactFilter facts={enginesFacts} selectedTag={selectedTag} />
        <FactList facts={enginesFacts} selectedTag={selectedTag} />
      </section>
    </SiteLayout>
  );
}

