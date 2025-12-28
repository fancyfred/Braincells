import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { ImageToggle } from './image-toggle';
import { RandomFact } from './random-fact';
import { QuizMeButton } from './quiz-me-button';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="nav shell">
        <Link href="/" aria-label="Fact Me App home">
          <div className="tagline">Fact Me App!</div>
        </Link>
        <RandomFact className="nav-random-fact" />
        <ImageToggle />
        <ThemeToggle />
      </nav>
      <main>{children}</main>
      <footer className="footer">
        <span>Fact Me App! — Facts for curious minds.</span>
      </footer>
      <QuizMeButton />
    </>
  );
}
