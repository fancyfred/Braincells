import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { ImageToggle } from './image-toggle';
import { FactFeedProvider } from '@/contexts/fact-feed-context';
import { NavLinks } from './nav-links';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <FactFeedProvider>
      <nav className="nav shell">
        <Link href="/" aria-label="Fact Me App home" className="nav-logo">
          <span className="tagline">Fact Me App!</span>
        </Link>
        <NavLinks />
        <div className="nav-actions">
          <ImageToggle />
          <ThemeToggle />
        </div>
      </nav>
      <main>{children}</main>
      <footer className="footer">
        <span>Fact Me App! — Facts for curious minds.</span>
      </footer>
    </FactFeedProvider>
  );
}
