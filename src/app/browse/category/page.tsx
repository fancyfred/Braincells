import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CategorySelector } from '@/components/category-selector';
import { TopicGrid } from '@/components/topic-grid';
import { topics } from '@/config/topics';
import { getCategoryLabel } from '@/config/categories';
import type { CategorySlug } from '@/config/categories';

export const metadata: Metadata = {
  title: 'Browse by category | The Fact Feed',
  description: 'Browse facts by category. Choose a category and explore topics.',
};

const VALID_CATEGORIES: CategorySlug[] = [
  'technology',
  'science',
  'nature',
  'food',
  'history',
  'culture',
  'entertainment',
  'misc',
];

export default async function BrowseByCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }> | { cat?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const selectedCat = params.cat as CategorySlug | undefined;

  const filteredTopics =
    selectedCat && VALID_CATEGORIES.includes(selectedCat)
      ? topics.filter((topic) => topic.category === selectedCat)
      : topics;

  const categoryLabel = selectedCat ? getCategoryLabel(selectedCat) : null;
  const breadcrumbItems = categoryLabel
    ? [
        { label: 'Browse', href: '/browse' },
        { label: 'By category', href: '/browse/category' },
        { label: categoryLabel },
      ]
    : [
        { label: 'Browse', href: '/browse' },
        { label: 'By category' },
      ];

  return (
    <SiteLayout>
      <section className="shell browse-page">
        <Breadcrumbs items={breadcrumbItems} />
        <h1>Browse by category</h1>
        <CategorySelector />
        <TopicGrid topics={filteredTopics} />
      </section>
    </SiteLayout>
  );
}
