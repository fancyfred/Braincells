import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { UNSPLASH_DISABLED } from '@/config/images';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

type ImageManifest = Record<string, { folder: string; count: number }>;

function getManifest(): ImageManifest | null {
  const manifestPath = join(process.cwd(), 'public', 'images', 'manifest.json');
  if (!existsSync(manifestPath)) return null;
  try {
    const raw = readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw) as ImageManifest;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'brain neuron';
  const topic = searchParams.get('topic') ?? undefined;
  const factIndexParam = searchParams.get('factIndex');
  const size = searchParams.get('size') || 'medium'; // 'thumb' or 'medium'

  // Prefer local topic image when available (from npm run process-images)
  if (topic && factIndexParam !== null && factIndexParam !== undefined) {
    const factIndex = Math.max(0, parseInt(factIndexParam, 10) || 0);
    const manifest = getManifest();
    const entry = manifest?.[topic];
    if (entry && factIndex < entry.count) {
      const imageNum = factIndex + 1;
      const folderEnc = encodeURIComponent(entry.folder);
      const filename = size === 'thumb' ? `${imageNum}-thumb.jpg` : `${imageNum}.jpg`;
      const url = `/images/${folderEnc}/${filename}`;
      return NextResponse.json({
        url,
        alt: query,
        useIcon: false,
      });
    }
  }

  // Disable Unsplash globally
  if (UNSPLASH_DISABLED) {
    return NextResponse.json({
      url: null,
      useIcon: true,
      error: 'Unsplash disabled',
    });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({
      url: null,
      useIcon: true,
      error: 'Unsplash API key not configured',
    });
  }

  try {
    // Fetch multiple images to get more variety
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      return NextResponse.json({ url: null });
    }

    // Randomly select one of the results for variety
    const randomIndex = Math.floor(Math.random() * results.length);
    const image = results[randomIndex];

    return NextResponse.json({
      url: image.urls.regular,
      alt: image.alt_description || query,
      credit: image.user.name,
      useIcon: false,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ 
      url: null, 
      useIcon: true,
      error: 'Failed to fetch image' 
    });
  }
}

