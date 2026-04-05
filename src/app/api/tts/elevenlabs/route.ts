import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

// Optional CSV from env: ELEVENLABS_VOICE_IDS=id1,id2,id3
const VOICE_IDS_FROM_ENV = (process.env.ELEVENLABS_VOICE_IDS || '')
  .split(',')
  .map((voiceId) => voiceId.trim())
  .filter(Boolean);

// Fallback public voice IDs if env list is not provided.
const FALLBACK_VOICE_IDS = [
  '21m00Tcm4TlvDq8ikWAM', // Rachel
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'EXAVITQu4vr4xnSDxMaL', // Bella
  'ErXwobaYiN019PkySvjV', // Antoni
  'MF3mGyEYCl7XYWbV9V6O', // Elli
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'pNInz6obpgDQGcFmaJgB', // Adam
] as const;

function getVoicePool(): string[] {
  return VOICE_IDS_FROM_ENV.length > 0 ? VOICE_IDS_FROM_ENV : [...FALLBACK_VOICE_IDS];
}

function getRandomVoiceId(): string {
  const pool = getVoicePool();
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const voiceId = getRandomVoiceId();

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: DEFAULT_MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      return NextResponse.json(
        {
          error: `ElevenLabs API error (${elevenLabsResponse.status})`,
          details: errorText,
        },
        { status: 502 }
      );
    }

    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioArrayBuffer).toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      url: dataUrl,
      voice: voiceId,
      model: DEFAULT_MODEL_ID,
      format: 'mp3',
    });
  } catch (error: any) {
    console.error('[ElevenLabsTTS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to synthesize speech with ElevenLabs' },
      { status: 500 }
    );
  }
}
