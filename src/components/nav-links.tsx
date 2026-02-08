'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Fact Feed' },
  { href: '/browse', label: 'Browse' },
] as const;

export function NavLinks() {
  const pathname = usePathname() ?? '';

  return (
    <div className="nav-links">
      {navItems.map(({ href, label }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith('/browse');
        return (
          <Link
            key={href}
            href={href}
            className={`nav-link ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
