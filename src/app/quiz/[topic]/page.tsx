import { Metadata } from 'next';
import { SiteLayout } from '@/components/layout';
import { Quiz } from '@/components/quiz';
import { generateQuizQuestions } from '@/lib/quiz-generator';
import { topicData } from '@/lib/topic-data';

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

