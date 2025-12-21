import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="nav shell">
        <Link href="/" aria-label="Did You Know home">
          <div className="tagline">Did You Know?</div>
        </Link>
        <ThemeToggle />
      </nav>
      <main>{children}</main>
      <footer className="footer">
        <span>Did You Know? — Facts for curious minds.</span>
      </footer>
    </>
  );
}
