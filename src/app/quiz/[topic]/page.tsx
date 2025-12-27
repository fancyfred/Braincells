import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { Quiz } from '@/components/quiz';
import { generateQuizQuestions } from '@/lib/quiz-generator';
import { braincellsFacts } from '@/data/braincells';
import { coffeeFacts } from '@/data/coffee';
import { greekMythologyFacts } from '@/data/greek-mythology';
import { spaceFacts } from '@/data/space';
import { electricityFacts } from '@/data/electricity';
import { miningFacts } from '@/data/mining';
import { enginesFacts } from '@/data/engines';
import { supercarsFacts } from '@/data/supercars';
import { movieQuotesFacts } from '@/data/movie-quotes';
import { beerFacts } from '@/data/beer';
import { whiskeyFacts } from '@/data/whiskey';
import { cocktailsFacts } from '@/data/cocktails';
import { presidentsFacts } from '@/data/presidents';
import { carsFacts } from '@/data/cars';
import { bibleFacts } from '@/data/bible';
import { organsFacts } from '@/data/organs';
import { planesFacts } from '@/data/planes';

const topicData: Record<string, { facts: typeof braincellsFacts; title: string }> = {
  braincells: { facts: braincellsFacts, title: 'Brain Facts' },
  coffee: { facts: coffeeFacts, title: 'Coffee Facts' },
  'greek-mythology': { facts: greekMythologyFacts, title: 'Greek Mythology Facts' },
  space: { facts: spaceFacts, title: 'Space Facts' },
  electricity: { facts: electricityFacts, title: 'Electricity Facts' },
  mining: { facts: miningFacts, title: 'Mining Facts' },
  engines: { facts: enginesFacts, title: 'Engines Facts' },
  supercars: { facts: supercarsFacts, title: 'Supercars Facts' },
  'movie-quotes': { facts: movieQuotesFacts, title: 'Movie Quotes Facts' },
  beer: { facts: beerFacts, title: 'Beer Facts' },
  whiskey: { facts: whiskeyFacts, title: 'Whiskey Facts' },
  cocktails: { facts: cocktailsFacts, title: 'Cocktails Facts' },
  presidents: { facts: presidentsFacts, title: 'Presidents Facts' },
  cars: { facts: carsFacts, title: 'Cars Facts' },
  bible: { facts: bibleFacts, title: 'The Bible Facts' },
  organs: { facts: organsFacts, title: 'Organs Facts' },
  planes: { facts: planesFacts, title: 'Planes Facts' },
};

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const topicInfo = topicData[topic];
  
  if (!topicInfo) {
    return {
      title: 'Quiz Not Found',
    };
  }
  
  return {
    title: `${topicInfo.title} Quiz`,
    description: `Test your knowledge with a quiz about ${topicInfo.title.toLowerCase()}.`,
  };
}

export default async function Page({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const topicInfo = topicData[topic];
  
  if (!topicInfo) {
    return (
      <SiteLayout>
        <section className="shell">
          <h1>Quiz Not Found</h1>
          <p>The quiz topic you're looking for doesn't exist.</p>
        </section>
      </SiteLayout>
    );
  }
  
  // Extract topic name from title (e.g., "Coffee Facts" -> "coffee")
  const topicName = topicInfo.title.toLowerCase().replace(' facts', '').replace('the ', '').trim();
  const questions = generateQuizQuestions(topicInfo.facts, 10, topicName);
  
  return (
    <SiteLayout>
      <section className="shell">
        <Quiz questions={questions} topicTitle={topicInfo.title} />
      </section>
    </SiteLayout>
  );
}

