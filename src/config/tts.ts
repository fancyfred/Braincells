// TTS Service Configuration
export type TTSService = 'BROWSER' | 'PUTER';

// Get TTS service from environment variable, default to BROWSER
export const TTS_SERVICE: TTSService = (process.env.NEXT_PUBLIC_TTS_SERVICE as TTSService) || 'BROWSER';

// OpenAI TTS voices (for Puter service)
export const OPENAI_TTS_VOICES = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
] as const;

export type OpenAIVoice = typeof OPENAI_TTS_VOICES[number];

// Get a random OpenAI voice
export function getRandomOpenAIVoice(): OpenAIVoice {
  const randomIndex = Math.floor(Math.random() * OPENAI_TTS_VOICES.length);
  return OPENAI_TTS_VOICES[randomIndex];
}

