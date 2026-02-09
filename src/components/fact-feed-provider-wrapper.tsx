'use client';

import { FactFeedProvider } from '@/contexts/fact-feed-context';

export function FactFeedProviderWrapper({ children }: { children: React.ReactNode }) {
  return <FactFeedProvider>{children}</FactFeedProvider>;
}
