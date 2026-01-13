import { NextRequest, NextResponse } from 'next/server';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { Readable } from 'stream';

// Initialize Polly client with credentials from environment variables
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Available Polly voices (neural voices for better quality)
const POLLY_VOICES = [
  'Joanna', // Female, US English
  'Matthew', // Male, US English
  'Amy', // Female, British English
  'Brian', // Male, British English
  'Emma', // Female, British English
  'Joey', // Male, US English
  'Justin', // Male, US English
  'Kendra', // Female, US English
  'Kimberly', // Female, US English
  'Salli', // Female, US English
  'Ivy', // Female, US English (child voice)
  'Ruth', // Female, US English
  'Stephen', // Male, US English
] as const;

// Get a random Polly voice
function getRandomPollyVoice(): string {
  const randomIndex = Math.floor(Math.random() * POLLY_VOICES.length);
  return POLLY_VOICES[randomIndex];
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

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS credentials not configured' },
        { status: 500 }
      );
    }

    // Get a random voice
    const voice = getRandomPollyVoice();

    // Synthesize speech using Polly
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voice,
      Engine: 'neural', // Use neural engine for better quality
    });

    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      return NextResponse.json(
        { error: 'No audio stream returned from Polly' },
        { status: 500 }
      );
    }

    // Convert the AudioStream to a buffer
    // AWS SDK v3 AudioStream can be Readable, Blob, or Uint8Array
    const audioBuffer = await streamToBuffer(response.AudioStream);

    // Return the audio as a base64-encoded data URL
    const base64Audio = audioBuffer.toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      url: dataUrl,
      voice: voice,
      format: 'mp3',
    });
  } catch (error: any) {
    console.error('[PollyTTS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}

// Helper function to convert AWS SDK AudioStream to a buffer
// In Node.js, AWS SDK v3 returns AudioStream as a Node.js Readable stream
async function streamToBuffer(stream: any): Promise<Buffer> {
  // If it's already a Buffer, return it
  if (Buffer.isBuffer(stream)) {
    return stream;
  }

  // If it's a Uint8Array, convert to Buffer
  if (stream instanceof Uint8Array) {
    return Buffer.from(stream);
  }

  // If it's a Node.js Readable stream (most common case in AWS SDK v3)
  if (stream instanceof Readable || (stream && typeof stream.on === 'function' && typeof stream.pipe === 'function')) {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      stream.on('data', (chunk: Buffer | Uint8Array) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      stream.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  // If it's a Blob (browser environment)
  if (typeof Blob !== 'undefined' && stream instanceof Blob) {
    const arrayBuffer = await stream.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // If it's a Web ReadableStream (browser environment)
  if (stream && typeof stream.getReader === 'function') {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    // Combine all chunks into a single Buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(result);
  }

  // Last resort: try to create buffer directly
  try {
    return Buffer.from(stream);
  } catch (error) {
    throw new Error(
      `Unable to convert AudioStream to buffer. ` +
      `Type: ${typeof stream}, ` +
      `Is Readable: ${stream instanceof Readable}, ` +
      `Has on: ${typeof stream?.on}, ` +
      `Has pipe: ${typeof stream?.pipe}, ` +
      `Has getReader: ${typeof stream?.getReader}`
    );
  }
}

