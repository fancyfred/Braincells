'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { categories, type CategorySlug } from '@/config/categories';

export function CategorySelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cat = searchParams.get('cat');
    if (cat && categories.some((c) => c.slug === cat)) {
      setSelectedCategory(cat as CategorySlug);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const handleCategoryChange = (category: CategorySlug | 'all') => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', category);
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}` as any);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="category-selector">
      <div className="category-buttons">
        <button
          key="all"
          onClick={() => handleCategoryChange('all')}
          className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
          aria-label="All categories"
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`category-button ${selectedCategory === cat.slug ? 'active' : ''}`}
            aria-label={`${cat.label} category`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
