import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { ImageToggle } from './image-toggle';
import { NavBrowseLinks } from './nav-browse-links';
import { categories } from '@/config/categories';
import { moodLabels, type FactMood } from '@/types/mood';

const moods: { slug: FactMood; label: string }[] = [
  { slug: 'general', label: moodLabels.general },
  { slug: 'niche', label: moodLabels.niche },
  { slug: 'obscure', label: moodLabels.obscure },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="nav shell">
        <Link href="/" aria-label="Fact Me App home" className="nav-logo">
          <span className="tagline">Fact Me App!</span>
        </Link>
        <NavBrowseLinks />
        <div className="nav-actions">
          <ImageToggle />
          <ThemeToggle />
        </div>
      </nav>
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-sections">
            <section className="footer-section" aria-labelledby="footer-browse">
              <h2 id="footer-browse" className="footer-heading">Browse</h2>
              <ul className="footer-links">
                <li><Link href="/browse">All topics</Link></li>
              </ul>
            </section>
            <section className="footer-section" aria-labelledby="footer-mood">
              <h2 id="footer-mood" className="footer-heading">By mood</h2>
              <ul className="footer-links">
                {moods.map(({ slug, label }) => (
                  <li key={slug}>
                    <Link href={`/browse?mood=${slug}`}>{label}</Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className="footer-section" aria-labelledby="footer-category">
              <h2 id="footer-category" className="footer-heading">By category</h2>
              <ul className="footer-links">
                {categories.map(({ slug, label }) => (
                  <li key={slug}>
                    <Link href={`/browse/category?cat=${slug}`}>{label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <p className="footer-tagline">Fact Me App! — Facts for curious minds.</p>
        </div>
      </footer>
    </>
  );
}
