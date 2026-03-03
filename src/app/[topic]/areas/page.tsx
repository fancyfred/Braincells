import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { FactList } from '@/components/fact-list';
import { topicData } from '@/lib/topic-data';
import { topics } from '@/config/topics';
import { getCategoryLabel } from '@/config/categories';
import { getFactArea, getAreaLabel } from '@/types/fact';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const topicInfo = topicData[topic];
  if (!topicInfo) return { title: 'Topic Not Found' };
  return {
    title: `${topicInfo.title} by area | The Fact Feed`,
    description: `Browse ${topicInfo.title} by area.`,
  };
}

export default async function TopicAreasPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ area?: string }> | { area?: string };
}) {
  const { topic } = await params;
  const topicInfo = topicData[topic];

  if (!topicInfo) {
    notFound();
  }

  const paramsResolved = await Promise.resolve(searchParams);
  const selectedArea = paramsResolved.area ?? '';

  const facts = topicInfo.facts;
  const areaSet = new Set(facts.map((f) => getFactArea(f)));
  const areas = [...areaSet].filter((a) => a !== 'misc').sort();

  const hasAreas = areas.length > 0;

  const topicConfig = topics.find((t) => t.slug === topic);
  const moodLabel =
    topicConfig?.mood === 'general'
      ? 'General'
      : topicConfig?.mood === 'niche'
        ? 'Niche'
        : topicConfig?.mood === 'obscure'
          ? 'Obscure'
          : null;
  const categoryLabel = topicConfig?.category ? getCategoryLabel(topicConfig.category) : null;
  const topicHref = `/${topic}`;
  const areasHref = `/${topic}/areas`;

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: 'Browse', href: '/browse' },
    ...(moodLabel ? [{ label: moodLabel, href: `/browse?mood=${topicConfig!.mood}` }] : []),
    ...(categoryLabel && topicConfig?.category
      ? [{ label: categoryLabel, href: `/browse/category?cat=${topicConfig.category}` }]
      : []),
    { label: topicInfo.title, href: topicHref },
    ...(selectedArea && areas.includes(selectedArea)
      ? [{ label: getAreaLabel(selectedArea), href: undefined }]
      : [{ label: 'By area', href: hasAreas ? undefined : undefined }]),
  ];

  if (!hasAreas) {
    return (
      <SiteLayout>
        <section className="shell">
          <Breadcrumbs items={breadcrumbItems.slice(0, -1)} />
          <h1>{topicInfo.title}</h1>
          <p className="browse-intro">
            This topic doesn&apos;t have areas yet. All facts are in the main list.
          </p>
          <p>
            <Link href={topicHref} className="browse-alt-link">
              View all facts
            </Link>
          </p>
        </section>
      </SiteLayout>
    );
  }

  if (selectedArea && areas.includes(selectedArea)) {
    const factsInArea = facts
      .map((fact, index) => ({ fact, index }))
      .filter(({ fact }) => getFactArea(fact) === selectedArea);
    const filteredFacts = factsInArea.map(({ fact }) => fact);
    const originalIndices = factsInArea.map(({ index }) => index);

    const areaBreadcrumbItems: { label: string; href?: string }[] = [
      ...breadcrumbItems.slice(0, -1),
      { label: 'By area', href: areasHref },
      { label: getAreaLabel(selectedArea) },
    ];

    return (
      <SiteLayout>
        <section className="shell">
          <Breadcrumbs items={areaBreadcrumbItems} />
          <h1>{topicInfo.title}</h1>
          <p className="topic-area-heading">
            Area: <strong>{getAreaLabel(selectedArea)}</strong> ({filteredFacts.length} fact{filteredFacts.length !== 1 ? 's' : ''})
          </p>
          <div className="facts-layout">
            <main className="facts-content facts-content-full">
              <FactList
                facts={filteredFacts}
                currentFactIndex={0}
                singleFactView={false}
                topicSlug={topic}
                linkBasePath={topicHref}
                originalIndices={originalIndices}
              />
            </main>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const areaCounts = areas.map((area) => ({
    area,
    label: getAreaLabel(area),
    count: facts.filter((f) => getFactArea(f) === area).length,
  }));

  return (
    <SiteLayout>
      <section className="shell browse-page">
        <Breadcrumbs items={breadcrumbItems} />
        <h1>{topicInfo.title}</h1>
        <p className="browse-intro">
          This topic is broken into areas. Click an area to see the facts in that area.
        </p>
        <div className="areas-grid">
          {areaCounts.map(({ area, label, count }) => (
            <Link
              key={area}
              href={`/${topic}/areas?area=${encodeURIComponent(area)}`}
              className="area-card"
            >
              <span className="area-card-label">{label}</span>
              <span className="area-card-count">{count} fact{count !== 1 ? 's' : ''}</span>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
