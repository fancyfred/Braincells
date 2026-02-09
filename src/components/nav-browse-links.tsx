'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavBrowseLinks() {
  const pathname = usePathname() ?? '';
  const onBrowse = pathname.startsWith('/browse') && !pathname.startsWith('/browse/category');
  const onCategory = pathname.startsWith('/browse/category');

  return (
    <div className="nav-browse">
      <span className="nav-browse-label" aria-hidden>Browse</span>
      <div className="nav-browse-links">
        <Link
          href="/browse"
          className={`nav-browse-link ${onBrowse ? 'active' : ''}`}
          aria-current={onBrowse ? 'page' : undefined}
        >
          All Topics
        </Link>
        <Link
          href="/browse"
          className={`nav-browse-link ${onBrowse ? 'active' : ''}`}
        >
          Moods
        </Link>
        <Link
          href="/browse/category"
          className={`nav-browse-link ${onCategory ? 'active' : ''}`}
          aria-current={onCategory ? 'page' : undefined}
        >
          Categories
        </Link>
      </div>
    </div>
  );
}
