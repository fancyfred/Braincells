import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Braincells HQ',
    template: '%s | Braincells HQ'
  },
  description: 'One-stop brain cell hub: research, pioneering professors, and playful facts for every curious mind.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
