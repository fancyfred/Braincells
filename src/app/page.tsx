import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { FactFeedSection } from '@/components/fact-feed-section';

export const metadata: Metadata = {
  title: 'Fact Me App! | Fun Facts About Everything',
  description: 'Discover fascinating facts about the world around us. Playful enough for kids, deep enough for adults.',
};

export default function Page() {
  return (
    <SiteLayout>
      <div className="home-page">
        <FactFeedSection />
      </div>
    </SiteLayout>
  );
}
