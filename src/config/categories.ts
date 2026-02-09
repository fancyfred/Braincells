/** Category slug used in URLs and topic config. */
export type CategorySlug =
  | 'technology'
  | 'science'
  | 'nature'
  | 'food'
  | 'history'
  | 'culture'
  | 'entertainment'
  | 'misc';

export interface Category {
  slug: CategorySlug;
  label: string;
}

export const categories: Category[] = [
  { slug: 'technology', label: 'Technology' },
  { slug: 'science', label: 'Science' },
  { slug: 'nature', label: 'Nature' },
  { slug: 'food', label: 'Food & Drink' },
  { slug: 'history', label: 'History' },
  { slug: 'culture', label: 'Culture' },
  { slug: 'entertainment', label: 'Entertainment' },
  { slug: 'misc', label: 'Misc' },
];

export function getCategoryLabel(slug: string): string {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}
