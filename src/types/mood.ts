export type FactMood = 'general' | 'niche' | 'obscure';

export const moodLabels: Record<FactMood, string> = {
  general: 'General Knowledge',
  niche: 'Niche',
  obscure: 'Obscure',
};

/** Optional short tagline shown with the mood (e.g. "Area 51" for obscure). */
export const moodTaglines: Partial<Record<FactMood, string>> = {
  obscure: 'Area 51',
};

export const moodDescriptions: Record<FactMood, string> = {
  general: 'Useful and general knowledge facts that are widely applicable',
  niche: 'More specific facts about less mainstream topics',
  obscure: 'Deep cuts for cult fans and geeks',
};

