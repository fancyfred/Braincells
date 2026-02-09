import { Metadata } from 'next';
import Link from 'next/link';
import { SiteLayout } from '@/components/layout';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CategorySelector } from '@/components/category-selector';
import { topics } from '@/config/topics';
import { getCategoryLabel } from '@/config/categories';
import type { CategorySlug } from '@/config/categories';

export const metadata: Metadata = {
  title: 'Browse by category | Fact Me App!',
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
        <p className="browse-intro">
          Pick a category to see topics. Use the filter to narrow by category.
        </p>
        <CategorySelector />
        <div className="topics-grid">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/${topic.slug}` as any}
              className="topic-card"
            >
              <div className="topic-emoji">{topic.emoji}</div>
              <div className="topic-header">
                <h2>{topic.title}</h2>
                <span className={`topic-mood-badge mood-${topic.mood}`}>
                  {topic.mood === 'general'
                    ? 'General'
                    : topic.mood === 'niche'
                      ? 'Niche'
                      : 'Obscure'}
                </span>
              </div>
              <p>{topic.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
