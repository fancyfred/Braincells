import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteLayout } from '@/components/layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { FactList } from '@/components/fact-list';
import { TopicAreaSelector } from '@/components/topic-area-selector';
import { topicData } from '@/lib/topic-data';
import { topics } from '@/config/topics';
import { getCategoryLabel } from '@/config/categories';
import { getFactArea, getAreaLabel } from '@/types/fact';

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const topicInfo = topicData[topic];

  if (!topicInfo) {
    return {
      title: 'Topic Not Found',
    };
  }

  return {
    title: topicInfo.title,
    description: topicInfo.description,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ fact?: string; area?: string }> | { fact?: string; area?: string };
}) {
  const { topic } = await params;
  const topicInfo = topicData[topic];

  if (!topicInfo) {
    notFound();
  }

  const searchParamsResolved = await Promise.resolve(searchParams);
  const factParam = searchParamsResolved.fact;
  const areaParam = searchParamsResolved.area ?? '';
  const hasFactParam = factParam !== undefined && factParam !== '';
  const factIndex = Math.max(0, parseInt(factParam ?? '0', 10) || 0);
  const facts = topicInfo.facts;
  const clampedIndex = Math.min(factIndex, facts.length - 1);

  const areaSet = new Set(facts.map((f) => getFactArea(f)));
  const areaSlugs = [...areaSet].filter((a) => a !== 'misc').sort();
  const hasAreas = areaSlugs.length > 0;
  const areaOptions = areaSlugs.map((slug) => ({
    slug,
    label: getAreaLabel(slug),
    count: facts.filter((f) => getFactArea(f) === slug).length,
  }));
  const validArea = areaParam && areaSlugs.includes(areaParam);
  const filteredByArea = hasAreas && validArea;

  const factsToShow = filteredByArea
    ? facts.filter((f) => getFactArea(f) === areaParam)
    : facts;
  const originalIndices = filteredByArea
    ? facts
        .map((f, i) => (getFactArea(f) === areaParam ? i : -1))
        .filter((i) => i >= 0)
    : undefined;
  const displayIndexInFiltered =
    hasFactParam && filteredByArea && originalIndices
      ? Math.max(0, originalIndices.indexOf(clampedIndex))
      : hasFactParam
        ? clampedIndex
        : 0;

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
  const topicListHref = `/${topic}`;
  const topicAreaHref = validArea ? `/${topic}?area=${areaParam}` : topicListHref;
  const factCode = `#${clampedIndex + 1}`;

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: 'Browse', href: '/browse' },
    ...(moodLabel
      ? [{ label: moodLabel, href: `/browse?mood=${topicConfig!.mood}` as string }]
      : []),
    ...(categoryLabel && topicConfig?.category
      ? [{ label: categoryLabel, href: `/browse/category?cat=${topicConfig.category}` }]
      : []),
    {
      label: topicInfo.title,
      href: hasFactParam || validArea ? topicListHref : undefined,
    },
    ...(validArea
      ? [
          {
            label: getAreaLabel(areaParam),
            href: hasFactParam ? topicAreaHref : undefined,
          },
        ]
      : []),
    ...(hasFactParam ? [{ label: factCode, href: undefined }] : []),
  ];

  return (
    <SiteLayout>
      <section className="shell">
        <Breadcrumbs items={breadcrumbItems} />
        <h1>{topicInfo.title}</h1>
        {hasAreas && !hasFactParam && (
          <TopicAreaSelector topicSlug={topic} areas={areaOptions} />
        )}
        {hasFactParam && (
          <p className="topic-fact-counter" aria-live="polite">
            {clampedIndex + 1} / {topicInfo.facts.length}
          </p>
        )}
        <div className="facts-layout">
          <main className="facts-content facts-content-full">
            <FactList
              facts={factsToShow}
              currentFactIndex={displayIndexInFiltered}
              singleFactView={hasFactParam}
              topicSlug={topic}
              linkBasePath={filteredByArea ? `${topicListHref}?area=${areaParam}` : undefined}
              originalIndices={filteredByArea ? originalIndices : undefined}
            />
          </main>
        </div>
      </section>
    </SiteLayout>
  );
}
