import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { FactFeedProviderWrapper } from '@/components/fact-feed-provider-wrapper';

export const metadata: Metadata = {
  title: {
    default: 'Fact Me App!',
    template: '%s | Fact Me App!'
  },
  description: 'Discover fascinating facts about the world around us. Playful enough for kids, deep enough for adults.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script 
          src="https://js.puter.com/v2/" 
          strategy="afterInteractive"
        />
        <FactFeedProviderWrapper>
          {children}
        </FactFeedProviderWrapper>
      </body>
    </html>
  );
}
